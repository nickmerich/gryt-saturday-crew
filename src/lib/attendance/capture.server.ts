import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canRsvp, currentRun } from "../run-occurrence";
import { normalizeContact, normalizeName, rsvpSchema } from "./schema";

export function privateJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
export async function attendanceDatabase(): Promise<SupabaseClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as SupabaseClient;
}
export async function smallJson(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    throw new Error("Invalid content type");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 8192) {
      await reader.cancel();
      throw new Error("Body too large");
    }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function captureRsvp(
  request: Request,
  dependencies?: { db: SupabaseClient; now: Date; saveSession?: false },
) {
  let parsed;
  try {
    parsed = rsvpSchema.safeParse(await smallJson(request));
  } catch {
    return privateJson({ error: "Invalid request. Please reload the form." }, 400);
  }
  if (!parsed.success)
    return privateJson(
      { error: "Check your name and email or phone. Reload the page if the event has changed." },
      422,
    );
  const input = parsed.data;
  const now = dependencies?.now ?? new Date();
  const event = currentRun(now);
  if (input.eventId !== event.id || input.eventVersion !== event.version || !canRsvp(event, now)) {
    return privateJson(
      {
        error: "This invitation has changed or RSVPs have closed. Reload to see the current run.",
        event,
      },
      409,
    );
  }
  const contact = normalizeContact(input.contact)!;
  const captureKey = hash([event.id, normalizeName(input.name), contact.kind, contact.value]);
  const payloadHash = hash([
    captureKey,
    event.version,
    input.source ?? "",
    input.heroVariant ?? "",
    input.attribution ?? {},
  ]);
  try {
    const db = dependencies?.db ?? (await attendanceDatabase());
    const { data, error } = await db.rpc("capture_gryt_rsvp", {
      p_key: input.idempotencyKey,
      p_hash: payloadHash,
      p_capture_key: captureKey,
      p_name: input.name,
      p_contact: contact.value,
      p_kind: contact.kind,
      p_source: input.source ?? null,
      p_variant: input.heroVariant ?? null,
      p_event: event,
      p_attribution: input.attribution ?? {},
    });
    if (error?.message.includes("RSVP_KEY_CONFLICT"))
      return privateJson(
        { error: "Details changed during a retry. Reload the form before submitting again." },
        409,
      );
    if (error?.message.includes("RSVP_EVENT_CHANGED"))
      return privateJson(
        {
          error:
            "You already RSVPed before this run changed. Please ask the organizer to review your earlier RSVP; the updated details are shown on the site.",
        },
        409,
      );
    if (error?.message.includes("RSVP_RATE_LIMIT"))
      return privateJson({ error: "Too many submissions. Please try again later." }, 429);
    if (error || !data?.id)
      return privateJson(
        { error: "We could not save your RSVP. Please retry; repeats will not create duplicates." },
        503,
      );
    // No provider calls in the request path: successful capture is independent of delivery.
    let confirmationStatus = contact.kind === "email" ? "queued" : "not_available";
    if (!data.created && contact.kind === "email") {
      const { data: existingJob } = await db
        .from("attendance_jobs")
        .select("status")
        .eq("rsvp_id", data.id)
        .eq("kind", "confirmation")
        .maybeSingle();
      if (existingJob?.status === "accepted" || existingJob?.status === "suppressed")
        confirmationStatus = existingJob.status;
      else if (["failed", "needs_review", "cancelled"].includes(existingJob?.status))
        confirmationStatus = "failed";
    }
    const response = privateJson({
      success: true,
      rsvpId: data.id,
      created: data.created,
      event,
      confirmationStatus,
      confirmationSent: false,
    });
    if (dependencies?.saveSession !== false) {
      try {
        const { readSignupToken, recordSignupSession, signupCookie } =
          await import("@/lib/signup-session.server");
        const token = await recordSignupSession(readSignupToken(request.headers.get("cookie")), {
          rsvp_id: data.id,
          name: input.name,
          contact: contact.value,
          event_label: event.label,
        });
        if (token) response.headers.set("set-cookie", signupCookie(token));
      } catch {
        /* RSVP is durable even if optional prefill storage fails. */
      }
    }
    return response;
  } catch {
    return privateJson({ error: "RSVP is temporarily unavailable. Please try again." }, 503);
  }
}
