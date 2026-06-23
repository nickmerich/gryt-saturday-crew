import * as React from 'react'
import { render as renderAsync } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'gryt-saturday-crew'
const SENDER_DOMAIN = 'notify.gryt.club'
const FROM_DOMAIN = 'notify.gryt.club'

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const RsvpSchema = z.object({
  name: z.string().trim().min(1).max(80),
  contact: z.string().trim().min(3).max(200),
  source: z.string().trim().max(40).optional().nullable(),
  eventLabel: z.string().trim().max(120).optional().nullable(),
})

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function redactEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '***'
  return `${localPart[0]}***@${domain}`
}

async function enqueueTemplate(
  supabase: ReturnType<typeof createClient>,
  templateName: string,
  recipientEmail: string,
  templateData: Record<string, any>,
  idempotencyKey: string,
) {
  const entry = TEMPLATES[templateName]
  if (!entry) throw new Error(`Template not found: ${templateName}`)

  const effectiveRecipient = entry.to || recipientEmail
  if (!effectiveRecipient) throw new Error('No recipient resolved')

  const messageId = crypto.randomUUID()
  const normalizedEmail = effectiveRecipient.toLowerCase()

  // suppression check
  const { data: suppressed } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (suppressed) {
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
    })
    return { skipped: true, reason: 'suppressed' as const }
  }

  // unsubscribe token (one per address)
  let unsubscribeToken: string
  const { data: existingToken } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token as string
  } else if (!existingToken) {
    unsubscribeToken = generateToken()
    await supabase
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true },
      )
    const { data: storedToken } = await supabase
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()
    if (storedToken?.token) unsubscribeToken = storedToken.token as string
  } else {
    return { skipped: true, reason: 'suppressed' as const }
  }

  const element = React.createElement(entry.component, templateData)
  const html = await renderAsync(element)
  const text = await renderAsync(element, { plainText: true })
  const subject =
    typeof entry.subject === 'function' ? entry.subject(templateData) : entry.subject

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    throw enqueueError
  }

  return { skipped: false }
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

        const { name, contact, source, eventLabel } = parsed.data
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
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
            user_agent: userAgent,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('Failed to insert RSVP', { error: insertError })
          return Response.json({ error: 'Failed to save RSVP' }, { status: 500 })
        }

        const rsvpId = inserted.id as string
        const resolvedEventLabel =
          eventLabel?.trim() || 'GRYT Run #11 · Sat, Jun 27 · 7 AM'

        // 2. Owner notification (always)
        try {
          await enqueueTemplate(
            supabase,
            'rsvp-notification',
            '', // fixed `to:` in template
            {
              name,
              contact,
              source: source || 'Not provided',
              eventLabel: resolvedEventLabel,
              submittedAt,
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
            const calHref =
              'https://calendar.google.com/calendar/render?action=TEMPLATE' +
              '&text=' +
              encodeURIComponent('GRYT Run #11') +
              '&dates=20260627T110000Z/20260627T120000Z' +
              '&details=' +
              encodeURIComponent(
                'GRYT Run Club — Saturday 7 AM. Walk, jog, or run the Montour/Peters Trail. No one gets dropped. https://www.strava.com/clubs/1708552',
              ) +
              '&location=' +
              encodeURIComponent('212 Valley Brook Road, McMurray, PA')

            await enqueueTemplate(
              supabase,
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

        return Response.json({ success: true, confirmationSent: contactIsEmail })
      },
    },
  },
})
