// Weekly run reports and the GRYT Milestone Club.
//
// Pure functions only. Server code passes in confirmed check-ins
// (status "present") and this module turns them into public, aggregate-only
// numbers. Nothing here returns a name, email, or phone number.
//
// Rules:
//  1. Only confirmed check-ins count. RSVPs never do.
//  2. Every check-in counts the same, whether you walked, ran, buddied, or swept.
//  3. Milestones count every Saturday you were checked in, all time. They are
//     not streaks: missing a week never takes a milestone away.
//  4. Check-ins began on a specific Saturday. Runs before that have no data,
//     and the first tracked run has no "first-timer" figure, because everyone
//     there was checked in for the first time.

export const MILESTONES = [5, 10, 25, 50, 100] as const;
export type Milestone = (typeof MILESTONES)[number];

export const MILESTONE_NAMES: Record<Milestone, string> = {
  5: "The 5 Club",
  10: "The 10 Club",
  25: "The 25 Club",
  50: "The 50 Club",
  100: "The 100 Club",
};

export const MILESTONE_LINES: Record<Milestone, string> = {
  5: "Five Saturdays. This is where showing up becomes a habit.",
  10: "Ten Saturdays. You're the person first-timers recognize.",
  25: "Twenty-five Saturdays. Half a year of choosing hard things together.",
  50: "Fifty Saturdays. About a year of 7 AM alarms.",
  100: "One hundred Saturdays. You are the club.",
};

export type CheckinRow = { personKey: string; eventDate: string };

export type RunReportSummary = {
  date: string;
  runNumber: number;
  runners: number;
  /** null on the first tracked run, where it can't be known. */
  firstTimers: number | null;
  returning: number | null;
  milestones: Array<{ milestone: Milestone; count: number }>;
};

export type ClubTotals = {
  trackedSince: string | null;
  runsTracked: number;
  peopleTracked: number;
  totalCheckins: number;
  clubCounts: Array<{ milestone: Milestone; members: number }>;
};

/** Dedupe (person, date) and sort each person's dates ascending. */
function datesByPerson(rows: CheckinRow[]): Map<string, string[]> {
  const sets = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.personKey || !r.eventDate) continue;
    const s = sets.get(r.personKey) ?? new Set<string>();
    s.add(r.eventDate);
    sets.set(r.personKey, s);
  }
  const out = new Map<string, string[]>();
  for (const [k, s] of sets) out.set(k, [...s].sort());
  return out;
}

/**
 * Build one summary per run date that has check-ins, newest first.
 * `runNumberFor` maps a YYYY-MM-DD date to its official GRYT run number.
 */
export function buildRunReports(
  rows: CheckinRow[],
  runNumberFor: (date: string) => number,
): RunReportSummary[] {
  const byPerson = datesByPerson(rows);
  const allDates = new Set<string>();
  for (const dates of byPerson.values()) dates.forEach((d) => allDates.add(d));
  const sortedDates = [...allDates].sort();
  const firstTracked = sortedDates[0] ?? null;

  type Acc = { runners: number; firstTimers: number; ms: Map<Milestone, number> };
  const acc = new Map<string, Acc>();
  for (const d of sortedDates) acc.set(d, { runners: 0, firstTimers: 0, ms: new Map() });

  for (const dates of byPerson.values()) {
    dates.forEach((d, i) => {
      const a = acc.get(d)!;
      a.runners += 1;
      if (i === 0) a.firstTimers += 1;
      const nth = i + 1;
      if ((MILESTONES as readonly number[]).includes(nth)) {
        const m = nth as Milestone;
        a.ms.set(m, (a.ms.get(m) ?? 0) + 1);
      }
    });
  }

  return sortedDates
    .map((date) => {
      const a = acc.get(date)!;
      const isFirst = date === firstTracked;
      return {
        date,
        runNumber: runNumberFor(date),
        runners: a.runners,
        firstTimers: isFirst ? null : a.firstTimers,
        returning: isFirst ? null : a.runners - a.firstTimers,
        milestones: MILESTONES.filter((m) => a.ms.has(m)).map((m) => ({
          milestone: m,
          count: a.ms.get(m)!,
        })),
      };
    })
    .reverse();
}

export function buildClubTotals(rows: CheckinRow[]): ClubTotals {
  const byPerson = datesByPerson(rows);
  const allDates = new Set<string>();
  let total = 0;
  for (const dates of byPerson.values()) {
    dates.forEach((d) => allDates.add(d));
    total += dates.length;
  }
  const sorted = [...allDates].sort();
  return {
    trackedSince: sorted[0] ?? null,
    runsTracked: sorted.length,
    peopleTracked: byPerson.size,
    totalCheckins: total,
    clubCounts: MILESTONES.map((m) => ({
      milestone: m,
      members: [...byPerson.values()].filter((d) => d.length >= m).length,
    })),
  };
}

export type PersonalMilestones = {
  saturdays: number;
  firstSaturday: string | null;
  lastSaturday: string | null;
  earned: Milestone[];
  next: Milestone | null;
  toNext: number;
};

export function personalMilestones(dates: string[]): PersonalMilestones {
  const uniq = [...new Set(dates)].sort();
  const n = uniq.length;
  const earned = MILESTONES.filter((m) => n >= m);
  const next = MILESTONES.find((m) => n < m) ?? null;
  return {
    saturdays: n,
    firstSaturday: uniq[0] ?? null,
    lastSaturday: uniq[n - 1] ?? null,
    earned,
    next,
    toNext: next ? next - n : 0,
  };
}
