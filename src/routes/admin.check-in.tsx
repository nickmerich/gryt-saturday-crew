import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin/allowlist";
import {
  OrganizerAttendance,
  type AttendanceTransport,
} from "@/components/site/OrganizerAttendance";

export const Route = createFileRoute("/admin/check-in")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Organizer attendance | GRYT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OrganizerPage,
});
const transport: AttendanceTransport = async (date, command) => {
  const { data } = await supabase.auth.getSession();
  if (!data.session)
    return Response.json(
      { error: "Your session ended. Sign in again before continuing." },
      { status: 403 },
    );
  return fetch(`/api/admin/checkins?date=${encodeURIComponent(date)}`, {
    method: command ? "POST" : "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      ...(command ? { "Content-Type": "application/json" } : {}),
    },
    body: command ? JSON.stringify(command) : undefined,
  });
};
function OrganizerPage() {
  const [access, setAccess] = useState<{ ready: boolean; id?: string }>({ ready: false });
  useEffect(() => {
    let alive = true;
    const update = (user: { id: string; email?: string; email_confirmed_at?: string } | null) => {
      if (alive)
        setAccess({
          ready: true,
          id: user?.email_confirmed_at && isAdminEmail(user.email) ? user.id : undefined,
        });
    };
    void supabase.auth
      .getUser()
      .then(({ data }) => update(data.user))
      .catch(() => update(null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      update(session?.user ?? null),
    );
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  if (!access.ready)
    return (
      <main className="gryt-organizer">
        <h1>Organizer attendance</h1>
        <p role="status">Checking private access...</p>
      </main>
    );
  if (!access.id)
    return (
      <main className="gryt-organizer">
        <p className="organizer-kicker">GRYT / Private organizer desk</p>
        <h1>Organizer sign-in required</h1>
        <p>
          Attendance and runner records are private. Use an approved organizer account, then return
          to this page.
        </p>
        <a href="/admin/roster">Sign in through the existing admin roster</a>
      </main>
    );
  return <OrganizerAttendance key={access.id} transport={transport} />;
}
