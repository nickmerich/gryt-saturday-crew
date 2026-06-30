import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Link as LinkIcon, Check, Facebook, Linkedin } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import ogImage from "@/assets/og-playbooks.jpg";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs`;
const TITLE =
  "Fleet Feet Pittsburgh Running Group vs Independent Run Clubs — Which Should You Join? · gryt run club";
const DESCRIPTION =
  "An honest breakdown of Fleet Feet Pittsburgh's running group, independent run clubs, and where GRYT Run Club fits if you're a South Hills or Washington County runner who wants community without the commute.";
const PUBLISHED = "2026-02-03";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "fleet-feet-offers", label: "What Fleet Feet Pittsburgh's Running Group Offers" },
  { id: "paid-side", label: "The Paid Side" },
  { id: "geographic-reality", label: "The Geographic Reality" },
  { id: "independent-offers", label: "What Independent Run Clubs Offer" },
  { id: "worth-joining", label: "What Makes an Independent Club Worth Joining" },
  { id: "gryt", label: "GRYT Run Club: The South Hills Independent" },
  { id: "saturday-7am", label: "Why Saturday at 7 AM Matters" },
  { id: "trail", label: "The Trail" },
  { id: "who-fleet-feet", label: "Who Should Choose Fleet Feet Pittsburgh" },
  { id: "who-gryt", label: "Who Should Choose GRYT" },
  { id: "comparison", label: "The Honest Comparison" },
  { id: "one-more", label: "One More Thing Worth Saying" },
  { id: "faqs", label: "FAQs" },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Is Fleet Feet Pittsburgh's running group free to join?",
    a: "Yes. Fleet Feet Pittsburgh's club runs are free with code FREECLUB. They also offer paid training programs ranging from $75 to $150, which are separate from the free club runs and tied to Pittsburgh Marathon season.",
  },
  {
    q: "Does Fleet Feet Pittsburgh have any runs in the South Hills?",
    a: "No. All Fleet Feet Pittsburgh club runs are anchored to the east end of the city — Bakery Square and Schenley Park. There is no consistent Fleet Feet presence in McMurray, Peters Township, Upper St. Clair, or Bethel Park.",
  },
  {
    q: "What free independent run clubs operate in Pittsburgh's South Hills?",
    a: "GRYT Run Club is the only free, weekly, trail-based run club consistently operating in the McMurray/South Hills corridor. It meets every Saturday at 7 AM on the Montour/Peters Trail — no fees, no pace requirements, no store affiliation.",
  },
  {
    q: "What's the difference between a retail-backed run club and an independent run club?",
    a: "A retail-backed club like Fleet Feet's is organized and funded by a running store, often tied to product launches, sponsored training programs, and store events. An independent club like GRYT has no retail sponsor, no upsell, and no agenda beyond showing up and running together.",
  },
  {
    q: "Are there Saturday morning run clubs in Pittsburgh's South Hills?",
    a: "Yes. GRYT Run Club meets every Saturday at 7 AM on the Montour/Peters Trail in McMurray. Free, open to walkers, joggers, and runners, with post-run coffee in the parking lot.",
  },
  {
    q: "What should I expect at my first GRYT run?",
    a: "Arrive ten minutes early and a founder or regular will introduce you before the run starts. The route is about four miles, flat, out-and-back on the Montour/Peters Trail. You run your pace. Nobody gets dropped. Coffee after.",
  },
  {
    q: "Can I do both Fleet Feet Pittsburgh and GRYT Run Club?",
    a: "Absolutely. Fleet Feet's weeknight schedule and GRYT's Saturday morning slot don't overlap. If you're in the South Hills and want more weekly mileage with community, running both makes sense.",
  },
];

export const Route = createFileRoute(
  "/resources_/playbooks_/fleet-feet-pittsburgh-vs-independent-run-clubs",
)({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Fleet Feet Pittsburgh, Fleet Feet running group, independent run club Pittsburgh, GRYT Run Club, South Hills running club, McMurray running club, Montour Trail run club, Peters Township run club, free running club Pittsburgh, Saturday morning run Pittsburgh",
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
            "Fleet Feet Pittsburgh Running Group vs Independent Run Clubs — Which Should You Join?",
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
          about: ["Fleet Feet Pittsburgh", "GRYT Run Club", "Pittsburgh running"],
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
            {
              "@type": "ListItem",
              position: 3,
              name: "Fleet Feet Pittsburgh vs Independent Run Clubs",
              item: URL,
            },
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
            Fleet Feet Pittsburgh Running Group vs Independent Run Clubs — Which Should You Join?
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            {DESCRIPTION}
          </p>

          <ShareBar className="mt-8" />

          <nav
            aria-label="Table of contents"
            className="mt-10 border border-paper/15 p-5"
          >
            <p className="eyebrow text-paper/55 mb-3">In this playbook</p>
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
            <p>You're standing in a parking lot at 6:58 AM, coffee still at home, wondering if you picked the right group. It's a fair question. Pittsburgh has options now — retail-backed clubs, free independents, city runs, trail runs. And if you're in the South Hills, most of those options are 45 minutes away before you've even tied your shoes.</p>
            <p>Here's a straight breakdown of what Fleet Feet Pittsburgh's running group offers, what independent clubs offer, and where GRYT Run Club fits if you're a South Hills or Washington County runner who wants community without the commute.</p>

            <h2 id="fleet-feet-offers" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">What Fleet Feet Pittsburgh's Running Group Offers</h2>
            <p>Fleet Feet Pittsburgh is retail-backed and anchored to the east end of the city. Their club runs are genuinely free — join with code FREECLUB — and the schedule is consistent:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Monday recovery runs, Bakery Square, 6:30 PM</li>
              <li>Wednesday track club, Schenley Park Oval, 6:30 PM</li>
              <li>Thursday East End pub runs, Bakery Square, 6:30 PM</li>
              <li>Sunday long runs, rotating location, 7:30 AM</li>
            </ul>
            <p>Four days a week of free programming is real. Worth saying plainly. If you live near Squirrel Hill, Shadyside, or anywhere in the east end, that schedule is convenient and well-organized.</p>

            <h3 id="paid-side" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">The Paid Side</h3>
            <p>Fleet Feet also runs structured training programs during Pittsburgh Marathon season, priced between $75 and $150. Coached, goal-oriented, sponsored by ASICS. If you want a training plan, pace groups, and a race-day target, that's what those programs are built for.</p>
            <p>The free club runs and the paid programs serve different purposes. Club runs are social. Training programs are performance-focused. That distinction matters when you're figuring out what you actually need.</p>

            <h3 id="geographic-reality" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">The Geographic Reality</h3>
            <p>Here's the honest part: Fleet Feet has no South Hills presence. Every run is anchored to Bakery Square or Schenley Park. If you're in McMurray, Peters Township, Upper St. Clair, or Bethel Park, you're looking at a 30-to-45-minute drive each way before a 6:30 PM weeknight run. After work, with kids, that math rarely works.</p>

            <h2 id="independent-offers" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">What Independent Run Clubs Offer</h2>
            <p>Independent clubs — no retail sponsor, no store affiliation, no paid programs attached — operate differently. The best ones are built around a specific time, place, and culture rather than a product ecosystem.</p>
            <p>The tradeoff is usually structure. You won't get a 16-week training plan or coached track workouts. What you get instead is consistency, low friction, and a group that shows up for the same reason you do: because running alone stopped working.</p>

            <h3 id="worth-joining" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">What Makes an Independent Club Worth Joining</h3>
            <p>The best ones share a few things. Same time every week. No one gets dropped. Free, always. And the post-run social is actually good — not an afterthought.</p>
            <p>Those aren't small things. Consistency builds habit. Not being dropped keeps newer runners coming back. Free means no weekly decision to make. And a real post-run ritual gives people a reason to stay.</p>

            <h2 id="gryt" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">GRYT Run Club: The South Hills Independent</h2>
            <p>GRYT Run Club meets every Saturday at 7 AM on the Montour/Peters Trail in McMurray. About four miles, flat, out and back. Walkers, joggers, and runners all go at whatever pace works for them. Nobody gets dropped. It's always free.</p>
            <p>After the run, people hang out in the parking lot with coffee. No agenda. No pitch. Just the kind of conversation that happens when you've just done something hard together.</p>
            <p>GRYT was founded by Laura and Nick Merich, who have 27 combined marathon finishes. They built it because the South Hills had no consistent, free, trail-based run club — and because Saturday at 7 AM, before the day takes over, is a window that actually works for people with full lives.</p>

            <h3 id="saturday-7am" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">Why Saturday at 7 AM Matters</h3>
            <p>Most people with kids or demanding schedules can't reliably make a 6:30 PM weeknight run. Something always comes up. Saturday at 7 AM is different. The house is quiet. The day hasn't started. You can be back by 9 AM with the run done and coffee already had.</p>
            <p>That timing isn't an accident. It's the whole point.</p>

            <h3 id="trail" className="text-xl md:text-2xl font-bold mt-8 mb-1 scroll-mt-24">The Trail</h3>
            <p>The Montour/Peters Trail is flat and beginner-friendly. For someone coming back after years off, that matters. There's no hill waiting to blow up your first run back. By mile two, the trail opens up and conversations get real — pace stops being the subject and life takes over. That's usually the mile where people decide they're coming back next week.</p>

            <h2 id="who-fleet-feet" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">Who Should Choose Fleet Feet Pittsburgh</h2>
            <p>Fleet Feet is the right call if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You live in or near Pittsburgh's east end and the commute is no issue</li>
              <li>You want weeknight runs with a structured, consistent schedule</li>
              <li>You're training for the Pittsburgh Marathon and want a coached program ($75–$150)</li>
              <li>You want track workouts or pace-group accountability</li>
              <li>You're drawn to a larger, more established club with retail support</li>
            </ul>
            <p>The free club runs are genuinely accessible. The paid programs are well-organized. If east end geography works for you and you want race-specific training, Fleet Feet delivers.</p>

            <h2 id="who-gryt" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">Who Should Choose GRYT</h2>
            <p>GRYT is the right call if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You're in McMurray, Peters Township, Upper St. Clair, Bethel Park, or anywhere in Washington County</li>
              <li>Saturday morning is your best window and weeknight runs don't fit your schedule</li>
              <li>You want a trail run, not a road or track workout</li>
              <li>You're a former athlete, a busy parent, or a comeback runner who wants community without competition</li>
              <li>You want zero cost, zero pace pressure, and coffee after with no sales pitch attached</li>
            </ul>
            <p>There is no other free, weekly, trail-based run club consistently operating in the McMurray/South Hills corridor. GRYT holds that ground alone. If you're in the South Hills, the real choice isn't Fleet Feet vs. GRYT — it's GRYT vs. running alone on Saturday.</p>

            <h2 id="comparison" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">The Honest Comparison</h2>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-[14px] md:text-[15px] border-collapse">
                <thead>
                  <tr className="border-b border-paper/25">
                    <th className="text-left py-2 px-2 font-bold"> </th>
                    <th className="text-left py-2 px-2 font-bold">Fleet Feet Pittsburgh</th>
                    <th className="text-left py-2 px-2 font-bold">GRYT Run Club</th>
                  </tr>
                </thead>
                <tbody className="text-paper/85">
                  {[
                    ["Cost", "Free (club runs) / $75–$150 (training)", "Always free"],
                    ["Schedule", "Mon/Wed/Thu/Sun", "Every Saturday"],
                    ["Time", "6:30 PM weeknights / 7:30 AM Sunday", "7:00 AM Saturday"],
                    ["Location", "East end (Bakery Square, Schenley)", "McMurray, Montour/Peters Trail"],
                    ["Format", "Road, track, pub run", "Trail, out-and-back"],
                    ["Post-run", "Pub (Thu) / varies", "Coffee in the parking lot"],
                    ["Coaching", "Paid programs available", "No — peer-led"],
                    ["South Hills presence", "None", "That's the whole point"],
                  ].map(([k, a, b]) => (
                    <tr key={k} className="border-b border-paper/10 align-top">
                      <td className="py-2 px-2 font-semibold text-paper">{k}</td>
                      <td className="py-2 px-2">{a}</td>
                      <td className="py-2 px-2">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Neither club is better in the abstract. They serve different people in different places at different times.</p>

            <h2 id="one-more" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">One More Thing Worth Saying</h2>
            <p>If you've been out of consistent running for a while, the first question isn't which club has the better training plan. It's which club you'll actually show up to. Proximity matters. Timing matters. Feeling like you belong on day one matters.</p>
            <p>Most people who join GRYT come alone the first time. That's fine. So did everyone else.</p>

            <h2 id="faqs" className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">FAQs</h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <p className="font-bold text-paper">{f.q}</p>
                  <p className="mt-2 text-paper/80">{f.a}</p>
                </div>
              ))}
            </div>

            <p className="mt-10">Saturday at 7 AM, the parking lot at the Montour/Peters Trail is quiet for about three minutes. Then shoes hit gravel and the run starts. By mile two, nobody's thinking about which club they picked. They're just running.</p>
            <p>
              If you're in the South Hills and you've been looking for a reason to show up, this is it. RSVP for this Saturday at{" "}
              <Link to="/" className="text-blue underline underline-offset-4">
                grytrunclub.com
              </Link>
              .
            </p>
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
  // Bump SHARE_VERSION when og:image / title / description change to force
  // X, Facebook, and LinkedIn to re-scrape instead of serving a cached preview.
  const SHARE_VERSION = "2026-02-03";
  const UTM_CAMPAIGN = "fleet-feet-vs-independent";

  function withUtm(medium: string) {
    const params = new URLSearchParams({
      v: SHARE_VERSION,
      utm_source: medium === "copy" ? "copy" : medium,
      utm_medium: medium === "copy" ? "copy-link" : "social",
      utm_campaign: UTM_CAMPAIGN,
      utm_content: "playbook-share-bar",
    });
    return `${URL}?${params.toString()}`;
  }

  const copyUrl = withUtm("copy");
  const xUrl = withUtm("twitter");
  const fbUrl = withUtm("facebook");
  const liUrl = withUtm("linkedin");

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    TITLE,
  )}&url=${encodeURIComponent(xUrl)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    fbUrl,
  )}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    liUrl,
  )}`;

  async function onCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyUrl);
      } else {
        const el = document.createElement("textarea");
        el.value = copyUrl;

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
