import assert from "node:assert/strict";
import test from "node:test";
import {
  currentRun,
  runOnDate,
  runsIcs,
  googleCalendarUrl,
  canRsvp,
  localRunInstant,
  runsForMonth,
} from "../src/lib/run-occurrence.ts";
import { nextSaturdayISOs } from "../src/lib/run-schedule.ts";
import { rsvpSchema, normalizeContact, confirmationMessage } from "../src/lib/attendance/schema.ts";
import { rosterIdentity, waiverIdentity } from "../src/lib/roster/identity.ts";
import { syncRsvpToNotion, NotionSyncError } from "../src/lib/notion/sync.server.ts";
import { captureRsvp } from "../src/lib/attendance/capture.server.ts";
import { attendanceAdmin } from "../src/lib/attendance/admin.server.ts";

test("summer, winter and DST calendars represent 7 AM New York", () => {
  assert.equal(runOnDate("2026-07-04").startsAt, "2026-07-04T11:00:00.000Z");
  assert.equal(runOnDate("2026-12-05").startsAt, "2026-12-05T12:00:00.000Z");
  assert.equal(runOnDate("2026-10-31").startsAt, "2026-10-31T11:00:00.000Z");
  assert.equal(runOnDate("2026-11-07").startsAt, "2026-11-07T12:00:00.000Z");
  assert.equal(
    new URL(googleCalendarUrl(runOnDate("2026-11-07"))).searchParams.get("dates"),
    "20261107T120000Z/20261107T130000Z",
  );
  assert.match(runsIcs([runOnDate("2026-11-07")]), /DTSTART:20261107T120000Z/);
});
test("same-day event stays visible during run; closes RSVP at start", () => {
  for (const time of ["10:59:00", "11:00:00", "11:59:00"]) {
    const now = new Date(`2026-09-26T${time}Z`);
    assert.equal(currentRun(now).localDate, "2026-09-26");
    assert.equal(canRsvp(currentRun(now), now), time === "10:59:00");
  }
  assert.equal(currentRun(new Date("2026-09-26T12:00:00Z")).localDate, "2026-10-03");
  assert.equal(currentRun(new Date("2026-12-31T23:00:00Z")).localDate, "2027-01-02");
});
test("cancelled and modified occurrences use consistent version/time/location", () => {
  const overrides = {
    "2026-09-26": { version: 2, status: "cancelled" as const, notice: "Trail closure" },
    "2026-10-03": {
      version: 3,
      status: "modified" as const,
      startTime: "08:00",
      endTime: "09:00",
      location: "Reviewed alternate meeting point",
    },
  };
  const cancelled = currentRun(new Date("2026-09-25T16:00:00Z"), overrides);
  assert.equal(canRsvp(cancelled), false);
  assert.match(runsIcs([cancelled]), /STATUS:CANCELLED/);
  const modified = runOnDate("2026-10-03", overrides);
  assert.equal(modified.startsAt, "2026-10-03T12:00:00.000Z");
  assert.equal(modified.version, 3);
  assert.match(new URL(googleCalendarUrl(modified)).searchParams.get("location")!, /alternate/);
});
test("invalid dates, non-Saturdays and nonexistent local times rejected", () => {
  assert.throws(() => runOnDate("2026-02-30"));
  assert.throws(() => runOnDate("2026-09-25"));
  assert.throws(() => localRunInstant("2026-03-08", "02:30"));
  assert.equal(runsForMonth(2026, 10).length, 4);
  assert.deepEqual(nextSaturdayISOs(2, new Date("2026-10-30T12:00:00Z")), [
    "2026-10-31T11:00:00.000Z",
    "2026-11-07T12:00:00.000Z",
  ]);
});
test("contact normalization and roster grouping never guess by name alone", () => {
  assert.deepEqual(normalizeContact("(412) 555-0100"), { kind: "phone", value: "+14125550100" });
  assert.deepEqual(normalizeContact("TEST@example.com"), {
    kind: "email",
    value: "test@example.com",
  });
  assert.equal(normalizeContact("same-name"), null);
  assert.notEqual(rosterIdentity("Alex", "unknown", "1"), rosterIdentity("Alex", "unknown", "2"));
  assert.notEqual(
    rosterIdentity("Alex", "family@example.com", "1"),
    rosterIdentity("Sam", "family@example.com", "2"),
  );
  assert.notEqual(waiverIdentity("Alex", "a@example.com"), waiverIdentity("Alex", "b@example.com"));
});
const run = runOnDate("2026-09-26");
const base = {
  name: "Test Runner",
  contact: "test@example.com",
  eventId: run.id,
  eventVersion: 1,
  idempotencyKey: "d6b478a6-7f19-4003-a41a-00d7b174cd84",
};
test("RSVP validation rejects invalid contacts, event refs, spam and full referrer URLs", () => {
  assert.equal(rsvpSchema.safeParse(base).success, true);
  for (const change of [
    { contact: "bad" },
    { website: "spam" },
    { eventId: "fake" },
    { eventVersion: 0 },
    { idempotencyKey: "bad" },
    { attribution: { referring_site: "https://x.test/?email=test@example.com" } },
  ]) {
    assert.equal(rsvpSchema.safeParse({ ...base, ...change }).success, false);
  }
  assert.match(confirmationMessage("queued"), /not yet sent/);
  assert.match(confirmationMessage("not_available"), /not enabled/);
});
function request(body: unknown) {
  return new Request("http://localhost/api/public/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
test("capture persists before delivery and does not claim sent", async () => {
  let called = 0;
  const db = {
    rpc: async () => {
      called++;
      return { data: { id: "fixture-rsvp", created: true }, error: null };
    },
  };
  const response = await captureRsvp(request(base), {
    db: db as never,
    now: new Date("2026-09-25T12:00:00Z"),
    saveSession: false,
  });
  const receipt = await response.json();
  assert.equal(response.status, 200);
  assert.equal(called, 1);
  assert.equal(receipt.confirmationSent, false);
  assert.equal(receipt.confirmationStatus, "queued");
});
test("stale event and invalid body never touch database", async () => {
  const db = {
    rpc: async () => {
      throw new Error("Must not touch database");
    },
  };
  for (const body of [
    { ...base, eventVersion: 2 },
    { ...base, eventId: "gryt-saturday-2026-09-19" },
  ]) {
    assert.equal(
      (
        await captureRsvp(request(body), {
          db: db as never,
          now: new Date("2026-09-25T12:00:00Z"),
          saveSession: false,
        })
      ).status,
      409,
    );
  }
  assert.equal(
    (
      await captureRsvp(request({ ...base, name: "x".repeat(9000) }), {
        db: db as never,
        now: new Date(),
        saveSession: false,
      })
    ).status,
    400,
  );
});
test("database errors and rate limits never display success", async () => {
  for (const [message, status] of [
    ["unavailable", 503],
    ["RSVP_RATE_LIMIT", 429],
    ["RSVP_KEY_CONFLICT", 409],
  ] as const) {
    const db = { rpc: async () => ({ data: null, error: { message } }) };
    assert.equal(
      (
        await captureRsvp(request(base), {
          db: db as never,
          now: new Date("2026-09-25T12:00:00Z"),
          saveSession: false,
        })
      ).status,
      status,
    );
  }
});
test("unauthenticated job endpoint denies reads and writes before opening database", async () => {
  assert.equal(
    (await attendanceAdmin(new Request("http://localhost/api/admin/attendance"))).status,
    403,
  );
  assert.equal(
    (
      await attendanceAdmin(
        new Request("http://localhost/api/admin/attendance", { method: "POST" }),
      )
    ).status,
    403,
  );
});
test("ordinary and unconfirmed users cannot read or process jobs", async () => {
  for (const user of [
    { email: "not-an-admin@example.com", email_confirmed_at: "2026-09-01" },
    { email: "nick@grytrunclub.com", email_confirmed_at: null },
  ]) {
    const db = { auth: { getUser: async () => ({ data: { user }, error: null }) } };
    for (const method of ["GET", "POST"]) {
      const response = await attendanceAdmin(
        new Request("http://localhost/api/admin/attendance", {
          method,
          headers: { authorization: "Bearer synthetic-test-token" },
        }),
        async () => db as never,
      );
      assert.equal(response.status, 403);
    }
  }
});
test("Notion identity ambiguity and phone contacts require review", async () => {
  const input = {
    rsvpId: "test-id",
    name: "Alex",
    contact: "shared@example.com",
    source: null,
    event: run,
  };
  await assert.rejects(
    syncRsvpToNotion(
      input,
      async () => {},
      async () => ({
        id: "",
        results: [
          { id: "another-person", properties: { Name: { title: [{ plain_text: "Sam" }] } } },
        ],
      }),
    ),
    (error: unknown) => error instanceof NotionSyncError && error.needsReview,
  );
  await assert.rejects(
    syncRsvpToNotion({ ...input, contact: "+14125550100" }, async () => {}),
    /manual identity review/,
  );
});
test("Notion reuses checkpoint IDs and never infers attendance", async () => {
  let calls = 0;
  const input = {
    rsvpId: "fixture",
    name: "Test Runner",
    contact: "test@example.com",
    source: null,
    event: run,
    memberPageId: "member",
    attendancePageId: "rsvp",
  };
  const result = await syncRsvpToNotion(
    input,
    async () => {},
    async () => {
      calls++;
      return { id: "" };
    },
  );
  assert.equal(calls, 0);
  assert.equal(result.attendancePageId, "rsvp");
  const payloads: unknown[] = [];
  await syncRsvpToNotion(
    { ...input, attendancePageId: null },
    async () => {},
    async (path, body) => {
      payloads.push(body);
      return path === "/pages" ? { id: "new-rsvp" } : { id: "", results: [] };
    },
  );
  const text = JSON.stringify(payloads);
  assert.match(text, /Attendance Status.*RSVP/);
  assert.match(text, /2026-09-26/);
  assert.doesNotMatch(text, /First-Timer|Attended/);
});
