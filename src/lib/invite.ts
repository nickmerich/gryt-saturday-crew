// Personal invite links. Pure helpers shared by the browser and the server.
//
// Every RSVP gets a stable, per-person invite code (first name plus a short
// hash of their contact). A friend who lands on grytrunclub.com/?ref=<code>
// and RSVPs is recorded as brought by that person. The code is not a secret
// and carries no contact details; it is only an attribution handle.

export const SITE_ORIGIN = "https://grytrunclub.com";
export const REF_PARAM = "ref";
export const INVITE_CODE_MAX = 40;

/** Lowercase letters, digits and dashes only, 3 to 40 chars. */
const CODE_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export function normalizeInviteCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toLowerCase();
  if (!CODE_RE.test(code)) return null;
  return code;
}

/** "Nick Merich" -> "nick"; falls back to "runner" for empty or non-latin names. */
export function inviteSlug(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  const slug = first
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 16);
  return slug || "runner";
}

/** Combine the slug with a short hash fragment into the public code. */
export function buildInviteCode(name: string, hashHex: string): string {
  const frag = hashHex.replace(/[^a-f0-9]/g, "").slice(0, 5) || "00000";
  return `${inviteSlug(name)}-${frag}`;
}

export function inviteUrl(code: string | null | undefined): string {
  const c = normalizeInviteCode(code);
  if (!c) return `${SITE_ORIGIN}/?utm_source=friend`;
  return `${SITE_ORIGIN}/?${REF_PARAM}=${encodeURIComponent(c)}`;
}

export function inviteMessage(code: string | null | undefined, dateLabel?: string): string {
  return `I'm running with GRYT this Saturday${dateLabel ? ` (${dateLabel})` : ""} at 7 AM, Peterswood Park lot in McMurray. Free, no-drop, every pace. Come with me: ${inviteUrl(code)}`;
}
