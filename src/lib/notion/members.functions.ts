// Client-callable server functions for the canonical Members store (Notion).
import { createServerFn, createMiddleware } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { isAdminEmail } from '@/lib/admin/allowlist'

const requireAdmin = createMiddleware({ type: 'function' })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const email = (context as any)?.claims?.email as string | undefined
    if (!isAdminEmail(email)) {
      throw new Error('Forbidden: admin allowlist only')
    }
    return next({ context: { adminEmail: email! } })
  })

export const listMembers = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(async () => {
    const { listMembersServer } = await import('./members.server')
    return listMembersServer()
  })

export const getMemberByKey = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .inputValidator((data: { key: string }) => {
    if (!data?.key || typeof data.key !== 'string') throw new Error('key required')
    return data
  })
  .handler(async ({ data }) => {
    const { getMemberByKeyServer } = await import('./members.server')
    return getMemberByKeyServer(data.key)
  })

export const getMemberSyncStatus = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .inputValidator((data: { memberId: string }) => {
    if (!data?.memberId) throw new Error('memberId required')
    return data
  })
  .handler(async ({ data }) => {
    const { getMemberSyncStatusServer } = await import('./members.server')
    return getMemberSyncStatusServer(data.memberId)
  })

export const listMembersForAdmin = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(async () => {
    const { listMembersServer } = await import('./members.server')
    return listMembersServer()
  })
