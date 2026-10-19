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
    a: "Not at all. Every Saturday brings a wide mix of walkers, joggers, and runners at every pace level. There is no minimum speed or fitness requirement to show up. We hold regrouping pockets at every turnaround point so that no one gets dropped or left behind. Whether you're training for your first 5K, coming back after time off, or just starting a walking routine, you belong here and will find others moving at a similar pace.",
  },
  {
    q: "Will I get left behind?",
    a: "Never — that's rule one of GRYT. We hold the group at every turn and the whole crew waits at the trailhead until the last person is back in. If you're joining for the first time, tell someone at sign-in and we'll pair you with a regular who knows the trail well. You'll never be alone on the Montour Trail unless you choose to be, and pace pressure from faster runners is not part of how we operate.",
  },
  {
    q: "Do I need to be able to run a 5K without stopping?",
    a: "Absolutely not. If you can walk for 30 minutes, you can do a GRYT Saturday. Walk-run intervals are completely welcome and widely practiced within the group. Nobody is tracking your pace, watching your splits, or judging how much you walk. The goal is simply to get outside, move your body, and enjoy the Montour Trail with friendly company — not to hit any performance standard. Come as you are and go at the effort that feels right.",
  },
  {
    q: "How much does it cost?",
    a: "GRYT is completely free. There are no dues, no registration fees, no membership costs, and no signup required to show up on Saturday morning. Donations help cover coffee, occasional swag, and group supplies — you can chip in through the Support GRYT section on the homepage — but contributing is entirely optional and never expected. You can show up for years without donating a dollar and you'll always be just as welcome as anyone else.",
  },
  {
    q: "Do I need to RSVP or just show up?",
    a: "Just show up — no RSVP, no app, no registration needed. We meet every Saturday at 7:00 AM at the Valley Brook trailhead, 212 Valley Brook Road, McMurray, PA 15317 in Peters Township. Parking in the gravel lot is free. Look for the group gathering near the trail sign at the entrance. If it's your first time, arriving five to ten minutes early makes it easy to introduce yourself before the run gets moving.",
  },
  {
    q: "Is there a waiver?",
    a: "Yes, all participants sign a liability waiver before their first run. You only need to sign it once — it covers every Saturday after that, so you'll never fill out paperwork at the trailhead again. The waiver takes under a minute to complete on our Waiver page online. Completing it before you arrive means you can walk straight to the group, say hello, and get moving without any administrative delay.",
  },
  {
    q: "Is the run club insured?",
    a: "Yes. GRYT Run Club carries general liability insurance covering organized group runs on the Montour Trail. We maintain this coverage as a standard safety measure for the group and the trail. If you need to verify insurance for any reason — a workplace wellness program, a school group, or your own records — the certificate of insurance is available to view or download as a PDF anytime.",
    href: insuranceAsset.url,
    hrefLabel: "View proof of insurance (PDF)",
  },
  {
    q: "What should I wear and bring?",
    a: "Dress in whatever you'd normally run or walk in for the weather. In cooler months, layers work well because the trail runs under a dense tree canopy and temperatures can feel a few degrees colder in the shade than in the parking lot. Bring water if you plan to be out longer than 45 minutes. During winter months when it's still dark at 7 AM, a headlamp or clip-on blinky light makes the first mile or two noticeably more comfortable and visible to others.",
  },
  {
    q: "What if it rains or snows?",
    a: "GRYT runs in the rain. The trail is crushed limestone under a dense tree canopy, so it drains quickly and stays runnable even after a heavy overnight rain. Snow is generally fine as well — the surface packs well and the tree cover cuts down on accumulation. We only cancel when conditions are genuinely unsafe, such as active lightning in the area or ice that makes footing dangerous. Check the GRYT Instagram or Strava the morning of your run; cancellations are posted there as early as possible.",
  },
  {
    q: "Where do you actually run?",
    a: "The group runs the Montour Trail and Peters Creek Trail from the Valley Brook Road trailhead in McMurray, Peters Township, South Hills Pittsburgh. The trail is flat, well-shaded, and follows an out-and-back format so every participant chooses their own distance. Common turnaround points fall at roughly the 1-mile, 2-mile, and 3-mile marks from the trailhead. The surface is crushed limestone — easy underfoot for walkers, joggers, and distance runners alike. Driving directions and a map are available on the homepage.",
  },
  {
    q: "How long is the run?",
    a: "The run is as long as you want it to be. Most participants cover between 3 and 6 miles on a typical Saturday. A smaller group of long-run regulars often goes 8 miles or more. The out-and-back trail format means you turn around at whatever point feels right and head back to the trailhead at your own pace. There is no required distance, and because the group spans a wide range of distances, you'll almost always find someone going roughly the same mileage as you.",
  },
  {
    q: "Is it safe for women running solo?",
    a: "Yes. The Valley Brook trailhead is active on Saturday mornings and the group runs together the whole time, so you're never isolated or alone unless you prefer to be. Many of our regulars are women, including a number who first came by themselves and are now weekly faces in the group. The trail runs through a well-maintained public park with consistent foot and bike traffic throughout the morning. The community has a zero-tolerance approach to any behavior that makes people feel unwelcome.",
  },
  {
    q: "Can I bring my dog or a stroller?",
    a: "Leashed dogs and jogging strollers are both welcome on the run. The Montour Trail is wide, flat, and crushed limestone — ideal for strollers and easy on dogs' paws. We ask that you start toward the back of the group so leashes and strollers don't create tripping hazards for runners heading out at the front. Dogs should be leashed at all times per trail rules, and please bring bags to clean up after your pet.",
  },
  {
    q: "Do I have to come every week?",
    a: "No commitment whatsoever. Some regulars show up every single Saturday without exception; others drop in once or twice a month around work, travel, and family schedules. You're equally welcome whether it's been one week or six months since your last visit. There are no streaks to maintain, no attendance records, and no one keeping track. Show up when it works for you — the group will be there, and they'll be glad to see you.",
  },
  {
    q: "Is there something after the run?",
    a: "Sometimes, yes. There's often an informal gathering in the parking lot after the run ends — coffee, occasional post-run food, or just people stretching and chatting before heading home for the day. Nothing is scheduled or required, but the crowd typically lingers for 15 to 20 minutes. It's one of the best parts of Saturday for getting to know other runners, especially if you're new. Stay as long or as briefly as you like.",
  },
  {
    q: "How do I find out about weekly updates and events?",
    a: "The best two channels are the GRYT Strava club (linked from the homepage) and the @grytrunclub Instagram account. Route changes, weather cancellations, special events, and community news get posted on both platforms — usually the day before or the morning of the run. Instagram is especially useful for same-day weather calls when conditions are borderline. You don't need an account to view the Instagram page, and Strava is free to join. Both are checked regularly by the people who organize each Saturday.",
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
              Frequently
              <br />
              asked questions.
            </h1>
            <p
              className="mt-6 text-lg text-ink/80 max-w-xl"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Everything first-timers ask before their first Saturday at GRYT
              Run Club — pace requirements, cost, parking, gear, weather
              policy, and how the group works. This page covers the South Hills
              Pittsburgh running community on the Montour Trail in McMurray,
              PA. If something isn't answered here, just show up at 7 AM
              Saturday and ask in person.
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
              The fastest way to get your questions answered is to show up at
              the Valley Brook trailhead at 7 AM any Saturday. The community is
              friendly, the trail is flat, and there's no obligation beyond
              signing the{" "}
              <Link to="/waiver" className="underline underline-offset-4">
                waiver
              </Link>{" "}
              once before your first run. GRYT has been welcoming runners of
              every pace in the South Hills since the beginning — whether
              you're returning to fitness, training for a race, or just looking
              for a reason to get outside on a Saturday morning, there's a
              place for you at 212 Valley Brook Road, McMurray, PA 15317.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>

  );
}
