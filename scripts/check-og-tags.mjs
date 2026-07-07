#!/usr/bin/env node
/**
 * Re-scrapes a URL and asserts the presence + expected values of the
 * social/SEO meta tags that link previews rely on. Run in CI so a
 * regression on the manifesto (or any listed URL) fails the build.
 *
 * Usage:
 *   node scripts/check-og-tags.mjs
 *   TARGET_URL=https://grytrunclub.com/resources/manifesto node scripts/check-og-tags.mjs
 *
 * Exit codes: 0 = all checks pass, 1 = one or more failed.
 */

const TARGETS = [
  {
    url: process.env.TARGET_URL || "https://grytrunclub.com/resources/manifesto",
    expect: {
      // Substring match — resilient to minor copy tweaks while catching
      // a stale "Lovable App" fallback or the wrong page.
      "og:title": "July 2026 Audit: The Human Layer Comes First",
      "twitter:title": "July 2026 Audit: The Human Layer Comes First",
      "og:description": "GRYT Club audit manifesto",
      "twitter:description": "GRYT Club audit manifesto",
      "og:type": "article",
      "twitter:card": "summary_large_image",
      "og:url": "https://grytrunclub.com/resources/manifesto",
      canonical: "https://grytrunclub.com/resources/manifesto",
      // Presence only — value can change per generation.
      "og:image": "__present__",
      "twitter:image": "__present__",
    },
  },
];

const attr = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};

function extractTags(html) {
  const tags = {};
  const metaRe = /<meta\b[^>]*>/gi;
  for (const tag of html.match(metaRe) ?? []) {
    const key =
      attr(tag, /\bproperty\s*=\s*"([^"]+)"/i) ||
      attr(tag, /\bname\s*=\s*"([^"]+)"/i);
    const content = attr(tag, /\bcontent\s*=\s*"([^"]*)"/i);
    if (key) tags[key.toLowerCase()] = content ?? "";
  }
  const canonical = attr(
    html,
    /<link\b[^>]*\brel\s*=\s*"canonical"[^>]*\bhref\s*=\s*"([^"]+)"/i,
  );
  if (canonical) tags["canonical"] = canonical;
  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) tags["title"] = title;
  return tags;
}

async function check(target) {
  const failures = [];
  const res = await fetch(target.url, {
    // Facebook's crawler UA — some caches/edge rules only serve full SSR
    // meta to known scrapers. Mirroring it makes the check match what
    // link-preview validators actually see.
    headers: { "user-agent": "facebookexternalhit/1.1" },
    redirect: "follow",
  });
  if (!res.ok) {
    return [`HTTP ${res.status} fetching ${target.url}`];
  }
  const html = await res.text();
  const tags = extractTags(html);

  for (const [key, expected] of Object.entries(target.expect)) {
    const actual = tags[key.toLowerCase()];
    if (actual == null || actual === "") {
      failures.push(`missing <${key}> on ${target.url}`);
      continue;
    }
    if (expected === "__present__") continue;
    if (!actual.includes(expected)) {
      failures.push(
        `<${key}> mismatch on ${target.url}\n    expected substring: ${expected}\n    actual:             ${actual}`,
      );
    }
  }
  return failures;
}

let hadFailure = false;
for (const target of TARGETS) {
  process.stdout.write(`\nChecking ${target.url}\n`);
  const failures = await check(target).catch((e) => [String(e)]);
  if (failures.length === 0) {
    process.stdout.write("  ok — all meta tags present and matching\n");
  } else {
    hadFailure = true;
    for (const f of failures) process.stdout.write(`  FAIL ${f}\n`);
  }
}

process.exit(hadFailure ? 1 : 0);
