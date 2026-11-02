// First-touch UTM + referrer attribution captured on landing and reused
// for the whole session so every signup posts consistent Beehiiv fields.

import { normalizeInviteCode, REF_PARAM } from "@/lib/invite";

const STORAGE_KEY = "gryt.attribution.v1";
// Personal invite code (?ref=) lives in localStorage so a friend who opens the
// link on Tuesday and RSVPs on Friday still credits the person who sent it.
const REF_KEY = "gryt.ref.v1";
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referring_site: string;
};

type Stored = Partial<Attribution> & { captured_at?: number };

function safeStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function readStored(): Stored {
  const s = safeStorage();
  if (!s) return {};
  try {
    return JSON.parse(s.getItem(STORAGE_KEY) || "{}") as Stored;
  } catch {
    return {};
  }
}

function writeStored(value: Stored) {
  const s = safeStorage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy mode */
  }
}

function safeLocal(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** Store a valid ?ref= code for 30 days. First code wins until it expires. */
function captureReferralCode(params: URLSearchParams): string | null {
  const code = normalizeInviteCode(params.get(REF_PARAM));
  const s = safeLocal();
  if (!s) return code;
  try {
    const existing = getReferralCode();
    if (existing) return existing;
    if (code) s.setItem(REF_KEY, JSON.stringify({ code, at: Date.now() }));
  } catch {
    /* ignore */
  }
  return code;
}

/** The invite code that brought this browser here, if any and not expired. */
export function getReferralCode(): string | null {
  const s = safeLocal();
  if (!s) return null;
  try {
    const raw = s.getItem(REF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { code?: string; at?: number };
    if (!parsed.at || Date.now() - parsed.at > REF_TTL_MS) {
      s.removeItem(REF_KEY);
      return null;
    }
    return normalizeInviteCode(parsed.code);
  } catch {
    return null;
  }
}

/** Forget the stored referral, e.g. once it has been attached to an RSVP. */
export function clearReferralCode(): void {
  try {
    safeLocal()?.removeItem(REF_KEY);
  } catch {
    /* ignore */
  }
}

function inferSourceFromReferrer(ref: string): { source: string; medium: string } | null {
  if (!ref) return null;
  let host = "";
  try {
    host = new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  if (!host || host.endsWith("grytrunclub.com") || host.endsWith("gryt.live")) return null;

  const map: Array<[RegExp, { source: string; medium: string }]> = [
    [/instagram\.com$/, { source: "instagram", medium: "social" }],
    [/(?:^|\.)t\.co$|twitter\.com$|x\.com$/, { source: "twitter", medium: "social" }],
    [/facebook\.com$|fb\.me$/, { source: "facebook", medium: "social" }],
    [/linkedin\.com$|lnkd\.in$/, { source: "linkedin", medium: "social" }],
    [/tiktok\.com$/, { source: "tiktok", medium: "social" }],
    [/reddit\.com$/, { source: "reddit", medium: "social" }],
    [/youtube\.com$|youtu\.be$/, { source: "youtube", medium: "social" }],
    [/strava\.com$/, { source: "strava", medium: "referral" }],
    [/google\./, { source: "google", medium: "organic" }],
    [/bing\.com$|duckduckgo\.com$/, { source: host.split(".")[0], medium: "organic" }],
  ];
  for (const [re, val] of map) if (re.test(host)) return val;
  return { source: host, medium: "referral" };
}

/**
 * Capture UTM params + referrer on the current page load. First-touch wins:
 * once stored for the session, later navigations don't overwrite it.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  // Always look for a personal invite code, even on later navigations.
  const ref = captureReferralCode(params);

  const stored = readStored();
  if (stored.utm_source || stored.utm_medium || stored.utm_campaign || stored.referring_site) {
    return;
  }

  // A personal invite counts as a friend referral unless the link carries
  // explicit UTM values of its own.
  const utm_source = params.get("utm_source")?.trim() || (ref ? "friend" : "");
  const utm_medium = params.get("utm_medium")?.trim() || (ref ? "invite" : "");
  const utm_campaign = params.get("utm_campaign")?.trim() || (ref ? `ref:${ref}` : "");
  const docRef = document.referrer || "";

  const inferred = !utm_source ? inferSourceFromReferrer(docRef) : null;

  writeStored({
    utm_source: utm_source || inferred?.source || "direct",
    utm_medium: utm_medium || inferred?.medium || (docRef ? "referral" : "none"),
    utm_campaign: utm_campaign || "",
    referring_site: docRef || "",
    captured_at: Date.now(),
  });
}

/**
 * Build attribution for a signup. `placement` is the on-page location
 * (e.g. "homepage_bar", "footer") and becomes utm_campaign when no
 * campaign was captured from the URL.
 */
export function getSignupAttribution(placement: string): Attribution {
  if (typeof window !== "undefined") captureAttribution();
  const s = readStored();
  return {
    utm_source: s.utm_source || "direct",
    utm_medium: s.utm_medium || "none",
    utm_campaign: s.utm_campaign || placement,
    referring_site: s.referring_site || "",
  };
}
