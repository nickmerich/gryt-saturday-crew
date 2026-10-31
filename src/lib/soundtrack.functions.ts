import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { identityKey } from '@/lib/checkin/identity'
import { getOccurrence, runNumberForDate } from '@/lib/run-schedule'
import { finishedRunDates } from '@/lib/streaks'
import { creditName, summarizeSoundtrack, type SongEntry, type SoundtrackSummary } from '@/lib/soundtrack'

const DATE_FROM_EVENT_ID = /^gryt-run-(\d{4}-\d{2}-\d{2})$/

export type SoundtrackRun = {
  eventDate: string
  runNumber: number
  songs: SongEntry[]
}

export type SoundtrackAdminPayload = {
  /** The run that RSVPs are being collected for right now. */
  upcomingDate: string
  runs: SoundtrackRun[]
  summary: SoundtrackSummary
}

/**
 * Organizer-only. Songs per run (to build the playlist), opt-in first names
 * (to credit in the run report), and the two numbers that say whether the
 * soundtrack is working: song share and return rate.
 */
export const getSoundtrackAdmin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SoundtrackAdminPayload> => {
    const verified = await context.supabase.auth.getUser()
    if (!verified.data.user?.email_confirmed_at || !isAdminEmail(verified.data.user.email)) {
      throw new Error('Admin access required.')
    }
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')

    const finished = finishedRunDates(26)
    const upcoming = getOccurrence()
    const dates = [upcoming.localDate, ...finished.filter((d) => d !== upcoming.localDate)]
    const eventIds = dates.map((d) => `gryt-run-${d}`)

    const { data: rsvpRows, error: rsvpError } = await db
      .from('rsvps')
      .select('name,contact,event_id,song,song_credit_ok,created_at')
      .in('event_id', eventIds)
      .order('created_at', { ascending: true })
      .limit(5000)
    if (rsvpError) throw new Error('Could not load RSVPs.')

    const { data: checkinRows, error: checkinError } = await db
      .from('run_checkins')
      .select('person_key,event_date')
      .eq('status', 'present')
      .in('event_date', finished)
      .limit(20000)
    if (checkinError) throw new Error('Could not load check-ins.')

    const songsByDate = new Map<string, SongEntry[]>()
    const seen = new Set<string>()
    const rsvps = []
    for (const r of rsvpRows ?? []) {
      const m = DATE_FROM_EVENT_ID.exec(String(r.event_id ?? ''))
      if (!m) continue
      const eventDate = m[1]!
      const personKey = identityKey(String(r.name ?? ''), String(r.contact ?? ''))
      const song = r.song ? String(r.song) : null
      rsvps.push({ personKey, eventDate, song })
      if (!song) continue
      // One song per person per run: keep their first.
      const k = `${personKey}|${eventDate}`
      if (seen.has(k)) continue
      seen.add(k)
      const list = songsByDate.get(eventDate) ?? []
      // Never ship more than a first name to the browser.
      list.push({ name: creditName(String(r.name ?? '')), song, creditOk: Boolean(r.song_credit_ok) })
      songsByDate.set(eventDate, list)
    }

    const summary = summarizeSoundtrack(
      rsvps,
      (checkinRows ?? []).map((c) => ({
        personKey: String(c.person_key),
        eventDate: String(c.event_date).slice(0, 10),
      })),
      finished,
    )

    return {
      upcomingDate: upcoming.localDate,
      runs: dates.map((eventDate) => ({
        eventDate,
        runNumber: runNumberForDate(eventDate),
        songs: songsByDate.get(eventDate) ?? [],
      })),
      summary,
    }
  })
