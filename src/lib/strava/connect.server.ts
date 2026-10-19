import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { STRAVA_CLUB_ID } from "@/lib/strava-club";
import { createOAuthState, verifyOAuthState } from "./crypto.server";
import { clubStatsService } from "./service.server";

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

async function requireAdmin(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as SupabaseClient;
    const { data, error } = await db.auth.getUser(token);
    return !error && data.user?.email_confirmed_at && isAdminEmail(data.user.email)
      ? data.user.email!
      : null;
  } catch {
    return null;
  }
}
const DENY = { error: "Sign in with an existing GRYT admin account." };

export async function stravaConnectConfig(request: Request) {
  const actor = await requireAdmin(request);
  if (!actor) return json(DENY, 403);
  const secret = process.env.STRAVA_CLIENT_SECRET;
  const stats = await clubStatsService().get();
  return json({
    clientIdConfigured: Boolean(process.env.STRAVA_CLIENT_ID),
    clientSecretConfigured: Boolean(secret),
    clientId: process.env.STRAVA_CLIENT_ID ?? null,
    clubId: STRAVA_CLUB_ID,
    oauthState: secret ? await createOAuthState(actor, secret) : null,
    stats,
  });
}

/** Only the authenticated admin can connect; credentials never leave the server. */
export async function stravaExchangeCode(request: Request) {
  const actor = await requireAdmin(request);
  if (!actor) return json(DENY, 403);
  const secret = process.env.STRAVA_CLIENT_SECRET;
  if (!secret || !process.env.STRAVA_CLIENT_ID) {
    return json(
      {
        error:
          "Configure the Strava application in the hosting provider's secure secrets settings.",
      },
      503,
    );
  }
  let body: { code?: unknown; state?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  if (
    typeof body.code !== "string" ||
    body.code.length < 4 ||
    body.code.length > 512 ||
    typeof body.state !== "string" ||
    body.state.length > 2048 ||
    !(await verifyOAuthState(body.state, actor, secret))
  )
    return json({ error: "Approval expired or did not match this admin. Start again." }, 400);
  try {
    const stats = await clubStatsService().connect(body.code);
    return json({ connected: true, stats });
  } catch {
    return json(
      {
        error:
          "Could not save a verified connection. Confirm the migration, server secrets, and club access, then authorize again.",
      },
      502,
    );
  }
}
