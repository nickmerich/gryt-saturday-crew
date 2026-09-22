import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin/allowlist'
import type { RosterEntry } from './types'

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' },
  })
}

async function database(): Promise<SupabaseClient> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  return supabaseAdmin as unknown as SupabaseClient
}

async function admin(request: Request, db: SupabaseClient) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  const { data, error } = await db.auth.getUser(token)
  return !error && data.user?.email_confirmed_at && isAdminEmail(data.user.email) ? data.user.email! : null
}

const normalizeEmail = (value: string) => value.trim().toLowerCase()
const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')
const digits = (value: string) => value.replace(/\D/g, '')

function contactKind(contact: string): RosterEntry['contactKind'] {
  if (contact.includes('@')) return 'email'
  if (digits(contact).length >= 7) return 'phone'
  return 'other'
}

/** Stable identity for grouping RSVPs: email, else last 10 phone digits, else the name. */
function identityKey(name: string, contact: string) {
  const kind = contactKind(contact)
  if (kind === 'email') return `e:${normalizeEmail(contact)}`
  if (kind === 'phone') return `p:${digits(contact).slice(-10)}`
  return `n:${normalizeName(name)}`
}

export async function adminRoster(request: Request) {
  if (!request.headers.get('authorization')?.match(/^Bearer .+$/))
    return json({ error: 'Sign in with an existing GRYT admin account.' }, 403)

  let db: SupabaseClient
  try {
    db = await database()
  } catch {
    return json({ error: 'The roster is temporarily unavailable. Please try again.' }, 503)
  }

  const actor = await admin(request, db)
  if (!actor) return json({ error: 'Sign in with an existing GRYT admin account.' }, 403)

  const [rsvpResult, waiverResult] = await Promise.all([
    db.from('rsvps').select('id,name,contact,event_label,created_at').order('created_at', { ascending: false }).limit(2000),
    db.from('waiver_signatures').select('full_name,email,signed_on,season,waiver_version').order('signed_on', { ascending: false }).limit(2000),
  ])

  if (rsvpResult.error || waiverResult.error) {
    return json({ error: 'The roster could not be loaded right now. Please try again.' }, 503)
  }

  const waiversByEmail = new Map<string, { signedOn: string; season: number; version: string }>()
  const waiversByName = new Map<string, { signedOn: string; season: number; version: string }>()
  for (const row of waiverResult.data ?? []) {
    const record = { signedOn: row.signed_on as string, season: row.season as number, version: row.waiver_version as string }
    const email = normalizeEmail((row.email as string) ?? '')
    const name = normalizeName((row.full_name as string) ?? '')
    if (email && !waiversByEmail.has(email)) waiversByEmail.set(email, record)
    if (name && !waiversByName.has(name)) waiversByName.set(name, record)
  }

  const entries = new Map<string, RosterEntry>()
  for (const row of rsvpResult.data ?? []) {
    const name = ((row.name as string) ?? '').trim()
    const contact = ((row.contact as string) ?? '').trim()
    const createdAt = row.created_at as string
    const key = identityKey(name, contact)
    const existing = entries.get(key)

    if (existing) {
      existing.rsvpCount += 1
      if (createdAt < existing.firstRsvp) existing.firstRsvp = createdAt
      if (createdAt > existing.lastRsvp) existing.lastRsvp = createdAt
      const label = (row.event_label as string) ?? ''
      if (label && !existing.eventLabels.includes(label)) existing.eventLabels.push(label)
      continue
    }

    const kind = contactKind(contact)
    const waiver =
      (kind === 'email' ? waiversByEmail.get(normalizeEmail(contact)) : undefined) ??
      waiversByName.get(normalizeName(name)) ??
      null

    entries.set(key, {
      key,
      name: name || '(no name given)',
      contact,
      contactKind: kind,
      firstRsvp: createdAt,
      lastRsvp: createdAt,
      rsvpCount: 1,
      eventLabels: (row.event_label as string) ? [row.event_label as string] : [],
      waiver,
    })
  }

  const roster = Array.from(entries.values()).sort((a, b) => b.lastRsvp.localeCompare(a.lastRsvp))
  return json({
    roster,
    totals: {
      people: roster.length,
      rsvps: rsvpResult.data?.length ?? 0,
      withWaiver: roster.filter((entry) => entry.waiver).length,
    },
  })
}
