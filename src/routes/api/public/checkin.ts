import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/checkin')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        (await import('@/lib/checkin/handlers.server')).selfCheckin(request),
    },
  },
})
