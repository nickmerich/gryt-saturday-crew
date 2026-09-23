import { createServerFn } from "@tanstack/react-start";
import { finishedRunDates, summarizeStreaks } from "./streaks";

/** How many recent finished runs the "regulars" figure looks back over. */
export const REGULARS_WINDOW_RUNS = 8;
/** Check-ins inside that window needed to count as a regular. */
export const REGULARS_MIN_RUNS = 2;

export type AttendanceStats = {
  /** Finished runs with at least one confirmed check-in. */
  runsCounted: number;
  /** People with at least one confirmed check-in. */
  peopleCounted: number;
  /** Longest streak still running right now. */
  longestActiveStreak: number;
  /** How many people are on that streak. */
  onLongestStreak: number;
  /** Confirmed attendances at the most recent finished run. */
  lastRunAttendance: number;
  lastRunDate: string | null;
  /**
   * People checked in at REGULARS_MIN_RUNS or more of the last
   * REGULARS_WINDOW_RUNS finished runs. 0 when there is nothing to count yet.
   */
  regulars: number;
  /** Finished runs inside the regulars window that had any check-ins. */
  regularsRunsCounted: number;
};

const EMPTY: AttendanceStats = {
  runsCounted: 0,
  peopleCounted: 0,
  longestActiveStreak: 0,
  onLongestStreak: 0,
  lastRunAttendance: 0,
  lastRunDate: null,
  regulars: 0,
  regularsRunsCounted: 0,
};

/**
 * Club-wide attendance figures from confirmed Saturday check-ins. Aggregate
 * counts only — no names, contacts or per-person records leave the server.
 */
export const getAttendanceStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<AttendanceStats> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const runDates = finishedRunDates();
      if (runDates.length === 0) return EMPTY;

      const { data, error } = await supabaseAdmin
        .from("run_checkins")
        .select("person_key,event_date")
        .eq("status", "present")
        .in("event_date", runDates);

      if (error) {
        console.error("Attendance stats query failed", error);
        return EMPTY;
      }

      const rows = (data ?? []).map((r) => ({
        personKey: r.person_key as string,
        eventDate: r.event_date as string,
      }));
      if (rows.length === 0) return EMPTY;

      const streaks = summarizeStreaks(rows, runDates);
      let longestActiveStreak = 0;
      let onLongestStreak = 0;
      for (const s of streaks.values()) {
        if (s.current > longestActiveStreak) {
          longestActiveStreak = s.current;
          onLongestStreak = 1;
        } else if (s.current === longestActiveStreak && s.current > 0) {
          onLongestStreak += 1;
        }
      }

      const lastRunDate = runDates[0] ?? null;

      // Regulars: people confirmed at several of the most recent finished runs.
      const window = new Set(runDates.slice(0, REGULARS_WINDOW_RUNS));
      const perPerson = new Map<string, Set<string>>();
      for (const r of rows) {
        if (!window.has(r.eventDate)) continue;
        const seen = perPerson.get(r.personKey) ?? new Set<string>();
        seen.add(r.eventDate);
        perPerson.set(r.personKey, seen);
      }
      let regulars = 0;
      for (const seen of perPerson.values()) {
        if (seen.size >= REGULARS_MIN_RUNS) regulars += 1;
      }
      const regularsRunsCounted = new Set(
        rows.filter((r) => window.has(r.eventDate)).map((r) => r.eventDate),
      ).size;

      return {
        runsCounted: new Set(rows.map((r) => r.eventDate)).size,
        peopleCounted: streaks.size,
        longestActiveStreak,
        onLongestStreak,
        lastRunAttendance: rows.filter((r) => r.eventDate === lastRunDate).length,
        lastRunDate,
        regulars,
        regularsRunsCounted,
      };
    } catch (err) {
      console.error("Attendance stats failed", err);
      return EMPTY;
    }
  },
);
