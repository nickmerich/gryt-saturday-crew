import { normalizeContact, normalizeName } from "../attendance/schema";

/** Group only an exact normalized name + contact; an unknown contact stays row-specific. */
export function rosterIdentity(name: string, contact: string, rowId: string) {
  const parsed = normalizeContact(contact);
  return parsed ? `${parsed.kind}:${parsed.value}:${normalizeName(name)}` : `unresolved:${rowId}`;
}
export function waiverIdentity(name: string, email: string) {
  const parsed = normalizeContact(email);
  return parsed?.kind === "email" ? `${parsed.value}:${normalizeName(name)}` : null;
}
