import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { inquirySchema, triageSchema, stages, type InquiryRecord } from './schema'

const columns = 'id,kind,payload,stage,owner,next_action,due,notes,history,version,created_at,updated_at'
function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}
async function database(): Promise<SupabaseClient> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  return supabaseAdmin as unknown as SupabaseClient
}
async function readBody(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new Error('INVALID_BODY')
  const text = await request.text()
  if (text.length > 20000) throw new Error('INVALID_BODY')
  return JSON.parse(text)
}
async function admin(request: Request, db: SupabaseClient) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  const { data, error } = await db.auth.getUser(token)
  return !error && data.user?.email_confirmed_at && isAdminEmail(data.user.email) ? data.user.email! : null
}
export async function intakeStatus() {
  if (process.env.GRYT_INQUIRIES_ENABLED !== 'true') return json({ enabled: false })
  try {
    const db = await database()
    const { error } = await db.from('gryt_inquiries').select('id', { head: true }).limit(1)
    return json({ enabled: !error })
  } catch { return json({ enabled: false }) }
}
export async function submitInquiry(request: Request) {
  if (process.env.GRYT_INQUIRIES_ENABLED !== 'true') return json({ error: 'Inquiries are not open yet. Please check back.' }, 503)
  let input
  try { input = inquirySchema.safeParse(await readBody(request)) } catch { return json({ error: 'Invalid request.' }, 400) }
  if (!input.success) return json({ error: 'Please check the required fields and your email address.' }, 422)
  const { idempotency_key, website_check: _honeypot, ...payload } = input.data
  try {
    const db = await database()
    const { data, error } = await db.rpc('submit_gryt_inquiry', { p_key: idempotency_key, p_kind: payload.kind, p_payload: payload })
    if (error?.message.includes('INQUIRY_KEY_CONFLICT')) return json({ error: 'This request reference belongs to different details. Start a new inquiry.' }, 409)
    if (error?.message.includes('INQUIRY_RATE_LIMIT')) return json({ error: 'Too many inquiries for this contact. Please try again in an hour.' }, 429)
    if (error || !data) return json({ error: 'We could not save your inquiry. Please retry; repeats will not create duplicates.' }, 503)
    return json({ id: data })
  } catch { return json({ error: 'Intake is temporarily unavailable. Please try again later.' }, 503) }
}
export async function operatorQueue(request: Request) {
  if (!request.headers.get('authorization')?.match(/^Bearer .+$/))
    return json({ error: 'Sign in with an existing GRYT admin account.' }, 403)
  try {
    const db = await database()
    const actor = await admin(request, db)
    if (!actor) return json({ error: 'Sign in with an existing GRYT admin account.' }, 403)
    if (request.method === 'GET') {
      const rawPage = Number(new URL(request.url).searchParams.get('page') || 0)
      if (!Number.isInteger(rawPage) || rawPage < 0 || rawPage > 10000) return json({ error: 'Invalid page.' }, 400)
      const { data, error, count } = await db.from('gryt_inquiries').select(columns, { count: 'exact' })
        .order('created_at', { ascending: false }).order('id', { ascending: false }).range(rawPage * 100, rawPage * 100 + 99)
      if (error) return json({ error: 'Queue storage is unavailable. Confirm the inquiry migration is applied in Lovable Cloud.' }, 503)
      return json({ records: data, total: count, page: rawPage })
    }
    let input
    try { input = triageSchema.safeParse(await readBody(request)) } catch { return json({ error: 'Invalid request.' }, 400) }
    if (!input.success) return json({ error: 'Check the fields. A follow-up date requires a next action.' }, 422)
    const { id, version, note, ...fields } = input.data
    const { data, error } = await db.from('gryt_inquiries').select(columns).eq('id', id).single()
    if (error || !data) return json({ error: 'Inquiry not found.' }, 404)
    const current = data as InquiryRecord
    if (current.version !== version) return json({ error: 'Another operator changed this inquiry. Reload it before saving your changes.' }, 409)
    if (!stages[current.kind].includes(fields.stage)) return json({ error: 'Invalid status for this inquiry type.' }, 422)
    const at = new Date().toISOString()
    const changes = (Object.keys(fields) as (keyof typeof fields)[]).filter(k => (current[k] || '') !== fields[k])
      .map(k => ({ field: k, from: current[k] || '', to: fields[k] }))
    const history = [...current.history, ...(changes.length ? [{ at, actor, action: 'Triage updated', changes }] : []),
      ...(note ? [{ at, actor, action: 'Internal note added' }] : [])]
    const { data: saved, error: updateError } = await db.from('gryt_inquiries').update({
      ...fields, due: fields.due || null, version: version + 1, updated_at: at, history,
      notes: [...current.notes, ...(note ? [{ at, actor, text: note }] : [])],
    }).eq('id', id).eq('version', version).select(columns).maybeSingle()
    if (updateError) return json({ error: 'Update failed. Your changes have not been saved.' }, 503)
    if (!saved) return json({ error: 'Another operator changed this inquiry. Reload it before saving your changes.' }, 409)
    return json(saved)
  } catch { return json({ error: 'Queue unavailable. Check the Lovable Cloud configuration.' }, 503) }
}
