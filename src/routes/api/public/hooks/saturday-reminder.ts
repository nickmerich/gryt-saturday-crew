import { createFileRoute } from '@tanstack/react-router'

// Called weekly by the scheduler on Friday afternoon. Safe to call by anyone:
// it only acts on Fridays (New York time), only emails people who signed up
// for tomorrow's run, and never emails the same person twice for one run.
export const Route = createFileRoute('/api/public/hooks/saturday-reminder')({
  server: {
    handlers: {
      POST: async () => {
        const { runSaturdayReminders } = await import('@/lib/saturday-reminder.server')
        const result = await runSaturdayReminders()
        return Response.json(result)
      },
    },
  },
})
