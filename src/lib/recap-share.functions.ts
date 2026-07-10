import { createServerFn } from "@tanstack/react-start";

// 10 years — signed URL longevity for shareable recap links.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

export const uploadRecap = createServerFn({ method: "POST" })
  .inputValidator((input: { dataUrl: string }) => {
    if (
      !input ||
      typeof input.dataUrl !== "string" ||
      !input.dataUrl.startsWith("data:image/png;base64,") ||
      input.dataUrl.length > 8_000_000 // ~6MB PNG max
    ) {
      throw new Error("Invalid image payload");
    }
    return { dataUrl: input.dataUrl };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base64 = data.dataUrl.slice("data:image/png;base64,".length);
    const bytes = Buffer.from(base64, "base64");
    const id = crypto.randomUUID();
    const path = `${id}.png`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("recaps")
      .upload(path, bytes, {
        contentType: "image/png",
        cacheControl: "31536000",
        upsert: false,
      });
    if (uploadErr) {
      console.error(`Recap upload failed: ${uploadErr.message}`);
      throw new Error("Couldn't save your recap. Please try again.");
    }

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("recaps")
      .createSignedUrl(path, SIGNED_URL_TTL);
    if (signErr || !signed) {
      console.error(`Recap sign failed: ${signErr?.message}`);
      throw new Error("Couldn't create share link. Please try again.");
    }

    return { url: signed.signedUrl };
  });
