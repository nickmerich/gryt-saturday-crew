import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/admin/checkin')({
  server: {
    handlers: {
      GET: async ({ request }) => (await import('@/lib/checkin/handlers.server')).checkinList(request),
      POST: async ({ request }) => (await import('@/lib/checkin/handlers.server')).checkinMutate(request),
    },
  },
})
