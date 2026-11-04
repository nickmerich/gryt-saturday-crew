import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import ogImage from "@/assets/og-conversations.jpg";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/more-than-miles`;
const TITLE =
  "More Than Miles: 5 Things You Wouldn't Guess From the Parking Lot · gryt run club";
const DESCRIPTION =
  "A Boston-standard marathoner waiting for the last runner, a 64-minute PR in 23 weeks, and route maps drawn by a real cartographer. Five things you'd never guess about GRYT Run Club.";
const PUBLISHED = "2026-07-27";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "patient-fast", label: "The person waiting for the last runner has a 3:25 marathon" },
  { id: "sixty-four", label: "I cut 64 minutes off my marathon in 23 weeks" },
  { id: "front-of-pack", label: "The front of the pack is quietly stacked" },
  { id: "cartographer", label: "Our route maps are made by an actual cartographer" },
  { id: "families", label: "Families keep the whole thing running" },
  { id: "road-ahead", label: "The road ahead" },
];

export const Route = createFileRoute("/resources_/more-than-miles")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "GRYT Run Club, Pittsburgh run club, South Hills running club, McMurray running club, Montour Trail, marathon PR, Boston qualifier, community running",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: `${SITE}${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Community" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE}${ogImage}` },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline:
            "More Than Miles: 5 Things You Wouldn't Guess From the Parking Lot",
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          author: { "@type": "Person", name: "Nick Merich" },
          publisher: {
            "@type": "Organization",
            name: "gryt run club",
            url: SITE,
          },
          mainEntityOfPage: URL,
          image: `${SITE}${ogImage}`,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE}/resources` },
            { "@type": "ListItem", position: 2, name: "More Than Miles", item: URL },
          ],
        }),
      },
    ],
  }),
  component: StoryPage,
});

function StoryPage() {
  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[760px] mx-auto">
          <Link
            to="/resources"
            className="eyebrow text-foreground hover:text-foreground transition-colors"
          >
            ← All resources
          </Link>
          <p className="eyebrow text-foreground mt-8 mb-5">COMMUNITY · 6 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            More Than Miles: 5 Things You Wouldn't Guess From the Parking Lot
          </h1>
          <p className="mt-7 text-foreground/75 text-lg md:text-xl leading-[1.55]">
            Every Saturday at 7 AM, a group of us meets at the Valley Brook Road
            trailhead in McMurray. From the parking lot, it looks simple.
          </p>

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-foreground/15 p-5"
          >
            <p className="eyebrow text-foreground/70 mb-3">In this story</p>
            <ul className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-foreground/80 hover:text-foreground/70 transition-colors text-[15px]"
                  >
                    → {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-5 text-foreground/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>Every Saturday at 7 AM, a group of us meets at the Valley Brook Road trailhead in McMurray.</p>
            <p>From the parking lot, it looks simple. Neighbors. Miles. Coffee after.</p>
            <p>That's on purpose. Most running groups are either too intimidating or too casual. We built GRYT for the people in the middle — former athletes, busy parents, comeback runners. People who want to train seriously without losing the reason it's fun.</p>
            <p>But look closer at who's standing in that parking lot, and the story gets interesting.</p>
            <p>Here are five things about GRYT you wouldn't guess at first glance.</p>

            <h2 id="patient-fast" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              1. The person waiting for the last runner has a 3:25 marathon
            </h2>
            <p>Laura leads our no-drop group. Nobody gets left behind. Coffee in the parking lot after.</p>
            <p>Her PR is 3:25:24 at Mountains 2 Beach — already inside the Boston-qualifying standard for her age group. She's run New York. She's run CIM.</p>
            <p>She could chase splits every Saturday. Instead she runs at the pace of whoever showed up.</p>
            <p>Jenn Cicchini is the same way. She's an official Pittsburgh Marathon pace-team leader, and her whole philosophy is our unofficial north star: races are meant to be enjoyed, and running with people makes it mean something.</p>
            <p className="border-l-2 border-blue pl-5 italic text-foreground/90">
              The fastest people in our club are the most patient ones. That's not an accident.
            </p>

            <h2 id="sixty-four" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              2. I cut 64 minutes off my marathon in 23 weeks
            </h2>
            <p>In May 2025, I finished the Pittsburgh Marathon in 5:18:15. That's a 12:08 mile, for over five hours.</p>
            <p>Twenty-three weeks later, I crossed the line at Columbus in 4:13:33. A 9:40 pace.</p>
            <p>Sixty-four minutes, gone in one season. Not because of a secret plan. Because I stopped training alone.</p>
            <p>There's a full-circle piece to this. My first recorded race was a trail half marathon in 2014, in Venetia, PA — ten minutes from the trailhead where we meet now. A decade later, I came back to the same ground and ran over an hour faster.</p>
            <p>Consistency compounds. Especially when people are expecting you at 7 AM.</p>

            <h2 id="front-of-pack" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              3. The front of the pack is quietly stacked
            </h2>
            <p>GRYT is built for beginners. But run near the front and you'll notice something.</p>
            <p>Ian Baun raced ITU world-series triathlons, qualified for PIAA states, and has run a 4:44 mile. Around Pittsburgh, he's known from the Freddie Fu Cycling Team.</p>
            <p>Izzy DiGnazio played lacrosse at Jefferson — her 2014 team was good enough that she went into the Jefferson Athletics Hall of Fame with the Class of 2025.</p>
            <p>Ben Brown is a career Army officer, Ranger, Airborne-qualified, and a former assistant cross-country coach at Pitt-Greensburg.</p>
            <p>None of them lead with any of that. But when you have a question about pacing or mechanics, someone in the parking lot has answered it at a level most run clubs never touch.</p>

            <h2 id="cartographer" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              4. Our route maps are made by an actual cartographer
            </h2>
            <p>The club runs on what people bring from their day jobs.</p>
            <p>Jay Wysocki leads AI recruiting strategy and thinks about the club the way he thinks about systems. Jack Hareza is a Senior Finance Manager at Twitch and keeps our commerce ideas honest. And our route maps and elevation profiles are built with help from Dan Barley — a credentialed GIS professional and Senior GIS Analyst.</p>
            <p>Yes, our Saturday routes are mapped by someone who does this professionally.</p>
            <p>Nobody asked anyone to do this. That's what happens when people feel like a club is theirs.</p>

            <h2 id="families" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              5. Families keep the whole thing running
            </h2>
            <p>The glue in this club isn't the schedule. It's the pairs.</p>
            <p>At the 2022 Harvest Moon 10 Miler, Jay Wysocki and his son Caleb ran with back-to-back bibs — 830 and 831. Jay was 61. Caleb was 28. Jay beat him by about seven minutes.</p>
            <p>Lizeth Bayona and David Andromalos took it on the road, racing the CARA Lakefront 10 Miler in Chicago in 2026 with bibs 1254 and 1255.</p>
            <p>Motivation dips for everyone. But when your dad, your partner, or your Saturday crew is holding a bib next to yours, you show up anyway. That's the whole system.</p>

            <h2 id="road-ahead" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              The road ahead
            </h2>
            <p>A Hall of Fame athlete and a comeback runner, sharing the same trail. A 64-minute PR celebrated over parking-lot coffee.</p>
            <p>That's what we mean by doing hard things together.</p>
            <p>Laura will be at the trailhead Saturday at 7. So will Jenn. So will I.</p>
            <p className="text-foreground text-lg md:text-xl font-bold">
              Come find out what your comeback looks like.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              See Saturday's run →
            </Link>
            <Link
              to="/resources"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-foreground/40 text-foreground hover:border-blue hover:text-foreground/70 transition-colors"
            >
              Back to Resources
            </Link>
          </div>
        </div>
        <ShareButtons url={URL} title={TITLE} />
      </article>
      <SiteFooter />
    </main>
  );
}
