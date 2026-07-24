import { createServerFn } from "@tanstack/react-start";

// 30 days — signed URL longevity for shareable recap links.
// Kept short to prevent the endpoint from being repurposed as long-lived
// anonymous file hosting.
const SIGNED_URL_TTL = 60 * 60 * 24 * 30;

// Hard cap on decoded PNG bytes (~4MB) — covers realistic recap graphics
// while limiting abuse potential.
const MAX_DECODED_BYTES = 4 * 1024 * 1024;

// PNG magic number: 89 50 4E 47 0D 0A 1A 0A
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// IEND chunk trailer that a valid PNG must end with.
const PNG_TRAILER = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);

function isValidPng(bytes: Buffer): boolean {
  if (bytes.length < PNG_SIGNATURE.length + PNG_TRAILER.length) return false;
  if (!bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) return false;
  const tail = bytes.subarray(bytes.length - PNG_TRAILER.length);
  return tail.equals(PNG_TRAILER);
}

export const uploadRecap = createServerFn({ method: "POST" })
  .inputValidator((input: { dataUrl: string }) => {
    if (
      !input ||
      typeof input.dataUrl !== "string" ||
      !input.dataUrl.startsWith("data:image/png;base64,") ||
      input.dataUrl.length > 8_000_000 // ~6MB base64 max
    ) {
      throw new Error("Invalid image payload");
    }
    return { dataUrl: input.dataUrl };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base64 = data.dataUrl.slice("data:image/png;base64,".length);
    let bytes: Buffer;
    try {
      bytes = Buffer.from(base64, "base64");
    } catch {
      throw new Error("Invalid image payload");
    }

    if (bytes.length === 0 || bytes.length > MAX_DECODED_BYTES) {
      throw new Error("Invalid image payload");
    }

    // Enforce real PNG format so the endpoint can't be used to host
    // arbitrary binary content disguised with a data-URL prefix.
    if (!isValidPng(bytes)) {
      throw new Error("Invalid image payload");
    }

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
