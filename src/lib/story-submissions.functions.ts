import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { z } from "zod";

const StorySubmissionInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  story: z.string().trim().min(1).max(4000),
  whyInterview: z.string().trim().min(1).max(2000),
  links: z.string().trim().max(600).optional().or(z.literal("")),
  consentContact: z.boolean(),
});

export const submitStorySubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => StorySubmissionInput.parse(data))
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

    const location = data.location?.trim() || null;
    const links = data.links?.trim() || null;

    const { data: inserted, error } = await (supabase.from(
      "story_submissions" as any,
    ) as any)
      .insert({
        name: data.name,
        email: data.email,
        location,
        story: data.story,
        why_interview: data.whyInterview,
        links,
        consent_contact: data.consentContact,
        ip_hash: ipHash,
      })
      .select("id, created_at")
      .maybeSingle();

    if (error) {
      console.error("story submission insert failed", error);
      throw new Error("We couldn't submit your story. Please try again.");
    }

    try {
      const { sendInternalTransactionalEmail } = await import(
        "./email/send-internal.server"
      );
      const baseKey = inserted?.id ?? crypto.randomUUID();
      const submittedAt = inserted?.created_at ?? new Date().toISOString();
      await sendInternalTransactionalEmail({
        templateName: "partner-inquiry-notification",
        recipientEmail: "merichnick@gmail.com",
        idempotencyKey: `story-submission-${baseKey}`,
        templateData: {
          name: data.name,
          email: data.email,
          organization: location ?? "N/A",
          involvement: "Story Submission",
          message: `WHY INTERVIEW:\n${data.whyInterview}\n\nSTORY:\n${data.story}\n\nLINKS:\n${links ?? "N/A"}\n\nConsent to contact: ${data.consentContact ? "yes" : "no"}`,
          submittedAt,
        },
      });
    } catch (e) {
      console.error("story submission notification email failed", e);
    }

    return { ok: true };
  });
