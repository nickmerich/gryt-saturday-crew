import { createServerFn } from "@tanstack/react-start";
import { identityKey } from "@/lib/checkin/identity";
import { getOccurrence } from "@/lib/run-schedule";
import { creditName } from "@/lib/soundtrack";

/** Most first names shown publicly; the rest roll into "and N more". */
export const GOING_NAMES_MAX = 6;
/** Below this many people the list stays hidden so one RSVP is never singled out. */
export const GOING_MIN_TO_SHOW = 2;

export type WhosGoing = {
  eventId: string;
  /** Unique people with an RSVP for the upcoming run. */
  people: number;
  /** Heads expected, counting party sizes. */
  heads: number;
  /** First names of people who opted in, oldest RSVP first. */
  names: string[];
};

const EMPTY = (eventId: string): WhosGoing => ({ eventId, people: 0, heads: 0, names: [] });

/**
 * Public, aggregate-only view of this Saturday's RSVPs: how many are in, and
 * the first names of those who explicitly asked to be shown. Nothing else
 * about an RSVP leaves the server.
 */
export const getWhosGoing = createServerFn({ method: "GET" }).handler(async (): Promise<WhosGoing> => {
  const occ = getOccurrence();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("rsvps")
      .select("name,contact,party_size,going_list_ok,created_at")
      .eq("event_id", occ.id)
      .order("created_at", { ascending: true })
      .limit(2000);
    if (error) {
      console.error("Who's going query failed", error);
      return EMPTY(occ.id);
    }

    const seen = new Map<string, { heads: number; name: string | null }>();
    for (const r of data ?? []) {
      const key = identityKey(String(r.name ?? ""), String(r.contact ?? ""));
      const heads = Math.max(1, Math.min(10, Number(r.party_size ?? 1) || 1));
      const existing = seen.get(key);
      const optedName = r.going_list_ok ? creditName(String(r.name ?? "")) : null;
      if (!existing) {
        seen.set(key, { heads, name: optedName || null });
      } else {
        // Latest RSVP wins for party size; any opt-in keeps the name visible.
        existing.heads = heads;
        if (optedName) existing.name = optedName;
      }
    }

    const people = seen.size;
    if (people < GOING_MIN_TO_SHOW) return EMPTY(occ.id);
    let heads = 0;
    const names: string[] = [];
    for (const v of seen.values()) {
      heads += v.heads;
      if (v.name) names.push(v.name);
    }
    return { eventId: occ.id, people, heads, names };
  } catch (err) {
    console.error("Who's going failed", err);
    return EMPTY(occ.id);
  }
});

/** "14 in so far, including Laura, Devin and Sam." */
export function whosGoingSentence(g: WhosGoing): string | null {
  if (g.people < GOING_MIN_TO_SHOW) return null;
  const count = `${g.heads} in so far`;
  const shown = g.names.slice(0, GOING_NAMES_MAX);
  if (shown.length === 0) return `${count}.`;
  const extra = g.names.length - shown.length;
  const list =
    shown.length === 1
      ? shown[0]
      : `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
  return `${count}, including ${list}${extra > 0 ? ` and ${extra} more` : ""}.`;
}
