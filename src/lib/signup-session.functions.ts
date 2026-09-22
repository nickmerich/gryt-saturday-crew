import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DeliveryState } from "@/lib/attendance/schema";
import type { RunOccurrence } from "@/lib/run-occurrence";

export type SignupSessionSummary = {
  name: string | null;
  /** Display-safe contact, e.g. "ca••••@example.com" */
  contactMasked: string | null;
  /** Raw contact, returned only to the browser that submitted it (cookie-bound). */
  contact: string | null;
  contactKind: "email" | "phone" | null;
  eventLabel: string | null;
  event: RunOccurrence | null;
  rsvpAt: string | null;
  confirmationStatus: DeliveryState;
  waiver: { signedOn: string | null } | null;
};

function mask(contact: string | null): string | null {
  if (!contact) return null;
  const value = contact.trim();
  if (value.includes("@")) {
    const [local = "", domain = ""] = value.split("@");
    const head = local.slice(0, 2);
    return `${head}${"•".repeat(Math.max(3, local.length - 2))}@${domain}`;
  }
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? `••• ••• ${digits.slice(-4)}` : "•••";
}

/** Reads the current signup from server-side storage via the httpOnly cookie. */
export const loadSignupSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<SignupSessionSummary | null> => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const { readSignupToken, getSignupSession } = await import("@/lib/signup-session.server");

    const token = readSignupToken(getRequestHeader("cookie"));
    const row = await getSignupSession(token);
    if (!row) return null;

    const contact = row.contact;
    let event: RunOccurrence | null = null;
    if (row.rsvp_id) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: receipt } = await (supabaseAdmin as SupabaseClient)
          .from("rsvps")
          .select("event_snapshot")
          .eq("id", row.rsvp_id)
          .maybeSingle();
        event = receipt?.event_snapshot ?? null;
      } catch {
        // Legacy receipts prefill the form, but cannot claim a current event version.
      }
    }
    let confirmationStatus: DeliveryState = contact?.includes("@")
      ? "unconfirmed"
      : "not_available";
    if (row.rsvp_id && contact?.includes("@")) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: job } = await (supabaseAdmin as SupabaseClient)
          .from("attendance_jobs")
          .select("status")
          .eq("rsvp_id", row.rsvp_id)
          .eq("kind", "confirmation")
          .maybeSingle();
        if (job?.status === "accepted" || job?.status === "suppressed")
          confirmationStatus = job.status;
        else if (job?.status === "pending" || job?.status === "processing")
          confirmationStatus = "queued";
        else if (["failed", "cancelled", "needs_review"].includes(job?.status))
          confirmationStatus = "failed";
      } catch {
        // Legacy sessions or unavailable job storage must not imply email was sent or queued.
      }
    }
    let currentWaiver: { signedOn: string | null } | null = null;
    if (row.waiver_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signature } = await supabaseAdmin
        .from("waiver_signatures")
        .select("full_name,email,signed_on,season,waiver_version")
        .eq("id", row.waiver_id)
        .maybeSingle();
      const { newYorkParts } = await import("@/lib/run-occurrence");
      const normal = (value: string | null) =>
        (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
      if (
        signature &&
        signature.season === newYorkParts().year &&
        signature.waiver_version === "gryt-run-club-2026-v1" &&
        normal(signature.full_name) === normal(row.name) &&
        normal(signature.email) === normal(contact)
      ) {
        currentWaiver = { signedOn: signature.signed_on };
      }
    }
    return {
      name: row.name,
      contact,
      contactMasked: mask(contact),
      contactKind: contact ? (contact.includes("@") ? "email" : "phone") : null,
      eventLabel: row.event_label,
      event,
      rsvpAt: row.rsvp_id ? row.created_at : null,
      confirmationStatus,
      waiver: currentWaiver,
    };
  },
);

/** Forgets the stored submission and clears the cookie. */
export const clearSignupSession = createServerFn({ method: "POST" }).handler(async () => {
  const { getRequestHeader, setResponseHeader } = await import("@tanstack/react-start/server");
  const { readSignupToken, deleteSignupSession, clearedSignupCookie } =
    await import("@/lib/signup-session.server");
  await deleteSignupSession(readSignupToken(getRequestHeader("cookie")));
  setResponseHeader("set-cookie", clearedSignupCookie());
  return { ok: true };
});
