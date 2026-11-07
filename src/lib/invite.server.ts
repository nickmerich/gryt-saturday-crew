import { createHash } from "crypto";
import { identityKey } from "@/lib/checkin/identity";
import { buildInviteCode } from "@/lib/invite";

/**
 * Deterministic per-person invite code. Same person (same email or phone)
 * gets the same code every week, so attribution survives across runs without
 * a members table. The hash is one-way; the code never reveals the contact.
 */
export function inviteCodeFor(name: string, contact: string): string {
  const key = identityKey(name, contact);
  const hex = createHash("sha256").update(`gryt-invite|${key}`).digest("hex");
  return buildInviteCode(name, hex);
}
