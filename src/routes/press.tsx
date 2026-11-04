import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { siteUrl } from "@/lib/site";
import { PRESS_LINKS } from "@/lib/press";

const TITLE = "GRYT Run Club | Press & Conversations";
const DESC =
  "Coverage, interviews, and event listings featuring GRYT Run Club, the free Saturday run club in Pittsburgh's South Hills.";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/press") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/press") }],
  }),
  component: PressPage,
});

const condensed = { fontFamily: "var(--font-condensed)" };
const body = { fontFamily: "var(--font-body)" };

function MaybeLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <span className="eyebrow text-foreground/70">{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="eyebrow text-foreground hover:text-foreground transition-colors">
      {children} →
    </a>
  );
}

function Item({ outlet, kind, date, links }: { outlet: string; kind: string; date: string; links: { label: string; href: string | null }[] }) {
  return (
    <article className="border-t-2 border-blue pt-6">
      <div className="eyebrow text-foreground/75 mb-3" style={body}>{kind} · {date}</div>
      <h3 className="text-3xl sm:text-4xl uppercase leading-none mb-5" style={condensed}>{outlet}</h3>
      <div className="flex flex-col gap-2">
        {links.map((l) => <MaybeLink key={l.label} href={l.href}>{l.label}</MaybeLink>)}
      </div>
    </article>
  );
}

const LISTINGS = [
  { name: "PoPville", href: PRESS_LINKS.popville },
  { name: "RunWashington", href: PRESS_LINKS.runWashington },
  { name: "Washington FAMILY (CitySpark)", href: PRESS_LINKS.washingtonFamily },
  { name: "Montgomery Magazine (CitySpark)", href: PRESS_LINKS.montgomeryMagazine },
];

function PressPage() {
  return (
    <>
      <SiteNav />
      <main className="bg-background text-foreground">
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="eyebrow text-foreground mb-4" style={body}>Press · GRYT Run Club</div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.92]" style={condensed}>
            <span className="block">Press &amp;</span>
            <span className="block">conversations</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/80 max-w-2xl" style={body}>
            A few places GRYT has shown up. Stories, briefs, and one long conversation about why we started.
          </p>
          <p className="mt-4 text-foreground/70 max-w-2xl" style={body}>
            The best coverage is still the Saturday run. Free, 7 AM, all paces.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-8" style={{ fontFamily: "var(--font-display)" }}>In the news</h2>
          <div className="grid gap-10 md:grid-cols-2">
            <Item outlet="The 51st" kind="Event spotlight" date="July 30, 2026" links={[{ label: "Read the weekend guide", href: PRESS_LINKS.the51stWeekendGuide }]} />
            <Item outlet="TribLIVE" kind="Community briefs" date="Aug 26 & Sep 23, 2026" links={[
              { label: "August brief", href: PRESS_LINKS.tribliveAugustBrief },
              { label: "September brief", href: PRESS_LINKS.tribliveSeptemberBrief },
            ]} />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-8" style={{ fontFamily: "var(--font-display)" }}>In conversation</h2>
          <Item outlet="The Founder Exhale" kind="Founder interview" date="August 1, 2026" links={[{ label: "Listen from 27:32, where Nick talks GRYT", href: PRESS_LINKS.founderExhaleEpisode }]} />
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-8" style={{ fontFamily: "var(--font-display)" }}>Helping people find the starting line</h2>
          <ul className="border-t border-foreground/15">
            {LISTINGS.map((l) => (
              <li key={l.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/15 py-4">
                <span className="text-lg" style={body}>{l.name}</span>
                <MaybeLink href={l.href}>Event listing</MaybeLink>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-4xl sm:text-5xl uppercase leading-[0.92]" style={condensed}>Come run with us</h2>
          <a href="/#join" className="btn-primary inline-block mt-6">RSVP This Saturday →</a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
