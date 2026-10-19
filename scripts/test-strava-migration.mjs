// Local-only PostgreSQL smoke test. Supply a PGlite installation through PGLITE_MODULE.
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const db = new PGlite();
try {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
  const sql = await readFile(
    new URL(
      "../supabase/migrations/20261019060000_verified_strava_connection.sql",
      import.meta.url,
    ),
    "utf8",
  );
  await db.exec(sql);
  await db.exec(sql); // Migration is safe to replay.
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    for (const query of [
      "select * from public.strava_club_connections",
      "select public.claim_strava_club_refresh(1708552,'00000000-0000-4000-8000-000000000001')",
    ]) {
      await assert.rejects(db.query(query), /permission denied/);
    }
    await db.exec("reset role");
  }
  await db.exec("set role service_role");
  await db.exec(
    `insert into public.strava_club_connections(club_id,encrypted_tokens) values (1708552,'test-ciphertext')`,
  );
  const one = "00000000-0000-4000-8000-000000000001";
  const two = "00000000-0000-4000-8000-000000000002";
  const claim = async (id) =>
    (await db.query("select public.claim_strava_club_refresh(1708552,$1) as ok", [id])).rows[0].ok;
  assert.equal(await claim(one), true);
  assert.equal(await claim(two), false);
  await db.exec(
    "update public.strava_club_connections set refresh_lease_until=now()-interval '1 second'",
  );
  assert.equal(await claim(two), true);
  const wrong = await db.query(
    "update public.strava_club_connections set encrypted_tokens='wrong' where refresh_lease=$1 returning club_id",
    [one],
  );
  assert.equal(wrong.rows.length, 0);
  await db.exec("update public.strava_club_connections set member_count=0,verified_at=now()");
  const result = await db.query("select member_count from public.strava_club_connections");
  assert.equal(result.rows[0].member_count, 0);
  console.log(
    "PASS: migration replay, anonymous/authenticated denial, service-role access, refresh lease exclusion/expiry, and valid zero count.",
  );
} finally {
  await db.close();
}
