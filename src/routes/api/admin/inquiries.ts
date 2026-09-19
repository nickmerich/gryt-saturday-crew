import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/admin/inquiries')({
  server: { handlers: {
    GET: async ({ request }) => (await import('@/lib/inquiries/handlers.server')).operatorQueue(request),
    PATCH: async ({ request }) => (await import('@/lib/inquiries/handlers.server')).operatorQueue(request),
  } },
})
