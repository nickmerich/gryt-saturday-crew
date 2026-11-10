import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PLAYBOOK_LASTMOD } from "../src/lib/sitemap-dates";
import { ARTICLES } from "../src/lib/articles-index";

// Search engines only trust <lastmod> when it is accurate, so the sitemap
// dates have to match the modified date each page shows and puts in its schema.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("sitemap lastmod", () => {
  test("playbook dates match the modified date in each route file", () => {
    const slugs = Object.keys(PLAYBOOK_LASTMOD);
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      const file = resolve(import.meta.dir, `../src/routes/resources_.playbooks_.${slug}.tsx`);
      const source = readFileSync(file, "utf8");
      const match = source.match(/(?:const MODIFIED = |\bmodified: )"(\d{4}-\d{2}-\d{2})"/);
      expect({ slug, modified: match?.[1] }).toEqual({ slug, modified: PLAYBOOK_LASTMOD[slug] });
    }
  });

  test("every article has a valid updated date that is not before its publish date", () => {
    for (const a of ARTICLES) {
      expect({
        slug: a.slug,
        valid: ISO_DATE.test(a.updated) && ISO_DATE.test(a.published),
      }).toEqual({
        slug: a.slug,
        valid: true,
      });
      expect({ slug: a.slug, ordered: a.updated >= a.published }).toEqual({
        slug: a.slug,
        ordered: true,
      });
    }
  });
});
