import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { isAdminEmail } from '@/lib/admin/allowlist'

const schema = z.object({
  email: z.string().trim().email().max(255).transform(v => v.toLowerCase()),
  website_check: z.literal('').default(''),
})

export const joinCapWaitlist = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const { error } = await db.from('cap_waitlist').insert({ email: data.email })
    // Duplicate email counts as success so the list never leaks who signed up.
    if (error && error.code !== '23505') throw new Error('Not saved. Please try again.')
    return { ok: true }
  })

export const listCapWaitlist = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const verified = await context.supabase.auth.getUser()
    if (!verified.data.user?.email_confirmed_at || !isAdminEmail(verified.data.user.email)) throw new Error('Admin access required.')
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const { data, error } = await db.from('cap_waitlist').select('email,created_at').order('created_at', { ascending: false }).limit(2000)
    if (error) throw new Error('Could not load the list.')
    return data
  })
