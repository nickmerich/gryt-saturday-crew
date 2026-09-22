import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { isRedirect } from '@tanstack/react-router';
import { Route as RegisterRoute } from '../src/routes/register';
import { Route as SitemapRoute } from '../src/routes/sitemap[.]xml';
import { SITE_ORIGIN, FREE_RUN_RSVP_PATH } from '../src/lib/site';

const source = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('registration throws a permanent server redirect without loading payment UI', () => {
  let thrown: unknown;
  try {
    const beforeLoad = RegisterRoute.options.beforeLoad as () => unknown;
    beforeLoad();
  } catch (error) {
    thrown = error;
  }
  expect(isRedirect(thrown)).toBe(true);
  expect((thrown as { options: unknown }).options).toMatchObject({ href: FREE_RUN_RSVP_PATH, statusCode: 308 });
  const text = source('src/routes/register.tsx');
  expect(text).not.toMatch(/Stripe|amountInCents|nextRunNumber|nextSaturday/);
});

test('sitemap handler excludes retired registration and preserves discovery pages', async () => {
  const options = SitemapRoute.options as unknown as { server: { handlers: { GET: () => Promise<Response> } } };
  const response = await options.server.handlers.GET();
  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Type')).toBe('application/xml');
  const xml = await response.text();
  expect(xml).not.toContain('/register');
  for (const path of ['/', '/faq', '/resources', '/resources/playbooks/gryt-vs-yinz-run-club']) {
    expect(xml).toContain(`<loc>${SITE_ORIGIN}${path}</loc>`);
  }
});

for (const page of ['playbooks', 'conversations', 'graphics']) {
  test(`${page} uses the production origin for canonical and social URLs`, () => {
    const text = source(`src/routes/resources_.${page}.tsx`);
    expect(text).toContain('SITE_ORIGIN as SITE');
    expect(text).not.toContain('gryt-saturday-crew.lovable.app');
    expect(text).toContain('rel: "canonical", href: URL');
    expect(text).toContain('property: "og:url", content: URL');
  });
}

for (const file of [
  'races.tsx',
  'resources_.playbooks.tsx',
  'resources_.playbooks_.gryt-vs-yinz-run-club.tsx',
  'resources_.playbooks_.best-free-run-clubs-south-hills-2026.tsx',
  'resources_.playbooks_.best-free-running-clubs-pittsburgh-2026.tsx',
  'resources_.playbooks_.fleet-feet-pittsburgh-vs-independent-run-clubs.tsx',
]) {
  test(`${file} links RSVP to the real homepage target`, () => {
    const text = source(`src/routes/${file}`);
    expect(text).not.toContain('hash="first-time"');
    expect(text).toContain('hash="join"');
  });
}

test('shared destinations and homepage anchors agree', () => {
  expect(SITE_ORIGIN).toBe('https://grytrunclub.com');
  expect(FREE_RUN_RSVP_PATH).toBe('/#join');
  const home = source('src/routes/index.tsx');
  expect(home).toContain('id="join"');
  expect(home).toContain('id="first"');
});

test('private account surfaces retain their noindex instructions', () => {
  for (const path of ['auth.tsx', 'admin.roster.tsx', 'members.tsx', 'waiver.tsx']) {
    expect(source(`src/routes/${path}`)).toContain('noindex');
  }
});
