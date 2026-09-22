import assert from 'node:assert/strict';

// Read-only. Never submits an RSVP, waiver, payment, or analytics event.
const base = new URL(process.env.DEPLOYMENT_BASE_URL || 'http://127.0.0.1:4173');
assert.ok(['http:', 'https:'].includes(base.protocol), 'Use an HTTP(S) deployment origin.');
assert.equal(base.pathname, '/', 'DEPLOYMENT_BASE_URL must be an origin, not a path.');
assert.ok(!base.username && !base.password && !base.search && !base.hash, 'Use a clean deployment origin.');
const expected = process.env.EXPECTED_COMMIT;
assert.match(expected || '', /^[a-f0-9]{40}$/i, 'Set EXPECTED_COMMIT to the exact deployed SHA.');

async function get(path, redirect = 'error') {
  return fetch(new URL(path, base), {
    redirect,
    headers: { 'cache-control': 'no-cache' },
    signal: AbortSignal.timeout(20000),
  });
}
function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
}
function links(html, rel) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter(tag => attr(tag, 'rel') === rel)
    .map(tag => attr(tag, 'href'));
}
function meta(html, property) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter(tag => attr(tag, 'property') === property)
    .map(tag => attr(tag, 'content'));
}

const markerResponse = await get(`/release.json?verify=${encodeURIComponent(expected)}`);
assert.equal(markerResponse.status, 200, 'Release marker missing.');
const marker = await markerResponse.json();
assert.equal(marker.release, 'free-runs-v1');
assert.equal(marker.commit, expected, 'Wrong deployed commit.');
assert.notEqual(marker.dirty, true, 'Release was built from modified tracked files.');
console.log(`PASS release identity ${expected}`);

for (const path of ['/register', '/register?eventId=gryt_saturday_long_run&quantity=2']) {
  const response = await get(path, 'manual');
  assert.equal(response.status, 308, `${path} must redirect before HTML/JS.`);
  const target = new URL(response.headers.get('location') || '', base);
  assert.equal(target.origin, base.origin, 'Registration redirect must remain on this site.');
  assert.equal(target.pathname + target.search + target.hash, '/#join');
}
console.log('PASS registration redirect (including stale query parameters)');

for (const path of ['/resources/playbooks', '/resources/conversations', '/resources/graphics']) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const canonical = `https://grytrunclub.com${path}`;
  assert.deepEqual(links(html, 'canonical'), [canonical], `Canonical mismatch: ${path}`);
  assert.deepEqual(meta(html, 'og:url'), [canonical], `Social URL mismatch: ${path}`);
}
console.log('PASS production-domain canonicals and og:url');

const sitemapResponse = await get('/sitemap.xml');
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
assert.match(sitemap, /<urlset\b/);
assert.doesNotMatch(sitemap, /<loc>[^<]*\/register(?:[/?#]|<)/);
console.log('PASS retired registration absent from sitemap');

const homeResponse = await get('/');
assert.equal(homeResponse.status, 200);
const home = await homeResponse.text();
assert.match(home, /\bid=["']join["']/);
assert.match(home, /\bid=["']first["']/);
assert.doesNotMatch(home, /name=["']robots["'][^>]*content=["'][^"']*noindex/i);
for (const path of [
  '/races',
  '/resources/playbooks',
  '/resources/playbooks/gryt-vs-yinz-run-club',
  '/resources/playbooks/best-free-run-clubs-south-hills-2026',
  '/resources/playbooks/best-free-running-clubs-pittsburgh-2026',
  '/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs',
]) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.doesNotMatch(html, /href=["'][^"']*\/#first-time["']/);
  assert.match(html, /href=["'][^"']*\/#join["']/, `Missing free RSVP CTA: ${path}`);
}
console.log('PASS homepage targets and priority article CTAs');
console.log('Read-only checks passed. Stripe hosted-session inventory, server-function refusal, and browser QA are separate release gates.');
