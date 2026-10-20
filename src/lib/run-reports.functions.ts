import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { occurrenceFor, runNumberForDate } from "./run-schedule";
import {
  buildClubTotals,
  buildRunReports,
  personalMilestones,
  type CheckinRow,
  type ClubTotals,
  type PersonalMilestones,
  type RunReportSummary,
} from "./run-reports";
import { contactKind, identityKey, normalizeName } from "./checkin/identity";

export type RunReportsPayload = {
  reports: RunReportSummary[];
  totals: ClubTotals;
  /** False when the database could not be reached. Pages hide numbers then. */
  ok: boolean;
};

const EMPTY: RunReportsPayload = {
  reports: [],
  totals: { trackedSince: null, runsTracked: 0, peopleTracked: 0, totalCheckins: 0, clubCounts: [] },
  ok: false,
};

/** A finished, non-cancelled Saturday run. */
function isFinishedSaturday(date: string, now: Date): boolean {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return false;
  if (new Date(Date.UTC(y, m - 1, d)).getUTCDay() !== 6) return false;
  return occurrenceFor(date, now).status === "completed";
}

/** All confirmed Saturday check-ins. Only person_key and date leave the database. */
async function loadSaturdayCheckins(): Promise<CheckinRow[] | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date();
  const rows: CheckinRow[] = [];
  const page = 1000;
  for (let from = 0; from < 50_000; from += page) {
    const { data, error } = await supabaseAdmin
      .from("run_checkins")
      .select("person_key,event_date")
      .eq("status", "present")
      .order("event_date", { ascending: true })
      .range(from, from + page - 1);
    if (error) {
      console.error("Run reports query failed", error);
      return null;
    }
    for (const r of data ?? []) {
      const date = String(r.event_date).slice(0, 10);
      if (isFinishedSaturday(date, now)) rows.push({ personKey: r.person_key as string, eventDate: date });
    }
    if (!data || data.length < page) break;
  }
  return rows;
}

export const getRunReports = createServerFn({ method: "GET" }).handler(
  async (): Promise<RunReportsPayload> => {
    try {
      const rows = await loadSaturdayCheckins();
      if (!rows) return EMPTY;
      return {
        reports: buildRunReports(rows, runNumberForDate),
        totals: buildClubTotals(rows),
        ok: true,
      };
    } catch (err) {
      console.error("Run reports failed", err);
      return EMPTY;
    }
  },
);

const LookupInput = z.object({
  firstName: z.string().trim().min(1).max(60),
  contact: z.string().trim().min(5).max(160),
});

export type MilestoneLookup =
  | ({ found: true } & PersonalMilestones)
  | { found: false; reason: "no-match" | "bad-contact" | "unavailable" };

/**
 * A runner checks their own Saturdays. Both the first name and the email or
 * phone they check in with must match the same check-in record, and the
 * response never echoes a name or contact back. "Not found" and "wrong name"
 * look the same from outside.
 */
export const lookupMilestones = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => LookupInput.parse(data))
  .handler(async ({ data }): Promise<MilestoneLookup> => {
    const kind = contactKind(data.contact);
    if (kind === "other") return { found: false, reason: "bad-contact" };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const key = identityKey("", data.contact);
      const { data: rows, error } = await supabaseAdmin
        .from("run_checkins")
        .select("event_date,name")
        .eq("person_key", key)
        .eq("status", "present")
        .limit(1000);
      if (error) {
        console.error("Milestone lookup failed", error);
        return { found: false, reason: "unavailable" };
      }
      const want = normalizeName(data.firstName).split(" ")[0] ?? "";
      const nameMatches = (rows ?? []).some(
        (r) => (normalizeName(String(r.name ?? "")).split(" ")[0] ?? "") === want,
      );
      if (!rows?.length || !nameMatches) return { found: false, reason: "no-match" };
      const now = new Date();
      const dates = rows
        .map((r) => String(r.event_date).slice(0, 10))
        .filter((d) => isFinishedSaturday(d, now));
      if (!dates.length) return { found: false, reason: "no-match" };
      return { found: true, ...personalMilestones(dates) };
    } catch (err) {
      console.error("Milestone lookup failed", err);
      return { found: false, reason: "unavailable" };
    }
  });
