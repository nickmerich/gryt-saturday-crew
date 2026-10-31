import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/soundtrack")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        (await import("@/lib/checkin/handlers.server")).soundtrackList(request),
    },
  },
});
