import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import ogImage from "@/assets/og-conversations.jpg";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/running-with-a-group`;
const TITLE =
  "Running With a Group: Why It Makes You Faster · gryt run club";
const DESCRIPTION =
  "Group running raises your pace without effort, turns motivation into expectation, and keeps you consistent. Why no-drop crews work, and how to find one.";
const PUBLISHED = "2026-08-28";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "faster", label: "You run faster without trying" },
  { id: "accountability", label: "Accountability is not a soft benefit" },
  { id: "no-drop", label: "The no-drop rule changes everything" },
  { id: "learn", label: "You learn more in a group than you do alone" },
  { id: "social", label: "The social layer is the retention layer" },
  { id: "find", label: "How to find the right group" },
  { id: "once", label: "The case for showing up once" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What are the actual benefits of running with a group?",
    a: "Running with a group tends to make you faster through social facilitation, keeps you consistent through accountability, and extends how long you stick with running through the connections you build. The combination of those three things is more durable than any training plan.",
  },
  {
    q: "Do I have to be fast to join a running group?",
    a: "No. A no-drop running group means everyone finishes together regardless of pace. If a group drops slower runners, it's not the right group. Pace requirements are a barrier that most people starting or returning to running don't need.",
  },
  {
    q: "How does running with others improve consistency?",
    a: "When someone is expecting you at a specific time and place, you show up more reliably than when the decision is entirely internal. Expectation is a more consistent motivator than willpower or mood.",
  },
  {
    q: "What is a no-drop running group?",
    a: "A no-drop group means no runner gets left behind. The fastest runners wait for the slowest, and everyone finishes together. It's a specific policy that changes the experience for newer and slower runners entirely.",
  },
  {
    q: "How do I find a running group near me?",
    a: "Look for groups that are free to join, have no pace requirements, and meet regularly at a fixed time and place. In the Pittsburgh South Hills area, GRYT Run Club meets Saturdays at 7 AM on the Montour / Peters Trail in McMurray.",
  },
  {
    q: "Can running with a group help me return to running after a long break?",
    a: "Yes — and it's often the most effective way to do it. Being around experienced runners recalibrates your expectations, the social layer keeps you accountable through the early weeks when it's hardest, and a no-drop environment removes the pressure of keeping up.",
  },
  {
    q: "Is running with a group better than running alone?",
    a: "For most people, most of the time, yes. Solo running has its place — long easy efforts, recovery runs, time to think. But group running builds consistency, raises your average pace, and gives you a reason to keep going that doesn't depend on how motivated you feel on a given morning.",
  },
];

export const Route = createFileRoute("/resources_/running-with-a-group")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "running with a group, group running benefits, no-drop run club, Pittsburgh run club, South Hills running group, Montour Trail, running accountability",
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
            "Running With a Group: Why It Makes You Faster and Less Likely to Quit",
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
            { "@type": "ListItem", position: 2, name: "Running With a Group", item: URL },
          ],
        }),
      },
    ],
  }),
  component: GroupRunningPage,
});

function GroupRunningPage() {
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
          <p className="eyebrow text-blue mt-8 mb-5">COMMUNITY · 6 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            Running With a Group: Why It Makes You Faster and Less Likely to Quit
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            Solo running has a ceiling. You hit it faster than you think.
          </p>

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-paper/15 p-5"
          >
            <p className="eyebrow text-paper/55 mb-3">In this story</p>
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
              Not a physical ceiling — your legs can keep going. The ceiling is
              mental. It's the Saturday morning when the alarm goes off and you
              talk yourself back to sleep. It's the night the couch wins. It's
              the slow drift from "I run" to "I used to run."
            </p>
            <p>
              Running with a group breaks that ceiling. Here's why it works —
              and why the effect is bigger than most people expect.
            </p>

            <h2 id="faster" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              You run faster without trying
            </h2>
            <p>This is the one that surprises people most.</p>
            <p>
              You don't have to be competitive. You don't have to care about
              pace. But put another person next to you and your body responds.
              Psychologists call it social facilitation — the presence of others
              raises your arousal level and improves performance on familiar
              tasks. Running is a familiar task.
            </p>
            <p>
              In practice, it looks like this: you finish a group run and check
              your watch. You ran 30 seconds per mile faster than your usual
              solo pace. You didn't push. You just weren't alone.
            </p>
            <p>
              The effect compounds on longer efforts. When you're 3 miles into a
              4-mile loop and the person beside you hasn't slowed down, you
              don't slow down either. Not because you're racing them. Because
              stopping feels strange in a way it never does when you're by
              yourself.
            </p>

            <h2 id="accountability" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              Accountability is not a soft benefit
            </h2>
            <p>People treat accountability like it's a nice-to-have. It isn't.</p>
            <p>
              Accountability is the mechanism. It's why group runners log more
              miles per week than solo runners, and why they stay consistent
              through the months when motivation disappears — which it always
              does, usually around week six.
            </p>
            <p>
              The kind of accountability that actually works isn't guilt or
              obligation. It's expectation. When someone is expecting you at a
              trailhead at 7 AM, you show up. Not because you're afraid of
              letting them down. Because you've already decided you're the kind
              of person who shows up.
            </p>
            <p className="border-l-2 border-blue pl-5 italic text-paper/90">
              Identity beats motivation. You don't have to want to run on
              Saturday. You just have to be the kind of person who runs on
              Saturday.
            </p>

            <h2 id="no-drop" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              The no-drop rule changes everything
            </h2>
            <p>
              Most runners who've tried group running have a bad memory attached
              to it. They showed up, the fast people went fast, and they spent
              45 minutes alone on a trail wondering why they bothered.
            </p>
            <p>That's not group running. That's a race with no finish line.</p>
            <p>
              A no-drop crew means nobody gets left behind. The fastest person
              sets their ego aside. The slowest person doesn't spend the whole
              run apologizing for their pace. Everyone finishes together.
            </p>
            <p>
              This matters for retention more than any other single factor. When
              a new runner shows up and doesn't get dropped on the first mile,
              they come back. When they come back three times, they're part of
              the crew. That's how a running group actually grows.
            </p>
            <p>
              At GRYT Run Club, no-drop isn't a policy posted on a website. It's
              just what happens. The person waiting at the finish on the Montour
              Trail has run a 3:25 marathon. They're waiting because that's what
              the crew does.
            </p>

            <h2 id="learn" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              You learn more in a group than you do alone
            </h2>
            <p>
              Solo running teaches you your own habits. Group running teaches
              you everything else.
            </p>
            <p>
              You learn pacing by running next to someone who's been doing this
              for 10 years. You learn breathing by noticing the person beside
              you is talking normally while you're gasping. You learn how to
              handle a bad stretch by watching someone else handle theirs.
            </p>
            <p>
              None of this is formal instruction. It's absorbed — the same way
              you pick up anything from people who are better at something than
              you are. By being around them long enough.
            </p>
            <p>
              The comeback runner especially benefits here. If you ran in high
              school or college and you're returning to it now, your instincts
              are mostly right but your body has changed. Running with a group
              recalibrates you faster than any training plan. You see what's
              possible. You see what's realistic. You find your place in the
              pack and build from there.
            </p>

            <h2 id="social" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              The social layer is the retention layer
            </h2>
            <p>
              Here's the honest reason most people keep running: they like the
              people.
            </p>
            <p>
              Not in a vague way. Specifically. They like the person who always
              has a terrible pun ready at mile 2. They like the one who shows up
              in weather that would make a reasonable person stay home. They
              like the ritual — same time, same place, same faces.
            </p>
            <p>
              That social layer is what turns running from a habit into an
              identity. And identity is durable in a way that motivation never
              is.
            </p>
            <p>
              This is what's easy to miss when you're deciding whether to join a
              running group. You're not just adding miles. You're adding people.
              And those people are the reason you'll still be running 18 months
              from now when a lot of solo runners have quietly stopped.
            </p>
            <p>
              For what that actually looks like week to week,{" "}
              <Link
                to="/resources/more-than-miles"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                More Than Miles: 5 Things You Wouldn't Guess From the Parking
                Lot
              </Link>{" "}
              gets into the specifics.
            </p>

            <h2 id="find" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              How to find the right group
            </h2>
            <p>
              Not all running groups are the same. Some are built around a
              specific training cycle. Some are pace-segregated. Some are
              attached to a store with a particular culture.
            </p>
            <p>
              The question worth asking before you join any group: what happens
              to the slowest person?
            </p>
            <p>
              If the answer is "they finish alone," keep looking. If the answer
              is "they finish with everyone else," you've found a no-drop crew.
            </p>
            <p>
              The other question: is there a barrier to entry? A fee, a minimum
              pace, a registration process? Some runners want that structure.
              Most people returning to running after a long break don't need
              another reason to delay starting.
            </p>
            <p>
              For a direct look at what different running groups in the
              Pittsburgh area actually look like in practice,{" "}
              <Link
                to="/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs"
                className="text-blue underline underline-offset-4 hover:text-paper transition-colors"
              >
                Fleet Feet Pittsburgh Running Group vs Independent Run Clubs
              </Link>{" "}
              breaks it down without the sales pitch.
            </p>

            <h2 id="once" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">
              The case for showing up once
            </h2>
            <p>
              You don't need to commit to anything. No new gear, no training
              plan, no minimum fitness level.
            </p>
            <p>Show up once and see what happens.</p>
            <p>
              GRYT Run Club meets Saturday mornings at 7 AM on the Montour /
              Peters Trail in McMurray. No membership. No pace requirement. No
              registration. The only thing required is showing up.
            </p>
            <p>
              That's the whole model. The homepage has the details on where to
              meet.
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

            <p className="text-paper text-lg md:text-xl font-bold mt-12">
              Consistency compounds. Especially when people are expecting you at
              7 AM.
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
