import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { getOccurrence, occurrenceFor } from '@/lib/run-schedule'
import { identityKey, normalizeEmail, normalizeName } from './identity'
import type { CheckinPerson, CheckinResponse } from './types'

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

async function admin(request: Request, db: SupabaseClient) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  const { data, error } = await db.auth.getUser(token)
  return !error && data.user?.email_confirmed_at && isAdminEmail(data.user.email)
    ? data.user.email!
    : null
}

const DENIED = 'Sign in with an existing GRYT admin account.'

async function gate(request: Request) {
  if (!request.headers.get('authorization')?.match(/^Bearer .+$/)) {
    return { error: json({ error: DENIED }, 403) } as const
  }
  let db: SupabaseClient
  try {
    db = await database()
  } catch {
    return { error: json({ error: 'Check-in is temporarily unavailable.' }, 503) } as const
  }
  const actor = await admin(request, db)
  if (!actor) return { error: json({ error: DENIED }, 403) } as const
  return { db, actor } as const
}

/** The run being checked in: today's run while it is live, otherwise the next one. */
function resolveOccurrence(dateParam: string | null) {
  return dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? occurrenceFor(dateParam)
    : getOccurrence()
}

export async function checkinList(request: Request) {
  const access = await gate(request)
  if ('error' in access) return access.error
  const { db } = access

  const url = new URL(request.url)
  const occurrence = resolveOccurrence(url.searchParams.get('date'))
  const label = `Run #${occurrence.runNumber}`

  // RSVPs are matched by event label when present, otherwise by the nine days
  // leading into the run — that covers the whole sign-up window for this week.
  const windowStart = new Date(new Date(occurrence.startUtc).getTime() - 9 * 864e5).toISOString()

  const [rsvpResult, waiverResult, checkinResult] = await Promise.all([
    db
      .from('rsvps')
      .select('id,name,contact,event_label,party_size,first_timer,created_at')
      .order('created_at', { ascending: false })
      .limit(1000),
    db
      .from('waiver_signatures')
      .select('full_name,email,signed_on')
      .order('signed_on', { ascending: false })
      .limit(2000),
    db.from('run_checkins').select('*').eq('event_id', occurrence.id),
  ])

  if (rsvpResult.error || waiverResult.error || checkinResult.error) {
    return json({ error: 'The check-in list could not be loaded. Please try again.' }, 503)
  }

  const waiverByEmail = new Map<string, string>()
  const waiverByName = new Map<string, string>()
  for (const row of waiverResult.data ?? []) {
    const email = normalizeEmail((row.email as string) ?? '')
    const name = normalizeName((row.full_name as string) ?? '')
    if (email && !waiverByEmail.has(email)) waiverByEmail.set(email, row.signed_on as string)
    if (name && !waiverByName.has(name)) waiverByName.set(name, row.signed_on as string)
  }

  const people = new Map<string, CheckinPerson>()

  for (const row of rsvpResult.data ?? []) {
    const createdAt = row.created_at as string
    const eventLabel = ((row.event_label as string) ?? '').trim()
    const matchesLabel =
      eventLabel.includes(label) || eventLabel.includes(occurrence.localDate)
    const inWindow = createdAt >= windowStart && createdAt <= occurrence.endUtc
    if (!matchesLabel && !inWindow) continue

    const name = ((row.name as string) ?? '').trim()
    const contact = ((row.contact as string) ?? '').trim()
    const key = identityKey(name, contact)
    const existing = people.get(key)
    if (existing) {
      existing.rsvpCount += 1
      existing.partySize = Math.max(existing.partySize, (row.party_size as number) ?? 1)
      existing.firstTimer = existing.firstTimer || Boolean(row.first_timer)
      continue
    }

    people.set(key, {
      key,
      name: name || '(no name given)',
      contact,
      source: 'rsvp',
      rsvpCount: 1,
      partySize: (row.party_size as number) ?? 1,
      firstTimer: Boolean(row.first_timer),
      waiverSignedOn:
        waiverByEmail.get(normalizeEmail(contact)) ?? waiverByName.get(normalizeName(name)) ?? null,
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
      note: null,
    })
  }

  for (const row of checkinResult.data ?? []) {
    const key = row.person_key as string
    const present = (row.status as string) === 'present'
    const existing = people.get(key)
    if (existing) {
      existing.checkedIn = present
      existing.checkedInAt = present ? (row.checked_in_at as string) : null
      existing.checkedInBy = present ? (row.checked_in_by as string) : null
      existing.note = (row.note as string) ?? null
      continue
    }
    const name = ((row.name as string) ?? '').trim()
    const contact = ((row.contact as string) ?? '').trim()
    people.set(key, {
      key,
      name: name || '(no name given)',
      contact,
      source: (row.source as CheckinPerson['source']) ?? 'walk-in',
      rsvpCount: 0,
      partySize: 1,
      firstTimer: false,
      waiverSignedOn:
        waiverByEmail.get(normalizeEmail(contact)) ?? waiverByName.get(normalizeName(name)) ?? null,
      checkedIn: present,
      checkedInAt: present ? (row.checked_in_at as string) : null,
      checkedInBy: present ? (row.checked_in_by as string) : null,
      note: (row.note as string) ?? null,
    })
  }

  const list = Array.from(people.values()).sort((a, b) => a.name.localeCompare(b.name))
  const body: CheckinResponse = {
    event: {
      id: occurrence.id,
      runNumber: occurrence.runNumber,
      localDate: occurrence.localDate,
      label,
      status: occurrence.status,
      startUtc: occurrence.startUtc,
      endUtc: occurrence.endUtc,
    },
    people: list,
    totals: {
      expected: list.filter((p) => p.source === 'rsvp').length,
      present: list.filter((p) => p.checkedIn).length,
      walkIns: list.filter((p) => p.source === 'walk-in').length,
      missingWaiver: list.filter((p) => p.checkedIn && !p.waiverSignedOn).length,
      notYetIn: list.filter((p) => p.source === 'rsvp' && !p.checkedIn).length,
    },
  }
  return json(body)
}

type Action =
  | { action: 'check-in'; personKey: string; name: string; contact?: string; note?: string; date?: string }
  | { action: 'undo'; personKey: string; date?: string }
  | { action: 'walk-in'; name: string; contact?: string; note?: string; date?: string }

export async function checkinMutate(request: Request) {
  const access = await gate(request)
  if ('error' in access) return access.error
  const { db, actor } = access

  let payload: Action
  try {
    payload = (await request.json()) as Action
  } catch {
    return json({ error: 'That request could not be read.' }, 400)
  }

  const occurrence = resolveOccurrence(payload.date ?? null)
  if (occurrence.status === 'cancelled') {
    return json({ error: 'That run is cancelled. Nothing to check in.' }, 409)
  }

  const trim = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

  if (payload.action === 'undo') {
    const personKey = trim(payload.personKey, 200)
    if (!personKey) return json({ error: 'Missing person.' }, 400)
    const { error } = await db
      .from('run_checkins')
      .update({ status: 'removed', updated_at: new Date().toISOString() })
      .eq('event_id', occurrence.id)
      .eq('person_key', personKey)
    if (error) return json({ error: 'That change did not save. Try again.' }, 503)
    await db.from('run_checkin_audit').insert({
      event_id: occurrence.id,
      person_key: personKey,
      action: 'undo',
      actor,
    })
    return json({ ok: true })
  }

  const isWalkIn = payload.action === 'walk-in'
  const name = trim((payload as { name?: string }).name, 80)
  if (!name) return json({ error: 'A name is required.' }, 400)
  const contact = trim((payload as { contact?: string }).contact, 200)
  const note = trim((payload as { note?: string }).note, 300)
  const personKey = isWalkIn
    ? identityKey(name, contact)
    : trim((payload as { personKey?: string }).personKey, 200) || identityKey(name, contact)

  const now = new Date().toISOString()
  const { data, error } = await db
    .from('run_checkins')
    .upsert(
      {
        event_id: occurrence.id,
        event_date: occurrence.localDate,
        person_key: personKey,
        name,
        contact: contact || null,
        source: isWalkIn ? 'walk-in' : 'rsvp',
        status: 'present',
        note: note || null,
        checked_in_at: now,
        checked_in_by: actor,
        updated_at: now,
      },
      { onConflict: 'event_id,person_key' },
    )
    .select('id')
    .single()

  if (error) return json({ error: 'That check-in did not save. Try again.' }, 503)

  await db.from('run_checkin_audit').insert({
    checkin_id: data?.id ?? null,
    event_id: occurrence.id,
    person_key: personKey,
    action: isWalkIn ? 'walk-in' : 'check-in',
    actor,
    detail: { name, contact: contact || null },
  })

  return json({ ok: true })
}
