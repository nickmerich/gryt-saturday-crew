import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/admin/attendance")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        (await import("@/lib/attendance/admin.server")).attendanceAdmin(request),
      POST: async ({ request }) =>
        (await import("@/lib/attendance/admin.server")).attendanceAdmin(request),
    },
  },
});
