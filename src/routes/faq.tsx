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
    a: "No. Every Saturday we have walkers, joggers, and runners of every pace. Go your own speed — we regroup at turnarounds so nobody runs alone and nobody gets dropped. GRYT is designed around the idea that showing up matters more than pace.",
  },
  {
    q: "Will I get left behind?",
    a: "No — that's rule one. We hold pockets at every turn and the group waits at the trailhead until the last person is back in. If you're new, tell someone at the sign-in and we'll pair you up. No one finishes a GRYT Saturday alone.",
  },
  {
    q: "Do I need to be able to run a 5K without stopping?",
    a: "No. If you can walk for 30 minutes you can do a GRYT Saturday. Walk-run intervals are welcome and common in the group. Nobody is timing you, and nobody will judge your method.",
  },
  {
    q: "How much does it cost?",
    a: "GRYT is completely free to join — no membership fees, no registration, and no recurring charges. We believe running should be accessible to everyone in the South Hills community. Donations keep the coffee and swag going, but they're entirely optional.",
  },
  {
    q: "Do I need to RSVP or just show up?",
    a: "Just show up. Meet at 212 Valley Brook Road in McMurray, Peters Township at 7:00 AM Saturday. Parking is free. Look for the group near the trail sign — if you're new, come 10 minutes early and someone will say hey.",
  },
  {
    q: "Is there a waiver?",
    a: "Yes. Sign it once on the Waiver page and you're good for every run after that. It takes under a minute and only needs to be completed one time. We keep it on file so you never have to sign again.",
  },
  {
    q: "Is the run club insured?",
    a: "Yes. GRYT Run Club carries general liability insurance covering all Saturday group runs. This protects both the club and participants during organized activities. You can view the certificate of insurance any time.",
    href: insuranceAsset.url,
    hrefLabel: "View proof of insurance (PDF)",
  },
  {
    q: "What should I wear and bring?",
    a: "Whatever you'd normally run or walk in. Layers if it's cold, and bring water for anything longer than 45 minutes. In winter, a headlamp helps for the first mile or two before the sun's up. The trail is mostly flat crushed limestone, so trail shoes are not required.",
  },
  {
    q: "What if it rains or snows?",
    a: "We run. Trail is mostly crushed limestone under a tree canopy, so it drains fast. We only cancel for lightning or ice that makes the trail dangerous — check the Instagram or Strava the morning of. Cancellations are rare.",
  },
  {
    q: "Where do you actually run?",
    a: "The Montour / Peters Creek Trail out of the Valley Brook trailhead in McMurray, PA. It's flat, shaded, and out-and-back so you pick your distance — turn around at 1 mile, 2 miles, or go long. Directions and a map are on the homepage.",
  },
  {
    q: "How long is the run?",
    a: "As long as you want. Most people do 3–6 miles, but some go 8+. The group is out on the trail together and we all meet back at the trailhead when we're done. There's no required minimum distance.",
  },
  {
    q: "Is it safe for women running solo?",
    a: "Yes. The trail is busy on Saturday mornings and we run as a group in the South Hills. You'll never be alone unless you want to be. Several of our regulars are women who started as first-timers and kept coming back.",
  },
  {
    q: "Can I bring my dog or a stroller?",
    a: "Leashed dogs and strollers are welcome — the trail is wide and flat enough for both. Just start toward the back so nobody trips over a leash. We have regulars who bring dogs and kids every week.",
  },
  {
    q: "Do I have to come every week?",
    a: "No. Come when you can — some people come every Saturday, some once a month. There's zero pressure or obligation to maintain any schedule. GRYT works for people with busy lives too.",
  },
  {
    q: "Is there something after the run?",
    a: "Sometimes coffee, sometimes tacos, sometimes just a parking-lot chat. Nothing is formal or required. Stay and hang out if you want to, or head home right after — both are completely fine.",
  },
  {
    q: "How do I find out about weekly updates and events?",
    a: "Join the Strava club (linked on the homepage) or follow @grytrunclub on Instagram. That's where route changes, weather calls, and special runs get posted. Checking either one on Friday evening or Saturday morning is the best way to stay current.",
  },
  {
    q: "Is GRYT Run Club affiliated with any national running organization?",
    a: "No. GRYT Run Club is an independent, community-run group based in the South Hills of Pittsburgh, PA. We are not affiliated with Road Runners Club of America (RRCA) or any national organization. That means no bureaucracy — just neighbors showing up to run together every Saturday.",
  },
  {
    q: "What is the meeting location address for the South Hills run club?",
    a: "GRYT meets at 212 Valley Brook Road, McMurray, PA 15317 — the Valley Brook trailhead parking lot for the Montour / Peters Creek Trail. It's in Peters Township, just off Valley Brook Road. Parking is free and the lot is well-marked.",
  },
  {
    q: "How do I join the GRYT Run Club email list or group chat?",
    a: "Follow @grytrunclub on Instagram or join the GRYT Strava club — both are linked on the homepage. That's where group updates, weather calls, and event announcements are posted. You can also just show up on a Saturday morning and ask someone in person.",
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

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "South Hills Run Club FAQ · McMurray, PA | GRYT" },
      {
        name: "description",
        content:
          "Pace, cost, parking, gear, weather, and waiver questions for GRYT — the free South Hills run club meeting Saturdays 7 AM in McMurray, PA.",
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
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <SiteNav />
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
              South Hills Run Club FAQ — GRYT McMurray, PA
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
      <SiteFooter />
    </>

  );
}
