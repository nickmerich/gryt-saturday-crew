import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * End-to-end confirmation that the private `recaps` storage bucket is
 * locked down to `service_role` only.
 *
 * The restrictive RLS policies on `storage.objects` deny SELECT/INSERT/
 * UPDATE/DELETE to both `anon` and `authenticated`. `service_role`
 * bypasses RLS by design, so the app's uploadRecap server function
 * (which uses supabaseAdmin) is the only supported write path.
 *
 * This spec exercises a publishable-key client (which acts as `anon`
 * for unauthenticated calls) against every relevant storage op and
 * asserts each one is rejected.
 */

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";

test.describe("recaps bucket RLS", () => {
  test.skip(
    !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY,
    "Supabase env vars not available",
  );

  const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const targetPath = `e2e-${Date.now()}.png`;
  // Minimal 1x1 PNG bytes.
  const pngBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=",
    "base64",
  );

  test("anon cannot upload to recaps", async () => {
    const { error } = await anon.storage
      .from("recaps")
      .upload(targetPath, pngBytes, { contentType: "image/png" });
    expect(error, "upload should be blocked by RLS").not.toBeNull();
  });

  test("anon cannot list recaps", async () => {
    const { data, error } = await anon.storage.from("recaps").list();
    // RLS on storage.objects returns either an error or an empty list.
    if (!error) {
      expect(data ?? []).toEqual([]);
    }
  });

  test("anon cannot download from recaps", async () => {
    const { data, error } = await anon.storage
      .from("recaps")
      .download("any.png");
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  test("anon cannot create signed URL for recaps", async () => {
    const { data, error } = await anon.storage
      .from("recaps")
      .createSignedUrl("any.png", 60);
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  test("anon cannot update in recaps", async () => {
    const { error } = await anon.storage
      .from("recaps")
      .update("any.png", pngBytes, { contentType: "image/png" });
    expect(error).not.toBeNull();
  });

  test("anon cannot delete from recaps", async () => {
    const { data, error } = await anon.storage
      .from("recaps")
      .remove(["any.png"]);
    // Delete returns success shape but with an empty array when RLS filters
    // out every row, or an explicit error. Either signals the row was not
    // reachable.
    if (!error) {
      expect(data ?? []).toEqual([]);
    }
  });
});
