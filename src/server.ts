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
// Edge HTML cache for static content pages (SEO: server response time / TTFB).
// Only public, non-personalized pages whose HTML doesn't depend on live data are
// cached, for a short window, keyed by build so deploys never mix versions.
// Anything unexpected (no Cache API, errors) falls through to normal SSR.
// ---------------------------------------------------------------------------
declare const __GRYT_BUILD_ID__: string;
const BUILD_ID = typeof __GRYT_BUILD_ID__ === "string" ? __GRYT_BUILD_ID__ : "dev";
const EDGE_TTL_SECONDS = 600;
const EDGE_CACHE_EXACT = new Set([
  "/about",
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

function isEdgeCacheable(request: Request): URL | null {
  if (request.method !== "GET") return null;
  const url = new URL(request.url);
  if (url.search) return null;
  if (request.headers.get("authorization")) return null;
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  if (EDGE_CACHE_EXCLUDE.some((p) => path === p || path.startsWith(`${p}/`))) return null;
  if (path.includes(".") || path.startsWith("/api") || path.startsWith("/_")) return null;
  if (EDGE_CACHE_EXACT.has(path) || EDGE_CACHE_PREFIXES.some((p) => path.startsWith(p))) return url;
  return null;
}

function edgeCache(): Cache | null {
  try {
    const c = (globalThis as unknown as { caches?: { default?: Cache } }).caches;
    return c?.default ?? null;
  } catch {
    return null;
  }
}

async function renderWithEdgeCache(
  request: Request,
  env: unknown,
  ctx: unknown,
  render: () => Promise<Response>,
): Promise<Response> {
  const url = isEdgeCacheable(request);
  const cache = url ? edgeCache() : null;
  if (!url || !cache) return render();

  const key = new Request(`${url.origin}${url.pathname}?__b=${BUILD_ID}`, { method: "GET" });
  try {
    const hit = await cache.match(key);
    if (hit) {
      const res = new Response(hit.body, hit);
      res.headers.set("x-gryt-edge-cache", "HIT");
      res.headers.set("cache-control", "public, max-age=0, must-revalidate");
      return res;
    }
  } catch {
    return render();
  }

  const response = await render();
  const type = response.headers.get("content-type") ?? "";
  if (response.status !== 200 || !type.includes("text/html") || response.headers.has("set-cookie")) {
    return response;
  }
  try {
    const toStore = new Response(response.clone().body, response);
    toStore.headers.set("cache-control", `public, s-maxage=${EDGE_TTL_SECONDS}, max-age=${EDGE_TTL_SECONDS}`);
    const put = cache.put(key, toStore).catch(() => undefined);
    const wctx = ctx as WaitUntilCtx | undefined;
    if (wctx?.waitUntil) wctx.waitUntil(put);
  } catch {
    // ignore cache write failures
  }
  const out = new Response(response.body, response);
  out.headers.set("x-gryt-edge-cache", "MISS");
  return out;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      return await renderWithEdgeCache(request, env, ctx, async () => {
        const response = await handler.fetch(request, env, ctx);
        return await normalizeCatastrophicSsrResponse(response);
      });
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
