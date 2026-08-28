import { createClient } from '@supabase/supabase-js'
import { EmailAPIError } from '@lovable.dev/email-js'
import { sendTemplateEmail } from '@/lib/email-templates/send-email'
import { TEMPLATES } from '@/lib/email-templates/registry'

/** Append-only audit row. Never decides the send result. */
async function logSend(entry: {
  templateName: string
  recipientEmail: string
  status: 'sent' | 'suppressed' | 'failed'
  errorMessage?: string
}): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { error } = await supabase.from('email_send_log').insert({
    message_id: null,
    template_name: entry.templateName,
    recipient_email: entry.recipientEmail,
    status: entry.status,
    error_message: entry.errorMessage ?? null,
  })
  if (error) {
    console.error('email_send_log insert failed', { code: error.code, message: error.message })
  }
}

/**
 * Server-only: render a registered template and send it through Lovable's
 * managed email API. Use this from public/unauthenticated server functions
 * (contact forms, recommendations, RSVP, etc.).
 */
export async function sendInternalTransactionalEmail(opts: {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, any>
  idempotencyKey?: string
}): Promise<{ ok: boolean; reason?: string }> {
  const template = TEMPLATES[opts.templateName]
  if (!template) {
    console.error('sendInternalTransactionalEmail: template not found', opts.templateName)
    return { ok: false, reason: 'template_not_found' }
  }

  const recipient = (template.to || opts.recipientEmail || '').toLowerCase()
  if (!recipient) {
    console.error('sendInternalTransactionalEmail: no recipient resolved')
    return { ok: false, reason: 'no_recipient' }
  }

  try {
    const result = await sendTemplateEmail(opts.templateName, recipient, {
      templateData: opts.templateData ?? {},
      ...(opts.idempotencyKey ? { idempotencyKey: opts.idempotencyKey } : {}),
    })

    if (!result.sent) {
      await logSend({
        templateName: opts.templateName,
        recipientEmail: recipient,
        status: 'suppressed',
      })
      return { ok: false, reason: 'suppressed' }
    }

    await logSend({
      templateName: opts.templateName,
      recipientEmail: recipient,
      status: 'sent',
    })
    return { ok: true }
  } catch (error) {
    const message =
      error instanceof EmailAPIError
        ? `${error.code}: ${error.message}`
        : error instanceof Error
          ? error.message
          : String(error)
    console.error('sendInternalTransactionalEmail send failed', { message })
    await logSend({
      templateName: opts.templateName,
      recipientEmail: recipient,
      status: 'failed',
      errorMessage: message.slice(0, 500),
    })
    return { ok: false, reason: 'send_failed' }
  }
}
