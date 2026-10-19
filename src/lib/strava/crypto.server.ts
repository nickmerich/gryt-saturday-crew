const encoder = new TextEncoder();
const decoder = new TextDecoder();
function base64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
function bytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
async function key(secret: string) {
  if (!secret) throw new Error("Strava application secret is not configured.");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`gryt-strava-tokens-v1:${secret}`),
  );
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
/** Encrypted at the application layer; client secret never enters the DB. */
export async function seal(value: unknown, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await key(secret),
    encoder.encode(JSON.stringify(value)),
  );
  return `v1.${base64(iv)}.${base64(new Uint8Array(encrypted))}`;
}
export async function unseal<T>(value: string, secret: string): Promise<T> {
  const [version, iv, ciphertext] = value.split(".");
  if (version !== "v1" || !iv || !ciphertext) throw new Error("Invalid encrypted connection.");
  const clear = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytes(iv) as Uint8Array<ArrayBuffer> },
    await key(secret),
    bytes(ciphertext) as Uint8Array<ArrayBuffer>,
  );
  return JSON.parse(decoder.decode(clear)) as T;
}

export async function createOAuthState(actor: string, secret: string, now = Date.now()) {
  return seal({ actor, expires: now + 10 * 60_000, nonce: crypto.randomUUID() }, secret);
}
export async function verifyOAuthState(
  state: string,
  actor: string,
  secret: string,
  now = Date.now(),
) {
  try {
    const data = await unseal<{ actor: string; expires: number }>(state, secret);
    return (
      data.actor === actor &&
      Number.isFinite(data.expires) &&
      data.expires > now &&
      data.expires <= now + 10 * 60_000
    );
  } catch {
    return false;
  }
}
