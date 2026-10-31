import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { getOccurrence, nyDateKey, occurrenceFor } from '@/lib/run-schedule'
import { finishedRunDates, summarizeStreaks } from '@/lib/streaks'
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
      streakCurrent: 0,
      streakLongest: 0,
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
      streakCurrent: 0,
      streakLongest: 0,
    })
  }

  // Streaks come from confirmed check-ins at finished runs only, so today's
  // run neither adds to nor breaks anybody's streak while it is still on.
  const runDates = finishedRunDates()
  if (runDates.length > 0 && people.size > 0) {
    const { data: history } = await db
      .from('run_checkins')
      .select('person_key,event_date')
      .eq('status', 'present')
      .in('event_date', runDates)
      .in('person_key', Array.from(people.keys()))
    const streaks = summarizeStreaks(
      (history ?? []).map((r) => ({
        personKey: r.person_key as string,
        eventDate: r.event_date as string,
      })),
      runDates,
    )
    for (const person of people.values()) {
      const s = streaks.get(person.key)
      if (!s) continue
      person.streakCurrent = s.current
      person.streakLongest = s.longest
    }
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

/* --------------------------------------------------------------------------
 * QR self check-in
 *
 * The organiser's phone shows a QR that rotates every 30 seconds. A runner
 * scans it at the trailhead, types their name and contact, and lands in the
 * same list an organiser check-in would. Off the run day, or with a stale
 * code, nothing is written.
 * ------------------------------------------------------------------------ */

function qrSecret(): string | null {
  return process.env['CHECKIN_QR_SECRET'] ?? null
}

/** Admin-only: the code the QR on the organiser's phone should encode. */
export async function checkinCode(request: Request) {
  const access = await gate(request)
  if ('error' in access) return access.error

  const secret = qrSecret()
  if (!secret) return json({ error: 'Scan check-in is not configured yet.' }, 503)

  const { currentCode } = await import('./rotating-code')
  const occurrence = getOccurrence()
  const { code, rotatesAt } = await currentCode(secret)
  return json({
    code,
    rotatesAt: new Date(rotatesAt).toISOString(),
    eventDate: occurrence.localDate,
    runNumber: occurrence.runNumber,
    openToday: occurrence.localDate === nyDateKey() && occurrence.status !== 'cancelled',
  })
}

/** Public: a runner scanning the QR at the run. */
export async function selfCheckin(request: Request) {
  const secret = qrSecret()
  if (!secret) return json({ error: 'Scan check-in is not set up yet.' }, 503)

  let payload: { code?: string; ticket?: string; claim?: boolean; name?: string; contact?: string }
  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return json({ error: 'That request could not be read.' }, 400)
  }

  const trim = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const { verifyCode, issueTicket, verifyTicket } = await import('./rotating-code')

  // On arrival the page swaps the scanned code for a 20-minute ticket.
  if (payload.claim === true) {
    if (!(await verifyCode(secret, trim(payload.code, 16)))) {
      return json({ error: 'That code has expired. Scan the code on the screen again.' }, 403)
    }
    return json({ ticket: await issueTicket(secret) })
  }

  const name = trim(payload.name, 80)
  const contact = trim(payload.contact, 200)
  if (name.length < 2) return json({ error: 'Please type your name.' }, 400)
  if (contact.length < 3) return json({ error: 'Please add an email or phone number.' }, 400)

  const ticketOk = payload.ticket ? await verifyTicket(secret, trim(payload.ticket, 64)) : false
  if (!ticketOk && !(await verifyCode(secret, trim(payload.code, 16)))) {
    return json({ error: 'That code has expired. Scan the code on the screen again.' }, 403)
  }

  const occurrence = getOccurrence()
  if (occurrence.localDate !== nyDateKey() || occurrence.status === 'cancelled') {
    return json({ error: 'There is no run to check in to right now.' }, 409)
  }

  let db: SupabaseClient
  try {
    db = await database()
  } catch {
    return json({ error: 'Check-in is temporarily unavailable.' }, 503)
  }

  const personKey = identityKey(name, contact)
  const now = new Date().toISOString()
  const { data, error } = await db
    .from('run_checkins')
    .upsert(
      {
        event_id: occurrence.id,
        event_date: occurrence.localDate,
        person_key: personKey,
        name,
        contact,
        source: 'self',
        status: 'present',
        checked_in_at: now,
        checked_in_by: 'qr-scan',
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
    action: 'self-checkin',
    actor: 'qr-scan',
    detail: { name },
  })

  return json({ ok: true, name, runNumber: occurrence.runNumber })
}

/**
 * Saturday Soundtrack songs for one run, for organizers building the
 * playlist. First names appear only when the runner opted in to a credit.
 * Kept separate from checkinList so a missing song column can never break
 * check-in.
 */
export async function soundtrackList(request: Request) {
  const access = await gate(request)
  if ('error' in access) return access.error
  const { db } = access
  const { buildSoundtrack, isMissingSongColumnError } = await import('@/lib/soundtrack')

  const url = new URL(request.url)
  const occurrence = resolveOccurrence(url.searchParams.get('date'))
  const label = `Run #${occurrence.runNumber}`
  const windowStart = new Date(new Date(occurrence.startUtc).getTime() - 9 * 864e5).toISOString()

  const { data, error } = await db
    .from('rsvps')
    .select('name,song,song_credit,event_id,event_label,created_at')
    .not('song', 'is', null)
    .gte('created_at', new Date(new Date(occurrence.startUtc).getTime() - 30 * 864e5).toISOString())
    .order('created_at', { ascending: true })
    .limit(1000)

  if (error) {
    if (isMissingSongColumnError(error)) {
      return json({ runNumber: occurrence.runNumber, localDate: occurrence.localDate, available: false, songs: [] })
    }
    return json({ error: 'The song list could not be loaded. Please try again.' }, 503)
  }

  const rows = (data ?? []).filter((row) => {
    if ((row.event_id as string | null) === occurrence.id) return true
    const createdAt = row.created_at as string
    const eventLabel = ((row.event_label as string) ?? '').trim()
    return (
      eventLabel.includes(label) ||
      eventLabel.includes(occurrence.localDate) ||
      (!row.event_id && createdAt >= windowStart && createdAt <= occurrence.endUtc)
    )
  })

  const songs = buildSoundtrack(
    rows.map((row) => ({
      song: row.song as string | null,
      songCredit: row.song_credit as boolean | null,
      name: row.name as string | null,
      createdAt: row.created_at as string,
    })),
  )
  return json({ runNumber: occurrence.runNumber, localDate: occurrence.localDate, available: true, songs })
}
