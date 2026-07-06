// Sticky 50/50 A/B assignment for the homepage hero.
// - Persisted in localStorage so returning visitors see the same variant.
// - Override with ?v=a or ?v=b (also persisted) for QA and stakeholder demos.
// - SSR-safe: returns null on the server; components render variant A until
//   the client hydrates and picks up the assignment.
// - Fires GA4 events so the split and per-variant view counts are observable.

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

export type HeroVariant = "a" | "b";
type AssignSource = "random" | "stored" | "override";

const KEY = "gryt.hero_variant.v1";

function readOverride(): HeroVariant | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search).get("v");
  return p === "a" || p === "b" ? p : null;
}

function readStored(): HeroVariant | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "a" || v === "b" ? v : null;
  } catch {
    return null;
  }
}

function writeStored(v: HeroVariant) {
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    /* privacy mode / quota — fine, we just re-roll next visit */
  }
}

function assign(): HeroVariant {
  return Math.random() < 0.5 ? "a" : "b";
}

export function useHeroVariant(): HeroVariant | null {
  const [variant, setVariant] = useState<HeroVariant | null>(null);

  useEffect(() => {
    const override = readOverride();
    const stored = readStored();
    let picked: HeroVariant;
    let source: AssignSource;

    if (override) {
      picked = override;
      source = "override";
      writeStored(picked);
    } else if (stored) {
      picked = stored;
      source = "stored";
    } else {
      picked = assign();
      source = "random";
      writeStored(picked);
    }

    setVariant(picked);

    // `hero_variant_assigned` fires only when the visitor gets a fresh
    // random pick or an explicit override — used to sanity-check the split.
    if (source !== "stored") {
      track("hero_variant_assigned", { hero_variant: picked, source });
    }
    // `hero_variant_view` fires on every landing so per-variant impression
    // counts can be paired against RSVP conversions.
    track("hero_variant_view", { hero_variant: picked, source });
  }, []);

  return variant;
}
