// Thin wrapper around GA4/gtag with a safe no-op fallback so the app never
// crashes if the tag hasn't loaded yet (adblock, first paint before script,
// SSR). Also mirrors to console in dev so you can validate events without
// opening the GA DebugView.

type Params = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const isBrowser = () => typeof window !== "undefined";
const isDev = () =>
  isBrowser() && /localhost|127\.0\.0\.1|\.lovable\.app$/.test(window.location.hostname);

export function track(event: string, params: Params = {}) {
  if (!isBrowser()) return;
  const clean: Params = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    clean[k] = v;
  }
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, clean);
    } else {
      // Queue on dataLayer so gtag picks it up when it loads.
      (window.dataLayer = window.dataLayer || []).push({ event, ...clean });
    }
  } catch {
    /* never let analytics break the page */
  }
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.info("[analytics]", event, clean);
  }
}
