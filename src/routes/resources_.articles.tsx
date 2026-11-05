import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ARTICLES } from "@/lib/articles-index";
import { TOPICS, type Topic } from "@/lib/library";
import ogImage from "@/assets/og-playbooks.jpg";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/articles`;
const TITLE = "Running Articles: Training, Gear, Racing & Clubs · gryt";
const DESCRIPTION =
  "Free running articles from GRYT Run Club: beginner training plans, pacing, gear, apps, racing tips, and how to find a run club that fits.";

export const Route = createFileRoute("/resources_/articles")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: `${SITE}${ogImage}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "GRYT running articles",
          url: URL,
          description: DESCRIPTION,
          hasPart: ARTICLES.map((a) => ({
            "@type": "Article",
            headline: a.title,
            url: `${SITE}/resources/articles/${a.slug}`,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE}/resources` },
            { "@type": "ListItem", position: 2, name: "Articles", item: URL },
          ],
        }),
      },
    ],
  }),
  component: ArticlesIndex,
});

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } as const;

function ArticlesIndex() {
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ARTICLES.filter((a) => (topic === "all" ? true : a.topic === topic)).filter((a) =>
      needle ? `${a.title} ${a.description}`.toLowerCase().includes(needle) : true,
    );
  }, [topic, q]);

  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-16 md:pt-24 pb-24">
        <Link to="/resources" className="eyebrow text-foreground hover:text-foreground transition-colors">
          ← All resources
        </Link>
        <h1
          className="mt-8 uppercase text-[clamp(44px,8vw,120px)] leading-[0.9] tracking-tight"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Running articles
        </h1>
        <p className="mt-6 max-w-[640px] text-foreground/80 text-[17px] leading-[1.65]">
          Plain-language guides on training, pacing, gear, apps, racing, and finding your people. Written for everyday
          runners, fact-checked, and updated as things change.
        </p>

        <div className="mt-12 flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between mb-8">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by topic">
            {TOPICS.map((t) => {
              const count = t.id === "all" ? ARTICLES.length : ARTICLES.filter((a) => a.topic === t.id).length;
              if (!count) return null;
              const active = topic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTopic(t.id)}
                  className={`px-3.5 py-2 text-[13px] border transition-colors ${
                    active ? "bg-blue text-ink border-blue font-bold" : "border-foreground/30 text-foreground/85 hover:border-blue"
                  }`}
                >
                  {t.label} <span className={active ? "text-ink/60" : "text-foreground/70"}>{count}</span>
                </button>
              );
            })}
          </div>
          <label className="relative block lg:w-[280px]">
            <span className="sr-only">Search articles</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: pace, shoes, 5K…"
              className="w-full bg-background border border-foreground/30 px-4 py-2.5 text-[14px] placeholder:text-foreground/55 focus:outline-none focus:border-blue"
            />
          </label>
        </div>

        <ul className="grid gap-px bg-foreground/20 border border-foreground/20 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <li key={a.slug} className="bg-background">
              <Link
                to="/resources/articles/$slug"
                params={{ slug: a.slug }}
                className="group flex flex-col h-full p-6 md:p-7 hover:bg-blue hover:text-ink transition-colors"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-foreground group-hover:text-ink" style={mono}>
                    {a.minutes} min read
                  </span>
                  <span className="text-[11px] tracking-[0.16em] uppercase text-foreground/70 group-hover:text-ink/60" style={mono}>
                    {TOPICS.find((t) => t.id === a.topic)?.label}
                  </span>
                </span>
                <span
                  className="mt-4 block text-[20px] md:text-[22px] font-bold leading-[1.18] tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {a.title}
                </span>
                <span className="mt-3 block text-[14.5px] leading-[1.6] text-foreground/75 group-hover:text-ink/80 flex-1">
                  {a.description}
                </span>
                <span className="mt-5 text-[12px] tracking-[0.22em] uppercase" style={mono}>
                  Read →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {items.length === 0 ? <p className="mt-6 text-foreground/70">Nothing matches that yet.</p> : null}
      </div>
      <SiteFooter />
    </main>
  );
}
