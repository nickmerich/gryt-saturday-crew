import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  checkinCommand,
  checkinCounts,
  checkinDate,
  contactHint,
} from "../src/lib/attendance/checkin";
import { organizerCheckin } from "../src/lib/attendance/checkin.server";
import { runOnDate } from "../src/lib/run-occurrence";

const actor = "11111111-1111-4111-8111-111111111111";
const runner = "22222222-2222-4222-8222-222222222222";
const walkin = "33333333-3333-4333-8333-333333333333";
const event = runOnDate("2026-01-03");
test("dates, correction reasons, review acknowledgements and masked contact", () => {
  assert.equal(checkinDate.safeParse("2026-02-30").success, false);
  assert.equal(checkinDate.safeParse("2026-09-20").success, false);
  assert.equal(checkinDate.safeParse("2026-09-19").success, true);
  const base = { date: "2026-09-19", requestId: actor, expectedRevision: 0 };
  assert.equal(
    checkinCommand.safeParse({ ...base, action: "mark", participantId: runner, present: false })
      .success,
    false,
  );
  assert.equal(
    checkinCommand.safeParse({ ...base, action: "close", reason: "Reviewed" }).success,
    false,
  );
  assert.equal(
    checkinCommand.safeParse({ ...base, action: "close", reason: "Reviewed", reviewed: true })
      .success,
    true,
  );
  assert.equal(contactHint("fixture@example.com"), "f***@example.com");
  assert.equal(contactHint("+14125550100"), "Phone ending 0100");
  assert.deepEqual(
    checkinCounts([
      {
        id: actor,
        name: "A",
        source: "rsvp",
        present: false,
        recordedAt: null,
        invitationChanged: false,
        contactHint: "",
      },
      {
        id: runner,
        name: "B",
        source: "walkin",
        present: true,
        recordedAt: null,
        invitationChanged: false,
        contactHint: "",
      },
    ]),
    { rsvps: 1, present: 1, walkins: 1, unrecorded: 1 },
  );
});
test("API rejects anonymous, worker, non-admin and unconfirmed identities", async () => {
  let databases = 0;
  const never = async () => {
    databases++;
    throw new Error("Should not reach database");
  };
  for (const headers of [{}, { "x-attendance-job-token": "worker" }]) {
    const response = await organizerCheckin(
      new Request("http://localhost/api/admin/checkins", { headers }),
      never,
    );
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.equal(databases, 0);
  for (const user of [
    { id: actor, email: "not-admin@example.com", email_confirmed_at: "2026-01-01" },
    { id: actor, email: "nick@grytrunclub.com" },
  ]) {
    const db: any = { auth: { getUser: async () => ({ data: { user }, error: null }) } };
    const response = await organizerCheckin(
      new Request("http://localhost/api/admin/checkins?date=2026-09-19", {
        headers: { Authorization: "Bearer fixture" },
      }),
      async () => db,
    );
    assert.equal(response.status, 403);
  }
});
test("API masks contacts, retains unrecorded status, and never invokes a writer on GET", async () => {
  const db: any = {
    auth: {
      getUser: async () => ({
        data: {
          user: { id: actor, email: "nick@grytrunclub.com", email_confirmed_at: "2026-01-01" },
        },
      }),
    },
    rpc: async (name: string) => {
      assert.equal(name, "read_gryt_checkin");
      return {
        data: {
          session: null,
          entries: [],
          audit: [],
          rsvps: [
            { id: runner, name: "Test Runner", contact: "test@example.com", event_snapshot: event },
          ],
        },
      };
    },
  };
  const response = await organizerCheckin(
    new Request("http://localhost/api/admin/checkins?date=2026-01-03", {
      headers: { Authorization: "Bearer fixture" },
    }),
    async () => db,
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.people[0].contactHint, "t***@example.com");
  assert.equal(body.people[0].present, false);
  assert.equal(JSON.stringify(body).includes("test@example.com"), false);
});
test("API enforces valid commands and returns a conflict rather than a false save", async () => {
  let calls = 0;
  const db: any = {
    auth: {
      getUser: async () => ({
        data: {
          user: { id: actor, email: "nick@grytrunclub.com", email_confirmed_at: "2026-01-01" },
        },
      }),
    },
    rpc: async () => {
      calls++;
      return { error: { message: "CHECKIN_REVISION" } };
    },
  };
  const send = (body: unknown) =>
    organizerCheckin(
      new Request("http://localhost/api/admin/checkins", {
        method: "POST",
        headers: { Authorization: "Bearer fixture", "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      async () => db,
    );
  assert.equal((await send({ action: "close" })).status, 422);
  assert.equal(calls, 0);
  const response = await send({
    date: "2026-01-03",
    requestId: actor,
    expectedRevision: 0,
    action: "mark",
    participantId: runner,
    present: true,
  });
  assert.equal(response.status, 409);
  assert.equal(calls, 1);
});
test("isolated database: check-in, replay, collisions, revisions, walk-ins, correction, closure and audit access", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE TABLE rsvps(id uuid PRIMARY KEY,name text NOT NULL,contact text NOT NULL,event_id text,event_snapshot jsonb,created_at timestamptz DEFAULT now());`);
    const sql = await readFile(
      new URL("../supabase/migrations/20260922070000_organizer_checkin.sql", import.meta.url),
      "utf8",
    );
    await db.exec(sql);
    await db.exec(sql);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20260922080000_checkin_privilege_hardening.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.query(
      "INSERT INTO rsvps(id,name,contact,event_id,event_snapshot) VALUES($1,'Test Runner','test@example.com',$2,$3)",
      [runner, event.id, JSON.stringify(event)],
    );
    let key = 0;
    const id = () => `00000000-0000-4000-8000-${String(++key).padStart(12, "0")}`;
    const write = async (
      revision: number,
      action: string,
      options: {
        key?: string;
        hash?: string;
        person?: string;
        present?: boolean;
        name?: string;
        reason?: string;
        duplicate?: boolean;
        event?: typeof event;
      } = {},
    ) =>
      db.query<{ result: { success: boolean; revision: number } }>(
        "SELECT write_gryt_checkin($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) AS result",
        [
          options.key ?? id(),
          options.hash ?? "fixture",
          actor,
          "organizer@example.com",
          JSON.stringify(options.event ?? event),
          revision,
          action,
          options.person ?? runner,
          options.present ?? true,
          options.name ?? null,
          options.reason ?? null,
          options.duplicate ?? false,
        ],
      );
    const read = async () =>
      (await db.query<{ board: any }>("SELECT read_gryt_checkin($1) AS board", [event.id])).rows[0]
        .board;
    assert.equal((await read()).session, null); // GET does not create attendance
    const retry = id();
    assert.equal((await write(0, "mark", { key: retry })).rows[0].result.revision, 1);
    assert.equal((await write(0, "mark", { key: retry })).rows[0].result.revision, 1);
    assert.equal((await read()).audit.length, 1);
    await assert.rejects(write(1, "mark", { key: retry, hash: "changed" }), /CHECKIN_KEY_CONFLICT/);
    await assert.rejects(write(0, "mark"), /CHECKIN_REVISION/);
    await assert.rejects(write(1, "mark", { person: actor }), /CHECKIN_PERSON/);
    await assert.rejects(
      write(1, "walkin", { person: walkin, name: " test   RUNNER " }),
      /CHECKIN_DUPLICATE/,
    );
    await write(1, "walkin", { person: walkin, name: "Second Runner" });
    await assert.rejects(write(2, "mark", { present: false }), /CHECKIN_REASON/);
    await write(2, "mark", { present: false, reason: "Tapped wrong runner" });
    await write(3, "close", { reason: "Headcount reconciled" });
    await assert.rejects(write(4, "mark"), /CHECKIN_CLOSED/);
    const closed = await read();
    assert.equal(closed.session.closed, true);
    assert.equal(closed.entries.find((e: any) => e.participant_id === runner).present, false);
    assert.equal(closed.entries.find((e: any) => e.participant_id === walkin).present, true);
    assert.equal(
      closed.audit.find((a: any) => a.action === "mark" && !a.present).previous_present,
      true,
    );
    await write(4, "reopen", { reason: "Correcting a late arrival" });
    await assert.rejects(
      write(5, "mark", { event: { ...event, version: 2 } }),
      /CHECKIN_EVENT_CHANGED/,
    );
    await assert.rejects(
      write(0, "mark", { event: { ...runOnDate("2099-01-03") } }),
      /CHECKIN_NOT_OPEN/,
    );
    await assert.rejects(
      write(0, "mark", { event: { ...event, status: "cancelled" } }),
      /CHECKIN_NOT_OPEN/,
    );
    assert.equal((await read()).session.revision, 5);
    assert.equal((await read()).audit.length, 5);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`SET ROLE ${role}`);
      await assert.rejects(read(), /permission denied/);
      await assert.rejects(write(5, "mark"), /permission denied/);
      await assert.rejects(db.query("SELECT * FROM checkin_entries"), /permission denied/);
      await db.exec("RESET ROLE");
    }
    await db.exec("SET ROLE service_role");
    assert.ok(await read());
    await assert.rejects(db.query("DELETE FROM checkin_audit"), /permission denied/);
    await db.exec("RESET ROLE");
  } finally {
    await db.close();
  }
});
