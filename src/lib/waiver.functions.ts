import { createServerFn } from "@tanstack/react-start";
import { createHash } from "crypto";
import { z } from "zod";

const EmailInput = z.object({
  email: z.string().trim().email().max(200),
});


const WaiverInput = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  emergency_contact_name: z.string().trim().min(1).max(120),
  emergency_contact_phone: z.string().trim().min(3).max(40),
  signature_text: z.string().trim().min(1).max(120),
  agree_release: z.literal(true),
  agree_fitness: z.literal(true),
  agree_adult: z.literal(true),
});

// Hash an email for log correlation without leaking PII into logs.
function hashEmail(email: string): string {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
}

function logWaiver(
  event: string,
  fields: Record<string, unknown>,
) {
  // Structured single-line log so it's greppable in worker logs.
  try {
    console.log(
      JSON.stringify({
        scope: "waiver",
        event,
        at: new Date().toISOString(),
        ...fields,
      }),
    );
  } catch {
    console.log(`[waiver] ${event}`, fields);
  }
}

export const signWaiver = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    try {
      return WaiverInput.parse(data);
    } catch (err) {
      const issues =
        err instanceof z.ZodError
          ? err.issues.map((i) => `${i.path.join(".")}:${i.code}`)
          : ["unknown"];
      logWaiver("validation_failed", { issues });
      throw err;
    }
  })
  .handler(async ({ data }) => {
    const emailHash = hashEmail(data.email);
    const startedAt = Date.now();
    logWaiver("attempt", { emailHash });

    // Age 18+ check (also enforced server-side by trigger)
    const dob = new Date(data.date_of_birth);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) {
      logWaiver("rejected", { emailHash, reason: "under_18" });
      throw new Error("You must be at least 18 to sign online. Minors must sign in person with a parent or guardian.");
    }

    // Signature must match full name (case-insensitive, trimmed)
    if (
      data.signature_text.trim().toLowerCase() !==
      data.full_name.trim().toLowerCase()
    ) {
      logWaiver("rejected", { emailHash, reason: "signature_mismatch" });
      throw new Error("Your typed signature must match your full legal name exactly.");
    }

    // Use service-role client: Zod + the checks above already validate input,
    // and Lovable Cloud's publishable key does not reliably map to a
    // PostgREST role that satisfies the table's INSERT policy.
    const { supabaseAdmin: supabase } = await import(
      "@/integrations/supabase/client.server"
    );

    // Best-effort request metadata
    let userAgent: string | null = null;
    let ipHash: string | null = null;
    try {
      const { getRequestHeader } = await import("@tanstack/react-start/server");
      userAgent = getRequestHeader("user-agent") ?? null;
      const ip =
        getRequestHeader("cf-connecting-ip") ??
        getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
        null;
      if (ip) {
        ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);
      }
    } catch {
      // not fatal
    }

    const { data: row, error } = await supabase
      .from("waiver_signatures")
      .insert({
        full_name: data.full_name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        date_of_birth: data.date_of_birth,
        emergency_contact_name: data.emergency_contact_name.trim(),
        emergency_contact_phone: data.emergency_contact_phone.trim(),
        signature_text: data.signature_text.trim(),
        season: 2026,
        waiver_version: "gryt-run-club-2026-v1",
        user_agent: userAgent,
        ip_hash: ipHash,
      })
      .select("id, signed_on")
      .single();

    if (error) {
      logWaiver("insert_failed", {
        emailHash,
        durationMs: Date.now() - startedAt,
        code: (error as { code?: string }).code ?? null,
        message: error.message,
        details: (error as { details?: string }).details ?? null,
        hint: (error as { hint?: string }).hint ?? null,
      });
      console.error("waiver insert failed", error);
      throw new Error("We couldn't save your signature. Please try again.");
    }

    logWaiver("signed", {
      emailHash,
      id: row.id,
      signed_on: row.signed_on,
      season: 2026,
      durationMs: Date.now() - startedAt,
    });

    // Fire-and-forget confirmation email — never block the response.
    try {
      const { sendInternalTransactionalEmail } = await import(
        "@/lib/email/send-internal.server"
      );
      void sendInternalTransactionalEmail({
        templateName: "waiver-confirmation",
        recipientEmail: data.email.trim().toLowerCase(),
        idempotencyKey: `waiver-confirm-${row.id}`,
        templateData: {
          name: data.full_name.trim(),
          signedOn: row.signed_on,
          confirmationId: row.id,
          waiverUrl: "https://grytrunclub.com/waiver",
        },
      }).catch((err) => {
        logWaiver("email_enqueue_failed", {
          emailHash,
          id: row.id,
          message: err instanceof Error ? err.message : String(err),
        });
      });
    } catch (err) {
      logWaiver("email_enqueue_failed", {
        emailHash,
        id: row.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }

    return { id: row.id as string, signed_on: row.signed_on as string };
  });

export const checkWaiverStatus = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => EmailInput.parse(data))
  .handler(async ({ data }) => {
    const emailHash = hashEmail(data.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("waiver_signatures")
      .select("id, signed_on, full_name")
      .eq("email", data.email.toLowerCase())
      .eq("season", 2026)
      .order("signed_on", { ascending: false })
      .limit(1);

    if (error) {
      logWaiver("status_lookup_failed", {
        emailHash,
        code: (error as { code?: string }).code ?? null,
        message: error.message,
      });
      console.error("waiver lookup failed", error);
      throw new Error("Unable to verify waiver status.");
    }

    const row = rows?.[0];
    if (!row) {
      logWaiver("status_lookup", { emailHash, signed: false });
      return { signed: false as const };
    }

    logWaiver("status_lookup", {
      emailHash,
      signed: true,
      id: row.id,
      signed_on: row.signed_on,
    });

    return {
      signed: true as const,
      id: row.id as string,
      signed_on: row.signed_on as string,
      full_name: row.full_name as string,
    };
  });
