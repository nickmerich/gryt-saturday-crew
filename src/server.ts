import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// ---------------------------------------------------------------------------
// First-paint: TanStack Start emits `<link rel="modulepreload">` for the entry
// bundle and route chunks (~200 KB gzipped). Chrome fetches those at High
// priority, so on a slow link they compete with the stylesheet for bandwidth
// before the first paint even though the LCP element is SSR'd text and the
// entry `<script type="module" async>` itself would load at Low priority.
// Adding `fetchpriority="low"` keeps early discovery (hydration still starts
// from the head) but lets CSS/HTML win the first-paint window. Not exposed as
// a TanStack option, so the streamed HTML is patched here (chunk-boundary safe).
// ---------------------------------------------------------------------------
const MODULEPRELOAD_TAG = '<link rel="modulepreload"';
const MODULEPRELOAD_LOW = '<link rel="modulepreload" fetchpriority="low"';

function deprioritizeModulePreloads(response: Response): Response {
  const type = response.headers.get("content-type") ?? "";
  if (response.status !== 200 || !type.includes("text/html") || !response.body) return response;
  try {
    let carry = "";
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const transform = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        const text = carry + decoder.decode(chunk, { stream: true });
        // Hold back any trailing partial match of the tag so one split across
        // two chunks is still rewritten on the next pass.
        let keep = 0;
        for (let k = Math.min(text.length, MODULEPRELOAD_TAG.length - 1); k > 0; k--) {
          if (MODULEPRELOAD_TAG.startsWith(text.slice(text.length - k))) {
            keep = k;
            break;
          }
        }
        const emit = text.slice(0, text.length - keep).split(MODULEPRELOAD_TAG).join(MODULEPRELOAD_LOW);
        carry = keep ? text.slice(text.length - keep) : "";
        if (emit) controller.enqueue(encoder.encode(emit));
      },
      flush(controller) {
        const tail = carry + decoder.decode();
        if (tail) controller.enqueue(encoder.encode(tail.split(MODULEPRELOAD_TAG).join(MODULEPRELOAD_LOW)));
      },
    });
    const out = new Response(response.body.pipeThrough(transform), response);
    out.headers.delete("content-length");
    return out;
  } catch {
    return response;
  }
}

// ---------------------------------------------------------------------------
// Edge HTML cache for static content pages (SEO: server response time / TTFB).
// Only public, non-personalized pages whose HTML doesn't depend on live data are
// cached, for a short window, keyed by build so deploys never mix versions.
//
// Two tiers:
//   1. Cache API (`caches.default`) when the runtime exposes it (Cloudflare Workers).
//   2. In-memory fallback (module-scope Map) when it doesn't. Lovable's runtime
//      runs this fetch handler but has no Cache API, so this tier is what warms
//      a long-lived instance after its first render of each page.
// Every response carries `x-gryt-edge-cache: HIT | MISS | BYPASS` so production
// behaviour is observable from response headers.
// Anything unexpected (errors in either tier) falls through to normal SSR.
// ---------------------------------------------------------------------------
declare const __GRYT_BUILD_ID__: string;
const BUILD_ID = typeof __GRYT_BUILD_ID__ === "string" ? __GRYT_BUILD_ID__ : "dev";
const EDGE_TTL_SECONDS = 600;
const EDGE_SWR_SECONDS = 86400;
const MEMORY_CACHE_MAX_ENTRIES = 100;
// Paths whose SSR HTML is identical for every visitor. Personalization on these
// pages (RSVP session restore, countdown timer) is client-only, behind useEffect.
// - "/" reads a public partners list + the public run schedule, no cookies.
// - "/calendar" renders a month grid from the fixed Saturday schedule + the
//   server clock (today highlight); a 10-minute window is fine for that.
const EDGE_CACHE_EXACT = new Set([
  "/",
  "/about",
  "/calendar",
  "/faq",
  "/plan",
  "/privacy",
  "/terms",
  "/races",
  "/register",
  "/resources",
  "/resources/playbooks",
]);
const EDGE_CACHE_PREFIXES = ["/resources/playbooks/", "/resources/"];
const EDGE_CACHE_EXCLUDE = [
  "/resources/what-to-wear-running",
  "/resources/recap",
  "/resources/runs",
  "/resources/graphics",
];

type WaitUntilCtx = { waitUntil?: (p: Promise<unknown>) => void };
type EdgeCacheState = "HIT" | "MISS" | "BYPASS";

function isEdgeCacheable(request: Request): URL | null {
  if (request.method !== "GET") return null;
  const url = new URL(request.url);
  if (url.search) return null;
  // Cookies are deliberately NOT a bypass: GA sets first-party `_ga` cookies on
  // most visitors and none of the cached pages read cookies during SSR
  // (RSVP session restore on "/" happens client-side after hydration).
  if (request.headers.get("authorization")) return null;
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  if (EDGE_CACHE_EXCLUDE.some((p) => path === p || path.startsWith(`${p}/`))) return null;
  if (path.includes(".") || path.startsWith("/api") || path.startsWith("/_")) return null;
  if (EDGE_CACHE_EXACT.has(path) || EDGE_CACHE_PREFIXES.some((p) => path.startsWith(p))) return url;
  return null;
}

/** A rendered response we may store: 200, HTML, and not setting cookies. */
function isStorable(response: Response): boolean {
  const type = response.headers.get("content-type") ?? "";
  return response.status === 200 && type.includes("text/html") && !response.headers.has("set-cookie");
}

function withEdgeHeaders(response: Response, state: EdgeCacheState, cacheable: boolean): Response {
  const out = new Response(response.body, response);
  out.headers.set("x-gryt-edge-cache", state);
  if (cacheable) {
    // Browsers always revalidate (max-age=0, must-revalidate) so a deploy never
    // leaves a user on HTML that points at the previous build's chunk hashes;
    // shared caches may hold it for the TTL (s-maxage) and, via the targeted
    // CDN-Cache-Control header, serve stale while they refresh.
    out.headers.set(
      "cache-control",
      `public, max-age=0, must-revalidate, s-maxage=${EDGE_TTL_SECONDS}`,
    );
    out.headers.set(
      "cdn-cache-control",
      `public, max-age=${EDGE_TTL_SECONDS}, stale-while-revalidate=${EDGE_SWR_SECONDS}`,
    );
  }
  return out;
}

// ---- Tier 1: Cache API --------------------------------------------------------
function edgeCache(): Cache | null {
  try {
    const c = (globalThis as unknown as { caches?: { default?: Cache } }).caches;
    return c?.default ?? null;
  } catch {
    return null;
  }
}

function cacheApiKey(url: URL): Request {
  return new Request(`${url.origin}${url.pathname}?__b=${BUILD_ID}`, { method: "GET" });
}

// ---- Tier 2: in-memory fallback -----------------------------------------------
type MemoryEntry = { status: number; headers: [string, string][]; body: string; expires: number };
const memoryCache = new Map<string, MemoryEntry>();

function memoryKey(url: URL): string {
  return `${BUILD_ID}:${url.pathname}`;
}

function memoryGet(key: string): MemoryEntry | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expires <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  // Refresh insertion order so eviction drops the least recently used entry.
  memoryCache.delete(key);
  memoryCache.set(key, entry);
  return entry;
}

function memoryPut(key: string, entry: MemoryEntry): void {
  memoryCache.delete(key);
  memoryCache.set(key, entry);
  while (memoryCache.size > MEMORY_CACHE_MAX_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (oldest === undefined) break;
    memoryCache.delete(oldest);
  }
}

function headersToStore(headers: Headers): [string, string][] {
  const out: [string, string][] = [];
  headers.forEach((value, name) => {
    const n = name.toLowerCase();
    if (n === "set-cookie" || n === "x-gryt-edge-cache" || n === "cache-control" || n === "cdn-cache-control") return;
    out.push([name, value]);
  });
  return out;
}

async function renderWithEdgeCache(
  request: Request,
  env: unknown,
  ctx: unknown,
  render: () => Promise<Response>,
): Promise<Response> {
  const url = isEdgeCacheable(request);
  if (!url) return withEdgeHeaders(await render(), "BYPASS", false);

  const wctx = ctx as WaitUntilCtx | undefined;
  const cache = edgeCache();
  const key = memoryKey(url);

  // Tier 2 first: the in-memory map is always authoritative on a warm instance.
  // (Some runtimes expose a Cache API that accepts writes but never serves them,
  // so the memory tier must run regardless of whether `caches.default` exists.)
  const memHit = memoryGet(key);
  if (memHit) {
    return withEdgeHeaders(new Response(memHit.body, { status: memHit.status, headers: memHit.headers }), "HIT", true);
  }

  // Tier 1: Cache API, when it works.
  if (cache) {
    try {
      const hit = await cache.match(cacheApiKey(url));
      if (hit) {
        const body = await hit.text();
        memoryPut(key, { status: hit.status, headers: headersToStore(hit.headers), body, expires: Date.now() + EDGE_TTL_SECONDS * 1000 });
        return withEdgeHeaders(new Response(body, { status: hit.status, headers: hit.headers }), "HIT", true);
      }
    } catch {
      // treat as a miss
    }
  }

  const response = await render();
  if (!isStorable(response) || !response.body) return withEdgeHeaders(response, "BYPASS", false);
  try {
    // Stream to the client while a second branch buffers the HTML for the caches,
    // so the MISS path keeps TanStack's streaming SSR behaviour.
    const [toClient, toStore] = response.body.tee();
    const status = response.status;
    const headers = headersToStore(response.headers);
    const store = new Response(toStore)
      .text()
      .then(async (body) => {
        memoryPut(key, { status, headers, body, expires: Date.now() + EDGE_TTL_SECONDS * 1000 });
        if (cache) {
          const h = new Headers(headers);
          h.set("cache-control", `public, s-maxage=${EDGE_TTL_SECONDS}, max-age=${EDGE_TTL_SECONDS}`);
          await cache.put(cacheApiKey(url), new Response(body, { status, headers: h })).catch(() => undefined);
        }
      })
      .catch(() => undefined);
    if (wctx?.waitUntil) wctx.waitUntil(store);
    return withEdgeHeaders(new Response(toClient, response), "MISS", true);
  } catch {
    return withEdgeHeaders(response, "MISS", true);
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // SEO: permanent (301) redirect from www to the apex domain. Lovable's own
    // domain redirect is a 302, so the primary domain is unset in Lovable and
    // this worker sends the permanent signal instead.
    const reqUrl = new URL(request.url);
    if (reqUrl.hostname === "www.grytrunclub.com") {
      return new Response(null, {
        status: 301,
        headers: {
          location: `https://grytrunclub.com${reqUrl.pathname}${reqUrl.search}`,
          "cache-control": "public, max-age=86400",
        },
      });
    }
    try {
      const handler = await getServerEntry();
      return await renderWithEdgeCache(request, env, ctx, async () => {
        const response = await handler.fetch(request, env, ctx);
        return deprioritizeModulePreloads(await normalizeCatastrophicSsrResponse(response));
      });
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8", "x-gryt-edge-cache": "BYPASS" },
      });
    }
  },
};
