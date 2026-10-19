// Single source of truth for GRYT's Saturday run schedule and run numbering.
// Anchor: Run #18 == Sat, Sep 5, 2026. Weekly cadence, 7:00 AM America/New_York.
export const RUN_ANCHOR_MS = Date.UTC(2026, 8, 5);
export const RUN_ANCHOR_NUMBER = 18;

/** Saturdays with no GRYT club run (YYYY-MM-DD). Numbering is unaffected. */
export const SKIPPED_RUN_DATES: string[] = [];

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function nextSaturday(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun..6=Sat
  // Always advance to the upcoming Saturday. If today is Saturday, roll to next week.
  const add = day === 6 ? 7 : (6 - day + 7) % 7;
  d.setDate(d.getDate() + add);
  // Skip any Saturdays where the club isn't running.
  let guard = 0;
  while (SKIPPED_RUN_DATES.includes(toYMD(d)) && guard++ < 52) {
    d.setDate(d.getDate() + 7);
  }
  return d;
}

/**
 * The run that's still ahead of you right now: today's Saturday run if it's
 * Saturday before 7 AM (and the club is running), otherwise the next Saturday.
 * `from` must already be expressed in America/New_York wall-clock time.
 */
export function upcomingRunSaturday(from: Date = new Date()): Date {
  if (from.getDay() === 6 && from.getHours() < 7) {
    const today = new Date(from);
    today.setHours(0, 0, 0, 0);
    if (!SKIPPED_RUN_DATES.includes(toYMD(today))) return today;
  }
  return nextSaturday(from);
}

export function upcomingRunLabel(from: Date = new Date()): string {
  const sat = upcomingRunSaturday(from);
  const satUTC = Date.UTC(sat.getFullYear(), sat.getMonth(), sat.getDate());
  const weeks = Math.round((satUTC - RUN_ANCHOR_MS) / (7 * 24 * 60 * 60 * 1000));
  const date = sat.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `GRYT Run #${RUN_ANCHOR_NUMBER + weeks} · Sat, ${date} · 7 AM`;
}




/** "Now" expressed in America/New_York wall-clock time. */
export function nyNow(from: Date = new Date()): Date {
  return new Date(from.toLocaleString("en-US", { timeZone: "America/New_York" }));
}

export function nextRunNumber(from: Date = nyNow()): number {
  const sat = upcomingRunSaturday(from);
  const satUTC = Date.UTC(sat.getFullYear(), sat.getMonth(), sat.getDate());
  const weeks = Math.round((satUTC - RUN_ANCHOR_MS) / (7 * 24 * 60 * 60 * 1000));
  return RUN_ANCHOR_NUMBER + weeks;
}

export function nextSaturdayShortDate(from: Date = nyNow()): string {
  return upcomingRunSaturday(from).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function nextSaturdayLabel(from: Date = nyNow()): string {
  return `GRYT Run #${nextRunNumber(from)} · Sat, ${nextSaturdayShortDate(from)} · 7 AM`;
}

export function nextSaturdayLabelLong(from: Date = nyNow()): string {
  return `GRYT Run #${nextRunNumber(from)} · Sat, ${nextSaturdayShortDate(from)} · 7:00 AM`;
}

/** Next `count` Saturday 7am occurrences (ISO instants) for recurring event schema. */
export function nextSaturdayISOs(count: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  let cursor = from;
  let guard = 0;
  while (out.length < count && guard++ < count + 60) {
    const occ = getOccurrence(cursor);
    out.push(occ.startUtc);
    // Move just past this run to find the following one.
    cursor = new Date(new Date(occ.endUtc).getTime() + 60_000);
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
export function nextSaturdayISODate(from: Date = nyNow()): string {
  const { y, m, d } = ymd(upcomingRunSaturday(from));
  return `${y}-${m}-${d}`;
}

/** Downloadable .ics for the next Saturday 7:00 AM run (America/New_York). */
export function nextSaturdayIcsDataUrl(from: Date = nyNow()): string {
  const sat = upcomingRunSaturday(from);
  const { y, m, d } = ymd(sat);
  const runNum = nextRunNumber(from);
  const dtStart = `${y}${m}${d}T070000`;
  const dtEnd = `${y}${m}${d}T080000`;
  // This static series export has a fixed revision timestamp. Using the render
  // clock here changes the href between SSR and hydration (and on every visit).
  const dtStamp = new Date(RUN_ANCHOR_MS).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
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

export function nextSaturdayIcsFilename(from: Date = nyNow()): string {
  const { y, m, d } = ymd(upcomingRunSaturday(from));
  return `gryt-run-${y}-${m}-${d}.ics`;
}

// ---------------------------------------------------------------------------
// Canonical run occurrence
// ---------------------------------------------------------------------------

export const RUN_SERIES_ID = "gryt-saturday";
export const RUN_TIME_ZONE = "America/New_York";
export const RUN_LOCAL_START = "07:00";
export const RUN_LOCAL_END = "08:30";

export const RUN_LOCATION = {
  name: "Peterswood Park lot, Montour / Peters Trail",
  address: "212 Valley Brook Rd, McMurray, PA 15317",
  mapsUrl: "https://maps.google.com/?q=212+Valley+Brook+Rd,+McMurray,+PA+15317",
} as const;

export type RunStatus =
  | "draft"
  | "scheduled"
  | "modified"
  | "cancelled"
  | "in-progress"
  | "completed";

export interface RunOccurrence {
  /** Opaque, stable id for this occurrence. */
  id: string;
  seriesId: string;
  runNumber: number;
  /** YYYY-MM-DD in America/New_York. */
  localDate: string;
  localStartTime: string;
  localEndTime: string;
  timeZone: string;
  /** Exact instants (ISO, UTC). */
  startUtc: string;
  endUtc: string;
  status: RunStatus;
  /** Bumped whenever an organizer changes or cancels this occurrence. */
  version: number;
  location: { name: string; address: string; mapsUrl: string };
  routeRef: string;
  url: string;
  /** Organizer-visible note shown when status is cancelled or modified. */
  note?: string;
}

/** Organizer overrides keyed by local date (YYYY-MM-DD). */
export const RUN_EXCEPTIONS: Record<
  string,
  { status: RunStatus; version?: number; note?: string; localStartTime?: string }
> = {};

/** Offset of America/New_York from UTC, in minutes, at a given instant. */
function nyOffsetMinutes(instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: RUN_TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(instant).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]),
  ) as Record<string, number>;
  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour === 24 ? 0 : parts.hour,
    parts.minute,
    parts.second,
  );
  return (asUTC - instant.getTime()) / 60000;
}

/** Convert an America/New_York wall-clock time to the exact UTC instant. */
export function nyWallClockToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute = 0,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let offset = nyOffsetMinutes(new Date(naive));
  let instant = naive - offset * 60000;
  // One correction pass handles DST boundary cases.
  const corrected = nyOffsetMinutes(new Date(instant));
  if (corrected !== offset) {
    offset = corrected;
    instant = naive - offset * 60000;
  }
  return new Date(instant);
}

function parseLocalDate(localDate: string): { y: number; m: number; d: number } {
  const [y, m, d] = localDate.split("-").map(Number);
  return { y: y!, m: m!, d: d! };
}

function runNumberForDate(localDate: string): number {
  const { y, m, d } = parseLocalDate(localDate);
  const weeks = Math.round((Date.UTC(y, m - 1, d) - RUN_ANCHOR_MS) / (7 * 24 * 60 * 60 * 1000));
  return RUN_ANCHOR_NUMBER + weeks;
}

function parseHm(v: string): { h: number; min: number } {
  const [h, min] = v.split(":").map(Number);
  return { h: h!, min: min! };
}

/** Build the occurrence for a specific America/New_York Saturday date. */
export function occurrenceFor(localDate: string, now: Date = new Date()): RunOccurrence {
  const exception = RUN_EXCEPTIONS[localDate];
  const { y, m, d } = parseLocalDate(localDate);
  const localStartTime = exception?.localStartTime ?? RUN_LOCAL_START;
  const start = nyWallClockToUtc(y, m, d, parseHm(localStartTime).h, parseHm(localStartTime).min);
  const end = nyWallClockToUtc(y, m, d, parseHm(RUN_LOCAL_END).h, parseHm(RUN_LOCAL_END).min);

  const baseStatus: RunStatus = SKIPPED_RUN_DATES.includes(localDate)
    ? "cancelled"
    : (exception?.status ?? "scheduled");
  let status: RunStatus = baseStatus;
  if (baseStatus === "scheduled" || baseStatus === "modified") {

    const t = now.getTime();
    if (t >= end.getTime()) status = "completed";
    else if (t >= start.getTime()) status = "in-progress";
  }

  return {
    id: `gryt-run-${localDate}`,
    seriesId: RUN_SERIES_ID,
    runNumber: runNumberForDate(localDate),
    localDate,
    localStartTime,
    localEndTime: RUN_LOCAL_END,
    timeZone: RUN_TIME_ZONE,
    startUtc: start.toISOString(),
    endUtc: end.toISOString(),
    status,
    version: exception?.version ?? 1,
    location: { ...RUN_LOCATION },
    routeRef: "montour-peters-out-and-back",
    url: "https://grytrunclub.com",
    ...(exception?.note ? { note: exception.note } : {}),
  };
}

function saturdayOnOrAfter(localDate: string): string {
  const { y, m, d } = parseLocalDate(localDate);
  const cur = new Date(Date.UTC(y, m - 1, d));
  const add = (6 - cur.getUTCDay() + 7) % 7;
  cur.setUTCDate(cur.getUTCDate() + add);
  return cur.toISOString().slice(0, 10);
}

/** Local (America/New_York) YYYY-MM-DD for an instant. */
export function nyDateKey(instant: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: RUN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
  return parts;
}

/**
 * The run a visitor should see right now: today's Saturday run until it has
 * finished (so nobody driving in at 6:55 loses today's details), otherwise the
 * next Saturday that isn't cancelled.
 */
export function getOccurrence(now: Date = new Date()): RunOccurrence {
  let candidate = saturdayOnOrAfter(nyDateKey(now));
  for (let i = 0; i < 60; i++) {
    const occ = occurrenceFor(candidate, now);
    if (occ.status !== "completed" && occ.status !== "cancelled" && occ.status !== "draft") return occ;
    const { y, m, d } = parseLocalDate(candidate);
    const next = new Date(Date.UTC(y, m - 1, d));
    next.setUTCDate(next.getUTCDate() + 7);
    candidate = next.toISOString().slice(0, 10);
  }
  return occurrenceFor(candidate, now);
}

/** Upcoming occurrences including cancelled ones, for organizer/admin views. */
export function upcomingOccurrences(count: number, now: Date = new Date()): RunOccurrence[] {
  const out: RunOccurrence[] = [];
  let candidate = saturdayOnOrAfter(nyDateKey(now));
  while (out.length < count) {
    const occ = occurrenceFor(candidate, now);
    if (occ.status !== "completed") out.push(occ);
    const { y, m, d } = parseLocalDate(candidate);
    const next = new Date(Date.UTC(y, m - 1, d));
    next.setUTCDate(next.getUTCDate() + 7);
    candidate = next.toISOString().slice(0, 10);
  }
  return out;
}

/** Validate a client-supplied event reference against the server's own view. */
export function validateEventRef(
  eventId: string | null | undefined,
  version: number | null | undefined,
  now: Date = new Date(),
): { ok: true; occurrence: RunOccurrence } | { ok: false; reason: "unknown" | "stale" | "cancelled"; occurrence: RunOccurrence } {
  const current = getOccurrence(now);
  if (!eventId) return { ok: true, occurrence: current }; // legacy payloads
  const match = /^gryt-run-(\d{4}-\d{2}-\d{2})$/.exec(eventId);
  if (!match) return { ok: false, reason: "unknown", occurrence: current };
  const occ = occurrenceFor(match[1]!, now);
  if (occ.status === "cancelled") return { ok: false, reason: "cancelled", occurrence: current };
  if (occ.id !== current.id) return { ok: false, reason: "stale", occurrence: current };
  if (version != null && version !== occ.version) return { ok: false, reason: "stale", occurrence: current };
  return { ok: true, occurrence: occ };
}

// ---------------------------------------------------------------------------
// Per-week details for emails and the Strava event helper
// ---------------------------------------------------------------------------

/** "Saturday, Sep 26" in America/New_York. */
export function occurrenceDateLong(occ: RunOccurrence): string {
  return new Date(occ.startUtc).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: occ.timeZone,
  });
}

/** "7:00 AM" in America/New_York. */
export function occurrenceTime(occ: RunOccurrence): string {
  return new Date(occ.startUtc).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: occ.timeZone,
  });
}

function compactUtc(iso: string): string {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Google Calendar link with the correct instants for this occurrence. */
export function occurrenceCalendarUrl(occ: RunOccurrence): string {
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(`GRYT Run #${occ.runNumber}`) +
    `&dates=${compactUtc(occ.startUtc)}/${compactUtc(occ.endUtc)}` +
    "&details=" + encodeURIComponent("GRYT Run Club, Saturday 7 AM. Walk, jog or run. Nobody gets dropped. https://grytrunclub.com") +
    "&location=" + encodeURIComponent(occ.location.address)
  );
}

/** Copy-ready text for posting this week's run as a Strava club event. */
export function occurrenceStravaEvent(occ: RunOccurrence) {
  return {
    title: `GRYT Run #${occ.runNumber} · Saturday 7 AM`,
    date: occurrenceDateLong(occ),
    time: occurrenceTime(occ),
    address: occ.location.address,
    meetingPoint: occ.location.name,
    description:
      `Free Saturday run. Meet at ${occ.location.name}, ${occ.location.address}, by the trail map board. ` +
      "About 4 miles out and back on the Montour and Peters trails. All paces, nobody gets dropped. " +
      "First time? Sign up and sign the free waiver at https://grytrunclub.com",
  };
}
