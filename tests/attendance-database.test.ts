import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("migration, atomic idempotency, job leases and denied public writes in isolated Postgres", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE TABLE public.rsvps(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,contact text NOT NULL,
        source text,hero_variant text,event_label text,created_at timestamptz DEFAULT now());`);
    const sql = await readFile(
      new URL("../supabase/migrations/20260922050000_attendance_foundation.sql", import.meta.url),
      "utf8",
    );
    await db.exec(sql);
    await db.exec(sql); // additive migration can be reapplied
    const event = JSON.stringify({
      id: "gryt-saturday-2026-09-26",
      version: 1,
      label: "Fixture run",
    });
    const capture = (key: string, hash = "hash", identity = "capture", name = "Test Runner") =>
      db.query<{ receipt: { id: string; created: boolean } }>(
        "SELECT public.capture_gryt_rsvp($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb) AS receipt",
        [key, hash, identity, name, "test@example.com", "email", null, null, event, "{}"],
      );
    const key = "d6b478a6-7f19-4003-a41a-00d7b174cd84";
    const first = (await capture(key)).rows[0].receipt;
    assert.equal(first.created, true);
    assert.equal((await capture(key)).rows[0].receipt.id, first.id);
    assert.equal(
      (await capture("d6b478a6-7f19-4003-a41a-00d7b174cd85")).rows[0].receipt.id,
      first.id,
    );
    await assert.rejects(capture(key, "changed"), /RSVP_KEY_CONFLICT/);
    assert.equal(
      (await db.query<{ count: number }>("SELECT count(*)::int AS count FROM rsvps")).rows[0].count,
      1,
    );
    assert.equal(
      (await db.query<{ count: number }>("SELECT count(*)::int AS count FROM attendance_jobs"))
        .rows[0].count,
      3,
    );
    const other = (
      await capture("d6b478a6-7f19-4003-a41a-00d7b174cd86", "other", "other-name", "Another Person")
    ).rows[0].receipt;
    assert.notEqual(other.id, first.id); // shared contact does not merge two names
    const claimed = await db.query<{ id: string }>("SELECT * FROM claim_attendance_job()");
    assert.equal(claimed.rows.length, 1);
    assert.equal((await db.query("SELECT * FROM claim_attendance_job()")).rows.length, 0);
    await db.exec(
      `UPDATE attendance_jobs SET lease_until=now()-interval '1 second' WHERE status='processing';`,
    );
    await db.query("SELECT * FROM claim_attendance_job()");
    assert.equal(
      (
        await db.query<{ status: string }>("SELECT status FROM attendance_jobs WHERE id=$1", [
          claimed.rows[0].id,
        ])
      ).rows[0].status,
      "needs_review",
    );
    await db.exec("SET ROLE anon");
    await assert.rejects(db.query("SELECT * FROM attendance_jobs"), /permission denied/);
    await assert.rejects(capture(key), /permission denied/);
    await assert.rejects(
      db.query("INSERT INTO rsvps(name,contact) VALUES('No','no@example.com')"),
      /permission denied/,
    );
    await db.exec("RESET ROLE");
  } finally {
    await db.close();
  }
});
