import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { STRAVA_CLUB_ID } from '@/lib/strava-club'

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

async function database(): Promise<SupabaseClient> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  return supabaseAdmin as unknown as SupabaseClient
}

async function requireAdmin(request: Request): Promise<string | null> {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  let db: SupabaseClient
  try {
    db = await database()
  } catch {
    return null
  }
  const { data, error } = await db.auth.getUser(token)
  return !error && data.user?.email_confirmed_at && isAdminEmail(data.user.email)
    ? data.user.email!
    : null
}

const DENY = { error: 'Sign in with an existing GRYT admin account.' }

/** What the connect page needs to render, without revealing any secret value. */
export async function stravaConnectConfig(request: Request) {
  if (!(await requireAdmin(request))) return json(DENY, 403)
  return json({
    clientIdConfigured: Boolean(process.env['STRAVA_CLIENT_ID']),
    clientSecretConfigured: Boolean(process.env['STRAVA_CLIENT_SECRET']),
    refreshTokenConfigured: Boolean(process.env['STRAVA_CLUB_REFRESH_TOKEN']),
    clientId: process.env['STRAVA_CLIENT_ID'] ?? null,
    clubId: STRAVA_CLUB_ID,
  })
}

type TokenResponse = {
  refresh_token?: string
  access_token?: string
  athlete?: { id?: number; firstname?: string; lastname?: string }
}

/**
 * Exchange the one-time Strava authorization code for a long-lived refresh
 * token. The athlete must belong to the GRYT club, otherwise the token is
 * useless for club reads and we refuse it rather than hand back a dead key.
 */
export async function stravaExchangeCode(request: Request) {
  const actor = await requireAdmin(request)
  if (!actor) return json(DENY, 403)

  const clientId = process.env['STRAVA_CLIENT_ID']
  const clientSecret = process.env['STRAVA_CLIENT_SECRET']
  if (!clientId || !clientSecret) {
    return json({ error: 'The Strava application ID and secret are not configured yet.' }, 503)
  }

  let body: { code?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Could not read the request.' }, 400)
  }
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  if (!code) return json({ error: 'Strava did not send an authorization code.' }, 400)

  let token: TokenResponse
  try {
    const res = await fetch('https://www.strava.com/api/v3/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    })
    if (!res.ok) {
      console.error(`Strava code exchange failed [${res.status}]`)
      return json(
        {
          error:
            res.status === 400
              ? 'Strava rejected that approval. It may have already been used. Start again.'
              : `Strava returned an error (${res.status}). Try again in a moment.`,
        },
        502,
      )
    }
    token = (await res.json()) as TokenResponse
  } catch {
    return json({ error: 'Could not reach Strava. Check the connection and try again.' }, 502)
  }

  if (!token.refresh_token || !token.access_token) {
    return json({ error: 'Strava did not return a usable key. Start the approval again.' }, 502)
  }

  // Confirm this athlete can actually read the club before handing over a key.
  let clubName: string | null = null
  try {
    const clubRes = await fetch(`https://www.strava.com/api/v3/clubs/${STRAVA_CLUB_ID}`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    if (!clubRes.ok) {
      return json(
        {
          error:
            'That Strava account cannot see the GRYT club. Sign in to Strava as an account that has joined the club, then try again.',
        },
        403,
      )
    }
    const club = (await clubRes.json()) as { name?: string }
    clubName = club.name ?? null
  } catch {
    return json({ error: 'Could not verify club access with Strava. Try again.' }, 502)
  }

  const athlete = token.athlete
  return json({
    refreshToken: token.refresh_token,
    athleteName: [athlete?.firstname, athlete?.lastname].filter(Boolean).join(' ') || null,
    clubName,
  })
}
