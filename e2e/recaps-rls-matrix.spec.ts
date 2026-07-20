import { test, expect } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Full RLS regression matrix for the private `recaps` bucket used by the
 * /resources/recap route. For each role (anon, authenticated user,
 * service_role) we exercise every storage op the recap flow touches:
 *
 *   upload → list → info → download → createSignedUrl → update → delete
 *
 * Expected outcome: only `service_role` succeeds end-to-end. anon and
 * authenticated must be denied (or return empty) on every op. This guards
 * against a policy or grant regression silently opening the bucket.
 */

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=",
  "base64",
);
const PNG_BYTES_ALT = Buffer.concat([PNG_BYTES, Buffer.from([0])]);

type Role = "anon" | "authenticated" | "service_role";

async function runMatrix(
  client: SupabaseClient,
  role: Role,
  seededPath: string,
) {
  const targetPath = `e2e-matrix-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const expectDenied = role !== "service_role";

  // upload
  const upload = await client.storage
    .from("recaps")
    .upload(targetPath, PNG_BYTES, { contentType: "image/png", upsert: false });
  if (expectDenied) {
    expect(upload.error, `${role}: upload must be denied`).not.toBeNull();
  } else {
    expect(upload.error, `${role}: upload must succeed`).toBeNull();
  }

  // list (should never surface the seeded object for non-admins)
  const list = await client.storage.from("recaps").list();
  if (expectDenied) {
    const names = (list.data ?? []).map((e) => e.name);
    expect(names, `${role}: list must not leak seeded object`).not.toContain(
      seededPath,
    );
  } else {
    expect(list.error, `${role}: list must succeed`).toBeNull();
    expect((list.data ?? []).map((e) => e.name)).toContain(seededPath);
  }

  // info on the seeded path
  const info = await client.storage.from("recaps").info(seededPath);
  if (expectDenied) {
    expect(info.data, `${role}: info must be null`).toBeNull();
    expect(info.error, `${role}: info must error`).not.toBeNull();
  } else {
    expect(info.error, `${role}: info must succeed`).toBeNull();
    expect(info.data).not.toBeNull();
  }

  // download
  const download = await client.storage.from("recaps").download(seededPath);
  if (expectDenied) {
    expect(download.data, `${role}: download must be null`).toBeNull();
    expect(download.error, `${role}: download must error`).not.toBeNull();
  } else {
    expect(download.error, `${role}: download must succeed`).toBeNull();
    expect(download.data).not.toBeNull();
  }

  // createSignedUrl + fetch
  const signed = await client.storage
    .from("recaps")
    .createSignedUrl(seededPath, 60);
  if (expectDenied) {
    expect(signed.data, `${role}: sign must be null`).toBeNull();
    expect(signed.error, `${role}: sign must error`).not.toBeNull();
  } else {
    expect(signed.error, `${role}: sign must succeed`).toBeNull();
    expect(signed.data?.signedUrl).toBeTruthy();
    const res = await fetch(signed.data!.signedUrl);
    expect(res.status, `${role}: signed URL must fetch 200`).toBe(200);
  }

  // update
  const update = await client.storage
    .from("recaps")
    .update(seededPath, PNG_BYTES_ALT, { contentType: "image/png" });
  if (expectDenied) {
    expect(update.error, `${role}: update must be denied`).not.toBeNull();
  } else {
    expect(update.error, `${role}: update must succeed`).toBeNull();
  }

  // delete (only remove targetPath — leave seededPath for other roles / cleanup)
  const remove = await client.storage.from("recaps").remove([targetPath]);
  if (expectDenied) {
    // Either an explicit error OR silently empty result — both mean nothing was removed.
    if (!remove.error) {
      expect(remove.data ?? []).toEqual([]);
    }
  } else {
    expect(remove.error, `${role}: delete must succeed`).toBeNull();
  }
}

test.describe.serial("recaps bucket — full RLS matrix regression", () => {
  test.skip(
    !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY,
    "Requires SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY",
  );

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const seededPath = `e2e-matrix-seed-${Date.now()}.png`;
  const email = `e2e-matrix-${Date.now()}@example.test`;
  const password = `Pw!${crypto.randomUUID()}`;
  let userId = "";

  test.beforeAll(async () => {
    const seed = await admin.storage
      .from("recaps")
      .upload(seededPath, PNG_BYTES, {
        contentType: "image/png",
        upsert: false,
      });
    if (seed.error) throw seed.error;

    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (created.error || !created.data.user)
      throw created.error ?? new Error("createUser failed");
    userId = created.data.user.id;

    const signIn = await userClient.auth.signInWithPassword({
      email,
      password,
    });
    if (signIn.error) throw signIn.error;
  });

  test.afterAll(async () => {
    await userClient.auth.signOut().catch(() => {});
    if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {});
    await admin.storage.from("recaps").remove([seededPath]).catch(() => {});
  });

  test("anon is denied across the full matrix", async () => {
    await runMatrix(anon, "anon", seededPath);
  });

  test("authenticated user is denied across the full matrix", async () => {
    await runMatrix(userClient, "authenticated", seededPath);
  });

  test("service_role succeeds across the full matrix", async () => {
    await runMatrix(admin, "service_role", seededPath);
  });
});
