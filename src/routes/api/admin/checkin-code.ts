import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/admin/checkin-code')({
  server: {
    handlers: {
      GET: async ({ request }) =>
        (await import('@/lib/checkin/handlers.server')).checkinCode(request),
    },
  },
})
