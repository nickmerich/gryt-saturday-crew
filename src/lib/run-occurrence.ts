/** Public, reviewed schedule configuration. Never put participant data here. */
export const RUN_TIMEZONE = "America/New_York";
export const RUN_LOCATION = "212 Valley Brook Road, McMurray, PA";
export const RUN_ROUTE = "Montour / Peters Trail";
export const RUN_ANCHOR_MS = Date.UTC(2026, 8, 5);
export const RUN_ANCHOR_NUMBER = 18;
export const SKIPPED_RUN_DATES: string[] = [];

export type RunStatus = "unconfirmed" | "scheduled" | "modified" | "cancelled";
export type RunOverride = {
  version: number;
  status?: RunStatus;
  notice?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  route?: string;
};
/**
 * Organizer-reviewed exceptions by full local date. Increment version whenever
 * details change. Cancelled runs remain visible until the end of their window.
 * Changes require the normal review/deploy path, not an unauthenticated API.
 */
export const RUN_OVERRIDES: Record<string, RunOverride> = {};

export type RunOccurrence = {
  id: string;
  version: number;
  localDate: string;
  timezone: typeof RUN_TIMEZONE;
  startsAt: string;
  endsAt: string;
  number: number;
  label: string;
  timeLabel: string;
  status: RunStatus;
  notice: string;
  location: string;
  route: string;
};

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: RUN_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function newYorkParts(instant = new Date()) {
  const values = Object.fromEntries(
    partsFormatter.formatToParts(instant).map((p) => [p.type, p.value]),
  );
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

export function validLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Resolve an NY wall time to an actual instant, without relying on host TZ. */
export function localRunInstant(date: string, time: string): string {
  if (!validLocalDate(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new Error("Invalid run date/time");
  const wall = Date.parse(`${date}T${time}:00Z`);
  let candidate = wall;
  for (let i = 0; i < 4; i++) {
    const p = newYorkParts(new Date(candidate));
    const actualWall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    const delta = wall - actualWall;
    if (!delta) return new Date(candidate).toISOString();
    candidate += delta;
  }
  throw new Error("Run time does not exist in America/New_York");
}

export function runOnDate(date: string, overrides = RUN_OVERRIDES): RunOccurrence {
  if (!validLocalDate(date) || new Date(`${date}T12:00:00Z`).getUTCDay() !== 6)
    throw new Error("Not a Saturday");
  const override = overrides[date];
  const startsAt = localRunInstant(date, override?.startTime ?? "07:00");
  const endsAt = localRunInstant(date, override?.endTime ?? "08:00");
  if (endsAt <= startsAt) throw new Error("Run end must follow start");
  const number =
    RUN_ANCHOR_NUMBER + Math.round((Date.parse(`${date}T00:00:00Z`) - RUN_ANCHOR_MS) / 604800000);
  const dayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: RUN_TIMEZONE,
    month: "short",
    day: "numeric",
  }).format(new Date(startsAt));
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: RUN_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startsAt));
  return {
    id: `gryt-saturday-${date}`,
    version: override?.version ?? 1,
    localDate: date,
    timezone: RUN_TIMEZONE,
    startsAt,
    endsAt,
    number,
    label: `GRYT Run #${number} · Sat, ${dayLabel} · ${timeLabel}`,
    timeLabel,
    status: SKIPPED_RUN_DATES.includes(date) ? "cancelled" : (override?.status ?? "scheduled"),
    notice: override?.notice ?? "",
    location: override?.location ?? RUN_LOCATION,
    route: override?.route ?? RUN_ROUTE,
  };
}

export function currentRun(now = new Date(), overrides = RUN_OVERRIDES): RunOccurrence {
  const localDate = newYorkParts(now).date;
  const cursor = new Date(`${localDate}T12:00:00Z`);
  cursor.setUTCDate(cursor.getUTCDate() + ((6 - cursor.getUTCDay() + 7) % 7));
  let run = runOnDate(cursor.toISOString().slice(0, 10), overrides);
  // Keep today's directions and status visible throughout the run.
  if (now.getTime() >= Date.parse(run.endsAt)) {
    cursor.setUTCDate(cursor.getUTCDate() + 7);
    run = runOnDate(cursor.toISOString().slice(0, 10), overrides);
  }
  return run;
}

export function canRsvp(run: RunOccurrence, now = new Date()) {
  return (
    (run.status === "scheduled" || run.status === "modified") &&
    now.getTime() < Date.parse(run.startsAt)
  );
}

export function runNotice(run: RunOccurrence, now = new Date()) {
  if (run.status === "cancelled")
    return run.notice || "This run is cancelled. Please do not travel to the meeting point.";
  if (run.status === "unconfirmed")
    return run.notice || "Details are being confirmed. Please check back before travelling.";
  if (now.getTime() >= Date.parse(run.endsAt))
    return "This run has finished. Check the current invitation for the next run.";
  if (now.getTime() >= Date.parse(run.startsAt))
    return "The run has started. Today’s meeting details stay here until the run ends.";
  return run.notice;
}

export function runsForMonth(year: number, month: number) {
  const runs: RunOccurrence[] = [];
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  for (let day = 1; day <= days; day++) {
    const date = new Date(Date.UTC(year, month, day, 12));
    if (date.getUTCDay() === 6) runs.push(runOnDate(date.toISOString().slice(0, 10)));
  }
  return runs;
}

const icsStamp = (value: string) => value.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const icsEscape = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/[,;]/g, "\\$&");

export function googleCalendarUrl(run: RunOccurrence) {
  return (
    "https://calendar.google.com/calendar/render?" +
    new URLSearchParams({
      action: "TEMPLATE",
      text: run.label,
      dates: `${icsStamp(run.startsAt)}/${icsStamp(run.endsAt)}`,
      ctz: RUN_TIMEZONE,
      location: run.location,
      details: `${run.route}. All paces welcome. Check current status at https://grytrunclub.com`,
    }).toString()
  );
}

export function runsIcs(runs: RunOccurrence[], now = new Date()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GRYT Run Club//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const run of runs) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${run.id}@grytrunclub.com`,
      `SEQUENCE:${run.version}`,
      `DTSTAMP:${icsStamp(now.toISOString())}`,
      `DTSTART:${icsStamp(run.startsAt)}`,
      `DTEND:${icsStamp(run.endsAt)}`,
      `STATUS:${run.status === "cancelled" ? "CANCELLED" : run.status === "unconfirmed" ? "TENTATIVE" : "CONFIRMED"}`,
      `SUMMARY:${icsEscape(run.label)}`,
      `LOCATION:${icsEscape(run.location)}`,
      `DESCRIPTION:${icsEscape([run.route, run.notice, "Check current status: https://grytrunclub.com"].filter(Boolean).join("\n"))}`,
      "URL:https://grytrunclub.com",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  // Fold at <= 75 UTF-8 octets, preserving multi-byte characters.
  return (
    lines
      .map((line) => {
        const chunks: string[] = [];
        let chunk = "";
        let bytes = 0;
        for (const char of line) {
          const size = new TextEncoder().encode(char).length;
          if (bytes + size > 74) {
            chunks.push(chunk);
            chunk = " ";
            bytes = 1;
          }
          chunk += char;
          bytes += size;
        }
        chunks.push(chunk);
        return chunks.join("\r\n");
      })
      .join("\r\n") + "\r\n"
  );
}

export function runIcsDataUrl(run: RunOccurrence) {
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(runsIcs([run]));
}
