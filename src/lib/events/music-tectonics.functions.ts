import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { BADGES, CONSENT_VERSION, GROUPS, MT_EVENT, ROLES } from './music-tectonics'

const schema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255).transform(v => v.toLowerCase()),
  company: z.string().trim().max(160).optional().default(''),
  role: z.enum(ROLES).or(z.literal('')).optional().default(''),
  group_choice: z.enum(GROUPS),
  badge_status: z.enum(BADGES),
  share_consent: z.literal(true),
  marketing: z.boolean().default(false),
  website_check: z.literal('').default(''),
})

export const submitMtRsvp = createServerFn({ method: 'POST' })
  .inputValidator((i: unknown) => schema.parse(i))
  .handler(async ({ data }) => {
    if (MT_EVENT.STATUS === 'cancelled') throw new Error('This run was cancelled.')
    if (data.badge_status === 'guest' && !MT_EVENT.GUESTS_ALLOWED) throw new Error('A conference badge is required for this run.')
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const now = new Date().toISOString()
    const row = {
      event_slug: MT_EVENT.SLUG, email: data.email, full_name: data.full_name,
      company: data.company || null, role: data.role || null,
      group_choice: data.group_choice, badge_status: data.badge_status,
      share_consent: true, share_consent_at: now, share_consent_version: CONSENT_VERSION,
      marketing_opt_in: data.marketing, marketing_opt_in_at: data.marketing ? now : null,
      is_test: data.email.endsWith('@example.com'), updated_at: now,
    }
    const { data: existing } = await db.from('event_rsvps').select('id').eq('event_slug', MT_EVENT.SLUG).eq('email', data.email).maybeSingle()
    const { error } = await db.from('event_rsvps').upsert(row, { onConflict: 'event_slug,email' })
    if (error) throw new Error('Your RSVP was not saved. Please try again.')
    return { ok: true, updated: !!existing }
  })

export const listMtRsvps = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const v = await context.supabase.auth.getUser()
    if (!v.data.user?.email_confirmed_at || !isAdminEmail(v.data.user.email)) throw new Error('Admin access required.')
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const { data, error } = await db.from('event_rsvps')
      .select('full_name,email,company,role,group_choice,badge_status,share_consent,share_consent_at,share_consent_version,marketing_opt_in,created_at,updated_at')
      .eq('event_slug', MT_EVENT.SLUG).order('created_at', { ascending: false }).limit(2000)
    if (error) throw new Error('Could not load RSVPs.')
    return data
  })
