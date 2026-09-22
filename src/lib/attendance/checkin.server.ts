import { createHash } from "node:crypto";
import { isAdminEmail } from "../admin/allowlist";
import { sameRunVersion, type RunOccurrence } from "../run-occurrence";
import { attendanceDatabase, privateJson, smallJson } from "./capture.server";
import { checkinCommand, checkinEvent, contactHint, type CheckinBoard } from "./checkin";

const conflicts: Record<string, string> = {
  CHECKIN_REVISION: "Another organizer changed this run. Refresh before making a new change.",
  CHECKIN_EVENT_CHANGED:
    "Run details changed after attendance started. An organizer must reconcile the saved session before continuing.",
  CHECKIN_CLOSED:
    "This attendance session is closed. Reopen it with a reason before making corrections.",
  CHECKIN_DUPLICATE:
    "This name or record is already listed. Check the roster before adding a different person with the same name.",
  CHECKIN_NOT_OPEN:
    "Check-in opens one hour before a confirmed run. Cancelled and unconfirmed runs cannot be checked in.",
  CHECKIN_NOT_ENDED: "Wait until the scheduled run has ended before closing attendance.",
  CHECKIN_KEY_CONFLICT:
    "This retry does not match the original change. Refresh and review the roster.",
  CHECKIN_PERSON: "This runner is not on the selected run. Refresh the roster.",
};
type RawBoard = {
  session: { event_snapshot: RunOccurrence; revision: number; closed: boolean } | null;
  rsvps: Array<{ id: string; name: string; contact: string; event_snapshot: RunOccurrence | null }>;
  entries: Array<{
    participant_id: string;
    rsvp_id: string | null;
    name: string;
    present: boolean;
    recorded_at: string;
  }>;
  audit: Array<{
    id: number;
    action: string;
    participant_id: string | null;
    present: boolean | null;
    reason: string | null;
    actor_email: string;
    created_at: string;
  }>;
};
export async function organizerCheckin(request: Request, database = attendanceDatabase) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return privateJson({ error: "Organizer sign-in required." }, 403);
  try {
    const db = await database();
    const { data: auth, error: authError } = await db.auth.getUser(token);
    const user = auth.user;
    if (authError || !user?.email_confirmed_at || !isAdminEmail(user.email))
      return privateJson({ error: "Organizer access required." }, 403);
    if (request.method === "GET") {
      let event;
      try {
        event = checkinEvent(new URL(request.url).searchParams.get("date") ?? "");
      } catch {
        return privateJson({ error: "Choose a valid Saturday in 2026 or later." }, 422);
      }
      const { data: rawData, error } = await db.rpc("read_gryt_checkin", { p_event_id: event.id });
      if (error || !rawData)
        return privateJson(
          {
            error:
              "Attendance storage is unavailable. Apply and verify the reviewed migrations in staging first.",
          },
          503,
        );
      const data = rawData as RawBoard;
      const entries = new Map(data.entries.map((e) => [e.participant_id, e]));
      const people: CheckinBoard["people"] = data.rsvps.map((r) => ({
        id: r.id,
        name: r.name,
        contactHint: contactHint(r.contact),
        source: "rsvp",
        present: entries.get(r.id)?.present ?? false,
        recordedAt: entries.get(r.id)?.recorded_at ?? null,
        invitationChanged: !sameRunVersion(r.event_snapshot, event),
      }));
      for (const entry of data.entries)
        if (!entry.rsvp_id)
          people.push({
            id: entry.participant_id,
            name: entry.name,
            contactHint: "No contact collected",
            source: "walkin",
            present: entry.present,
            recordedAt: entry.recorded_at,
            invitationChanged: false,
          });
      const board: CheckinBoard = {
        event,
        revision: data.session?.revision ?? 0,
        closed: data.session?.closed ?? false,
        snapshotChanged: !!data.session && !sameRunVersion(data.session.event_snapshot, event),
        writable:
          ["scheduled", "modified", "completed"].includes(event.status) &&
          Date.parse(event.startsAt) <= Date.now() + 3600000,
        people: people.sort((a, b) => a.name.localeCompare(b.name)),
        audit: data.audit.slice(0, 50).map((a) => ({
          id: a.id,
          action: a.action,
          participantId: a.participant_id,
          present: a.present,
          reason: a.reason,
          actor: a.actor_email,
          at: a.created_at,
        })),
        auditHasMore: data.audit.length > 50,
      };
      return privateJson(board);
    }
    if (request.method !== "POST") return privateJson({ error: "Method not allowed." }, 405);
    let input;
    try {
      input = checkinCommand.parse(await smallJson(request));
    } catch {
      return privateJson(
        { error: "Check the date, runner and required correction or review reason." },
        422,
      );
    }
    const event = checkinEvent(input.date);
    const hash = createHash("sha256")
      .update(JSON.stringify({ ...input, actor: user.id, event }))
      .digest("hex");
    const { data, error } = await db.rpc("write_gryt_checkin", {
      p_request: input.requestId,
      p_hash: hash,
      p_actor: user.id,
      p_email: user.email,
      p_event: event,
      p_expected: input.expectedRevision,
      p_action: input.action,
      p_participant: input.participantId ?? null,
      p_present: input.present ?? null,
      p_name: input.name ?? null,
      p_reason: input.reason ?? null,
      p_duplicate_reviewed: input.duplicateReviewed ?? false,
    });
    if (error) {
      const code = Object.keys(conflicts).find((k) => error.message.includes(k));
      if (code) return privateJson({ error: conflicts[code], code }, 409);
      return privateJson(
        { error: "Save could not be confirmed. Retry the same change or refresh to reconcile it." },
        503,
      );
    }
    if (!data?.success)
      return privateJson({ error: "Save could not be confirmed. Refresh before proceeding." }, 503);
    return privateJson(data);
  } catch {
    return privateJson({ error: "Attendance is unavailable. No save is assumed." }, 503);
  }
}
