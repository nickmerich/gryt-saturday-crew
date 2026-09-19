import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api/public/inquiries')({
  server: { handlers: {
    GET: async () => (await import('@/lib/inquiries/handlers.server')).intakeStatus(),
    POST: async ({ request }) => (await import('@/lib/inquiries/handlers.server')).submitInquiry(request),
  } },
})
