// Single source of truth for the GRYT x Music Tectonics run. Edit values here only.
export const MT_EVENT = {
  SLUG: 'music-tectonics-2026',
  EVENT_NAME: 'GRYT Morning Run + Walk by the Beach',
  PARTNER: 'Music Tectonics Conference',
  DATE: 'Thursday, October 29, 2026',
  ISO_DATE: '2026-10-29',
  TIMEZONE: 'America/Los_Angeles',
  MEET_TIME: '9:00 AM',
  START_TIME: '9:15 AM',
  FINISH_TIME: '10:15 AM',
  WRAP_TIME: '10:45 AM',
  VENUE_DEADLINE: 'Annenberg Beach House by 12:45 PM',
  MEET_SPOT: 'Beach path, north side of the Santa Monica Pier. Look for the GRYT flag.',
  LOCATION: 'Santa Monica Pier, Santa Monica, CA',
  MAP_URL: 'https://www.google.com/maps/search/?api=1&query=Santa+Monica+Pier',
  ROUTE: 'North on the beach path to the Annenberg Beach House and back. About 3 miles round trip, flat and paved.',
  RUN_LEAD: 'Nick Merich',
  WALK_LEADS: ['C.Y. Lee'],
  GUESTS_ALLOWED: true, // outside guests without a badge; pending Music Tectonics approval
  BADGE_URL: 'https://www.musictectonics.com/',
  COUPON_CODE: 'GRYT',
  COUPON_VALUE: '$50 off',
  PRICE_LINE: '',
  STATUS: 'proposed' as 'proposed' | 'confirmed' | 'changed' | 'cancelled',
  CONFIRMATION_EMAIL_ENABLED: false, // no confirmation email template wired; keep off
}
export type MtEvent = typeof MT_EVENT

export const CONSENT_VERSION = 'mt-share-2026-v1'
export const CONSENT_TEXT = 'I understand my name, email and company will be shared with Music Tectonics, the conference organizer.'
export const ROLES = ['Artist', 'Founder', 'Label or music business', 'Developer or product', 'Investor', 'Other'] as const
export const GROUPS = ['run', 'walk', 'unsure'] as const
export const BADGES = ['have', 'getting', 'guest'] as const

/** "9:00 AM" -> { h: 9, m: 0 } (24h) */
export function parseTime(t: string) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim())
  if (!m) throw new Error(`Bad time: ${t}`)
  let h = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return { h, m: Number(m[2]) }
}

// Pacific offset for a wall-clock time on a given date (handles PDT/PST).
function toUtc(isoDate: string, time: string, tz: string) {
  const { h, m } = parseTime(time)
  const guess = Date.UTC(+isoDate.slice(0, 4), +isoDate.slice(5, 7) - 1, +isoDate.slice(8, 10), h, m)
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(guess))
  const g = (t: string) => Number(parts.find(p => p.type === t)!.value)
  const asTz = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'))
  return new Date(guess + (guess - asTz))
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function buildIcs(e: MtEvent = MT_EVENT) {
  const start = toUtc(e.ISO_DATE, e.MEET_TIME, e.TIMEZONE)
  const end = toUtc(e.ISO_DATE, e.WRAP_TIME, e.TIMEZONE)
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1')
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GRYT Run Club//Music Tectonics//EN', 'BEGIN:VEVENT',
    `UID:${e.SLUG}@grytrunclub.com`, `DTSTAMP:${stamp(start)}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.EVENT_NAME)}`, `LOCATION:${esc(e.LOCATION)}`,
    `DESCRIPTION:${esc(`${e.MEET_SPOT} ${e.ROUTE} Be at the ${e.VENUE_DEADLINE}.`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}
export const icsStartUtc = (e: MtEvent = MT_EVENT) => toUtc(e.ISO_DATE, e.MEET_TIME, e.TIMEZONE)
