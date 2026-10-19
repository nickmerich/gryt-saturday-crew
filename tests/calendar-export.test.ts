import { expect, test, setSystemTime } from "bun:test";
import { nextSaturdayIcsDataUrl } from "../src/lib/run-schedule";

test("the same Saturday calendar export stays identical across render clocks", () => {
  const localMonday = new Date(2026, 9, 19, 4, 18);
  try {
    setSystemTime(new Date("2026-10-19T08:18:00Z"));
    const serverUrl = nextSaturdayIcsDataUrl(localMonday);
    setSystemTime(new Date("2026-10-19T08:18:03Z"));
    expect(nextSaturdayIcsDataUrl(localMonday)).toBe(serverUrl);
    const calendar = decodeURIComponent(serverUrl.split(",").slice(1).join(","));
    expect(calendar).toContain("DTSTART;TZID=America/New_York:20261024T070000");
    expect(calendar).toContain("UID:gryt-run-20261024@grytrunclub.com");
    expect(calendar).toContain("DTSTAMP:20260905T000000Z");
  } finally {
    setSystemTime();
  }
});