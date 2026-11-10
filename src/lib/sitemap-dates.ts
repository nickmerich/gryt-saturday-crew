/**
 * <lastmod> dates for the comparison playbooks in /sitemap.xml.
 *
 * Each date mirrors the MODIFIED / modified value in the matching route file
 * (src/routes/resources_.playbooks_.<slug>.tsx), which is also what the page
 * shows readers and puts in its Article schema. Bump both together when a
 * playbook is edited. tests/sitemap-lastmod.test.ts fails if they drift.
 *
 * Articles do not need an entry here: the sitemap reads their dates from the
 * generated articles index.
 */
export const PLAYBOOK_LASTMOD: Record<string, string> = {
  "best-free-run-clubs-south-hills-2026": "2026-11-10",
  "best-free-running-clubs-pittsburgh-2026": "2026-11-10",
  "fleet-feet-pittsburgh-vs-independent-run-clubs": "2026-11-10",
  "gryt-vs-yinz-run-club": "2026-11-10",
  "gryt-vs-parkrun-pittsburgh": "2026-11-10",
  "gryt-vs-city-of-bridges-run-club": "2026-11-10",
};
