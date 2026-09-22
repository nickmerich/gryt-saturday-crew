/**
 * LOCAL ONLY: actual handlers + actual reviewed PostgreSQL functions.
 * Auth identity results are injected fixtures, NOT a hosted Supabase auth test.
 * No project URL, service key, browser session, email or external database is used.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import type { SupabaseClient } from "@supabase/supabase-js";
import { captureRsvp } from "../src/lib/attendance/capture.server";
import { organizerCheckin } from "../src/lib/attendance/checkin.server";
import { runOnDate } from "../src/lib/run-occurrence";

const migrations = [
  "20260623122530_2d3d98bd-0636-449a-b935-622b2f10fa0c.sql",
  "20260623122543_6dc91825-a7e3-4abb-840b-e2ef4c41ba4a.sql",
  "20260624033624_a18e33ad-b512-4b5d-84a0-f09e74bda6ca.sql",
  "20260706142726_a9d0f6a8-7dfa-41eb-ab48-d06df6ab6e87.sql",
  "20260922050000_attendance_foundation.sql",
  "20260922070000_organizer_checkin.sql",
];
const readMigration = (name: string) =>
  readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf8");
const event = runOnDate("2026-01-03");
const identities: Record<string, { id: string; email: string; email_confirmed_at?: string }> = {
  organizerA: {
    id: "11111111-1111-4111-8111-111111111111",
    email: "nick@grytrunclub.com",
    email_confirmed_at: "2026-01-01",
  },
  organizerB: {
    id: "22222222-2222-4222-8222-222222222222",
    email: "laura@grytrunclub.com",
    email_confirmed_at: "2026-01-01",
  },
  member: {
    id: "33333333-3333-4333-8333-333333333333",
    email: "member@example.com",
    email_confirmed_at: "2026-01-01",
  },
  unconfirmed: { id: "44444444-4444-4444-8444-444444444444", email: "nick@grytrunclub.com" },
};

test("local staging rehearsal (hosted auth and PostgREST are NOT exercised)", async (t) => {
  const db = new PGlite();
  const priorFetch = globalThis.fetch;
  let externalRequests = 0;
  globalThis.fetch = async () => {
    externalRequests++;
    throw new Error("External requests forbidden in rehearsal");
  };
  let loseNextWriteResponse = false;
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon,authenticated,service_role;`);
    for (const name of migrations) await db.exec(await readMigration(name));
    const count = async (table: string) => {
      assert.match(
        table,
        /^(rsvps|attendance_jobs|checkin_entries|checkin_audit|checkin_requests)$/,
      );
      return (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
    };
    await t.test("inherited grants are removed without breaking service RPC access", async () => {
      // Demonstrates why merely omitting a GRANT is insufficient on an existing database.
      const canDelete = async () =>
        (
          await db.query<{ allowed: boolean }>(
            "SELECT has_table_privilege('service_role','checkin_audit','DELETE') AS allowed",
          )
        ).rows[0].allowed;
      assert.equal(await canDelete(), true);
      const hardening = await readMigration("20260922080000_checkin_privilege_hardening.sql");
      await db.exec(hardening);
      await db.exec(hardening);
      assert.equal(await canDelete(), false);
      const preflight = await readFile(
        new URL("../scripts/checkin-staging-preflight.sql", import.meta.url),
        "utf8",
      );
      const gates = await db.query<{ gate: string; passed: boolean }>(preflight);
      assert.equal(gates.rows.length, 26);
      assert.ok(
        gates.rows.every((row) => row.passed),
        JSON.stringify(gates.rows.filter((row) => !row.passed)),
      );
      for (const role of ["anon", "authenticated", "service_role"]) {
        await db.exec(`SET ROLE ${role}`);
        await assert.rejects(
          db.query(
            "INSERT INTO checkin_sessions(event_id,event_snapshot) VALUES('forbidden','{}')",
          ),
          /permission denied/,
        );
        await assert.rejects(db.query("DELETE FROM checkin_audit"), /permission denied/);
        if (role !== "service_role") {
          await assert.rejects(
            db.query("SELECT read_gryt_checkin($1)", [event.id]),
            /permission denied/,
          );
          await assert.rejects(db.query("SELECT * FROM checkin_entries"), /permission denied/);
          await assert.rejects(
            db.query("INSERT INTO rsvps(name,contact) VALUES('Forbidden','blocked@example.com')"),
            /permission denied/,
          );
        }
        await db.exec("RESET ROLE");
      }
    });
    // Execute functions under the service role to verify grants, not just owner privileges.
    const rpc = async (name: string, args: Record<string, unknown>) => {
      const signatures: Record<string, string[]> = {
        capture_gryt_rsvp: [
          "p_key",
          "p_hash",
          "p_capture_key",
          "p_name",
          "p_contact",
          "p_kind",
          "p_source",
          "p_variant",
          "p_event",
          "p_attribution",
        ],
        read_gryt_checkin: ["p_event_id"],
        write_gryt_checkin: [
          "p_request",
          "p_hash",
          "p_actor",
          "p_email",
          "p_event",
          "p_expected",
          "p_action",
          "p_participant",
          "p_present",
          "p_name",
          "p_reason",
          "p_duplicate_reviewed",
        ],
      };
      const keys = signatures[name];
      if (!keys) throw new Error("Unexpected RPC");
      try {
        const result = await db.transaction(async (tx) => {
          await tx.exec("SET LOCAL ROLE service_role");
          const values = keys.map((k) =>
            typeof args[k] === "object" && args[k] !== null ? JSON.stringify(args[k]) : args[k],
          );
          return (
            await tx.query<{ result: unknown }>(
              `SELECT ${name}(${keys.map((_, i) => `$${i + 1}`).join(",")}) AS result`,
              values,
            )
          ).rows[0].result;
        });
        if (name === "write_gryt_checkin" && loseNextWriteResponse) {
          loseNextWriteResponse = false;
          throw new Error("Synthetic response loss after committed transaction");
        }
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error: { message: (error as Error).message } };
      }
    };
    const client = {
      auth: {
        getUser: async (token: string) => ({
          data: { user: identities[token] ?? null },
          error: identities[token] ? null : { message: "Synthetic expired/invalid session" },
        }),
      },
      rpc,
      from: (table: string) => {
        assert.equal(table, "attendance_jobs");
        const filters: Record<string, string> = {};
        const query = {
          select: (columns: string) => {
            assert.equal(columns, "status");
            return query;
          },
          eq: (key: string, value: string) => {
            assert.ok(["rsvp_id", "kind"].includes(key));
            filters[key] = value;
            return query;
          },
          maybeSingle: async () => ({
            data:
              (
                await db.query("SELECT status FROM attendance_jobs WHERE rsvp_id=$1 AND kind=$2", [
                  filters.rsvp_id,
                  filters.kind,
                ])
              ).rows[0] ?? null,
          }),
        };
        return query;
      },
    } as unknown as SupabaseClient;
    const call = (body?: Record<string, unknown>, actor = "organizerA") =>
      organizerCheckin(
        new Request(`http://localhost/api/admin/checkins?date=${event.localDate}`, {
          method: body ? "POST" : "GET",
          headers: {
            Authorization: `Bearer ${actor}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        }),
        async () => client,
      );
    const command = (revision: number, fields: Record<string, unknown>) => ({
      date: event.localDate,
      requestId: randomUUID(),
      expectedRevision: revision,
      ...fields,
    });
    let participant = "";
    await t.test(
      "actual RSVP handler and migrations feed the organizer board, not attendance",
      async () => {
        const input = {
          name: "Staging Fixture Runner",
          contact: "runner@example.com",
          eventId: event.id,
          eventVersion: event.version,
          idempotencyKey: randomUUID(),
        };
        const capture = () =>
          captureRsvp(
            new Request("http://localhost/api/public/rsvp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input),
            }),
            { db: client, now: new Date("2026-01-02T12:00:00Z"), saveSession: false },
          );
        const first = await capture();
        assert.equal(first.status, 200);
        participant = (await first.json()).rsvpId;
        assert.equal((await (await capture()).json()).rsvpId, participant);
        assert.equal(await count("rsvps"), 1);
        assert.equal(await count("checkin_entries"), 0);
        assert.equal(await count("attendance_jobs"), 3); // queued by RSVP, never processed
        const board = await (await call()).json();
        assert.equal(board.revision, 0);
        assert.equal(board.people[0].id, participant);
        assert.equal(board.people[0].present, false);
        assert.equal(board.people[0].contactHint, "r***@example.com");
        assert.equal(JSON.stringify(board).includes("runner@example.com"), false);
      },
    );
    await t.test(
      "identity decisions deny expired, member and unconfirmed fixtures without writes",
      async () => {
        for (const actor of ["expired", "member", "unconfirmed"]) {
          assert.equal((await call()).headers.get("cache-control"), "no-store");
          assert.equal((await call(undefined, actor)).status, 403);
          assert.equal(
            (
              await call(
                command(0, { action: "mark", participantId: participant, present: true }),
                actor,
              )
            ).status,
            403,
          );
        }
        assert.equal(await count("checkin_entries"), 0);
        assert.equal(await count("checkin_audit"), 0);
      },
    );
    await t.test(
      "a lost response after commit replays once and rejects a different actor's reuse",
      async () => {
        const body = command(0, { action: "mark", participantId: participant, present: true });
        loseNextWriteResponse = true;
        assert.equal((await call(body)).status, 503);
        assert.equal(await count("checkin_entries"), 1);
        assert.equal(await count("checkin_audit"), 1);
        assert.equal((await call(body)).status, 200);
        assert.equal(await count("checkin_audit"), 1);
        assert.equal((await call(body, "organizerB")).status, 409);
        const conflicting = await Promise.all([
          call(command(1, { action: "mark", participantId: participant, present: true })),
          call(
            command(1, { action: "mark", participantId: participant, present: true }),
            "organizerB",
          ),
        ]);
        assert.deepEqual(conflicting.map((r) => r.status).sort(), [200, 409]);
        assert.equal((await (await call()).json()).revision, 2);
      },
    );
    await t.test(
      "audit failure rolls back presence, revision and request receipt atomically",
      async () => {
        await db.exec(
          "ALTER TABLE checkin_audit ADD CONSTRAINT rehearsal_failure CHECK(reason IS DISTINCT FROM 'Force audit failure')",
        );
        const priorRequests = await count("checkin_requests");
        const body = command(2, {
          action: "mark",
          participantId: participant,
          present: false,
          reason: "Force audit failure",
        });
        assert.equal((await call(body)).status, 503);
        const board = await (await call()).json();
        assert.equal(board.revision, 2);
        assert.equal(board.people[0].present, true);
        assert.equal(await count("checkin_requests"), priorRequests);
        assert.equal(await count("checkin_audit"), 2);
        await db.exec("ALTER TABLE checkin_audit DROP CONSTRAINT rehearsal_failure");
        assert.equal((await call(body)).status, 200);
        assert.equal((await (await call()).json()).people[0].present, false);
      },
    );
    await t.test(
      "walk-in review, closure and reopening preserve audit and do not create jobs",
      async () => {
        const duplicate = command(3, {
          action: "walkin",
          participantId: randomUUID(),
          name: " staging fixture RUNNER ",
        });
        assert.equal((await call(duplicate)).status, 409);
        assert.equal(
          (await call({ ...duplicate, requestId: randomUUID(), duplicateReviewed: true })).status,
          200,
        );
        assert.equal(
          (
            await call(
              command(4, {
                action: "close",
                reason: "Synthetic headcount verified",
                reviewed: true,
              }),
            )
          ).status,
          200,
        );
        assert.equal(
          (await call(command(5, { action: "mark", participantId: participant, present: true })))
            .status,
          409,
        );
        assert.equal(
          (
            await call(
              command(5, { action: "reopen", reason: "Synthetic correction", reviewed: true }),
              "organizerB",
            )
          ).status,
          200,
        );
        const board = await (await call()).json();
        assert.equal(board.closed, false);
        assert.equal(board.revision, 6);
        assert.equal(board.people.filter((p: { present: boolean }) => p.present).length, 1);
        assert.equal(board.audit.length, 6);
        assert.equal(await count("attendance_jobs"), 3);
        const jobs = await db.query<{ status: string }>("SELECT status FROM attendance_jobs");
        assert.ok(jobs.rows.every((row) => row.status === "pending"));
        assert.equal(externalRequests, 0);
      },
    );
  } finally {
    globalThis.fetch = priorFetch;
    await db.close();
  }
});
