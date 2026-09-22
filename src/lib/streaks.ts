// Saturday attendance streaks, derived from confirmed check-ins only.
//
// Rules (deliberate, and the same everywhere streaks are shown):
//  1. A streak counts consecutive Saturday runs a person was checked in for.
//     RSVPs never count — only a confirmed check-in does.
//  2. Only runs that have finished are counted. This Saturday's run does not
//     break anyone's streak until it is over.
//  3. Cancelled or skipped Saturdays are ignored entirely. They neither
//     extend nor break a streak.
//  4. A missed run ends the current streak. It stays in the longest-ever
//     figure.
//  5. Late check-ins are fine. Streaks are recomputed from stored check-ins
//     every time they are read, so a person added on Sunday gets credit for
//     Saturday's run.

import { nyDateKey, occurrenceFor } from "./run-schedule";

export type StreakSummary = {
  /** Consecutive finished runs attended, counting back from the latest one. */
  current: number;
  /** Best run of consecutive attendances ever. */
  longest: number;
  /** Total finished runs attended. */
  attended: number;
  /** Local date (YYYY-MM-DD) of the most recent attended run, if any. */
  lastAttended: string | null;
};

export const EMPTY_STREAK: StreakSummary = {
  current: 0,
  longest: 0,
  attended: 0,
  lastAttended: null,
};

function priorSaturday(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const cur = new Date(Date.UTC(y!, m! - 1, d!));
  cur.setUTCDate(cur.getUTCDate() - 7);
  return cur.toISOString().slice(0, 10);
}

function saturdayOnOrBefore(localDate: string): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const cur = new Date(Date.UTC(y!, m! - 1, d!));
  cur.setUTCDate(cur.getUTCDate() - ((cur.getUTCDay() + 1) % 7));
  return cur.toISOString().slice(0, 10);
}

/**
 * Finished, non-cancelled run dates, most recent first. Rule 2 and rule 3.
 */
export function finishedRunDates(count = 52, now: Date = new Date()): string[] {
  const out: string[] = [];
  let candidate = saturdayOnOrBefore(nyDateKey(now));
  for (let guard = 0; guard < count * 3 && out.length < count; guard++) {
    const occ = occurrenceFor(candidate, now);
    if (occ.status === "completed") out.push(candidate);
    candidate = priorSaturday(candidate);
  }
  return out;
}

/**
 * Turn a set of attended run dates into a streak summary.
 * `runDates` must be finished runs, most recent first.
 */
export function summarizeStreak(
  attendedDates: Iterable<string>,
  runDates: string[],
): StreakSummary {
  const attended = new Set(attendedDates);
  let current = 0;
  let longest = 0;
  let running = 0;
  let counted = 0;
  let lastAttended: string | null = null;
  let stillCurrent = true;

  for (const date of runDates) {
    if (attended.has(date)) {
      running += 1;
      counted += 1;
      if (!lastAttended) lastAttended = date;
      if (stillCurrent) current = running;
      longest = Math.max(longest, running);
    } else {
      stillCurrent = false;
      running = 0;
    }
  }

  return { current, longest, attended: counted, lastAttended };
}

/** Streaks for many people at once, from `person_key` + run date pairs. */
export function summarizeStreaks(
  rows: Array<{ personKey: string; eventDate: string }>,
  runDates: string[],
): Map<string, StreakSummary> {
  const byPerson = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = byPerson.get(row.personKey) ?? new Set<string>();
    set.add(row.eventDate);
    byPerson.set(row.personKey, set);
  }
  const out = new Map<string, StreakSummary>();
  for (const [key, dates] of byPerson) {
    out.set(key, summarizeStreak(dates, runDates));
  }
  return out;
}
