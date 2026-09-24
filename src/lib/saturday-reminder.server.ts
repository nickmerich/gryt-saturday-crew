import { createClient } from '@supabase/supabase-js'
import { sendInternalTransactionalEmail } from '@/lib/email/send-internal.server'
import {
  getOccurrence,
  nyDateKey,
  occurrenceCalendarUrl,
  occurrenceDateLong,
  occurrenceTime,
} from '@/lib/run-schedule'

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const TEMPLATE = 'saturday-reminder'

export async function runSaturdayReminders(now: Date = new Date()) {
  const occ = getOccurrence(now)
  const tomorrow = nyDateKey(new Date(now.getTime() + 24 * 3600 * 1000))
  if (occ.localDate !== tomorrow || occ.status !== 'scheduled') {
    return { skipped: true, reason: 'no run tomorrow', eventId: occ.id }
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { skipped: true, reason: 'config' }
  const supabase = createClient(url, key)

  // Sign-ups for this run: tagged with its id, or untagged ones from the 9 days before it.
  const windowStart = new Date(new Date(occ.startUtc).getTime() - 9 * 86400000).toISOString()
  const { data: rows, error } = await supabase
    .from('rsvps')
    .select('name, contact, event_id, created_at')
    .or(`event_id.eq.${occ.id},and(event_id.is.null,created_at.gte.${windowStart})`)
    .lte('created_at', occ.startUtc)
  if (error) {
    console.error('saturday-reminder: rsvp read failed', error.message)
    return { skipped: true, reason: 'read failed' }
  }

  // Already reminded this week (guards against repeat calls).
  const { data: sentRows } = await supabase
    .from('email_send_log')
    .select('recipient_email')
    .eq('template_name', TEMPLATE)
    .eq('status', 'sent')
    .gte('created_at', new Date(now.getTime() - 3 * 86400000).toISOString())
  const already = new Set((sentRows ?? []).map((r) => String(r.recipient_email).toLowerCase()))

  const people = new Map<string, string>()
  for (const r of rows ?? []) {
    const email = String(r.contact ?? '').trim().toLowerCase()
    if (isEmail(email) && !people.has(email)) people.set(email, String(r.name ?? ''))
  }

  const data = {
    runNumber: occ.runNumber,
    dateLabel: occurrenceDateLong(occ),
    timeLabel: occurrenceTime(occ),
    meetingPoint: occ.location.name,
    address: occ.location.address,
    mapsUrl: occ.location.mapsUrl,
    calendarUrl: occurrenceCalendarUrl(occ),
  }

  let sent = 0
  for (const [email, name] of people) {
    if (already.has(email)) continue
    // Each sign-up gets one reminder for the run they signed up for.
    const r = await sendInternalTransactionalEmail({
      templateName: TEMPLATE,
      recipientEmail: email,
      templateData: { ...data, name },
      idempotencyKey: `${TEMPLATE}-${occ.id}-${email}`,
    })
    if (r.ok) sent++
  }
  return { skipped: false, eventId: occ.id, signups: people.size, sent }
}
