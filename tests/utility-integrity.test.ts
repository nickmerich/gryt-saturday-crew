import test from "node:test";
import assert from "node:assert/strict";
import { forecastForEvent, windMph, type HourlyPeriod } from "../src/lib/weather";
import { runOnDate, sameRunVersion, canRsvp, runNotice } from "../src/lib/run-occurrence";
import { UNAVAILABLE_CLUB_STATS } from "../src/lib/strava-club";
import { processAttendanceJobs } from "../src/lib/attendance/jobs.server";
import type { SupabaseClient } from "@supabase/supabase-js";

const now = new Date("2026-09-25T18:00:00Z");
const updated = "2026-09-25T17:30:00Z";
const summer = runOnDate("2026-09-26");
const period: HourlyPeriod = {
  startTime: "2026-09-26T07:00:00-04:00",
  endTime: "2026-09-26T08:00:00-04:00",
  temperature: 50,
  temperatureUnit: "F",
  windSpeed: "5 to 10 mph",
  probabilityOfPrecipitation: { value: null },
};

test("missing precipitation is unknown, not a dry forecast", () => {
  const data = forecastForEvent(summer, [period], updated, now);
  assert.equal(data.available, true);
  assert.equal(data.rainChance, null);
  assert.equal(data.windMph, 10);
  assert.equal("feelsLikeF" in data, false);
});
test("forecast selects the period covering a modified start time", () => {
  const changed = runOnDate("2026-09-26", {
    "2026-09-26": { version: 2, status: "modified", startTime: "07:30" },
  });
  assert.equal(forecastForEvent(changed, [period], updated, now).available, true);
  const later = runOnDate("2026-09-26", {
    "2026-09-26": { version: 2, startTime: "09:00", endTime: "10:00" },
  });
  assert.equal(forecastForEvent(later, [period], updated, now).reason, "out_of_range");
});
test("winter event matches the winter UTC offset", () => {
  const winter = runOnDate("2026-12-05");
  const result = forecastForEvent(
    winter,
    [{ ...period, startTime: "2026-12-05T07:00:00-05:00", endTime: "2026-12-05T08:00:00-05:00" }],
    "2026-12-04T18:00:00Z",
    new Date("2026-12-04T18:10:00Z"),
  );
  assert.equal(result.available, true);
});
test("old, missing and future provider timestamps do not display as fresh", () => {
  for (const date of [undefined, "not-a-date", "2026-09-25T14:00:00Z", "2026-09-26T18:00:00Z"])
    assert.equal(forecastForEvent(summer, [period], date, now).reason, "stale");
});
test("bad measurement values stay unknown and Celsius converts explicitly", () => {
  const result = forecastForEvent(
    summer,
    [
      {
        ...period,
        temperature: 10,
        temperatureUnit: "C",
        probabilityOfPrecipitation: { value: 130 },
      },
    ],
    updated,
    now,
  );
  assert.equal(result.tempF, 50);
  assert.equal(result.rainChance, null);
  assert.equal(
    forecastForEvent(summer, [{ ...period, temperatureUnit: "unknown" }], updated, now).tempF,
    null,
  );
  assert.equal(windMph("10 to 20 km/h"), 12);
  assert.equal(windMph("unknown"), null);
});
test("cancelled, unconfirmed and completed events do not produce an invitation forecast", () => {
  for (const status of ["cancelled", "unconfirmed", "completed"] as const) {
    const event = { ...summer, status };
    assert.equal(forecastForEvent(event, [period], updated, now).reason, "event_status");
    assert.equal(canRsvp(event, now), false);
    assert.ok(runNotice(event, now));
  }
});
test("receipt restoration requires exact event details, not a reused human label", () => {
  assert.equal(sameRunVersion(null, summer), false);
  assert.equal(sameRunVersion({ ...summer }, summer), true);
  for (const edit of [
    { version: 2 },
    { status: "cancelled" as const },
    { location: "Different meeting point" },
    { startsAt: "2026-09-26T12:00:00Z" },
    { route: "Other route" },
  ])
    assert.equal(sameRunVersion({ ...summer, ...edit }, summer), false);
  assert.match(summer.label, /2026/);
});
test("unavailable Strava integration never substitutes invented statistics or activities", () => {
  assert.equal(UNAVAILABLE_CLUB_STATS.weeklyMiles, null);
  assert.equal(UNAVAILABLE_CLUB_STATS.longestStreakWeeks, null);
  assert.deepEqual(UNAVAILABLE_CLUB_STATS.recentRuns, []);
});
test("worker cannot report success after losing the claim fence", async () => {
  let claims = 0;
  const chain = {
    select: () => chain,
    eq: () => chain,
    update: () => chain,
    single: async () => ({ data: null, error: { message: "fixture" } }),
    maybeSingle: async () => ({ data: null, error: null }),
  };
  const db = {
    rpc: async () => ({
      data: claims++
        ? []
        : [
            {
              id: "job",
              rsvp_id: "rsvp",
              kind: "confirmation",
              attempts: 1,
              claim_token: "expired-token",
            },
          ],
      error: null,
    }),
    from: () => chain,
  } as unknown as SupabaseClient;
  await assert.rejects(processAttendanceJobs(db), /checkpoint failed/);
});
