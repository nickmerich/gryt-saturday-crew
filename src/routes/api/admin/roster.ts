import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/admin/roster')({
  server: {
    handlers: {
      GET: async ({ request }) => (await import('@/lib/roster/handlers.server')).adminRoster(request),
    },
  },
})
