import { createServerFn } from "@tanstack/react-start";

export type SignupSessionSummary = {
  name: string | null;
  /** Display-safe contact, e.g. "ca••••@example.com" */
  contactMasked: string | null;
  /** Raw contact, returned only to the browser that submitted it (cookie-bound). */
  contact: string | null;
  contactKind: "email" | "phone" | null;
  eventLabel: string | null;
  rsvpAt: string | null;
  waiver: { signedOn: string | null } | null;
};

function mask(contact: string | null): string | null {
  if (!contact) return null;
  const value = contact.trim();
  if (value.includes("@")) {
    const [local = "", domain = ""] = value.split("@");
    const head = local.slice(0, 2);
    return `${head}${"•".repeat(Math.max(3, local.length - 2))}@${domain}`;
  }
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? `••• ••• ${digits.slice(-4)}` : "•••";
}

/** Reads the current signup from server-side storage via the httpOnly cookie. */
export const loadSignupSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<SignupSessionSummary | null> => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const {
      readSignupToken,
      getSignupSession,
    } = await import("@/lib/signup-session.server");

    const token = readSignupToken(getRequestHeader("cookie"));
    const row = await getSignupSession(token);
    if (!row) return null;

    const contact = row.contact;
    return {
      name: row.name,
      contact,
      contactMasked: mask(contact),
      contactKind: contact ? (contact.includes("@") ? "email" : "phone") : null,
      eventLabel: row.event_label,
      rsvpAt: row.rsvp_id ? row.created_at : null,
      waiver: row.waiver_id ? { signedOn: row.waiver_signed_on } : null,
    };
  },
);

/** Forgets the stored submission and clears the cookie. */
export const clearSignupSession = createServerFn({ method: "POST" }).handler(async () => {
  const { getRequestHeader, setResponseHeader } = await import(
    "@tanstack/react-start/server"
  );
  const { readSignupToken, deleteSignupSession, clearedSignupCookie } = await import(
    "@/lib/signup-session.server"
  );
  await deleteSignupSession(readSignupToken(getRequestHeader("cookie")));
  setResponseHeader("set-cookie", clearedSignupCookie());
  return { ok: true };
});
