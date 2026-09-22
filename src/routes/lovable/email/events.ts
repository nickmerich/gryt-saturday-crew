import { createClient } from '@supabase/supabase-js'
import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'

type Reason = 'bounce' | 'complaint' | 'unsubscribe'

function mapReasonToStatus(reason: Reason): 'bounced' | 'complained' | 'suppressed' {
  switch (reason) {
    case 'bounce':
      return 'bounced'
    case 'complaint':
      return 'complained'
    default:
      return 'suppressed'
  }
}

function mapReasonToMessage(reason: Reason): string {
  switch (reason) {
    case 'bounce':
      return 'Permanent bounce, email address is invalid or rejected'
    case 'complaint':
      return 'Spam complaint, recipient marked email as spam'
    case 'unsubscribe':
      return 'Recipient unsubscribed'
    default:
      return 'Email suppressed'
  }
}

async function recordOutcome(
  recipient: string,
  reason: Reason,
  messageId: string | null,
  eventId: string,
) {
  const supabaseUrl = process.env['SUPABASE_URL'] || import.meta.env['VITE_SUPABASE_URL']
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server configuration error')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const normalizedEmail = (recipient || '').toLowerCase()

  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert({ email: normalizedEmail, reason, metadata: null }, { onConflict: 'email' })

  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      code: suppressError.code,
      message: suppressError.message,
      event_id: eventId,
    })
    throw new Error('Failed to write suppression')
  }

  const { error: insertError } = await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'system',
    recipient_email: normalizedEmail,
    status: mapReasonToStatus(reason),
    error_message: mapReasonToMessage(reason),
    metadata: null,
  })

  if (insertError) {
    console.warn('Failed to insert email_send_log', {
      code: insertError.code,
      message: insertError.message,
      event_id: eventId,
    })
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': async (event) => {
              await recordOutcome(
                event.data.recipient,
                'bounce',
                event.data.message_id ?? null,
                event.event_id,
              )
            },
            'email.complaint': async (event) => {
              await recordOutcome(
                event.data.recipient,
                'complaint',
                event.data.message_id ?? null,
                event.event_id,
              )
            },
            'email.unsubscribed': async (event) => {
              await recordOutcome(
                event.data.recipient,
                'unsubscribe',
                event.data.message_id ?? null,
                event.event_id,
              )
            },
          },
        })
        return handler(request)
      },
    },
  },
})
