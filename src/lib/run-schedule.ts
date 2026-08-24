// Single source of truth for GRYT's Saturday run schedule and run numbering.
// Anchor: Run #18 == Sat, Sep 5, 2026. Weekly cadence, 7:00 AM America/New_York.
export const RUN_ANCHOR_MS = Date.UTC(2026, 8, 5);
export const RUN_ANCHOR_NUMBER = 18;

export function nextSaturday(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun..6=Sat
  // Always advance to the upcoming Saturday. If today is Saturday, roll to next week.
  const add = day === 6 ? 7 : (6 - day + 7) % 7;
  d.setDate(d.getDate() + add);
  return d;
}

export function nextRunNumber(from: Date = new Date()): number {
  const sat = nextSaturday(from);
  const satUTC = Date.UTC(sat.getFullYear(), sat.getMonth(), sat.getDate());
  const weeks = Math.round((satUTC - RUN_ANCHOR_MS) / (7 * 24 * 60 * 60 * 1000));
  return RUN_ANCHOR_NUMBER + weeks;
}

export function nextSaturdayShortDate(from: Date = new Date()): string {
  return nextSaturday(from).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function nextSaturdayLabel(from: Date = new Date()): string {
  return `GRYT Run #${nextRunNumber(from)} · Sat, ${nextSaturdayShortDate(from)} · 7 AM`;
}

export function nextSaturdayLabelLong(from: Date = new Date()): string {
  return `GRYT Run #${nextRunNumber(from)} · Sat, ${nextSaturdayShortDate(from)} · 7:00 AM`;
}

/** Next `count` Saturday 7am occurrences (ISO) for recurring event schema. */
export function nextSaturdayISOs(count: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  const d = new Date(from);
  d.setUTCHours(11, 0, 0, 0); // 7:00 AM America/New_York ~= 11:00 UTC. Best-effort.
  const day = d.getUTCDay();
  const add = (6 - day + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString());
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return out;
}

function ymd(d: Date) {
  return {
    y: d.getFullYear(),
    m: String(d.getMonth() + 1).padStart(2, "0"),
    d: String(d.getDate()).padStart(2, "0"),
  };
}

/** ISO date (YYYY-MM-DD) of the next Saturday run. */
export function nextSaturdayISODate(from: Date = new Date()): string {
  const { y, m, d } = ymd(nextSaturday(from));
  return `${y}-${m}-${d}`;
}

/** Downloadable .ics for the next Saturday 7:00 AM run (America/New_York). */
export function nextSaturdayIcsDataUrl(from: Date = new Date()): string {
  const sat = nextSaturday(from);
  const { y, m, d } = ymd(sat);
  const runNum = nextRunNumber(from);
  const dtStart = `${y}${m}${d}T070000`;
  const dtEnd = `${y}${m}${d}T080000`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `gryt-run-${y}${m}${d}@grytrunclub.com`;
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GRYT Run Club//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "BEGIN:STANDARD",
    "DTSTART:20071104T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:20070311T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=America/New_York:${dtStart}`,
    `DTEND;TZID=America/New_York:${dtEnd}`,
    `SUMMARY:${esc(`GRYT Run #${runNum} — Saturday Morning`)}`,
    `LOCATION:${esc("212 Valley Brook Rd, McMurray, PA 15317")}`,
    `DESCRIPTION:${esc("All paces. All parents. 7 AM sharp. Coffee in the lot after. https://grytrunclub.com")}`,
    "URL:https://grytrunclub.com",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
}

export function nextSaturdayIcsFilename(from: Date = new Date()): string {
  const { y, m, d } = ymd(nextSaturday(from));
  return `gryt-run-${y}-${m}-${d}.ics`;
}
