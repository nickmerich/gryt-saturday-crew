import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Link as LinkIcon, Check, Facebook, Linkedin } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import ogImage from "@/assets/og-playbooks.jpg";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/playbooks/gryt-vs-yinz-run-club`;
const TITLE =
  "GRYT vs Yinz Run Club: Which Pittsburgh Run Club Is Right for You? · gryt run club";
const DESCRIPTION =
  "An honest comparison of Yinz Run Club and GRYT Run Club: location, schedule, group size, and post-run culture. Figure out which Pittsburgh run club actually fits your life.";
const PUBLISHED = "2026-01-27";
const MODIFIED = "2026-11-10";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "what-yinz-is", label: "What Yinz Run Club Is" },
  { id: "what-gryt-is", label: "What GRYT Run Club Is" },
  { id: "real-differences", label: "The Real Differences" },
  { id: "location", label: "Location" },
  { id: "day-and-time", label: "Day and Time" },
  { id: "group-size", label: "Group Size and Feel" },
  { id: "post-run", label: "Post-Run Social" },
  { id: "who-yinz", label: "Who Should Run with Yinz" },
  { id: "who-gryt", label: "Who Should Run with GRYT" },
  { id: "both", label: "Can You Run with Both?" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Is there a Yinz Run Club in the South Hills?",
    a: "No. Yinz Run Club is Pittsburgh's largest free run club, but their runs are city-centric with no consistent South Hills presence. Its Wednesday evening runs rotate between businesses in city neighborhoods, and its trail runs rotate between parks every other Saturday morning, so there's no fixed weekly run in McMurray, Peters Township, Upper St. Clair, or Bethel Park.",
  },
  {
    q: "What are good alternatives to Yinz Run Club in Pittsburgh's South Hills?",
    a: "GRYT Run Club is a free, weekly run club based in McMurray, in Peters Township. It meets every Saturday at 7 AM on the Montour / Peters Trail. Always free, no pace requirements. For a weeknight, City of Bridges Run Club has a free Thursday 6:30 PM South Hills run at rotating spots, and Canonsburg Run Club meets Mondays at 6 PM.",
  },
  {
    q: "Is GRYT Run Club free like Yinz?",
    a: "Yes. Completely free. No membership fees, no annual cost, no upsell. Same as Yinz.",
  },
  {
    q: "What time does GRYT Run Club meet?",
    a: "Every Saturday at 7 AM at the Montour / Peters Trail in McMurray, PA. The run covers roughly four miles out and back. Most people are done and in the parking lot with coffee by 8:15.",
  },
  {
    q: "Do I need to be fast to join GRYT?",
    a: "No. Walkers, joggers, and runners all show up. No pace requirement, and no one gets dropped. If it's your first time, arrive ten minutes early — a founder or regular will introduce you before the run starts.",
  },
  {
    q: "How big is GRYT compared to Yinz?",
    a: "Yinz has over 2,500 members and is Pittsburgh's largest free run club. GRYT is smaller and newer — 33 Strava members, 7 to 15 people on a typical Saturday. The smaller size means you'll know people quickly.",
  },
  {
    q: "What happens after the run at GRYT?",
    a: "Coffee in the parking lot. Every week. No agenda, no pitch. People hang around as long as they want, then go on with their Saturday.",
  },
];

export const Route = createFileRoute(
  "/resources_/playbooks_/gryt-vs-yinz-run-club",
)({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Yinz Run Club, GRYT Run Club, Pittsburgh run club comparison, South Hills running club, McMurray running club, Montour Trail run club, Peters Township run club, free running club Pittsburgh, Saturday morning run Pittsburgh",
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
      { property: "article:modified_time", content: MODIFIED },
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
            "GRYT vs Yinz Run Club: Which Pittsburgh Run Club Is Right for You?",
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: MODIFIED,
          author: { "@type": "Person", name: "Nick Merich" },
          publisher: {
            "@type": "Organization",
            name: "gryt run club",
            url: SITE,
          },
          mainEntityOfPage: URL,
          image: `${SITE}${ogImage}`,
          about: ["Yinz Run Club", "GRYT Run Club", "Pittsburgh running"],
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
            { "@type": "ListItem", position: 3, name: "GRYT vs Yinz Run Club", item: URL },
          ],
        }),
      },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[760px] mx-auto">
          <Link
            to="/resources/playbooks"
            className="eyebrow text-foreground hover:text-foreground transition-colors"
          >
            ← All playbooks
          </Link>
          <p className="eyebrow text-foreground mt-8 mb-5">COMMUNITY · 8 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            GRYT vs Yinz Run Club: Which Pittsburgh Run Club Is Right for You?
          </h1>
          <p className="mt-7 text-foreground/75 text-lg md:text-xl leading-[1.55]">
            {DESCRIPTION}
          </p>

          <ShareBar className="mt-8" />

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-foreground/15 p-5"
          >
            <p className="eyebrow text-foreground/70 mb-3">In this playbook</p>
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
            <p>You've heard of Yinz Run Club. Maybe you've shown up to a Wednesday evening run downtown, or you've scrolled past their Instagram and thought, that looks fun. But Wednesday evenings are complicated. The South Hills are far from the city at 6:30 PM. And honestly, you're better at mornings than you are at after-work anything.</p>
            <p>That's a real situation. It's also exactly why this comparison exists.</p>
            <p>Both clubs are free. Both are genuinely welcoming. But they serve different people, at different times, in different parts of Pittsburgh. Here's an honest look at each so you can figure out which one actually fits your life right now.</p>

            <h2 id="what-yinz-is" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">What Yinz Run Club Is</h2>
            <p>Yinz Run Club is Pittsburgh's largest free running community, with over 2,500 members. They've built something real: a consistent Wednesday evening run at 6:30 PM with 3-mile and 1-mile options at rotating locations across the city, plus trail runs every other Saturday morning in rotating parks. Both are no-drop, with volunteer pacers and sweepers. As of November 10, 2026, Yinz's site lists the Saturday start as 9:00 AM on one page and 10:00 AM on another, so check before you go.</p>
            <p>If you live in or near Pittsburgh proper, work a standard schedule, and want a big energetic group run with a social scene attached, Yinz delivers. The size alone means you'll find someone running your pace. Rotating locations keep things fresh. The community is active and it shows.</p>
            <p>The honest limitation is geography and timing. Yinz is a city club. Their runs happen in Pittsburgh neighborhoods. If you're coming from McMurray, Peters Township, Upper St. Clair, or Bethel Park, a Wednesday 6:30 PM run in the city means fighting traffic, arriving rushed, and getting home late. Their Saturday trail runs are every other week in rotating parks, so they aren't a fixed weekly anchor.</p>
            <p>None of that is a knock on Yinz. It's just the reality of where they run and when.</p>

            <h2 id="what-gryt-is" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">What GRYT Run Club Is</h2>
            <p>GRYT Run Club meets every Saturday at 7 AM on the Montour / Peters Trail in McMurray, PA. Four miles out and back on a flat, beginner-friendly trail. Walkers, joggers, and runners all show up. No one gets dropped. After the run, people hang out in the parking lot with coffee.</p>
            <p>Always free. No membership, no fees, no upsell.</p>
            <p>Laura and Nick Merich founded GRYT and have 27 marathon finishes between them. On a typical Saturday, 7 to 15 people show up. The Strava club has 33 members. It's a smaller group — and that's part of what makes it work.</p>
            <p>The 7 AM start is intentional. You're done by 8:15. The rest of Saturday is still yours.</p>

            <h2 id="real-differences" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">The Real Differences</h2>

            <h3 id="location" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">Location</h3>
            <p>This is the clearest split. Yinz is a Pittsburgh city club. GRYT is a South Hills club. If you live south of the city, GRYT is probably ten minutes from your house. Yinz is thirty-plus minutes away before you even think about parking.</p>
            <p>For anyone searching "Yinz Run Club South Hills" or "run club McMurray PA," this matters more than anything else on this list.</p>

            <h3 id="day-and-time" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">Day and Time</h3>
            <p>Yinz runs Wednesday evenings at 6:30 PM and trail runs every other Saturday morning. GRYT runs every Saturday at 7 AM, every week.</p>
            <p>Wednesday evenings work well if you don't have kids or your schedule is flexible. For parents, 6:30 PM is often the hardest hour of the day — dinner, homework, bedtime. Getting out the door consistently at that time is hard to sustain.</p>
            <p>Saturday at 7 AM is different. The kids aren't up yet. The day hasn't started. You can run four miles, drink coffee in a parking lot with people you actually like, and still be home before 9.</p>

            <h3 id="group-size" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">Group Size and Feel</h3>
            <p>Yinz has 2,500-plus members. That's a scene. You might run next to someone different every week. The energy is high and the variety is real.</p>
            <p>GRYT is smaller and tighter. You'll know people's names quickly. By your third Saturday, someone will remember how your last race went. It's the difference between a big open gym and a regular pickup game with the same crew.</p>
            <p>Neither is better in the abstract. It depends on what you need.</p>

            <h3 id="post-run" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">Post-Run Social</h3>
            <p>Yinz's post-run social varies by location and night. GRYT's is the same every week: coffee in the parking lot at the Montour / Peters trailhead. No agenda, no pitch, no bar tab. It's a simple ritual, and that consistency is part of why people keep showing up.</p>

            <h2 id="who-yinz" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">Who Should Run with Yinz</h2>
            <p>You live in or near Pittsburgh proper. Wednesday evenings work for you. You want a massive community, rotating locations, and a lot of energy. You're comfortable in a big group and don't need the same faces every week. Yinz is a great club and a strong fit for that profile.</p>

            <h2 id="who-gryt" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">Who Should Run with GRYT</h2>
            <p>You live in the South Hills — McMurray, Peters Township, Upper St. Clair, Bethel Park. Saturday mornings work better than Wednesday evenings. You have kids, or a job that makes weeknight runs hard to stick with. You used to be an athlete and you miss having a group, but you're not chasing a PR right now. You want to know the people you run with.</p>
            <p>You want coffee after, not a bar.</p>
            <p>If that sounds like you, GRYT is closer, more convenient, and built specifically for that version of you.</p>

            <h2 id="both" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">Can You Run with Both?</h2>
            <p>Yes. Yinz and GRYT aren't competing for the same Saturday morning slot. They serve different parts of the city on different days. If you want a Saturday morning anchor in the South Hills, GRYT gives you that. If you occasionally want a bigger city run on a Wednesday, Yinz is there.</p>
            <p>Most people end up gravitating toward whichever club fits their schedule consistently. Consistency is what builds a habit. A habit is what makes running stick.</p>

            <h2 id="faqs" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">FAQs</h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <p className="font-bold text-foreground">{f.q}</p>
                  <p className="mt-2 text-foreground/80">{f.a}</p>
                </div>
              ))}
            </div>

            <p className="mt-10">Both clubs are worth knowing about. But if you're in the South Hills and Saturday mornings are when you can actually show up, there's one clear answer.</p>
            <p>We'll be at the Montour / Peters Trail next Saturday at 7. Most people come alone the first time. That's fine. So did everyone else.</p>
            <p>
              RSVP for this Saturday at{" "}
              <Link to="/" className="text-foreground underline underline-offset-4">
                grytrunclub.com
              </Link>
              .
            </p>
          </div>

          <ShareBar className="mt-12" label="Share this playbook" />

          <div className="mt-12 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              RSVP This Saturday →
            </Link>
            <Link
              to="/resources/playbooks"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-foreground/40 text-foreground hover:border-blue hover:text-foreground/70 transition-colors"
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
    "inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] border border-foreground/30 text-foreground hover:border-blue hover:text-foreground/70 transition-colors";

  return (
    <div className={className} aria-label={label}>
      <p className="eyebrow text-foreground/70 mb-3">{label}</p>
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
        <a href={xHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2H21l-6.51 7.44L22 22h-6.83l-4.77-6.23L4.8 22H2l6.96-7.95L2 2h6.91l4.33 5.73L18.24 2Zm-1.197 18h1.671L7.05 4h-1.79l11.787 16Z" />
          </svg>
          X
        </a>
        <a href={fbHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on Facebook">
          <Facebook size={14} aria-hidden="true" /> Facebook
        </a>
        <a href={liHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on LinkedIn">
          <Linkedin size={14} aria-hidden="true" /> LinkedIn
        </a>
      </div>
    </div>
  );
}
