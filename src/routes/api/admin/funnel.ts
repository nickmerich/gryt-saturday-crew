// Admin-only funnel health + backfill endpoint.
//
// GET  /api/admin/funnel            → health report (env presence, sync status, last errors)
// POST /api/admin/funnel?action=backfill → sync all unsynced rsvps + waivers to Notion
//
// Auth: send header  x-admin-token: <FUNNEL_ADMIN_TOKEN env var>
// Returns 503 if FUNNEL_ADMIN_TOKEN is not configured.

import { createFileRoute } from '@tanstack/react-router'

function authorized(request: Request): Response | null {
  const expected = process.env.FUNNEL_ADMIN_TOKEN
  if (!expected) {
    return Response.json(
      { error: 'FUNNEL_ADMIN_TOKEN is not configured' },
      { status: 503 },
    )
  }
  const got = request.headers.get('x-admin-token')
  if (got !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

async function getAdmin() {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  return supabaseAdmin
}

export const Route = createFileRoute('/api/admin/funnel')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = authorized(request)
        if (denied) return denied
        const supabase = await getAdmin()

        const env = {
          LOVABLE_API_KEY: Boolean(process.env.LOVABLE_API_KEY),
          NOTION_API_KEY: Boolean(process.env.NOTION_API_KEY),
          BEEHIIV_API_KEY: Boolean(process.env.BEEHIIV_API_KEY),
        }

        const { count: rsvpTotal } = await supabase
          .from('rsvps')
          .select('*', { count: 'exact', head: true })
        const { count: rsvpSynced } = await supabase
          .from('rsvps')
          .select('*', { count: 'exact', head: true })
          .eq('notion_synced', true)
        const { data: rsvpErrors } = await supabase
          .from('rsvps')
          .select('id, name, created_at, notion_last_error')
          .not('notion_last_error', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10)

        const { count: waiverTotal } = await supabase
          .from('waiver_signatures')
          .select('*', { count: 'exact', head: true })
        let waiverSynced: number | null = null
        let waiverErrors: any[] | null = null
        try {
          const synced = await supabase
            .from('waiver_signatures')
            .select('*', { count: 'exact', head: true })
            .eq('notion_synced', true)
          waiverSynced = synced.count
          const errs = await supabase
            .from('waiver_signatures')
            .select('id, full_name, created_at, notion_last_error')
            .not('notion_last_error', 'is', null)
            .order('created_at', { ascending: false })
            .limit(10)
          waiverErrors = errs.data
        } catch {
          // columns not migrated yet
        }

        return Response.json({
          env,
          rsvps: {
            total: rsvpTotal ?? 0,
            notion_synced: rsvpSynced ?? 0,
            recent_errors: rsvpErrors ?? [],
          },
          waivers: {
            total: waiverTotal ?? 0,
            notion_synced: waiverSynced,
            recent_errors: waiverErrors ?? [],
          },
        })
      },

      POST: async ({ request }) => {
        const denied = authorized(request)
        if (denied) return denied
        const url = new URL(request.url)
        if (url.searchParams.get('action') !== 'backfill') {
          return Response.json({ error: 'Unknown action' }, { status: 400 })
        }
        const supabase = await getAdmin()
        const results = { rsvps: { ok: 0, fail: 0 }, waivers: { ok: 0, fail: 0 } }
        const errors: string[] = []

        // 1. Waivers first — they carry email + phone (strongest data).
        try {
          const { syncWaiverToNotion } = await import('@/lib/notion/waiver-sync.server')
          const { data: waivers } = await supabase
            .from('waiver_signatures')
            .select('id, full_name, email, phone, signed_on, notion_synced')
            .order('created_at', { ascending: true })
            .limit(500)
          for (const w of waivers ?? []) {
            if ((w as any).notion_synced === true) continue
            try {
              const res = await syncWaiverToNotion({
                full_name: w.full_name,
                email: w.email,
                phone: w.phone,
                signed_on: w.signed_on,
              })
              results.waivers.ok++
              await supabase
                .from('waiver_signatures')
                .update({
                  notion_synced: true,
                  notion_member_page_id: res.memberPageId,
                  notion_synced_at: new Date().toISOString(),
                  notion_last_error: null,
                })
                .eq('id', w.id)
            } catch (err) {
              results.waivers.fail++
              const msg = err instanceof Error ? err.message : String(err)
              errors.push(`waiver ${w.id}: ${msg.slice(0, 200)}`)
              await supabase
                .from('waiver_signatures')
                .update({ notion_last_error: msg.slice(0, 1000) })
                .eq('id', w.id)
            }
          }
        } catch (err) {
          errors.push(
            `waiver backfill unavailable: ${err instanceof Error ? err.message : String(err)}`,
          )
        }

        // 2. RSVPs — attendance + member creation.
        const { syncRsvpToNotion } = await import('@/lib/notion/sync.server')
        const { data: rsvps } = await supabase
          .from('rsvps')
          .select('id, name, contact, source, event_label, created_at, notion_synced')
          .order('created_at', { ascending: true })
          .limit(500)
        for (const r of rsvps ?? []) {
          if ((r as any).notion_synced === true) continue
          try {
            const res = await syncRsvpToNotion({
              name: r.name,
              contact: r.contact,
              source: r.source,
              eventLabel: r.event_label ?? '',
              submittedAt: r.created_at,
            })
            results.rsvps.ok++
            await supabase
              .from('rsvps')
              .update({
                notion_synced: true,
                notion_member_page_id: res.memberPageId,
                notion_attendance_page_id: res.attendancePageId,
                notion_synced_at: new Date().toISOString(),
                notion_last_error: null,
              })
              .eq('id', r.id)
          } catch (err) {
            results.rsvps.fail++
            const msg = err instanceof Error ? err.message : String(err)
            errors.push(`rsvp ${r.id}: ${msg.slice(0, 200)}`)
            await supabase
              .from('rsvps')
              .update({ notion_last_error: msg.slice(0, 1000) })
              .eq('id', r.id)
          }
        }

        return Response.json({ results, errors })
      },
    },
  },
})
