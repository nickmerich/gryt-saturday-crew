import { describe, expect, test } from "bun:test";
import {
  getOccurrence,
  occurrenceFor,
  nyWallClockToUtc,
  nextSaturdayISOs,
  validateEventRef,
  RUN_EXCEPTIONS,
  type RunOccurrence,
} from "../src/lib/run-schedule";

// Helper: the local wall-clock hour in New York for an ISO instant.
function nyHour(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

describe("America/New_York conversion", () => {
  test("July and December 7 AM map to different UTC instants", () => {
    const july = nyWallClockToUtc(2026, 7, 4, 7).toISOString();
    const december = nyWallClockToUtc(2026, 12, 5, 7).toISOString();
    expect(july).toBe("2026-07-04T11:00:00.000Z"); // EDT, UTC-4
    expect(december).toBe("2026-12-05T12:00:00.000Z"); // EST, UTC-5
  });

  test("Oct 31 and Nov 7 2026 both read 7 AM locally", () => {
    for (const date of ["2026-10-31", "2026-11-07"]) {
      expect(nyHour(occurrenceFor(date).startUtc)).toBe("07:00");
    }
  });

  test("Oct 31 and Nov 7 2026 sit on opposite sides of the clock change", () => {
    expect(occurrenceFor("2026-10-31").startUtc).toBe("2026-10-31T11:00:00.000Z");
    expect(occurrenceFor("2026-11-07").startUtc).toBe("2026-11-07T12:00:00.000Z");
  });
});

describe("which run is shown", () => {
  const sat = "2026-09-26";
  const at = (iso: string) => getOccurrence(new Date(iso));

  test("Friday shows the coming Saturday", () => {
    expect(at("2026-09-25T18:00:00Z").localDate).toBe(sat);
  });

  test("Saturday 6:59 AM local still shows today", () => {
    const occ = at("2026-09-26T10:59:00Z");
    expect(occ.localDate).toBe(sat);
    expect(occ.status).toBe("scheduled");
  });

  test("Saturday 7:00 AM local is in progress and still today", () => {
    const occ = at("2026-09-26T11:00:00Z");
    expect(occ.localDate).toBe(sat);
    expect(occ.status).toBe("in-progress");
  });

  test("mid-run still shows today", () => {
    expect(at("2026-09-26T11:45:00Z").localDate).toBe(sat);
  });

  test("after the run rolls to next Saturday", () => {
    expect(at("2026-09-26T13:00:00Z").localDate).toBe("2026-10-03");
  });

  test("a visitor in another timezone sees the same run as the server", () => {
    const instant = new Date("2026-09-26T10:59:00Z");
    expect(getOccurrence(instant).id).toBe(at("2026-09-26T10:59:00Z").id);
  });

  test("December to January rollover", () => {
    const occ = at("2026-12-27T12:00:00Z");
    expect(occ.localDate).toBe("2027-01-02");
    expect(nyHour(occ.startUtc)).toBe("07:00");
  });
});

describe("cancelled and modified runs", () => {
  const date = "2026-10-10";

  test("a cancelled Saturday is still addressable with its status", () => {
    RUN_EXCEPTIONS[date] = { status: "cancelled", version: 2, note: "Trail closed" };
    try {
      const occ = occurrenceFor(date);
      expect(occ.status).toBe("cancelled");
      expect(occ.note).toBe("Trail closed");
      // And the site skips past it.
      expect(getOccurrence(new Date("2026-10-07T12:00:00Z")).localDate).toBe("2026-10-17");
    } finally {
      delete RUN_EXCEPTIONS[date];
    }
  });

  test("a stale tab submitting a cancelled run is rejected", () => {
    RUN_EXCEPTIONS[date] = { status: "cancelled", version: 2 };
    try {
      const result = validateEventRef(`gryt-run-${date}`, 1, new Date("2026-10-07T12:00:00Z"));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("cancelled");
    } finally {
      delete RUN_EXCEPTIONS[date];
    }
  });
});

describe("run numbering and identity", () => {
  test("numbering is unchanged: Run #18 is Sep 5, 2026", () => {
    expect(occurrenceFor("2026-09-05").runNumber).toBe(18);
    expect(occurrenceFor("2026-09-12").runNumber).toBe(19);
  });

  test("the id, date and schema instants agree", () => {
    const now = new Date("2026-09-25T18:00:00Z");
    const occ = getOccurrence(now);
    expect(occ.id).toBe(`gryt-run-${occ.localDate}`);
    expect(nextSaturdayISOs(1, now)[0]).toBe(occ.startUtc);
  });

  test("the next 12 schema dates are all 7 AM local and weekly", () => {
    const isos = nextSaturdayISOs(12, new Date("2026-09-25T18:00:00Z"));
    expect(isos).toHaveLength(12);
    for (const iso of isos) expect(nyHour(iso)).toBe("07:00");
    for (let i = 1; i < isos.length; i++) {
      const days = (Date.parse(isos[i]!) - Date.parse(isos[i - 1]!)) / 86400000;
      expect(Math.round(days)).toBe(7);
    }
  });
});

describe("event reference validation", () => {
  const now = new Date("2026-09-25T18:00:00Z");
  const current: RunOccurrence = getOccurrence(now);

  test("legacy payloads without an event id are accepted", () => {
    const result = validateEventRef(null, null, now);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.occurrence.id).toBe(current.id);
  });

  test("the current event id and version are accepted", () => {
    expect(validateEventRef(current.id, current.version, now).ok).toBe(true);
  });

  test("a stale event id is rejected", () => {
    const result = validateEventRef("gryt-run-2026-09-19", 1, now);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("stale");
  });

  test("a version mismatch is rejected", () => {
    const result = validateEventRef(current.id, 99, now);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("stale");
  });

  test("a malformed event id is rejected", () => {
    const result = validateEventRef("not-a-run", 1, now);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("unknown");
  });
});
