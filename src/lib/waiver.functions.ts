import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { z } from "zod";


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

export const signWaiver = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => WaiverInput.parse(data))
  .handler(async ({ data }) => {
    // Age 18+ check (also enforced server-side by trigger)
    const dob = new Date(data.date_of_birth);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) {
      throw new Error("You must be at least 18 to sign online. Minors must sign in person with a parent or guardian.");
    }

    // Signature must match full name (case-insensitive, trimmed)
    if (
      data.signature_text.trim().toLowerCase() !==
      data.full_name.trim().toLowerCase()
    ) {
      throw new Error("Your typed signature must match your full legal name exactly.");
    }

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
      console.error("waiver insert failed", error);
      throw new Error("We couldn't save your signature. Please try again.");
    }

    return { id: row.id as string, signed_on: row.signed_on as string };
  });
