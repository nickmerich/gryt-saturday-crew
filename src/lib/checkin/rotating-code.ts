/**
 * Rotating check-in code.
 *
 * The organiser's phone shows a QR that changes every 30 seconds. The code is
 * derived from a server-only secret and the current time window, so a photo of
 * the QR is useless a minute later and nobody can check in from home.
 *
 * Nothing is stored: the server recomputes the expected code on arrival.
 */

export const CODE_WINDOW_MS = 30_000;
/** How many past windows still verify, covering slow scans and clock drift. */
export const CODE_TOLERANCE_WINDOWS = 3;

function windowIndex(now: number): number {
  return Math.floor(now / CODE_WINDOW_MS);
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return new Uint8Array(sig);
}

/** Eight uppercase base32-ish characters, easy to read and URL safe. */
function encode(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out;
}

async function codeForWindow(secret: string, index: number): Promise<string> {
  return encode(await hmac(secret, `gryt-checkin:${index}`));
}

export type RotatingCode = {
  code: string;
  /** When this code stops being the current one (ms epoch). */
  rotatesAt: number;
};

export async function currentCode(secret: string, now = Date.now()): Promise<RotatingCode> {
  const index = windowIndex(now);
  return { code: await codeForWindow(secret, index), rotatesAt: (index + 1) * CODE_WINDOW_MS };
}

/** True when `code` matches the current window or one of the recent ones. */
export async function verifyCode(secret: string, code: string, now = Date.now()): Promise<boolean> {
  const candidate = code.trim().toUpperCase();
  if (!/^[A-Z2-9]{8}$/.test(candidate)) return false;
  const index = windowIndex(now);
  for (let back = 0; back <= CODE_TOLERANCE_WINDOWS; back++) {
    if (candidate === (await codeForWindow(secret, index - back))) return true;
  }
  return false;
}

/**
 * Arrival ticket. Scanning a fresh code on arrival swaps it for a ticket that
 * lasts long enough to type a name with cold hands, so a slow typist is not
 * turned away once the QR on screen has moved on.
 */
export const TICKET_TTL_MS = 20 * 60_000;

function hex(bytes: Uint8Array): string {
  return Array.from(bytes.slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function issueTicket(secret: string, now = Date.now()): Promise<string> {
  return `${now}.${hex(await hmac(secret, `gryt-ticket:${now}`))}`;
}

export async function verifyTicket(secret: string, ticket: string, now = Date.now()): Promise<boolean> {
  const match = /^(\d{13})\.([0-9a-f]{32})$/.exec(ticket.trim());
  if (!match) return false;
  const issued = Number(match[1]);
  if (issued > now + 60_000 || now - issued > TICKET_TTL_MS) return false;
  return match[2] === hex(await hmac(secret, `gryt-ticket:${issued}`));
}
