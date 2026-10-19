import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { partnerSchema, partnerInquirySchema, partnerStatuses, publicDescription, type PublicPartner } from '@/lib/partners'
import { z } from 'zod'

export const getPartners = createServerFn({ method: 'GET' })
  .inputValidator((data: { home?: boolean }) => z.object({ home: z.boolean().default(false) }).parse(data))
  .handler(async ({ data }) => {
    const key = process.env['SUPABASE_PUBLISHABLE_KEY']!
    const db = createClient(process.env['SUPABASE_URL']!, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers)
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization')
      headers.set('apikey',key)
      return fetch(input, { ...init, headers })
    } } })
    const { data: rows, error } = await db.rpc('read_approved_partners', { home_only: data.home })
    if (error) throw new Error('Partners are temporarily unavailable.')
    const partners = (rows || []) as PublicPartner[]
    // Workspace policy disallows public buckets. Sign only logos from approved rows.
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    return Promise.all(partners.map(async row => {
      const result = row.logo ? await supabaseAdmin.storage.from('partner-logos').createSignedUrl(row.logo, 3600) : null
      return { ...row, description: publicDescription(row.description), logo: result?.data?.signedUrl || '' }
    }))
  })

export const managePartners = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.discriminatedUnion('action', [
    z.object({ action: z.literal('list') }),
    z.object({ action: z.literal('save'), partner: partnerSchema }),
    z.object({ action: z.literal('delete'), id: z.uuid() }),
    z.object({ action: z.literal('status'), id: z.uuid(), status: z.enum(partnerStatuses) }),
    z.object({ action: z.literal('upload'), png: z.string().max(2800000) }),
  ]).parse(input))
  .handler(async ({ data, context }) => {
    const verified = await context.supabase.auth.getUser()
    if (!verified.data.user?.email_confirmed_at || !isAdminEmail(verified.data.user.email)) throw new Error('Admin access required.')
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    if (data.action === 'list') {
      const partners = await db.from('site_partners').select('*').order('sort_order')
      const inquiries = await db.from('partner_inquiries').select('id,created_at,organization,name,email,involvement,city,message,status').order('created_at', { ascending: false }).limit(1000)
      if (partners.error || inquiries.error) throw new Error('Could not load the partner desk.')
      return { partners: partners.data, inquiries: inquiries.data, logo: '' }
    }
    if (data.action === 'upload') {
      const bytes = Uint8Array.from(atob(data.png), c => c.charCodeAt(0))
      if (bytes.length > 2097152 || ![137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) throw new Error('Upload a PNG logo under 2 MB.')
      const path = `${crypto.randomUUID()}.png`
      const result = await db.storage.from('partner-logos').upload(path, bytes, { contentType: 'image/png', upsert: false })
      if (result.error) throw new Error('Logo upload failed.')
      return { partners: [], inquiries: [], logo: path }
    }
    let error
    if (data.action === 'save') {
      const { id, ...fields } = data.partner
      const result = id ? await db.from('site_partners').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id) : await db.from('site_partners').insert(fields)
      error = result.error
    } else if (data.action === 'delete') error = (await db.from('site_partners').delete().eq('id',data.id)).error
    else error = (await db.from('partner_inquiries').update({ status: data.status }).eq('id',data.id)).error
    if (error) throw new Error('Not saved. Check that the slug is unique and try again.')
    return { partners: [], inquiries: [], logo: '' }
  })

export const sendPartnerInquiry = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => partnerInquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { website_check: _honeypot, ...fields } = data
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server')
    const result = await db.from('partner_inquiries').insert({ ...fields, source: 'partners', status: 'new' })
    if (result.error?.message.includes('PARTNER_DAILY_LIMIT')) throw new Error('We already received a message from this email today. Please try again tomorrow.')
    if (result.error) throw new Error('Your message was not saved. Please try again.')
    return { ok: true }
  })