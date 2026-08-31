import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Link as LinkIcon, Check, Facebook, Linkedin } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import ogImage from "@/assets/og-playbooks.jpg";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/playbooks/best-free-running-clubs-pittsburgh-2026`;
const TITLE =
  "Best Free Running Clubs in Pittsburgh (2026) · gryt run club";
const DESCRIPTION =
  "Pittsburgh's free running clubs in 2026 — Yinz, Fleet Feet, Steel City, Kool, Pharaoh Hounds, and GRYT. Who they're for and when they meet.";
const PUBLISHED = "2026-01-20";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Are there free running clubs in Pittsburgh?",
    a: "Yes. Several Pittsburgh-area running clubs are free, including Yinz Run Club, Kool Run Club, Pittsburgh Pharaoh Hounds, Fleet Feet Pittsburgh's group runs, and GRYT Run Club. Steel City Road Runners asks for a $20 annual donation but doesn't require it.",
  },
  {
    q: "What is the best running club for beginners in Pittsburgh?",
    a: "GRYT Run Club in McMurray is a strong option for beginners. The Montour / Peters Trail route is flat and forgiving, there are no pace requirements, and no one gets dropped. Yinz Run Club and Fleet Feet Pittsburgh also welcome beginners.",
  },
  {
    q: "Is there a running club in Pittsburgh's South Hills?",
    a: "Yes. GRYT Run Club meets every Saturday at 7 AM on the Montour / Peters Trail in McMurray, PA, serving Peters Township, Upper St. Clair, Bethel Park, and the broader South Hills and Washington County. It's free and open to all paces.",
  },
  {
    q: "What time does GRYT Run Club meet?",
    a: "Every Saturday at 7 AM at the Montour / Peters Trail in McMurray, PA. First-timers are asked to arrive ten minutes early so a founder or regular can introduce themselves before the run starts.",
  },
  {
    q: "Does GRYT Run Club cost anything?",
    a: "No. GRYT Run Club is always free. No membership fees, no registration costs, no upsells.",
  },
  {
    q: "How do I join GRYT Run Club?",
    a: "Fill out the RSVP form at grytrunclub.com. You'll get one reminder Friday evening and one nudge Saturday morning. Show up ten minutes early your first time and someone will find you.",
  },
  {
    q: "What happens after the run at GRYT?",
    a: "People hang out in the parking lot with coffee. No agenda, no pitch — just a natural end to a Saturday morning run.",
  },
];

export const Route = createFileRoute(
  "/resources_/playbooks_/best-free-running-clubs-pittsburgh-2026",
)({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Pittsburgh running clubs, free running clubs Pittsburgh, South Hills running club, McMurray running club, Montour Trail run club, GRYT Run Club, Yinz Run Club, Fleet Feet Pittsburgh, Pittsburgh Pharaoh Hounds, Kool Run Club, Steel City Road Runners",
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
          headline: "The Best Free Running Clubs in Pittsburgh (2026)",
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
          about: [
            "Yinz Run Club",
            "Fleet Feet Pittsburgh",
            "Steel City Road Runners",
            "Kool Run Club",
            "Pittsburgh Pharaoh Hounds",
            "GRYT Run Club",
          ],
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
            { "@type": "ListItem", position: 2, name: "Playbooks", item: `${SITE}/resources/playbooks` },
            { "@type": "ListItem", position: 3, name: "Best Free Running Clubs in Pittsburgh (2026)", item: URL },
          ],
        }),
      },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[760px] mx-auto">
          <Link
            to="/resources/playbooks"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All playbooks
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">COMMUNITY · 9 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            The Best Free Running Clubs in Pittsburgh (2026)
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            {DESCRIPTION}
          </p>

          <ShareBar className="mt-8" />


          <div className="mt-12 space-y-5 text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>You used to have a team. Then life got complicated — kids, commutes, a schedule that treats anything non-urgent as optional. But the part of you that needs to move, that needs people to move with, doesn't really disappear. It just waits.</p>
            <p>Pittsburgh has a real running community. It's spread across neighborhoods and suburbs, split between early risers and evening runners, trail people and road people. Some clubs cost money. Most are city-centric. A few are genuinely free and genuinely welcoming.</p>
            <p>Here's what's actually out there in 2026 — who each club is for, when and where they meet, and what makes each one worth considering.</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">Yinz Run Club</h2>
            <p>Yinz is Pittsburgh's largest free running community, with more than 2,500 members. If you've spent any time in the city's running scene, you've probably already heard the name.</p>
            <p>They meet Wednesday evenings and bi-weekly Saturdays at 10 AM, rotating routes through city neighborhoods. The group is inclusive and well-organized, with a strong social culture built around post-run hangs.</p>
            <p><strong>Best for:</strong> City-based runners who can make a weeknight work, or who want a large, established group with a real social scene.</p>
            <p><strong>Cost:</strong> Free.</p>
            <p><strong>Limitation:</strong> Every run is city-centric. If you're in the South Hills, Peters Township, or Washington County, you're adding a commute before you even lace up. The Saturday 10 AM slot also doesn't work well for parents who need to be back before the day takes over.</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">Fleet Feet Pittsburgh</h2>
            <p>Fleet Feet runs a free weekly group run out of their East End location. The retail backing shows — solid infrastructure, mapped routes, consistent scheduling.</p>
            <p><strong>Best for:</strong> Runners who want a structured, beginner-friendly setup with gear and coaching resources close by.</p>
            <p><strong>Cost:</strong> Free with registration.</p>
            <p><strong>Limitation:</strong> Anchored to the East End. If you're in Bethel Park, Upper St. Clair, or McMurray, this isn't your neighborhood option — it's a trip.</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">Steel City Road Runners</h2>
            <p>One of Pittsburgh's older running organizations. They host events and group runs throughout the year, with a suggested $20 annual donation rather than a hard membership fee.</p>
            <p><strong>Best for:</strong> Runners who want to connect with a broader Pittsburgh racing community and get involved in organized events.</p>
            <p><strong>Cost:</strong> $20 suggested donation per year.</p>
            <p><strong>Limitation:</strong> Meets only a few times per year. If you're looking for something that shows up on your calendar every single Saturday and holds you to it, this isn't that.</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">Kool Run Club</h2>
            <p>Kool Run Club brings a different energy to Pittsburgh running — free, community-oriented, with a following built around runners who want the social side of the sport front and center.</p>
            <p><strong>Best for:</strong> Runners who want a personality-driven group with a strong social identity.</p>
            <p><strong>Cost:</strong> Free.</p>
            <p><strong>Limitation:</strong> Check their current schedule directly, as meeting times and locations can shift. Not a South Hills option.</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">Pittsburgh Pharaoh Hounds</h2>
            <p>The Pharaoh Hounds meet Tuesday evenings and have a reputation for being welcoming at every pace. They've built a consistent following among Pittsburgh runners who want a midweek group run with real regulars.</p>
            <p><strong>Best for:</strong> Runners who can commit to a Tuesday evening and want a group with history behind it.</p>
            <p><strong>Cost:</strong> Free.</p>
            <p><strong>Limitation:</strong> Tuesday evenings are hard for a lot of parents and people with demanding schedules. And like most Pittsburgh clubs, the Pharaoh Hounds don't have a South Hills or Washington County presence.</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">GRYT Run Club — McMurray / South Hills</h2>
            <p>Here's the honest gap in Pittsburgh's running scene: almost nothing consistently serves the South Hills suburbs on a Saturday morning.</p>
            <p>McMurray, Peters Township, Upper St. Clair, Bethel Park — these neighborhoods are full of former athletes, busy parents, and people who used to run and want to again. They don't need another Wednesday evening option that requires driving into the city first. They need something close, early, and free.</p>
            <p>That's what GRYT Run Club is.</p>
            <p>GRYT meets every Saturday at 7 AM on the Montour / Peters Trail in McMurray. The route is an out-and-back covering roughly four miles on a flat, beginner-friendly trail. Walkers, joggers, and runners all show up. No one gets dropped. No one has ever been dropped.</p>
            <p>After the run, people hang out in the parking lot with coffee. No agenda. No pitch. Just the natural end of a Saturday morning well spent.</p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">Who Started It</h3>
            <p>GRYT was founded by Laura and Nick Merich, who have 27 combined marathon finishes between them. They're not coaches with a program to sell. They're former athletes who got busy, missed having a team, and decided to build something instead of waiting for someone else to.</p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">What Makes It Different</h3>
            <p>The combination is specific: zero cost, 7 AM Saturday, a flat trail in the South Hills, and coffee after. No Pittsburgh-area club currently owns that combination.</p>
            <p>The 7 AM start matters more than it sounds. You're done by 8:15. The rest of Saturday is still yours — kids' activities, errands, whatever the day demands. You didn't sacrifice the morning. You started it.</p>
            <p>The Montour / Peters Trail matters too. It's accessible, well-maintained, and close to home for anyone in the Peters Township and South Hills corridor. You're not driving 30 minutes to run.</p>

            <h3 className="text-xl md:text-2xl font-bold mt-10 mb-1">What to Expect Your First Time</h3>
            <p>Show up ten minutes early. A founder or regular will find you before the run starts. You won't be standing at the edge of a group mid-warmup wondering where to put yourself.</p>
            <p>By mile two, the conversations are usually less about running and more about everything else — work, kids, the week you just had. That's the part people come back for.</p>
            <p>The RSVP system is simple: fill out the form at grytrunclub.com, get one reminder Friday evening, and one nudge Saturday morning. That's it. No inbox flooding, no upsell.</p>
            <p>GRYT also has a Strava club (ID 1708552) where members log activity and stay connected between runs. Low-key and useful if you're already on Strava.</p>
            <p><strong>Best for:</strong> Former athletes, busy parents, and comeback runners in Pittsburgh's South Hills and Washington County who want a free, weekly, early Saturday run with real people and coffee after.</p>
            <p><strong>Cost:</strong> Always free. No membership. No fees.</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">How These Clubs Compare</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Yinz Run Club</strong> — Free · Wed evenings &amp; Sat 10 AM · City · Social post-run.</li>
              <li><strong>Fleet Feet Pittsburgh</strong> — Free · Varies · East End · Varies.</li>
              <li><strong>Steel City Road Runners</strong> — $20/yr donation · Occasional · City · Varies.</li>
              <li><strong>Kool Run Club</strong> — Free · Varies · City · Social.</li>
              <li><strong>Pittsburgh Pharaoh Hounds</strong> — Free · Tuesday evenings · City · Social.</li>
              <li><strong>GRYT Run Club</strong> — Free · Saturday 7 AM · McMurray / South Hills · Coffee.</li>
            </ul>
            <p>If you're in the city and free on a Wednesday evening, Yinz Run Club is a strong choice. If you're in the South Hills and Saturday mornings are your window, GRYT is the only consistent free option on the Montour / Peters Trail corridor.</p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">The One Thing Worth Saying</h2>
            <p>Most people who show up to GRYT for the first time come alone. That's fine. So did everyone else.</p>
            <p>The trail is flat. The coffee is real. The 7 AM start means you're back home before most people have had breakfast.</p>
            <p>If you've been waiting for a reason to start again, Saturday is a good one.</p>
            <p>
              RSVP for this Saturday at{" "}
              <Link to="/" className="text-blue underline underline-offset-4">
                grytrunclub.com
              </Link>
              .
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-2">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <p className="font-bold text-paper">{f.q}</p>
                  <p className="mt-2 text-paper/80">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <ShareBar className="mt-12" label="Share this playbook" />

          <div className="mt-12 flex flex-wrap gap-4">
            <Link to="/" hash="first-time" className="btn-primary">
              RSVP for Saturday →
            </Link>
            <Link
              to="/resources/playbooks"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
            >
              Back to Playbooks
            </Link>
          </div>

        </div>
        <ShareButtons url={URL} title={TITLE} />
      </article>
      <SiteFooter />
    </main>
  );
}

function ShareBar({
  className = "",
  label = "Share",
}: {
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = URL;
  const shareText = `${TITLE} — ${DESCRIPTION}`;

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    TITLE,
  )}&url=${encodeURIComponent(shareUrl)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl,
  )}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`;

  async function onCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const el = document.createElement("textarea");
        el.value = shareUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const btn =
    "inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] border border-paper/30 text-paper hover:border-blue hover:text-blue transition-colors";

  return (
    <div className={className} aria-label={label}>
      <p className="eyebrow text-paper/55 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={onCopy} className={btn} aria-live="polite">
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <LinkIcon size={14} aria-hidden="true" /> Copy link
            </>
          )}
        </button>
        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          aria-label="Share on X"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2H21l-6.51 7.44L22 22h-6.83l-4.77-6.23L4.8 22H2l6.96-7.95L2 2h6.91l4.33 5.73L18.24 2Zm-1.197 18h1.671L7.05 4h-1.79l11.787 16Z" />
          </svg>
          X
        </a>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          aria-label="Share on Facebook"
        >
          <Facebook size={14} aria-hidden="true" /> Facebook
        </a>
        <a
          href={liHref}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          aria-label="Share on LinkedIn"
        >
          <Linkedin size={14} aria-hidden="true" /> LinkedIn
        </a>
      </div>
      {/* shareText is used only when native share is available */}
      <span hidden>{shareText}</span>
    </div>
  );
}
