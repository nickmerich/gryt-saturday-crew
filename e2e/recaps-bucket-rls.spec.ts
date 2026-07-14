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
 */

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Minimal 1x1 PNG bytes shared across all cases.
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=",
  "base64",
);

test.describe("recaps bucket RLS — anon", () => {
  test.skip(
    !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY,
    "Supabase env vars not available",
  );

  const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const targetPath = `e2e-anon-${Date.now()}.png`;

  test("anon cannot upload to recaps", async () => {
    const { error } = await anon.storage
      .from("recaps")
      .upload(targetPath, PNG_BYTES, { contentType: "image/png" });
    expect(error, "upload should be blocked by RLS").not.toBeNull();
  });

  test("anon cannot list recaps", async () => {
    const { data, error } = await anon.storage.from("recaps").list();
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
      .update("any.png", PNG_BYTES, { contentType: "image/png" });
    expect(error).not.toBeNull();
  });

  test("anon cannot delete from recaps", async () => {
    const { data, error } = await anon.storage
      .from("recaps")
      .remove(["any.png"]);
    if (!error) {
      expect(data ?? []).toEqual([]);
    }
  });
});

test.describe.serial("recaps bucket RLS — authenticated (non-admin) user", () => {
  test.skip(
    !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY,
    "Requires SUPABASE_SERVICE_ROLE_KEY to provision a temporary user",
  );

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = `e2e-recap-${Date.now()}@example.test`;
  const password = `Pw!${crypto.randomUUID()}`;
  let userId = "";

  test.beforeAll(async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    userId = data.user.id;

    const signIn = await userClient.auth.signInWithPassword({ email, password });
    if (signIn.error) throw signIn.error;
    expect(signIn.data.session?.access_token).toBeTruthy();
  });

  test.afterAll(async () => {
    await userClient.auth.signOut().catch(() => {});
    if (userId) {
      await admin.auth.admin.deleteUser(userId).catch(() => {});
    }
  });

  const targetPath = `e2e-user-${Date.now()}.png`;

  test("authenticated user cannot upload to recaps", async () => {
    const { error } = await userClient.storage
      .from("recaps")
      .upload(targetPath, PNG_BYTES, { contentType: "image/png" });
    expect(error, "upload should be blocked by RLS for authenticated").not.toBeNull();
  });

  test("authenticated user cannot list recaps", async () => {
    const { data, error } = await userClient.storage.from("recaps").list();
    if (!error) {
      expect(data ?? []).toEqual([]);
    }
  });

  test("authenticated user cannot download from recaps", async () => {
    const { data, error } = await userClient.storage
      .from("recaps")
      .download("any.png");
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  test("authenticated user cannot create signed URL for recaps", async () => {
    const { data, error } = await userClient.storage
      .from("recaps")
      .createSignedUrl("any.png", 60);
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });
});

test.describe.serial("recaps bucket — service_role (admin) happy path", () => {
  test.skip(
    !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY,
    "Requires SUPABASE_SERVICE_ROLE_KEY",
  );

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const targetPath = `e2e-admin-${Date.now()}.png`;

  test("service_role can upload to recaps", async () => {
    const { error } = await admin.storage
      .from("recaps")
      .upload(targetPath, PNG_BYTES, {
        contentType: "image/png",
        upsert: false,
      });
    expect(error).toBeNull();
  });

  test("service_role can create signed URL and fetch the object", async () => {
    const { data, error } = await admin.storage
      .from("recaps")
      .createSignedUrl(targetPath, 60);
    expect(error).toBeNull();
    expect(data?.signedUrl).toBeTruthy();

    const res = await fetch(data!.signedUrl);
    expect(res.status).toBe(200);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBe(PNG_BYTES.length);
  });

  test("service_role can delete from recaps", async () => {
    const { error } = await admin.storage.from("recaps").remove([targetPath]);
    expect(error).toBeNull();
  });
});
