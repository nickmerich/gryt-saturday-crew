import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { z } from "zod";

const PartnerInquiryInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  organization: z.string().trim().max(160).optional().or(z.literal("")),
  involvement: z.enum([
    "Post-Run Sponsor",
    "Gear Partner",
    "Content Feature",
    "Location Partner",
    "Other",
  ]),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

export const submitPartnerInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => PartnerInquiryInput.parse(data))
  .handler(async ({ data }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    let ipHash: string | null = null;
    try {
      const { getRequestHeader } = await import("@tanstack/react-start/server");
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

    const organization = data.organization?.trim() || null;
    const message = data.message?.trim() || null;

    const { data: inserted, error } = await (supabase.from(
      "partner_inquiries" as any,
    ) as any)
      .insert({
        name: data.name,
        email: data.email,
        organization,
        involvement: data.involvement,
        message,
        ip_hash: ipHash,
      })
      .select("id, created_at")
      .maybeSingle();

    if (error) {
      console.error("partner inquiry insert failed", error);
    }

    let emailed = false;
    try {
      const { sendInternalTransactionalEmail } = await import(
        "./email/send-internal.server"
      );
      const baseKey = inserted?.id ?? crypto.randomUUID();
      const submittedAt = inserted?.created_at ?? new Date().toISOString();
      const result = await sendInternalTransactionalEmail({
        templateName: "partner-inquiry-notification",
        recipientEmail: "nick@gryt.club",
        idempotencyKey: `partner-inquiry-${baseKey}`,
        templateData: {
          name: data.name,
          email: data.email,
          organization: organization ?? "—",
          involvement: data.involvement,
          message: message ?? "—",
          submittedAt,
          ...(error ? { note: "Database save failed — email only." } : {}),
        },
      });
      emailed = result.ok;
    } catch (e) {
      console.error("partner inquiry notification email failed", e);
    }

    // The lead is only lost if BOTH the save and the notification failed.
    if (error && !emailed) {
      throw new Error("We couldn't send your message. Please try again.");
    }

    return { ok: true };
  });

