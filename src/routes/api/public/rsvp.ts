import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/rsvp")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        (await import("@/lib/attendance/capture.server")).captureRsvp(request),
    },
  },
});
