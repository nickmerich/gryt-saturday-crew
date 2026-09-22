import { currentRun, newYorkParts, runOnDate, runIcsDataUrl } from "./run-occurrence";
export { RUN_ANCHOR_MS, RUN_ANCHOR_NUMBER, SKIPPED_RUN_DATES } from "./run-occurrence";

/** Compatibility for calendar display only. Do not pass wall-clock Dates to schedule helpers. */
export function nyNow(from = new Date()) {
  const p = newYorkParts(from);
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}
export function upcomingRunSaturday(from = new Date()) {
  const run = currentRun(from);
  const [y, m, d] = run.localDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function nextSaturday(from = new Date()) {
  const d = upcomingRunSaturday(from);
  if (newYorkParts(from).date === currentRun(from).localDate) d.setDate(d.getDate() + 7);
  return d;
}
export function upcomingRunLabel(from = new Date()) {
  return currentRun(from).label;
}
export function nextRunNumber(from = new Date()) {
  return currentRun(from).number;
}
export function nextSaturdayShortDate(from = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  }).format(new Date(currentRun(from).startsAt));
}
export function nextSaturdayLabel(from = new Date()) {
  return currentRun(from).label;
}
export function nextSaturdayLabelLong(from = new Date()) {
  return currentRun(from).label;
}
export function nextSaturdayISODate(from = new Date()) {
  return currentRun(from).localDate;
}
export function nextSaturdayISOs(count: number, from = new Date()) {
  const out: string[] = [];
  const cursor = new Date(`${currentRun(from).localDate}T12:00:00Z`);
  for (let i = 0; i < count; i++) {
    const run = runOnDate(cursor.toISOString().slice(0, 10));
    if (run.status !== "cancelled" && run.status !== "unconfirmed") out.push(run.startsAt);
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return out;
}
export function nextSaturdayIcsDataUrl(from = new Date()) {
  return runIcsDataUrl(currentRun(from));
}
export function nextSaturdayIcsFilename(from = new Date()) {
  return `${currentRun(from).id}.ics`;
}
