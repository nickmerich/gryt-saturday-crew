import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { reviewSchema, toPublicReviews, REVIEW_CONSENT_VERSION } from '@/lib/reviews'

export const submitReview = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const { error } = await db.from('runner_reviews').insert({
      first_name: data.first_name, email: data.email || null, rating: data.rating, body: data.body,
      consent_at: new Date().toISOString(), consent_version: REVIEW_CONSENT_VERSION,
    })
    if (error) {
      if (error.message.includes('review_daily_limit')) throw new Error('Thanks, we already have your review for today.')
      console.error('review insert failed', error.code)
      throw new Error('Not saved. Please try again.')
    }
    return { ok: true }
  })

export const listApprovedReviews = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const { data, error } = await db.from('runner_reviews').select('id,first_name,rating,body,created_at,status').eq('status', 'approved').order('created_at', { ascending: false }).limit(6)
    if (error) return []
    return toPublicReviews(data)
  } catch { return [] }
})

async function requireAdmin(context: { supabase: { auth: { getUser: () => Promise<{ data: { user: { email?: string; email_confirmed_at?: string } | null } }> } } }) {
  const v = await context.supabase.auth.getUser()
  if (!v.data.user?.email_confirmed_at || !isAdminEmail(v.data.user.email)) throw new Error('Admin access required.')
}

export const listAllReviews = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context as never)
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const { data, error } = await db.from('runner_reviews').select('id,first_name,email,rating,body,status,created_at').order('created_at', { ascending: false }).limit(500)
    if (error) throw new Error('Could not load reviews.')
    return data
  })

export const moderateReview = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), action: z.enum(['approve', 'hide', 'delete']) }).parse(i))
  .handler(async ({ context, data }) => {
    await requireAdmin(context as never)
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const q = data.action === 'delete'
      ? db.from('runner_reviews').delete().eq('id', data.id)
      : db.from('runner_reviews').update({ status: data.action === 'approve' ? 'approved' : 'hidden', reviewed_at: new Date().toISOString() }).eq('id', data.id)
    const { error } = await q
    if (error) throw new Error('Could not update.')
    return { ok: true }
  })
