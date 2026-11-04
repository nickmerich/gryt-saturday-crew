import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import ogImage from "@/assets/og-playbooks.jpg";

export const PLAYBOOK_SITE = "https://grytrunclub.com";

export type ComparisonConfig = {
  slug: string;
  title: string;
  headline: string;
  description: string;
  published: string;
  modified: string;
  readTime: string;
  keywords: string;
  about: string[];
  breadcrumb: string;
  faqs: Array<{ q: string; a: string }>;
};

/** Shared head() payload for comparison playbooks: meta, canonical, Article + FAQPage + BreadcrumbList JSON-LD. */
export function comparisonHead(c: ComparisonConfig) {
  const url = `${PLAYBOOK_SITE}/resources/playbooks/${c.slug}`;
  const image = `${PLAYBOOK_SITE}${ogImage}`;
  return {
    meta: [
      { title: c.title },
      { name: "description", content: c.description },
      { name: "keywords", content: c.keywords },
      { property: "og:title", content: c.title },
      { property: "og:description", content: c.description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "article:published_time", content: c.published },
      { property: "article:modified_time", content: c.modified },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Community" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: c.title },
      { name: "twitter:description", content: c.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: c.headline,
          description: c.description,
          datePublished: c.published,
          dateModified: c.modified,
          author: { "@type": "Person", name: "Nick Merich", url: `${PLAYBOOK_SITE}/about` },
          publisher: { "@type": "Organization", name: "gryt run club", url: PLAYBOOK_SITE },
          mainEntityOfPage: url,
          image,
          about: c.about,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: c.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Resources", item: `${PLAYBOOK_SITE}/resources` },
            { "@type": "ListItem", position: 2, name: "Playbooks", item: `${PLAYBOOK_SITE}/resources/playbooks` },
            { "@type": "ListItem", position: 3, name: c.breadcrumb, item: url },
          ],
        }),
      },
    ],
  };
}

export function PH2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
      {children}
    </h2>
  );
}

export function CompareTable({
  left,
  right,
  rows,
}: {
  left: string;
  right: string;
  rows: Array<[string, string, string]>;
}) {
  return (
    <div className="overflow-x-auto border border-foreground/15">
      <table className="w-full text-left text-[14px] md:text-[15px] min-w-[560px]">
        <thead>
          <tr className="border-b border-foreground/15 text-foreground">
            <th className="p-3 font-bold uppercase tracking-[0.1em] text-[11px]"> </th>
            <th className="p-3 font-bold uppercase tracking-[0.1em] text-[11px]">{left}</th>
            <th className="p-3 font-bold uppercase tracking-[0.1em] text-[11px]">{right}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b]) => (
            <tr key={k} className="border-b border-foreground/10 align-top">
              <td className="p-3 text-foreground font-bold">{k}</td>
              <td className="p-3">{a}</td>
              <td className="p-3">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComparisonPlaybook({
  config,
  sections,
  quickAnswer,
  sourcesNote,
  children,
}: {
  config: ComparisonConfig;
  sections: Array<{ id: string; label: string }>;
  quickAnswer: ReactNode;
  sourcesNote: ReactNode;
  children: ReactNode;
}) {
  const url = `${PLAYBOOK_SITE}/resources/playbooks/${config.slug}`;
  const updated = new Date(`${config.modified}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[760px] mx-auto">
          <Link to="/resources/playbooks" className="eyebrow text-foreground hover:text-foreground transition-colors">
            ← All playbooks
          </Link>
          <p className="eyebrow text-foreground mt-8 mb-5">
            COMMUNITY · {config.readTime} · BY NICK MERICH
          </p>
          <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,88px)] leading-[0.95]">
            {config.headline}
          </h1>
          <p className="mt-7 text-foreground/75 text-lg md:text-xl leading-[1.55]">{config.description}</p>
          <p className="mt-4 text-foreground/70 text-[14px]">Updated {updated}</p>

          <div className="mt-10 border-l-2 border-blue pl-5 text-foreground/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p className="font-bold text-foreground">Quick answer</p>
            <div className="mt-2 space-y-3">{quickAnswer}</div>
          </div>

          <nav aria-label="Table of contents" className="mt-10 border border-foreground/15 p-5">
            <p className="eyebrow text-foreground/70 mb-3">In this guide</p>
            <ul className="flex flex-col gap-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-foreground/80 hover:text-foreground/70 transition-colors text-[15px]">
                    → {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#faqs" className="text-foreground/80 hover:text-foreground/70 transition-colors text-[15px]">
                  → FAQs
                </a>
              </li>
            </ul>
          </nav>

          <div className="mt-12 space-y-5 text-foreground/85 text-[16px] md:text-[17px] leading-[1.7]">
            {children}

            <PH2 id="faqs">FAQs</PH2>
            <div className="space-y-6">
              {config.faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="text-foreground font-bold text-[17px] md:text-[18px] mb-1.5">{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>

            <p className="text-foreground/70 text-[14px] mt-10">{sourcesNote}</p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              RSVP This Saturday →
            </Link>
            <Link
              to="/resources/playbooks"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-foreground/40 text-foreground hover:border-blue hover:text-foreground/70 transition-colors"
            >
              Back to Playbooks
            </Link>
          </div>
        </div>
        <ShareButtons url={url} title={config.title} />
      </article>
      <SiteFooter />
    </main>
  );
}
