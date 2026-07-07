// Utilities for encoding/decoding a timer event payload into a URL hash so
// results can be shared via a plain link (no backend required).

export type SharedFinisher = {
  n: string; // name
  b?: string; // bib
  t: number; // finishMs
};

export type SharedPayload = {
  v: 1;
  title: string;
  startedAt: number | null; // epoch ms
  finishers: SharedFinisher[];
};

// base64url helpers (URL-safe, no padding)
function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (str.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodePayload(p: SharedPayload): string {
  const json = JSON.stringify(p);
  const bytes = new TextEncoder().encode(json);
  return toB64Url(bytes);
}

export function decodePayload(encoded: string): SharedPayload | null {
  try {
    const bytes = fromB64Url(encoded);
    const json = new TextDecoder().decode(bytes);
    const obj = JSON.parse(json);
    if (obj && obj.v === 1 && Array.isArray(obj.finishers)) return obj as SharedPayload;
    return null;
  } catch {
    return null;
  }
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const pad = (n: number, w = 2) => n.toString().padStart(w, "0");
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
}
