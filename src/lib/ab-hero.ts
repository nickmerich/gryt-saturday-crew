// Sticky 50/50 A/B assignment for the homepage hero.
// - Persisted in localStorage so returning visitors see the same variant.
// - Override with ?v=a or ?v=b (also persisted) for QA and stakeholder demos.
// - SSR-safe: returns null on the server; components render variant A until
//   the client hydrates and picks up the assignment.

import { useEffect, useState } from "react";

export type HeroVariant = "a" | "b";

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
    if (override) {
      writeStored(override);
      setVariant(override);
      return;
    }
    const stored = readStored();
    if (stored) {
      setVariant(stored);
      return;
    }
    const fresh = assign();
    writeStored(fresh);
    setVariant(fresh);
  }, []);

  return variant;
}
