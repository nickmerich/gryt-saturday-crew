import { z } from "zod";
import { runOnDate, validLocalDate, type RunOccurrence } from "../run-occurrence";

export const checkinDate = z
  .string()
  .refine(
    (value) =>
      validLocalDate(value) &&
      value >= "2026-01-01" &&
      new Date(`${value}T12:00:00Z`).getUTCDay() === 6,
    "Choose a Saturday in 2026 or later.",
  );
export const checkinCommand = z
  .object({
    date: checkinDate,
    requestId: z.string().uuid(),
    expectedRevision: z.number().int().min(0),
    action: z.enum(["mark", "walkin", "close", "reopen"]),
    participantId: z.string().uuid().optional(),
    present: z.boolean().optional(),
    name: z.string().trim().min(1).max(80).optional(),
    reason: z.string().trim().min(3).max(240).optional(),
    duplicateReviewed: z.boolean().optional(),
    reviewed: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.action === "mark" && (!value.participantId || value.present === undefined))
      ctx.addIssue({ code: "custom", message: "Choose a runner and attendance state." });
    if (value.action === "mark" && value.present === false && !value.reason)
      ctx.addIssue({ code: "custom", message: "Add a reason for the correction." });
    if (value.action === "walkin" && (!value.participantId || !value.name))
      ctx.addIssue({ code: "custom", message: "Add the walk-in's name." });
    if (
      (value.action === "close" || value.action === "reopen") &&
      (!value.reviewed || !value.reason)
    )
      ctx.addIssue({ code: "custom", message: "Review the session and add a reason." });
  });
export type CheckinCommand = z.infer<typeof checkinCommand>;
export type CheckinPerson = {
  id: string;
  name: string;
  contactHint: string;
  source: "rsvp" | "walkin";
  present: boolean;
  recordedAt: string | null;
  invitationChanged: boolean;
};
export type CheckinBoard = {
  event: RunOccurrence;
  revision: number;
  closed: boolean;
  snapshotChanged: boolean;
  writable: boolean;
  people: CheckinPerson[];
  audit: Array<{
    id: number;
    action: string;
    participantId: string | null;
    present: boolean | null;
    reason: string | null;
    actor: string;
    at: string;
  }>;
  auditHasMore: boolean;
};
export function checkinCounts(people: CheckinPerson[]) {
  return {
    rsvps: people.filter((p) => p.source === "rsvp").length,
    present: people.filter((p) => p.present).length,
    walkins: people.filter((p) => p.source === "walkin" && p.present).length,
    unrecorded: people.filter((p) => !p.present).length,
  };
}
export function contactHint(contact: string) {
  if (contact.includes("@")) {
    const [name, domain] = contact.split("@");
    return `${name.slice(0, 1)}***@${domain}`;
  }
  return contact ? `Phone ending ${contact.replace(/\D/g, "").slice(-4)}` : "No contact collected";
}
export function checkinEvent(date: string) {
  return runOnDate(checkinDate.parse(date));
}
