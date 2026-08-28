import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import heroAsset from "@/assets/pittsburgh-10-miler.png.asset.json";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/eqt-pittsburgh-10-miler-2026`;
const OG_IMAGE = `${SITE}${heroAsset.url}`;
const TITLE =
  "EQT Pittsburgh 10 Miler 2026: Race Guide & Training · gryt run club";
const DESCRIPTION =
  "Course details, hill training, pacing strategy, and race-day logistics for the EQT Pittsburgh 10 Miler 2026 — plus how to train with a free no-drop group.";
const PUBLISHED = "2026-08-28";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "what", label: "What Is the EQT Pittsburgh 10 Miler?" },
  { id: "course", label: "Course Overview" },
  { id: "train", label: "How to Train for It" },
  { id: "long-run", label: "Build Your Long Run First" },
  { id: "hills", label: "Run Hills on Purpose" },
  { id: "consistency", label: "Consistency Beats Everything Else" },
  { id: "pacing", label: "Pacing Strategy" },
  { id: "logistics", label: "Race Day Logistics" },
  { id: "group", label: "Train With a Group" },
  { id: "worth-it", label: "Why the 10 Miler Is Worth It" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How long does it take to train for the EQT Pittsburgh 10 Miler?",
    a: "Most runners need 10 to 12 weeks of consistent training starting from a base of 3 to 4 miles per week. Already running 5 or more miles regularly? Eight weeks is often enough.",
  },
  {
    q: "Is the Pittsburgh 10 Miler course hilly?",
    a: "Yes. Real elevation changes, consistent with Pittsburgh's terrain. Training on hills before race day will make a noticeable difference in how you feel in the second half.",
  },
  {
    q: "What pace should I target for the EQT Pittsburgh 10 Miler?",
    a: "A runner who can comfortably run a 30-minute 5K should target somewhere between 1:35 and 1:45, depending on fitness and hill training. Start conservatively and build into it.",
  },
  {
    q: "Do I need a training plan to run the 10 Miler?",
    a: "A formal plan helps, but it's not required. Three consistent runs per week — one long run, one hilly effort — is enough structure for most runners to finish feeling strong.",
  },
  {
    q: "Are there running groups in Pittsburgh that train for this race?",
    a: "GRYT Run Club runs every Saturday morning at 7 AM on the Montour/Peters Trail in McMurray. Free, no-drop, open to all paces. Details at grytrunclub.com.",
  },
  {
    q: "What should I eat before the EQT Pittsburgh 10 Miler?",
    a: "Stick with what you've practiced in training. A light meal two to three hours before the race — something familiar, easy to digest. Don't try anything new on race morning.",
  },
  {
    q: "Can beginners run the EQT Pittsburgh 10 Miler?",
    a: "Yes. The race draws runners across a wide range of experience levels. If you can run 4 to 5 miles comfortably and have 10 to 12 weeks before the event, you have enough time to prepare. The finish line is the same for everyone.",
  },
];

export const Route = createFileRoute("/resources_/eqt-pittsburgh-10-miler-2026")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "EQT Pittsburgh 10 Miler, Pittsburgh 10 miler 2026, Pittsburgh road race, 10 mile training plan, Pittsburgh hills training, Montour Trail, Pittsburgh run club",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: OG_IMAGE },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Racing" },
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
            "EQT Pittsburgh 10 Miler 2026: Race Guide, Course Details, and Training Tips",
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
            { "@type": "ListItem", position: 2, name: "EQT Pittsburgh 10 Miler 2026", item: URL },
          ],
        }),
      },
    ],
  }),
  component: TenMilerPage,
});

function TenMilerPage() {
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
          <p className="eyebrow text-blue mt-8 mb-5">RACING · 7 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,88px)] leading-[0.95]">
            EQT Pittsburgh 10 Miler 2026: Race Guide, Course Details, and
            Training Tips
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            Real hills, great views, and a finish line that means something.
          </p>

          <img
            src={heroAsset.url}
            alt="Runner heading toward the Pittsburgh skyline and river bridges"
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
              The EQT Pittsburgh 10 Miler is one of the best road races in
              western Pennsylvania. Thousands of runners line up for it every
              year, and if you're planning to be one of them in 2026, you
              already know what you're signing up for: real hills, great views,
              and a finish line that means something.
            </p>
            <p>
              Here's what you need to know about the race, the course, and how
              to get ready for it.
            </p>

            <h2 id="what" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              What Is the EQT Pittsburgh 10 Miler?
            </h2>
            <p>
              It's an annual road race through Pittsburgh — point-to-point,
              winding through some of the city's most recognizable
              neighborhoods, with river and skyline views that remind you why
              Pittsburgh is worth running in the first place.
            </p>
            <p>
              The field is wide. First-timers chasing their longest distance
              ever. Veterans using it as a spring tune-up before a marathon. The
              10-mile distance sits in an interesting spot: long enough to
              demand real preparation, short enough that you don't need a
              20-week training block to get there.
            </p>

            <h2 id="course" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              Course Overview
            </h2>
            <p>
              The course moves through Pittsburgh's North Shore, follows the
              river, and finishes near downtown. It is not flat. Pittsburgh
              doesn't do flat.
            </p>
            <p>
              Expect rolling terrain throughout, with a few sustained climbs
              that will expose you if you go out too fast. The back half is
              where undertrained runners pay for the first half.
            </p>
            <p>
              The views are the reward. Running through Pittsburgh in the spring
              — bridges, rivers, skyline — is genuinely one of the better
              race-day experiences in the region.
            </p>

            <h2 id="train" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              How to Train for It
            </h2>
            <p>
              Ten miles rewards aerobic base more than speed. It punishes
              runners who skip the long run.
            </p>

            <h3 id="long-run" className="text-xl md:text-2xl font-bold mt-10 mb-2 scroll-mt-24">
              Build Your Long Run First
            </h3>
            <p>
              Starting from 3 to 4 miles? You have enough runway before a spring
              race. Add roughly a mile to your long run every one to two weeks,
              and take a down week every third week to let your body absorb the
              work.
            </p>
            <p>
              You don't need to run 10 miles in training before race day.
              Getting to 8 is enough. Race-day energy and taper will carry you
              the rest of the way.
            </p>

            <h3 id="hills" className="text-xl md:text-2xl font-bold mt-10 mb-2 scroll-mt-24">
              Run Hills on Purpose
            </h3>
            <p>
              Most Pittsburgh runners train on flat routes, then wonder why the
              hills hit so hard on race day. If you're training in the South
              Hills or anywhere near the Montour Trail, you already have real
              elevation available. Use it.
            </p>
            <p>
              One hilly run per week — even a short one — builds the leg
              strength and mental tolerance that flat miles don't.
            </p>

            <h3 id="consistency" className="text-xl md:text-2xl font-bold mt-10 mb-2 scroll-mt-24">
              Consistency Beats Everything Else
            </h3>
            <p>
              Three runs a week, every week, for 10 to 12 weeks will get most
              runners to the finish line feeling good. The plan doesn't need to
              be complicated. It needs to happen.
            </p>
            <p className="border-l-2 border-blue pl-5 italic text-paper/90">
              Identity beats motivation. You don't have to want to run on a cold
              morning. You just have to be the kind of person who runs.
            </p>

            <h2 id="pacing" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              Pacing Strategy
            </h2>
            <p>
              The most common mistake in a 10-miler is running the first three
              miles at half-marathon effort. It feels easy because you're fresh,
              the crowd is moving, and the adrenaline is real.
            </p>
            <p>
              Run the first two miles slower than you think you need to. By mile
              six, you'll be glad you did.
            </p>
            <p>
              A rough target: if you can run a comfortable 5K in around 30
              minutes, aim for somewhere between 1:35 and 1:45 for the full 10,
              depending on your training and how the hills have been going.
              Start conservative and build.
            </p>

            <h2 id="logistics" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              Race Day Logistics
            </h2>
            <p>
              <strong className="text-paper">Parking:</strong> It fills up
              early. Plan to arrive at least 60 to 75 minutes before your wave.
              Check the official race site for updated parking and shuttle
              details as the event gets closer.
            </p>
            <p>
              <strong className="text-paper">Gear:</strong> Spring weather in
              Pittsburgh is unpredictable. A light layer you can tie around your
              waist is worth the minor inconvenience. Don't wear anything on
              race day you haven't already worn on a long run.
            </p>
            <p>
              <strong className="text-paper">Nutrition:</strong> For most
              runners, 10 miles doesn't require mid-race fuel. If you're running
              slower than 1:45, one gel around mile five won't hurt — but
              practice it in training first.
            </p>

            <h2 id="group" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              Train With a Group
            </h2>
            <p>
              Solo training works. Group training works better, especially for
              the long runs.
            </p>
            <p>
              If you're in the Pittsburgh area and want company on Saturday
              mornings, GRYT Run Club meets every Saturday at 7 AM at the Valley
              Brook Road trailhead on the Montour / Peters Trail in McMurray. No
              membership, no pace requirement, no training plan required. You
              show up, you run, you're part of the crew.
            </p>
            <p>
              It's a no-drop group. Nobody gets left behind. Some of the fastest
              people in the crew have run their slowest miles waiting at the top
              of a hill for someone who needed it. That's the point.
            </p>
            <p>
              More on why that works:{" "}
              <Link
                to="/resources/running-with-a-group"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                Running With a Group: Why It Makes You Faster and Less Likely to
                Quit
              </Link>
              .
            </p>
            <p>
              If you're newer to Pittsburgh running and want to see what else is
              out there,{" "}
              <Link
                to="/resources/playbooks/best-free-running-clubs-pittsburgh-2026"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                the best free running clubs in Pittsburgh in 2026
              </Link>{" "}
              is a good place to start.
            </p>

            <h2 id="worth-it" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              Why the 10 Miler Is Worth It
            </h2>
            <p>
              There's something specific about finishing a 10-mile race in
              Pittsburgh. The course is hard enough that you feel it. The
              distance is long enough that you had to prepare for it. And the
              city — visible from the course in a way you never get from a car —
              makes the effort feel like it belongs somewhere.
            </p>
            <p>
              If you've been sitting on the fence about registering, do it. The
              training is manageable, the race is well-organized, and the finish
              line is worth the work.
            </p>

            <h2 id="faqs" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              FAQs
            </h2>
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
            <p className="text-paper/85">
              Deciding which crew fits your schedule?{" "}
              <Link
                to="/resources/playbooks/gryt-vs-yinz-run-club"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                GRYT vs Yinz Run Club
              </Link>{" "}
              is worth a look.
            </p>

            <p className="text-paper text-lg md:text-xl font-bold mt-12">
              Consistency compounds. Especially when there are people expecting
              you at the trailhead at 7 AM on Saturday.
            </p>
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
