import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { z } from "zod";

const RecommendationInput = z.object({
  category: z.string().trim().min(1).max(40),
  message: z.string().trim().min(1).max(500),
});

export const submitRecommendation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => RecommendationInput.parse(data))
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

    const { error } = await supabase.from("recommendations").insert({
      category: data.category,
      message: data.message,
      ip_hash: ipHash,
    });

    if (error) {
      console.error("recommendation insert failed", error);
      throw new Error("We couldn't save your idea. Please try again.");
    }

    return { ok: true };
  });
