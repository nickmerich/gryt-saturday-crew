import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import heroAsset from "@/assets/pre-run-nutrition.png.asset.json";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/what-to-eat-before-a-run`;
const OG_IMAGE = `${SITE}${heroAsset.url}`;
const TITLE = "What to Eat Before a Run: Timing & Portions · gryt run club";
const DESCRIPTION =
  "Pre-run nutrition that actually works: how long before a run to eat, portion sizes, foods that hold up, foods that cause problems, and what to eat after.";
const PUBLISHED = "2026-08-31";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "one-rule", label: "The One Rule That Covers Most Situations" },
  { id: "two-three", label: "Eating 2 to 3 Hours Before" },
  { id: "thirty-sixty", label: "Eating 30 to 60 Minutes Before" },
  { id: "morning", label: "Running First Thing in the Morning" },
  { id: "works", label: "Foods That Consistently Work" },
  { id: "problems", label: "Foods That Tend to Cause Problems" },
  { id: "hydration", label: "Hydration Is Part of This" },
  { id: "after", label: "What to Do After the Run" },
  { id: "bigger-picture", label: "The Bigger Picture" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What should I eat before a morning run if I don't have much time?",
    a: "A small, fast-digesting carbohydrate. Half a banana, a piece of toast, or a few dates all work. If your run is under 45 minutes, running on empty is fine too — as long as you ate well the night before.",
  },
  {
    q: "How long before a run should I eat a full meal?",
    a: "At least two hours. Two to three is the standard window where most people can run without GI issues.",
  },
  {
    q: "Can I drink coffee before a run?",
    a: "Yes, and many runners do. Caffeine can sharpen focus and improve performance. The main thing to watch is drinking it on a completely empty stomach, which causes nausea for some people. Pair it with something small if that's an issue.",
  },
  {
    q: "What foods should I avoid before running?",
    a: "High-fat foods, high-fiber foods, and anything spicy are the main ones to cut close to a run. They slow digestion or irritate the GI tract during movement. Dairy is worth testing individually — it bothers some runners and not others.",
  },
  {
    q: "Is it okay to run on an empty stomach?",
    a: "For shorter, easier efforts, yes. Your stored glycogen can carry you through 30 to 45 minutes without a problem. For longer or harder runs, eating something small beforehand helps.",
  },
  {
    q: "What should I eat after a run to recover?",
    a: "Carbohydrates and protein within 30 to 45 minutes of finishing. Chocolate milk, eggs on toast, a smoothie, or a grain bowl with protein all work. The timing matters more than the exact food.",
  },
  {
    q: "Does what I eat the night before a morning run matter?",
    a: "Yes, significantly. Your overnight glycogen stores come from what you ate the day before. A solid dinner with carbohydrates and protein sets you up better than trying to fuel entirely from a pre-run snack at 6 AM.",
  },
];

export const Route = createFileRoute("/resources_/what-to-eat-before-a-run")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "what to eat before a run, pre-run nutrition, running fueling, morning run empty stomach, pre run snack, runner hydration, Pittsburgh run club",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: OG_IMAGE },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Training" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline:
            "What to Eat Before a Run: Timing, Portions, and Foods That Work",
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
          image: OG_IMAGE,
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
            { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE}/resources` },
            { "@type": "ListItem", position: 2, name: "What to Eat Before a Run", item: URL },
          ],
        }),
      },
    ],
  }),
  component: PreRunNutritionPage,
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
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

function PreRunNutritionPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[760px] mx-auto">
          <Link
            to="/resources"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All resources
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">TRAINING · 7 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,88px)] leading-[0.95]">
            What to Eat Before a Run: Timing, Portions, and Foods That Work
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            Most pre-run nutrition mistakes aren't about eating the wrong thing.
            They're about eating the right thing at the wrong time.
          </p>

          <img
            src={heroAsset.url}
            alt="Runner heading toward the Pittsburgh skyline surrounded by pre-run foods: banana, toast with peanut butter, rice and chicken, energy bar, dates and chews"
            width={1536}
            height={1024}
            loading="lazy"
            className="mt-10 w-full border border-paper/15"
          />

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-paper/15 p-5"
          >
            <p className="eyebrow text-paper/55 mb-3">In this guide</p>
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
              Get the timing off and a perfectly fine meal becomes a side stitch
              at mile two. Get the portions wrong and you're either dragging
              through the first half or making an unplanned stop before you've
              even warmed up. This guide covers both — plus the foods that
              actually hold up when you're moving.
            </p>

            <H2 id="one-rule">The One Rule That Covers Most Situations</H2>
            <p className="border-l-2 border-blue pl-5 italic text-paper/90">
              The further out you eat, the more you can eat. The closer to your
              run, the simpler and smaller it needs to be.
            </p>
            <p>That's it. Everything else is a variation on that principle.</p>
            <p>
              Two to three hours out? You can eat a full, balanced meal — carbs,
              protein, a little fat, vegetables. Your body has time to process
              it. Thirty to 45 minutes out? Keep it small and mostly
              carbohydrate-based. Less than 20 minutes? You're probably better
              off running on empty or grabbing a few quick bites.
            </p>

            <H2 id="two-three">Eating 2 to 3 Hours Before</H2>
            <p>
              This is the sweet spot for most people. A meal at this window
              gives you fuel without the discomfort of running on a full
              stomach.
            </p>
            <p className="text-paper font-bold">What works here:</p>
            <Bullets
              items={[
                "Oatmeal with banana and a little honey",
                "Rice with chicken or eggs",
                "Toast with peanut butter and a piece of fruit",
                "A bowl of pasta or a grain bowl with lean protein",
              ]}
            />
            <p>
              Keep fat and fiber moderate. Both slow digestion — useful at
              dinner, not when you're about to run. You don't need to eliminate
              them, just don't make them the centerpiece.
            </p>
            <p>
              Portion-wise, think normal and comfortable. Not a feast, not a
              snack. Something you'd eat for lunch and feel good two hours
              later.
            </p>

            <H2 id="thirty-sixty">Eating 30 to 60 Minutes Before</H2>
            <p>
              You need something, but not much. The goal is a quick carbohydrate
              source your body can access fast without sitting heavy in your
              stomach.
            </p>
            <p className="text-paper font-bold">What works:</p>
            <Bullets
              items={[
                "Half a banana",
                "A slice of toast with a thin layer of peanut butter",
                "A small handful of pretzels or crackers",
                "A date or two",
                "A small cup of applesauce",
              ]}
            />
            <p>
              What doesn't: anything high in fat, high in fiber, or high in
              protein. Those macronutrients take longer to digest. A handful of
              almonds sounds reasonable until you're a mile in and your stomach
              disagrees.
            </p>
            <p>
              Keep the portion small — 150 to 200 calories is usually enough.
              You're taking the edge off hunger, not fueling a marathon.
            </p>

            <H2 id="morning">Running First Thing in the Morning</H2>
            <p>
              Early morning runs are their own category. If you're heading out
              within 20 to 30 minutes of waking up, you probably don't have time
              for a real meal — and your body may not want one.
            </p>
            <p>
              For shorter runs under 45 minutes, most people do fine on empty.
              Your glycogen stores from the night before are usually sufficient.
            </p>
            <p>
              For longer or harder efforts, a small, fast-digesting carb helps.
              A few bites of banana, a piece of toast, a gel — something that
              takes five minutes to eat and doesn't ask much of your stomach.
            </p>
            <p>
              If you're showing up with the GRYT crew on Saturday mornings, the
              7 AM start at the Montour/Peters Trail means you're either eating
              before 6:30 or skipping the pre-run meal entirely. Both are fine.
              What matters is that you ate well the night before and you're not
              showing up dehydrated.
            </p>

            <H2 id="works">Foods That Consistently Work</H2>
            <p>These aren't exotic. They're reliable.</p>
            <Bullets
              items={[
                "Bananas. Easy to digest, fast carbohydrates, a little potassium. The default pre-run food for a reason.",
                "Toast or white bread. Low fiber, quick energy. Not glamorous, but effective.",
                "Oatmeal. Works well at the two-to-three-hour window. Fills you up without sitting like a brick.",
                "Rice. Same idea as oatmeal — mild, digestible, solid carbohydrate source.",
                "Dates. Dense carbohydrates in a small package. Two or three before a run is a legitimate strategy.",
                "Sports drinks or diluted juice. If your stomach doesn't tolerate solids before running, liquid carbohydrates are a real option.",
              ]}
            />

            <H2 id="problems">Foods That Tend to Cause Problems</H2>
            <Bullets
              items={[
                "High-fat meals. Fat slows gastric emptying. A burger two hours before a run is a gamble.",
                "High-fiber foods. Beans, raw vegetables, bran cereals — all good for you, all bad timing before a run.",
                "Dairy (for some people). Not universal, but a meaningful number of runners find that milk, cheese, or yogurt before a run causes GI distress. If this is you, you already know.",
                "Spicy food. Fine in general, risky before movement.",
                "Caffeine on an empty stomach. Coffee before a run is common and often fine, but on a completely empty stomach it can cause nausea for some people. Pair it with something small if that's you.",
              ]}
            />

            <H2 id="hydration">Hydration Is Part of This</H2>
            <p>
              You can eat perfectly and still feel terrible if you're
              dehydrated. Water affects how your body processes food and how
              your muscles perform.
            </p>
            <p>
              The simple version: drink water consistently throughout the day
              before a run. Don't try to catch up by chugging 16 ounces right
              before you head out — that just sloshes around.
            </p>
            <p>
              If your urine is pale yellow before you start, you're in a good
              place. If it's dark, drink more water. Not a sports drink. Just
              water.
            </p>

            <H2 id="after">What to Do After the Run</H2>
            <p>
              Post-run nutrition matters too, especially if you're running
              consistently. Within 30 to 45 minutes of finishing, a combination
              of carbohydrates and protein helps your muscles recover and
              refuel.
            </p>
            <p>
              It doesn't need to be complicated. Chocolate milk, eggs on toast,
              a smoothie with protein, rice and chicken — all of these work. The
              timing matters more than the specific food.
            </p>
            <p>
              If you're logging your runs and want to track how nutrition
              affects your performance,{" "}
              <Link
                to="/resources/recap"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                creating a run recap
              </Link>{" "}
              after each session gives you something real to look back on.
            </p>

            <H2 id="bigger-picture">The Bigger Picture</H2>
            <p>
              Pre-run nutrition is one variable. It matters, but it doesn't
              override sleep, training load, stress, or hydration. A perfectly
              timed banana won't save a run when you've slept four hours and
              skipped water all day.
            </p>
            <p>
              Get the basics right consistently. Eat real food. Hydrate. Give
              yourself enough time between meals and effort. The details refine
              from there.
            </p>
            <p>
              If you're newer to running or coming back after a break, the{" "}
              <Link
                to="/resources/playbooks"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                GRYT playbooks
              </Link>{" "}
              cover the practical side of building a consistent running habit —
              including what actually matters in the early weeks versus what you
              can figure out later.
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
              Consistency compounds. That includes how you fuel. Get the timing
              and portions right a few times and it stops being something you
              think about — it just becomes part of how you run.
            </p>
            <p>
              Show up when you're ready to run with people who take the same
              approach to everything else.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
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
        <ShareButtons url={URL} title={TITLE} />
      </article>
      <SiteFooter />
    </main>
  );
}
