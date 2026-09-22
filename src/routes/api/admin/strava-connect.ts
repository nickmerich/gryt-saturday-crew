import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/admin/strava-connect')({
  server: {
    handlers: {
      GET: async ({ request }) =>
        (await import('@/lib/strava/connect.server')).stravaConnectConfig(request),
      POST: async ({ request }) =>
        (await import('@/lib/strava/connect.server')).stravaExchangeCode(request),
    },
  },
})
