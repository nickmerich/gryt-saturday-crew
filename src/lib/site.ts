/**
 * The single production origin for canonical URLs, social metadata,
 * sitemap generation, and structured-data IDs.
 *
 * Never hardcode a host anywhere else — import SITE_ORIGIN instead, so a
 * preview or Lovable host can never leak into a public canonical tag.
 */
export const SITE_ORIGIN = "https://grytrunclub.com";

/** Absolute production URL for a site-relative path. */
export function siteUrl(path = "/"): string {
  return path === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
