import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/should-you-join-a-running-club`;
const TITLE = "Should You Join a Running Club? An Honest Answer · gryt";
const DESCRIPTION =
  "Am I too slow? Do I have to talk? What does it cost? A straight answer to the questions people actually ask before showing up to a run club — from a South Hills Pittsburgh crew.";
const PUBLISHED = "2026-08-31";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "too-slow", label: "\u201cAm I Too Slow?\u201d" },
  { id: "cost", label: "What It Actually Costs" },
  { id: "talking", label: "Do You Have to Talk to Anyone?" },
  { id: "worth-it", label: "What You Actually Get Out of It" },
  { id: "not-for-you", label: "When a Run Club Isn\u2019t for You" },
  { id: "first-time", label: "How to Show Up the First Time" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Am I too slow to join a running club?",
    a: "No. A no-drop club is built so pace doesn't decide who belongs. At GRYT someone always runs the back of the pack, and the group regroups at intersections and turnarounds. If you can cover the distance at any pace, you can run with us.",
  },
  {
    q: "How much does a running club cost?",
    a: "GRYT is free. There is no membership fee, no dues, and nothing to buy. Some clubs are store-affiliated or charge seasonal dues — ask before you go so there are no surprises.",
  },
  {
    q: "Do I have to run the whole distance?",
    a: "No. Turn around whenever you want. Out-and-back routes make it easy to cut a run short without leaving the group behind.",
  },
  {
    q: "What if I don't know anyone?",
    a: "Most people show up alone the first time. Come ten minutes early, stand near the trail sign, and someone will introduce themselves. That's the whole system.",
  },
  {
    q: "How often do I have to show up?",
    a: "As often as you want. Some people run every Saturday, some show up once a month. There's no attendance requirement and no one keeps score.",
  },
  {
    q: "What should I bring to my first run?",
    a: "Shoes you've run in before, water, and layers you can ditch in the car. Everything else is optional.",
  },
];

export const Route = createFileRoute(
  "/resources_/should-you-join-a-running-club",
)({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "should i join a running club, am i too slow for a run club, run club near me, running club pittsburgh, south hills run club, no drop run club",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Community" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Should You Join a Running Club? An Honest Answer",
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
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
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
            {
              "@type": "ListItem",
              position: 1,
              name: "Resources",
              item: `${SITE}/resources`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Should You Join a Running Club?",
              item: URL,
            },
          ],
        }),
      },
    ],
  }),
  component: ShouldYouJoinPage,
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2 marker:text-blue">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function ShouldYouJoinPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[760px] mx-auto">
          <Link
            to="/resources"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All resources
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">
            COMMUNITY · 6 MIN READ · BY NICK MERICH
          </p>
          <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,88px)] leading-[0.95]">
            Should You Join a Running Club? An Honest Answer
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            Nobody hesitates because they don't know where the trailhead is.
            They hesitate because they think they'll be the slowest person
            there.
          </p>

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-paper/15 p-5"
          >
            <p className="eyebrow text-paper/55 mb-3">In this post</p>
            <ul className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-paper/80 hover:text-blue transition-colors text-[15px]"
                  >
                    → {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-5 text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>
              We've watched a lot of people stand in the parking lot at 6:52 AM
              deciding whether to get out of the car. Almost none of them were
              worried about the route. Here's the straight version of what
              they're actually asking.
            </p>

            <H2 id="too-slow">"Am I Too Slow?"</H2>
            <p>
              This is the question. It's under every other question. And the
              answer depends entirely on one thing: whether the club is
              no-drop.
            </p>
            <p className="border-l-2 border-blue pl-5 italic text-paper/90">
              No-drop means the group's pace is set by the back of the pack, not
              the front. Nobody finishes alone.
            </p>
            <p>
              At GRYT that's structural, not a courtesy. Someone runs the back
              every week. We regroup at intersections and at the turnaround. A
              14-minute mile and an 8-minute mile end the run in the same place,
              at the same time, having had the same conversation.
            </p>
            <p>
              If a club doesn't say no-drop anywhere, ask before you show up.
              A club that can't answer that question clearly is telling you the
              answer.
            </p>

            <H2 id="cost">What It Actually Costs</H2>
            <p>
              Run clubs fall into a few buckets, and the price tells you a lot
              about what you're walking into:
            </p>
            <Bullets
              items={[
                "Free community clubs — no dues, no signup, show up when you can. GRYT is one of these.",
                "Store-affiliated clubs — free to run, but built around a retailer and its calendar.",
                "Coached or dues-based clubs — a few hundred dollars a season for structured training and a coach.",
              ]}
            />
            <p>
              None of these are wrong. But if you're not sure you'll like
              running with people, start with a free one. There's nothing to
              cancel if it isn't for you.
            </p>

            <H2 id="talking">Do You Have to Talk to Anyone?</H2>
            <p>
              No. You can run the whole thing in silence and nobody will think
              anything of it. Plenty of people do that for their first two or
              three runs.
            </p>
            <p>
              What tends to happen is that around mile two the group naturally
              breaks into pairs and the conversation starts on its own. You
              don't have to make it happen. You just have to be there when it
              does.
            </p>

            <H2 id="worth-it">What You Actually Get Out of It</H2>
            <p>
              The performance research on group running is real — people run
              slightly faster and considerably longer in company than alone. But
              that's not the main thing.
            </p>
            <p className="text-paper font-bold">The main thing is this:</p>
            <Bullets
              items={[
                "Expectation beats motivation. Motivation is gone by week three. Six people expecting you at 7 AM is not.",
                "You stop negotiating with yourself. The run is already scheduled and already decided.",
                "Easy runs stay easy. Talking pace is a built-in governor on the days you'd otherwise push too hard.",
                "You get local knowledge for free — routes, races, shoes, hills, which trail floods after rain.",
              ]}
            />
            <p>
              Most people join for the miles and stay for the second part.
              That's the honest pattern.
            </p>

            <H2 id="not-for-you">When a Run Club Isn't for You</H2>
            <p>
              A few real cases where the answer is no, at least for now:
            </p>
            <Bullets
              items={[
                "You're deep in a structured plan with precise interval targets that a group pace would wreck.",
                "Running is your only hour alone all week and you need it that way. That's a legitimate reason.",
                "The only club near you is pace-gated and you'd spend every week chasing taillights.",
              ]}
            />
            <p>
              Even then — one Saturday a month with a group tends to be additive,
              not disruptive.
            </p>

            <H2 id="first-time">How to Show Up the First Time</H2>
            <p>
              For GRYT specifically: we meet Saturdays at 7:00 AM at 212 Valley
              Brook Road in McMurray, at the Peters Township trailhead. Parking
              is free and easy.
            </p>
            <Bullets
              items={[
                "Come ten minutes early. Stand near the trail sign — someone will say hey.",
                "Wear shoes you've already run in. First-run day is not new-shoe day.",
                "Bring water and layers you can leave in the car.",
                "Turn around whenever you want. It's an out-and-back.",
              ]}
            />
            <p>
              You don't need to introduce yourself to the group, sign up in
              advance, or tell anyone your pace. Show up, run, see how it feels.
            </p>

            <H2 id="faqs">FAQs</H2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="text-paper font-bold text-[17px] md:text-[18px] mb-1.5">
                    {f.q}
                  </h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>

            <p className="text-paper text-lg md:text-xl font-bold mt-12">
              If you're still deciding, the decision is smaller than it feels.
              It's one Saturday morning.
            </p>
            <p className="text-paper/70">— Nick Merich</p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="run" className="btn-primary">
              See Saturday's run →
            </Link>
            <Link
              to="/resources"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
            >
              Back to Resources
            </Link>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
