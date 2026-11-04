import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import insuranceAsset from "@/assets/certificate-of-insurance.pdf.asset.json";

type FAQ = { q: string; a: string; href?: string; hrefLabel?: string };

const FAQS: FAQ[] = [
  {
    q: "Am I too slow to join GRYT?",
    a: "No. Every Saturday we have walkers, joggers, and runners. Go your pace. We regroup at turnarounds so nobody runs alone and nobody gets dropped.",
  },
  {
    q: "Will I get left behind?",
    a: "No — that's rule one. We hold pockets at every turn and the group waits at the trailhead until the last person is back in. If you're new, tell someone at the sign-in and we'll pair you up.",
  },
  {
    q: "Do I need to be able to run a 5K without stopping?",
    a: "No. If you can walk for 30 minutes you can do a GRYT Saturday. Walk-run intervals are welcome. Nobody is timing you.",
  },
  {
    q: "How much does it cost?",
    a: "It's free. There are no dues, no membership fees, and no signup required. Donations keep the coffee and swag going — you can chip in from the Support GRYT block on the homepage, but it's optional.",
  },
  {
    q: "Do I need to RSVP or just show up?",
    a: "Just show up. Meet at 212 Valley Brook Road in McMurray, Peters Township at 7:00 AM Saturday. Parking is free. Look for the group near the trail sign — if you're new, come 10 minutes early and someone will say hey.",
  },
  {
    q: "Is there a waiver?",
    a: "Yes. Sign it once on the Waiver page and you're good for every run after that. It takes under a minute.",
  },
  {
    q: "Is the run club insured?",
    a: "Yes. GRYT Run Club carries general liability insurance. You can view the certificate of insurance any time.",
    href: insuranceAsset.url,
    hrefLabel: "View proof of insurance (PDF)",
  },
  {
    q: "What should I wear and bring?",
    a: "Whatever you'd normally run in. Layers if it's cold. Bring water for anything longer than 45 minutes. In winter, a headlamp helps for the first mile or two before the sun's up.",
  },
  {
    q: "What if it rains or snows?",
    a: "We run. Trail is mostly crushed limestone under a tree canopy, so it drains fast. We only cancel for lightning or ice that makes the trail dangerous — check the Instagram or Strava the morning of.",
  },
  {
    q: "Where do you actually run?",
    a: "The Montour / Peters Creek Trail out of the Valley Brook trailhead in McMurray. Flat, shaded, out-and-back. You pick your distance — turn around at 1 mile, 2 miles, or go long. Directions are on the homepage.",
  },
  {
    q: "How long is the run?",
    a: "As long as you want. Most people do 3–6 miles. Some go 8+. The group is out on the trail together, then we meet back at the trailhead.",
  },
  {
    q: "Is it safe for women running solo?",
    a: "Yes. The trail is busy on Saturday mornings and we run as a group. You'll never be alone unless you want to be. Several of our regulars are women who started as first-timers.",
  },
  {
    q: "Can I bring my dog or a stroller?",
    a: "Leashed dogs and strollers are welcome — the trail is wide and flat. Just start toward the back so nobody trips over a leash.",
  },
  {
    q: "Do I have to come every week?",
    a: "No. Come when you can. Some people come every Saturday, some once a month. Zero pressure.",
  },
  {
    q: "Is there something after the run?",
    a: "Sometimes coffee, sometimes tacos, sometimes just a parking-lot chat. Nothing formal. Stay if you want to.",
  },
  {
    q: "How do I find out about weekly updates and events?",
    a: "Join the Strava club (linked on the homepage) or follow @grytrunclub on Instagram. That's where route changes, weather calls, and special runs get posted.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const SPORTS_CLUB_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: "GRYT Run Club Pittsburgh",
  url: "https://grytrunclub.com",
  logo: "https://grytrunclub.com/logo.png",
  description:
    "A free, inclusive run club based in Pittsburgh, PA welcoming runners of all paces every Saturday morning.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pittsburgh",
    addressRegion: "PA",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.instagram.com/grytrunclub",
    "https://www.facebook.com/grytrunclub",
    "https://x.com/grytrunclub",
  ],
  event: {
    "@type": "Event",
    name: "GRYT Saturday Morning Run",
    startDate: "2025-01-04",
    eventSchedule: {
      "@type": "Schedule",
      repeatFrequency: "P1W",
      byDay: "https://schema.org/Saturday",
    },
  },
};

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "South Hills Run Club FAQ · McMurray, PA | GRYT" },
      {
        name: "description",
        content:
          "Pace, cost, parking, gear, weather, and waiver questions for GRYT, the free South Hills run club meeting Saturdays 7 AM in McMurray, PA.",
      },
      { property: "og:title", content: "South Hills Run Club FAQ · McMurray, PA | GRYT" },
      {
        property: "og:description",
        content:
          "Am I too slow? Where do I park in McMurray? What if it rains? Everything a first-timer asks before a South Hills Saturday run.",
      },

      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://grytrunclub.com/faq" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(FAQ_JSON_LD),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(SPORTS_CLUB_JSON_LD),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <SiteNav />
      <main id="main-content">
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <div className="mb-10 sm:mb-14">
            <div
              className="eyebrow text-ink/60 mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              BEFORE YOU SHOW UP
            </div>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.92] tracking-tight"
              style={{ fontFamily: "var(--font-display-condensed)" }}
            >
              South Hills run club
              <br />
              FAQ.
            </h1>
            <p
              className="mt-6 text-lg text-ink/80 max-w-xl"
              style={{ fontFamily: "var(--font-body)" }}
            >
              The stuff first-timers actually message us about. If you don't
              see your question here, just show up — we'll answer it in
              person at 7 AM Saturday.
            </p>
          </div>

          <h2 className="sr-only">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="border-t border-ink/15">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-ink/15"
              >
                <AccordionTrigger
                  className="text-left text-lg sm:text-xl py-5 hover:no-underline"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent
                  className="text-base text-ink/80 leading-relaxed pb-5"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {f.a}
                  {f.href ? (
                    <>
                      {" "}
                      <a
                        href={f.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-ink"
                      >
                        {f.hrefLabel ?? "Learn more"}
                      </a>
                    </>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-14 border border-ink/15 p-6 sm:p-8 bg-ink/[0.02]">
            <div
              className="eyebrow text-ink/60 mb-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              STILL WONDERING?
            </div>
            <h2
              className="text-3xl sm:text-4xl uppercase leading-tight"
              style={{ fontFamily: "var(--font-display-condensed)" }}
            >
              Just come Saturday.
            </h2>
            <p
              className="mt-3 text-ink/80"
              style={{ fontFamily: "var(--font-body)" }}
            >
              7 AM · 212 Valley Brook Road, McMurray. Sign the{" "}
              <Link to="/waiver" className="underline underline-offset-4">
                waiver
              </Link>{" "}
              once and you're set.
            </p>
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>

  );
}
