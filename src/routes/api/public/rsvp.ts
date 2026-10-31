import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { sendInternalTransactionalEmail } from '@/lib/email/send-internal.server'
import {
  nextSaturdayLabel,
  occurrenceCalendarUrl,
  validateEventRef,
} from '@/lib/run-schedule'
import { normalizeSong, SONG_MAX } from '@/lib/soundtrack'

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const RsvpSchema = z.object({
  name: z.string().trim().min(1).max(80),
  contact: z.string().trim().min(3).max(200),
  source: z.string().trim().max(40).optional().nullable(),
  // Legacy display label. Recorded, never trusted as the event identity.
  eventLabel: z.string().trim().max(120).optional().nullable(),
  eventId: z.string().trim().max(60).optional().nullable(),
  eventVersion: z.coerce.number().int().min(1).max(999).optional().nullable(),
  heroVariant: z.enum(['a', 'b']).optional().nullable(),
  partySize: z.coerce.number().int().min(1).max(10).optional().default(1),
  firstTimer: z.boolean().optional().default(false),
  // Saturday Soundtrack: optional song, plus explicit opt-in to be credited.
  song: z.string().max(SONG_MAX * 2).optional().nullable(),
  songCreditOk: z.boolean().optional().default(false),
})


function redactEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '***'
  return `${localPart[0]}***@${domain}`
}

async function sendTemplate(
  templateName: string,
  recipientEmail: string,
  templateData: Record<string, any>,
  idempotencyKey: string,
) {
  return sendInternalTransactionalEmail({
    templateName,
    recipientEmail,
    templateData,
    idempotencyKey,
  })
}

export const Route = createFileRoute('/api/public/rsvp')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'Invalid JSON' }, { status: 400 })
        }

        const parsed = RsvpSchema.safeParse(body)
        if (!parsed.success) {
          return Response.json(
            { error: 'Invalid submission', issues: parsed.error.flatten() },
            { status: 400 },
          )
        }

        const {
          name,
          contact,
          source,
          eventLabel,
          eventId,
          eventVersion,
          heroVariant,
          partySize,
          firstTimer,
        } = parsed.data
        const song = normalizeSong(parsed.data.song)
        // A credit only means something when there is a song to credit.
        const songCreditOk = Boolean(song) && parsed.data.songCreditOk === true

        // Validate the canonical occurrence server-side. A stale tab that still
        // holds a cancelled or superseded run must not silently sign someone up.
        const eventCheck = validateEventRef(eventId, eventVersion)
        if (!eventCheck.ok) {
          return Response.json(
            {
              error:
                eventCheck.reason === 'cancelled'
                  ? 'That run was cancelled. Refresh the page for the next one.'
                  : 'The run details changed. Refresh the page and sign up again.',
              reason: eventCheck.reason,
              currentEventId: eventCheck.occurrence.id,
            },
            { status: 409 },
          )
        }
        const occurrence = eventCheck.occurrence

        const supabase: SupabaseClient<any, 'public', any> = createClient(supabaseUrl, supabaseServiceKey)
        const userAgent = request.headers.get('user-agent')?.slice(0, 300) ?? null
        const submittedAt = new Date().toISOString()


        // 1. Persist the RSVP
        const { data: inserted, error: insertError } = await supabase
          .from('rsvps')
          .insert({
            name,
            contact,
            source: source ?? null,
            event_label: eventLabel ?? null,
            event_id: occurrence.id,
            hero_variant: heroVariant ?? null,
            party_size: partySize,
            first_timer: firstTimer,
            song,
            song_credit_ok: songCreditOk,
            user_agent: userAgent,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('Failed to insert RSVP', { error: insertError })
          return Response.json({ error: 'Failed to save RSVP' }, { status: 500 })
        }

        const rsvpId = inserted.id as string
        const resolvedEventLabel = eventId
          ? `GRYT Run #${occurrence.runNumber} · Sat, ${new Date(occurrence.startUtc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: occurrence.timeZone })} · 7 AM`
          : eventLabel?.trim() || nextSaturdayLabel()


        // 2. Owner notification (always)
        try {
          await sendTemplate(
            'rsvp-notification',
            '', // fixed `to:` in template
            {
              name,
              contact,
              source: source || 'Not provided',
              eventLabel: resolvedEventLabel,
              submittedAt,
              partySize,
              firstTimer,
              song: song ?? undefined,
            },
            `rsvp-notify-${rsvpId}`,
          )
        } catch (err) {
          console.error('Notification email failed', { error: err })
        }

        // 3. Confirmation to RSVPer (only if contact looks like an email)
        const contactIsEmail = isEmail(contact.trim())
        if (contactIsEmail) {
          try {
            const calHref = occurrenceCalendarUrl(occurrence)

            await sendTemplate(
              'rsvp-confirmation',
              contact.trim(),
              {
                name,
                eventLabel: resolvedEventLabel,
                calendarUrl: calHref,
                stravaUrl: 'https://www.strava.com/clubs/1708552',
              },
              `rsvp-confirm-${rsvpId}`,
            )
          } catch (err) {
            console.error('Confirmation email failed', {
              error: err,
              recipient_redacted: redactEmail(contact),
            })
          }
        }

        // 4. Notion sync — best-effort, log on failure
        try {
          const { syncRsvpToNotion } = await import('@/lib/notion/sync.server')
          const { memberPageId, attendancePageId } = await syncRsvpToNotion({
            name,
            contact,
            source: source ?? null,
            eventLabel: resolvedEventLabel,
            submittedAt,
          })
          await supabase
            .from('rsvps')
            .update({
              notion_synced: true,
              notion_member_page_id: memberPageId,
              notion_attendance_page_id: attendancePageId,
              notion_synced_at: new Date().toISOString(),
              notion_last_error: null,
            })
            .eq('id', rsvpId)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error('Notion sync failed', { rsvpId, error: msg })
          await supabase
            .from('rsvps')
            .update({ notion_last_error: msg.slice(0, 1000) })
            .eq('id', rsvpId)
        }

        // 5. Store the completed submission server-side, keyed by an opaque
        //    httpOnly cookie token. No personal data in the URL.
        const headers = new Headers()
        try {
          const { readSignupToken, recordSignupSession, signupCookie } = await import(
            '@/lib/signup-session.server'
          )
          const token = await recordSignupSession(
            readSignupToken(request.headers.get('cookie')),
            {
              rsvp_id: rsvpId,
              name,
              contact,
              event_label: resolvedEventLabel,
            },
          )
          if (token) headers.set('set-cookie', signupCookie(token))
        } catch (err) {
          console.error('Signup session store failed', { rsvpId, error: err })
        }

        return Response.json({ success: true, confirmationSent: contactIsEmail }, { headers })

      },
    },
  },
})
