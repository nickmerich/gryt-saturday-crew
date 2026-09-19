/**
 * Server-side storage for completed RSVP + waiver submissions.
 *
 * Nothing personal ever travels in a URL. The browser only holds an opaque,
 * httpOnly cookie token; every field lives in `public.signup_sessions`, which
 * is service-role only (no anon/authenticated grants, RLS on).
 */
import { createHash, randomBytes } from "crypto";

export const SIGNUP_COOKIE = "gryt_signup";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days

export function generateSignupToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSignupToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function readSignupToken(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === SIGNUP_COOKIE) {
      const value = rest.join("=").trim();
      return value ? decodeURIComponent(value) : null;
    }
  }
  return null;
}

// Secure is required everywhere the app is actually served (https). Local dev
// runs over plain http, where a Secure cookie would be dropped by the browser.
const SECURE = process.env["NODE_ENV"] === "production" ? "Secure; " : "";

export function signupCookie(token: string): string {
  return [
    `${SIGNUP_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    ...(SECURE ? ["Secure"] : []),
    "SameSite=Lax",
    `Max-Age=${MAX_AGE_SECONDS}`,
  ].join("; ");
}

export function clearedSignupCookie(): string {
  return `${SIGNUP_COOKIE}=; Path=/; HttpOnly; ${SECURE}SameSite=Lax; Max-Age=0`;
}


export type SignupSessionRow = {
  id: string;
  rsvp_id: string | null;
  waiver_id: string | null;
  name: string | null;
  contact: string | null;
  event_label: string | null;
  waiver_signed_on: string | null;
  created_at: string;
  expires_at: string;
};

type SessionPatch = {
  rsvp_id?: string | null;
  waiver_id?: string | null;
  name?: string | null;
  contact?: string | null;
  event_label?: string | null;
  waiver_signed_on?: string | null;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function getSignupSession(token: string | null): Promise<SignupSessionRow | null> {
  if (!token) return null;
  try {
    const supabase = await admin();
    const { data, error } = await supabase
      .from("signup_sessions")
      .select("id, rsvp_id, waiver_id, name, contact, event_label, waiver_signed_on, created_at, expires_at")
      .eq("token_hash", hashSignupToken(token))
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error || !data) return null;
    return data as SignupSessionRow;
  } catch {
    return null;
  }
}

/**
 * Writes the submission server-side and returns the token the caller should
 * set as a cookie. Reuses the existing token when the browser already has one.
 */
export async function recordSignupSession(
  existingToken: string | null,
  patch: SessionPatch,
): Promise<string | null> {
  try {
    const supabase = await admin();
    const now = new Date().toISOString();

    if (existingToken) {
      const hash = hashSignupToken(existingToken);
      const { data } = await supabase
        .from("signup_sessions")
        .update({ ...patch, updated_at: now })
        .eq("token_hash", hash)
        .select("id")
        .maybeSingle();
      if (data) return existingToken;
    }

    const token = generateSignupToken();
    const { error } = await supabase.from("signup_sessions").insert({
      token_hash: hashSignupToken(token),
      ...patch,
    });
    if (error) return null;
    return token;
  } catch {
    return null;
  }
}

export async function deleteSignupSession(token: string | null): Promise<void> {
  if (!token) return;
  try {
    const supabase = await admin();
    await supabase.from("signup_sessions").delete().eq("token_hash", hashSignupToken(token));
  } catch {
    // best effort
  }
}
