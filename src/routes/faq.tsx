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
    a: "Not at all. Every Saturday the group includes walkers, slow joggers, and faster runners side by side. There is no minimum pace, no cutoff time, and no judgment about how fast you move. We regroup at every turnaround so nobody runs alone and nobody gets dropped at the back. Whether you're running your first mile or training for a marathon, you belong here — all that matters is that you show up.",
  },
  {
    q: "Will I get left behind?",
    a: "Getting left behind is rule number one — it simply doesn't happen here. We hold pockets at every turn and the full group waits at the trailhead until the last person is safely back. If you're new, tell someone at sign-in and we'll personally pair you with a buddy who knows the trail and won't mind going at your pace. No one finishes alone.",
  },
  {
    q: "Do I need to be able to run a 5K without stopping?",
    a: "Not at all. If you can walk comfortably for 30 minutes, you are ready for a GRYT Saturday. Walk-run intervals, frequent walk breaks, and hiking the whole thing are all completely welcome. We have participants of every fitness level, from true beginners to ultramarathon veterans. The only goal is to get outside and move together. Nobody is timing you, and no one will ask about your pace.",
  },
  {
    q: "How much does it cost?",
    a: "GRYT is 100% free to attend — no dues, no membership fees, and no signup required to come on any given Saturday. Donations help keep the coffee flowing, occasional giveaways happening, and the group running smoothly. You can contribute from the Support GRYT section on the homepage if you'd like, but it's entirely optional and never expected. Show up, run, and enjoy — that's all we ask.",
  },
  {
    q: "Do I need to RSVP or just show up?",
    a: "No RSVP needed — just show up and you're in. We meet at 212 Valley Brook Road in McMurray, Peters Township, every Saturday at 7:00 AM. Parking is free in the lot. Look for the group gathered near the trail sign. If it's your first time, arriving 10 minutes early gives you a chance to meet someone and get your bearings before the group heads out onto the trail.",
  },
  {
    q: "Is there a waiver?",
    a: "Yes, a brief liability waiver is required before your first run. The good news is you only sign it once and it covers you for every GRYT run afterward — no re-signing each week or each season. The waiver is available on our Waiver page and takes under a minute to complete. We keep it on file so you'll never be asked to sign again.",
  },
  {
    q: "Is the run club insured?",
    a: "Yes. GRYT Run Club carries general liability insurance for all group runs on the Montour Trail. This coverage protects participants and the organization during officially organized Saturday morning runs. We maintain this insurance year-round as a commitment to runner safety and community responsibility. You can view the current certificate of insurance at any time using the link below.",
    href: insuranceAsset.url,
    hrefLabel: "View proof of insurance (PDF)",
  },
  {
    q: "What should I wear and bring?",
    a: "Wear whatever you normally run or walk in — there's no uniform or dress code. Bring water for any outing longer than 45 minutes, especially in warm months. Layer up in cold weather since the trail has a few exposed sections where wind picks up. In winter, a headlamp is helpful for the first mile or two before sunrise. Reflective or high-visibility gear is always a smart addition when it's dark.",
  },
  {
    q: "What if it rains or snows?",
    a: "We run in the rain and in light snow. The Montour Trail at Valley Brook is mostly crushed limestone under heavy tree cover, so it drains quickly and stays runnable in most weather conditions. We only cancel when lightning is in the immediate area or ice makes the trail genuinely dangerous to use. Always check our Instagram or Strava the morning of any questionable weather day before driving out.",
  },
  {
    q: "Where do you actually run?",
    a: "We run the Montour Trail out of the Valley Brook Road trailhead in McMurray, PA. The surface is flat, crushed limestone under heavy tree cover — easy on joints and runnable year-round. The format is out-and-back, so you control your own distance: turn around at 1 mile, 2 miles, or keep going for a long run. Detailed directions to the trailhead parking lot are available on our homepage.",
  },
  {
    q: "How long is the run?",
    a: "As long as you choose — that's the beauty of the out-and-back format. Most participants cover 3 to 6 miles on a typical Saturday morning. Some regulars push 8 or more miles, and a few keep it to a mile or two. You turn around whenever you're ready, then make your way back to the trailhead. The group gathers at the start and finishes together once everyone has returned.",
  },
  {
    q: "Is it safe for women running solo?",
    a: "Yes. The Montour Trail is well-traveled on Saturday mornings, and GRYT always runs as a group — you're never isolated on the trail unless you choose to be. We have a strong showing of women regulars, including many who came out for the first time not knowing a single person. If safety or comfort is a concern, mention it at sign-in and we'll make sure you're running alongside others the whole way.",
  },
  {
    q: "Can I bring my dog or a stroller?",
    a: "Leashed dogs and running strollers are both welcome. The Montour Trail at Valley Brook is wide, flat, and paved with crushed limestone, making it accessible for strollers and comfortable for dogs of all sizes. We just ask that dogs stay leashed throughout the run, and that strollers start toward the back of the group at the beginning so everyone has room to spread out naturally on the trail.",
  },
  {
    q: "Do I have to come every week?",
    a: "Absolutely not. Come when you can and skip when life gets busy — there are no commitments, no attendance requirements, and zero pressure to show up on any particular schedule. Some regulars come nearly every Saturday, others show up once or twice a month, and some drop in only occasionally. You're always welcome no matter how long it's been since your last run with us.",
  },
  {
    q: "Is there something after the run?",
    a: "Sometimes yes, sometimes no — and that's intentional. After the run wraps up at the trailhead, people often hang around for a parking-lot chat. Other weeks there are informal coffee runs or taco outings at nearby spots. Nothing is scheduled in advance or mandatory. Stay as long as you like, or head straight home — either is perfectly fine. The social side of GRYT grows naturally over time.",
  },
  {
    q: "How do I find out about weekly updates and events?",
    a: "The best way to stay in the loop is to join the GRYT Strava club, linked on our homepage, and follow @grytrunclub on Instagram. That's where route adjustments, same-day weather calls, special event announcements, and real-time updates get posted. We don't run a mailing list or a separate app — Strava and Instagram are the primary channels for everything happening week to week with the South Hills run group.",
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
              These are the questions first-timers actually message us before
              their first Saturday — pace, cost, gear, weather, dogs, kids,
              safety. GRYT Run Club is free, no-signup, and open to every
              fitness level in the South Hills of Pittsburgh. If you don't see
              your question answered here, just show up at 7 AM and someone
              will answer it in person.
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
              The fastest way to get your questions answered is to show up.
              We meet every Saturday at 7 AM at 212 Valley Brook Road in
              McMurray, Peters Township — parking is free and the group is
              easy to spot near the trail sign. Sign the{" "}
              <Link to="/waiver" className="underline underline-offset-4">
                waiver
              </Link>{" "}
              once before your first run and you're set for every run after
              that. New faces are welcome every week, no RSVP needed.
            </p>
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
