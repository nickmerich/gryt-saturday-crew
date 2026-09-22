import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/admin/checkins")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        (await import("@/lib/attendance/checkin.server")).organizerCheckin(request),
      POST: async ({ request }) =>
        (await import("@/lib/attendance/checkin.server")).organizerCheckin(request),
    },
  },
});
