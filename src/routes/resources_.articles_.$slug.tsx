import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import { ARTICLES } from "@/lib/articles-index";
import { TOPICS } from "@/lib/library";
import { parseFrontmatter, renderMarkdown } from "@/lib/markdown";
import ogImage from "@/assets/og-playbooks.jpg";

const SITE = "https://grytrunclub.com";

const SOURCES = import.meta.glob("/src/content/articles/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

export const Route = createFileRoute("/resources_/articles_/$slug")({
  loader: async ({ params }) => {
    const meta = ARTICLES.find((a) => a.slug === params.slug);
    const load = SOURCES[`/src/content/articles/${params.slug}.md`];
    if (!meta || !load) throw notFound();
    const raw = await load();
    const { body } = parseFrontmatter(raw);
    const { html, headings } = renderMarkdown(body);
    return { meta, html, headings };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Article not found · gryt" }, { name: "robots", content: "noindex" }] };
    const a = loaderData.meta;
    const url = `${SITE}/resources/articles/${a.slug}`;
    const image = `${SITE}${ogImage}`;
    const title = `${a.title} · gryt`;
    return {
      meta: [
        { title },
        { name: "description", content: a.description },
        { property: "og:title", content: title },
        { property: "og:description", content: a.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "gryt run club" },
        { property: "og:image", content: image },
        { property: "article:published_time", content: a.published },
        { property: "article:modified_time", content: a.updated },
        { property: "article:author", content: "Nick Merich" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: a.description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.description,
            datePublished: a.published,
            dateModified: a.updated,
            author: { "@type": "Person", name: "Nick Merich", url: `${SITE}/about` },
            publisher: { "@type": "Organization", name: "gryt run club", url: SITE },
            mainEntityOfPage: url,
            image,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE}/resources` },
              { "@type": "ListItem", position: 2, name: "Articles", item: `${SITE}/resources/articles` },
              { "@type": "ListItem", position: 3, name: a.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <main className="bg-background text-foreground min-h-screen">
      <SiteNav />
      <div className="max-w-[760px] mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold">That article isn't here.</h1>
        <Link to="/resources/articles" className="text-foreground underline underline-offset-4 mt-6 inline-block">
          See all articles
        </Link>
      </div>
      <SiteFooter />
    </main>
  ),
});

const PROSE =
  "text-foreground/85 text-[16px] md:text-[17px] leading-[1.7] " +
  "[&_p]:my-5 " +
  "[&_h2]:text-foreground [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:leading-tight [&_h2]:scroll-mt-24 " +
  "[&_h3]:text-foreground [&_h3]:font-bold [&_h3]:text-[18px] md:[&_h3]:text-[20px] [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:scroll-mt-24 " +
  "[&_ul]:my-5 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-5 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:my-1.5 [&_li]:pl-1 " +
  "[&_a]:text-blue [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-foreground " +
  "[&_strong]:text-foreground [&_strong]:font-bold " +
  "[&_code]:bg-foreground/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-blue [&_blockquote]:pl-5 [&_blockquote]:text-foreground/75 " +
  "[&_hr]:border-foreground/15 [&_hr]:my-10 " +
  "[&_.md-table]:my-7 [&_.md-table]:overflow-x-auto [&_.md-table]:border [&_.md-table]:border-foreground/20 " +
  "[&_table]:w-full [&_table]:text-[14.5px] [&_table]:leading-[1.5] [&_table]:border-collapse " +
  "[&_th]:text-left [&_th]:text-foreground [&_th]:font-bold [&_th]:bg-foreground/[0.06] [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:border-b [&_th]:border-foreground/20 " +
  "[&_td]:px-3.5 [&_td]:py-2.5 [&_td]:border-t [&_td]:border-foreground/10 [&_td]:align-top";

function fmtDate(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function ArticlePage() {
  const { meta, html, headings } = Route.useLoaderData();
  const url = `${SITE}/resources/articles/${meta.slug}`;
  const topicLabel = TOPICS.find((t) => t.id === meta.topic)?.label ?? "Training";
  const related = ARTICLES.filter((a) => a.slug !== meta.slug && a.topic === meta.topic).slice(0, 3);
  const toc = headings.filter((h) => h.level === 2);

  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[760px] mx-auto">
          <nav aria-label="Breadcrumb" className="eyebrow text-foreground flex flex-wrap gap-2">
            <Link to="/resources" className="hover:text-foreground transition-colors">Resources</Link>
            <span aria-hidden="true">/</span>
            <Link to="/resources/articles" className="hover:text-foreground transition-colors">Articles</Link>
          </nav>
          <p className="eyebrow text-foreground mt-8 mb-5">
            {topicLabel.toUpperCase()} · {meta.minutes} MIN READ
          </p>
          <h1 className="display-condensed uppercase text-[clamp(36px,6vw,80px)] leading-[0.95]">{meta.title}</h1>
          <p className="mt-7 text-foreground/75 text-lg md:text-xl leading-[1.55]">{meta.description}</p>
          <p className="mt-5 text-foreground/70 text-[13px]">
            By Nick Merich · Updated <time dateTime={meta.updated}>{fmtDate(meta.updated)}</time>
          </p>

          {toc.length >= 3 ? (
            <nav aria-label="Table of contents" className="mt-10 border border-foreground/15 p-5">
              <p className="eyebrow text-foreground/70 mb-3">In this article</p>
              <ul className="flex flex-col gap-2">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-foreground/80 hover:text-foreground/70 transition-colors text-[15px]">
                      → {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className={`mt-10 ${PROSE}`} dangerouslySetInnerHTML={{ __html: html }} />

          <aside className="mt-14 border border-blue bg-blue/[0.06] p-6 md:p-8">
            <p className="eyebrow text-foreground mb-3">Run with us in the South Hills</p>
            <p className="text-foreground/85 leading-[1.65]">
              GRYT Run Club meets every Saturday at 7:00 AM at 212 Valley Brook Road, McMurray, on the Montour/Peters
              Trail. About 4 miles out and back, free, no-drop, walkers welcome, coffee after.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/" className="bg-blue text-ink font-bold px-5 py-3 hover:bg-foreground hover:text-background transition-colors">
                RSVP for Saturday
              </Link>
              <Link to="/faq" className="border border-foreground/30 px-5 py-3 hover:border-blue transition-colors">
                Read the FAQ
              </Link>
            </div>
          </aside>

          <div className="mt-10">
            <ShareButtons url={url} title={meta.title} />
          </div>

          {related.length ? (
            <section className="mt-14" aria-labelledby="related-title">
              <h2 id="related-title" className="eyebrow text-foreground/70 mb-4">
                Keep reading
              </h2>
              <ul className="grid gap-px bg-foreground/20 border border-foreground/20">
                {related.map((r) => (
                  <li key={r.slug} className="bg-background">
                    <Link
                      to="/resources/articles/$slug"
                      params={{ slug: r.slug }}
                      className="block p-5 hover:bg-blue hover:text-ink transition-colors"
                    >
                      <span className="font-bold text-[17px] leading-tight">{r.title}</span>
                      <span className="block mt-1 text-[14px] opacity-75">{r.minutes} min read</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
