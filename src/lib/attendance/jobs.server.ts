import type { SupabaseClient } from "@supabase/supabase-js";
import { googleCalendarUrl, runOnDate, type RunOccurrence } from "../run-occurrence";
import { NotionSyncError, syncRsvpToNotion } from "../notion/sync.server";

type Job = { id: string; rsvp_id: string; kind: string; attempts: number; claim_token: string };
export async function processAttendanceJobs(db: SupabaseClient, limit = 5) {
  let processed = 0;
  for (let i = 0; i < Math.min(limit, 10); i++) {
    const { data, error } = await db.rpc("claim_attendance_job");
    if (error) throw new Error("Job storage unavailable.");
    const job = (data as Job[] | null)?.[0];
    if (!job) break;
    let status = "succeeded";
    let lastError: string | null = null;
    try {
      const { data: rsvp, error: readError } = await db
        .from("rsvps")
        .select("*")
        .eq("id", job.rsvp_id)
        .single();
      if (readError || !rsvp?.event_snapshot)
        throw new NotionSyncError("RSVP snapshot unavailable.", false);
      const event = rsvp.event_snapshot as RunOccurrence;
      if (job.kind === "notion") {
        const links = await syncRsvpToNotion(
          {
            rsvpId: rsvp.id,
            name: rsvp.name,
            contact: rsvp.contact,
            source: rsvp.source,
            event,
            memberPageId: rsvp.notion_member_page_id,
            attendancePageId: rsvp.notion_attendance_page_id,
          },
          async (fields) => {
            const result = await db.from("rsvps").update(fields).eq("id", rsvp.id);
            if (result.error) throw new Error("Checkpoint failed");
          },
        );
        const updated = await db
          .from("rsvps")
          .update({
            notion_synced: true,
            notion_synced_at: new Date().toISOString(),
            notion_last_error: null,
            notion_member_page_id: links.memberPageId,
            notion_attendance_page_id: links.attendancePageId,
          })
          .eq("id", rsvp.id);
        if (updated.error) throw new NotionSyncError("Sync result checkpoint failed.", true);
      } else {
        const current = runOnDate(event.localDate);
        if (
          job.kind === "confirmation" &&
          (current.version !== event.version ||
            current.status === "cancelled" ||
            current.status === "unconfirmed" ||
            Date.now() >= Date.parse(current.startsAt))
        ) {
          status = "cancelled";
          lastError = "Event changed or started. Do not send a stale confirmation.";
        } else {
          if (!process.env.LOVABLE_API_KEY)
            throw new NotionSyncError("Email configuration missing.", false);
          const { sendInternalTransactionalEmail } = await import("../email/send-internal.server");
          const result = await sendInternalTransactionalEmail({
            templateName: job.kind === "confirmation" ? "rsvp-confirmation" : "rsvp-notification",
            recipientEmail: job.kind === "confirmation" ? rsvp.contact : "",
            templateData: {
              name: rsvp.name,
              contact: rsvp.contact,
              source: rsvp.source || "Not provided",
              eventLabel: event.label,
              submittedAt: rsvp.created_at,
              calendarUrl: googleCalendarUrl(event),
              location: event.location,
              route: event.route,
              stravaUrl: "https://www.strava.com/clubs/1708552",
            },
            idempotencyKey: `attendance-${job.id}`,
          });
          if (result.ok) status = "accepted";
          else if (result.reason === "suppressed") status = "suppressed";
          else
            throw new NotionSyncError(
              "Email result uncertain or rejected. Inspect provider evidence before replay.",
              true,
            );
        }
      }
    } catch (error) {
      const known = error instanceof NotionSyncError;
      status =
        !known || error.needsReview ? "needs_review" : job.attempts >= 5 ? "failed" : "pending";
      lastError = known
        ? error.message
        : "Unexpected worker error; verify external state before replay.";
    }
    const retryMs = Math.min(3600000, 30000 * 2 ** job.attempts) + Math.floor(Math.random() * 5000);
    const result = await db
      .from("attendance_jobs")
      .update({
        status,
        last_error: lastError,
        lease_until: null,
        claim_token: null,
        next_attempt_at: new Date(Date.now() + retryMs).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .eq("status", "processing")
      .eq("claim_token", job.claim_token);
    if (result.error)
      throw new Error("Worker checkpoint failed. Do not replay until lease review.");
    processed += 1;
  }
  return { processed };
}
