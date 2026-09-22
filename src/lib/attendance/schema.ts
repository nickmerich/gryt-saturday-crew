import { z } from "zod";

export function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
export function normalizeContact(value: string): { kind: "email" | "phone"; value: string } | null {
  const trimmed = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return { kind: "email", value: trimmed.toLowerCase() };
  if (!/^\+?[\d ()-]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return { kind: "phone", value: `+1${digits}` };
  if (digits.length === 11 && digits.startsWith("1")) return { kind: "phone", value: `+${digits}` };
  if (trimmed.startsWith("+") && /^[1-9]\d{7,14}$/.test(digits))
    return { kind: "phone", value: `+${digits}` };
  return null;
}

const campaign = z
  .string()
  .trim()
  .max(100)
  .regex(/^[\w .:/-]*$/)
  .optional();
export const rsvpSchema = z.object({
  name: z.string().trim().min(1).max(80),
  contact: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .refine((value) => normalizeContact(value) !== null),
  eventId: z.string().regex(/^gryt-saturday-\d{4}-\d{2}-\d{2}$/),
  eventVersion: z.number().int().positive(),
  idempotencyKey: z.string().uuid(),
  source: z
    .enum(["", "Friend", "Instagram", "Strava", "Google", "Trail", "Other"])
    .optional()
    .nullable(),
  heroVariant: z.enum(["a", "b"]).optional().nullable(),
  website: z.literal("").optional(),
  attribution: z
    .object({
      utm_source: campaign,
      utm_medium: campaign,
      utm_campaign: campaign,
      // Hostname only: never persist a full referrer URL with personal query params.
      referring_site: z
        .string()
        .max(253)
        .regex(/^[a-zA-Z0-9.-]*$/)
        .optional(),
    })
    .optional(),
});
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type DeliveryState =
  | "queued"
  | "accepted"
  | "suppressed"
  | "failed"
  | "not_available"
  | "unconfirmed";
export function confirmationMessage(state: DeliveryState) {
  switch (state) {
    case "unconfirmed":
      return "Your RSVP is saved. Email status is not confirmed. Keep the run details below.";
    case "accepted":
      return "Your RSVP is saved. Your confirmation was accepted by our email provider; delivery is not yet confirmed.";
    case "suppressed":
      return "Your RSVP is saved. A confirmation email could not be sent to this address. Your run details are below.";
    case "failed":
      return "Your RSVP is saved. Email is unavailable right now. Keep the run details below.";
    case "not_available":
      return "Your RSVP is saved. Automatic text reminders are not enabled. Keep the run details below.";
    default:
      return "Your RSVP is saved. Email confirmation is queued, not yet sent. Your run details are below.";
  }
}
