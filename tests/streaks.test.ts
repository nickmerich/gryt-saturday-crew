import { describe, expect, test } from "bun:test";
import { summarizeStreak, summarizeStreaks, finishedRunDates } from "../src/lib/streaks";

// Most recent first, as finishedRunDates returns them.
const RUNS = ["2026-09-19", "2026-09-12", "2026-09-05", "2026-08-29", "2026-08-22"];

describe("attendance streaks", () => {
  test("no check-ins means no streak", () => {
    expect(summarizeStreak([], RUNS)).toEqual({
      current: 0,
      longest: 0,
      attended: 0,
      lastAttended: null,
    });
  });

  test("consecutive attendance builds the current streak", () => {
    const s = summarizeStreak(["2026-09-19", "2026-09-12", "2026-09-05"], RUNS);
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
    expect(s.attended).toBe(3);
    expect(s.lastAttended).toBe("2026-09-19");
  });

  test("a missed run ends the current streak but keeps the longest", () => {
    const s = summarizeStreak(["2026-09-12", "2026-09-05", "2026-08-29"], RUNS);
    expect(s.current).toBe(0); // missed the latest finished run
    expect(s.longest).toBe(3);
  });

  test("a gap in the middle splits the streaks", () => {
    const s = summarizeStreak(["2026-09-19", "2026-09-05", "2026-08-29"], RUNS);
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
    expect(s.attended).toBe(3);
  });

  test("cancelled Saturdays are simply absent from the run list, so they do not break a streak", () => {
    const withGap = ["2026-09-19", "2026-09-05"]; // 09-12 cancelled, not listed
    const s = summarizeStreak(["2026-09-19", "2026-09-05"], withGap);
    expect(s.current).toBe(2);
  });

  test("a late check-in restores the streak on the next read", () => {
    const before = summarizeStreak(["2026-09-12", "2026-09-05"], RUNS);
    expect(before.current).toBe(0);
    const after = summarizeStreak(["2026-09-19", "2026-09-12", "2026-09-05"], RUNS);
    expect(after.current).toBe(3);
  });

  test("streaks are computed per person", () => {
    const map = summarizeStreaks(
      [
        { personKey: "a", eventDate: "2026-09-19" },
        { personKey: "a", eventDate: "2026-09-12" },
        { personKey: "b", eventDate: "2026-09-05" },
      ],
      RUNS,
    );
    expect(map.get("a")!.current).toBe(2);
    expect(map.get("b")!.current).toBe(0);
    expect(map.get("b")!.longest).toBe(1);
  });

  test("this Saturday's run is not counted until it is over", () => {
    // Saturday Sep 26 2026, 6:00 AM New York = 10:00 UTC, run not finished.
    const during = finishedRunDates(5, new Date("2026-09-26T10:00:00Z"));
    expect(during).not.toContain("2026-09-26");
    expect(during[0]).toBe("2026-09-19");
    // Same day, after the run.
    const after = finishedRunDates(5, new Date("2026-09-26T14:00:00Z"));
    expect(after[0]).toBe("2026-09-26");
  });
});
