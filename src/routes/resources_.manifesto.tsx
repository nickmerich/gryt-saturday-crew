import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import { track } from "@/lib/analytics";
import crewTrail from "@/assets/photos/manifesto/crew-trail.jpg.asset.json";
import marathonStreet from "@/assets/photos/manifesto/marathon-street.jpg.asset.json";
import fourFriends from "@/assets/photos/manifesto/brotherhood-crew.jpg.asset.json";

import dadsAndKids from "@/assets/photos/manifesto/dads-and-kids.jpg.asset.json";

const HUMAN_LAYER_PHOTOS: {
  src: string;
  alt: string;
  caption: string;
  eyebrow: string;
  span: string;
  ratio: string;
}[] = [
  {
    src: crewTrail.url,
    alt: "GRYT crew gathered on the trail before a Saturday run",
    caption: "The crew before the run. Names remembered. Nobody invisible.",
    eyebrow: "The people",
    span: "md:col-span-8",
    ratio: "aspect-[16/9]",
  },
  {
    src: dadsAndKids.url,
    alt: "Two GRYT dads at the ballpark holding their kids",
    caption: "Why we protect the ritual. The people we run home to.",
    eyebrow: "The family",
    span: "md:col-span-4",
    ratio: "aspect-[4/5]",
  },
  {
    src: marathonStreet.url,
    alt: "Two runners crossing the city together mid-race",
    caption: "Do hard things together. Side by side, every mile.",
    eyebrow: "The love",
    span: "md:col-span-5",
    ratio: "aspect-[4/5]",
  },
  {
    src: fourFriends.url,
    alt: "GRYT crew smiling together on the trail after a Saturday run",
    caption: "Belonging with responsibility attached. This is the crew.",
    eyebrow: "The brotherhood",
    span: "md:col-span-7",
    ratio: "aspect-[16/10]",
  },
];

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/manifesto`;
const TITLE = "July 2026 Audit: The Human Layer Comes First · GRYT Manifesto";
const DESCRIPTION =
  "A GRYT Club audit manifesto from Nick Merich on what we learned, what we missed, and what we are building next.";
const PUBLISHED = "2026-07-01T00:00:00Z";

export const Route = createFileRoute("/resources_/manifesto")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "Nick Merich" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "GRYT Run Club" },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Resources" },
      { property: "article:published_time", content: PUBLISHED },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "July 2026 Audit: The Human Layer Comes First",
          description: DESCRIPTION,
          author: {
            "@type": "Person",
            name: "Nick Merich",
            jobTitle: "Founder, GRYT Run Club",
          },
          publisher: {
            "@type": "Organization",
            name: "GRYT Run Club",
            url: SITE,
          },
          datePublished: PUBLISHED,
          mainEntityOfPage: URL,
          url: URL,
        }),
      },
    ],
  }),
  component: ManifestoPage,
});

const mono = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

type Section = {
  id: string;
  eyebrow?: string;
  heading: string;
  paragraphs: (string | string[])[]; // string = <p>, string[] = <ul>
};

const INTRO: string[] = [
  "We built a serious system before we built a serious ritual.",
  "That is the hard truth from the GRYT audit.",
  "The brand is there. The website is there. The tech stack is there. The ambition is there. We have the tools, the dashboards, the automations, the content engine, the Strava layer, the Notion layer, the email layer, and the operating brain of a much bigger community.",
  "But the audit made one thing clear:",
  "Our infrastructure is ahead of our in-person mechanics.",
  "That is not failure. That is sequencing.",
  "It means we have already built the rails. Now we have to make sure the train is full of real people who feel seen, safe, known, and pulled back in every week.",
  "GRYT is not leaking because people do not want community. GRYT is leaking because the human layer is not operational enough yet.",
  "That is the work now.",
];

const PULL_QUOTES = [
  "Not more software. More structure.",
  "Not more acquisition. More retention.",
  "Not more “we are beginner-friendly.” More proof that a beginner can show up, run the pace they actually run, get their name remembered, appear in the recap, and receive a real follow-up from a real person.",
];

const SECTIONS: Section[] = [
  {
    id: "core-lesson",
    eyebrow: "The core lesson",
    heading: "The tech stack scales the community. It does not create it.",
    paragraphs: [
      "The mistake is thinking the tech stack creates the community. It does not. The tech stack scales the community.",
      "It scales the photo. It scales the story. It scales the attendance signal. It scales the follow-up. It scales the member journey. It scales the proof.",
      "But it cannot create the signal by itself. The signal is human.",
      "It is someone standing in the parking lot looking for the newcomer who is not sure where to go. It is someone saying, “I have the back today.” It is someone introducing the first-timer to the regular before the run starts. It is someone taking the photo before everyone disappears into their cars. It is someone sending the DM within 24 hours that says, “I saw you on that last hill. Come back Saturday.”",
      "That is the operating system underneath the software. If that layer is weak, everything leaks. If that layer is strong, everything compounds.",
    ],
  },
  {
    id: "truth-01",
    eyebrow: "Hard truth 01",
    heading: "Values are slogans until they become mechanics.",
    paragraphs: [
      "We say GRYT is beginner-friendly. That is not enough. Every run club says that. Every gym says that. Every community says that.",
      "The audit forced us to separate the value from the mechanic. “Beginner-friendly” is a value. A named pace lead is a mechanic. “No drop” is a value. A tail walker is a mechanic. “Everyone belongs” is a value. A welcome lead who knows exactly what to say in the first 15 seconds is a mechanic.",
      "If someone shows up in McMurray running a 12-minute mile and there is no structural guarantee that they will not get dropped, then we have not earned the right to call the run beginner-friendly yet. That does not mean the intention is wrong. It means the intention is not operational.",
      "The fix is simple, but it has to be explicit:",
      [
        "Someone owns the front. They keep the faster group moving without pulling the whole run away from the rest of the pack.",
        "Someone owns the middle. They keep the social pace alive and make sure the run still feels connected.",
        "Someone owns the back. They make sure the last runner is never alone.",
        "Someone owns the welcome. They greet new people before the awkwardness has time to settle.",
        "Someone owns the photo. They capture proof before the moment disappears.",
      ],
      "That is the difference between a promise and a system. We do not need to say “no one gets left behind” louder. We need to build the mechanics that make it impossible to leave someone behind.",
    ],
  },
  {
    id: "truth-02",
    eyebrow: "Hard truth 02",
    heading: "We are overbuilt for 15 people and underbuilt for first-timers.",
    paragraphs: [
      "GRYT has infrastructure that many 300-person communities would envy. Strava. Notion. Slack. Klaviyo. Automated recaps. Member tracking. Content workflows. Growth systems. Partner systems. A real operating brain. That is not bad. It is actually one of our advantages.",
      "But at this stage, infrastructure can create a dangerous illusion of progress. You can spend hours improving the dashboard while the newcomer is standing by their car wondering if they are in the right place. You can refine the email flow while the first-timer leaves without anyone asking if they are coming back. You can build the recap engine before there is a consistent human responsible for taking the photos.",
      "That is the infrastructure trap. The tools make it feel like the community is more mature than the in-person experience actually is.",
      "So the priority has to flip. The tech stack stays. But it stops leading. The human mechanics lead now. The tools exist to support the ritual, not replace it.",
      "Our next operating question is not, “What else can we automate?” It is, “What human moment has to happen every single Saturday, no matter what?” Once we answer that, the software becomes powerful again. Because then it is scaling something real.",
    ],
  },
  {
    id: "truth-03",
    eyebrow: "Hard truth 03",
    heading: "The photo is not content. The photo is proof.",
    paragraphs: [
      "Run #10 told the truth. The recap system was ready. The content engine was ready. The automation was ready. But the recap could not post because the human signal failed. No photos. No captured moments. No synced details. Nothing real for the machine to work with.",
      "The photo matters because it tells the member, “You were here. This counted. We saw you.” That is retention. People come back to places where they are remembered.",
      "The photo gives us proof of participation. It gives us proof of belonging. It gives us proof that the hard thing actually happened. The recap does not create the community. The recap reflects the community back to itself.",
      "That means capture is now an operational role, not a creative afterthought. Every Saturday needs a human sensor. One person whose job is to take the group photo, get three candid moments, notice the first-timer, capture the coffee table, and hand the signal to the system before the day goes cold. The fix is not more automation. The fix is one person with a phone who knows the assignment.",
    ],
  },
  {
    id: "truth-04",
    eyebrow: "Hard truth 04",
    heading: "A founder-led ritual is fragile until the crew exists.",
    paragraphs: [
      "Right now, too much of GRYT still runs through me and Laura. That is normal in the beginning. It is also dangerous if we pretend it can stay that way.",
      "If the run depends on the founders, the community is one sick kid, one travel weekend, one bad night of sleep, one roofing emergency, or one overloaded week away from breaking rhythm. And rhythm is everything. People do not build habits around uncertainty. They build habits around rituals that keep showing up.",
      "The answer is not to lower the ambition. The answer is to build the crew. Not a giant volunteer bureaucracy. A small operating crew that protects the ritual:",
      [
        "Welcome Lead — owns the first 15 seconds and makes sure no newcomer is invisible.",
        "Pace Leads — own the front, middle, and back so every runner knows where they fit.",
        "Tail Walker — owns the final runner and makes “no drop” real.",
        "Photographer — owns proof of participation and same-day handoff.",
        "Backup Captain — owns the ritual when the founders cannot.",
      ],
      "The goal is not for Nick and Laura to carry GRYT forever. The goal is for GRYT to become strong enough that other people can carry pieces of it with pride.",
    ],
  },
  {
    id: "truth-05",
    eyebrow: "Hard truth 05",
    heading: "Acquisition is wasteful until retention holds.",
    paragraphs: [
      "The instinct when attendance is flat is to push harder. More posts. More invites. More bring-a-friend. More partnerships. More campaigns. More noise.",
      "The audit pushed back on that instinct. If week one does not become week two, acquisition is not growth. It is churn with better marketing.",
      "You can bring 20 new people into a system that does not welcome them clearly, pace them safely, photograph them visibly, and follow up personally. But if only two of them return, the problem was never top-of-funnel. The problem was the container.",
      "So the order matters:",
      [
        "01 — Plug the leak. Install the pace mechanics, welcome ritual, photo role, and 24-hour follow-up.",
        "02 — Empower the crew. Give named humans ownership of the Saturday experience.",
        "03 — Turn on the faucet. Push bring-a-friend, partner collabs, and larger acquisition once the experience can hold the demand.",
      ],
      "We should be optimistic about September. September can be a real push. But July and August need to be the build. This is where we earn the right to grow. Not by making the brand louder. By making the experience stronger.",
    ],
  },
  {
    id: "priorities",
    eyebrow: "New operating priorities",
    heading: "Named humans. Named moments. Repeatable every Saturday.",
    paragraphs: [
      "Build the no-drop system. No-drop has to become visible, named, and repeatable. Every Saturday needs named pace ownership before the run starts. Pace leads, a tail walker, regroup points, and language that makes the system clear before the first step. No one has to be brave just to avoid being left alone.",
      "Own the first 15 seconds. The newcomer experience starts before the run starts. “Hey, you new to GRYT? I’m Nick. What’s your name? Glad you’re here. We run easy, nobody gets left, and we hang after. I’m going to pair you with Sarah today.” A person who is named in the first minute is more likely to come back than a person who quietly survives the run.",
      "Make capture a role. Group photo. First-timer in the middle. Two or three candid moments. Coffee table. One member quote if it shows up naturally. That is enough. The automation can take it from there. But the human has to capture the moment first.",
      "Protect the Saturday ritual. Same day. Same time. Same anchor. Same expectation. Weather can shape the route. Holidays can shape the turnout. Life can shape who shows up. But silent cancellation cannot become part of the culture.",
      "Grow the crew before the crowd. The next unlock is not 100 more prospects. It is five reliable people who each own one part of the Saturday experience. The crew is belonging with responsibility attached.",
    ],
  },
  {
    id: "next-90",
    eyebrow: "The next 90 days",
    heading: "Stabilize, then staff, then scale.",
    paragraphs: [
      "Days 1–30 · Stabilize the ritual. Name pace roles before every run. Assign a tail walker every Saturday. Designate a welcome lead. Designate a photo owner. Send every first-timer a personal 24-hour DM. Keep the post-run hang protected. The goal is repeatability.",
      "Days 31–60 · Build the crew. Identify three to five regulars who already behave like anchors. Give each person a small role with a clear job. Rotate responsibilities without overcomplicating the system. Recognize the crew publicly so responsibility feels like identity, not labor. Start tracking first-timer return rate and missed-three-week drifters.",
      "Days 61–90 · Turn on growth. Bring-a-friend starts to matter. Partnerships become more valuable. The content engine becomes powerful. September becomes the next chapter. But we only turn on the faucet when the bucket is no longer leaking.",
    ],
  },
  {
    id: "beliefs",
    eyebrow: "What we believe now",
    heading: "The back of the pack is a growth channel.",
    paragraphs: [
      "Community is not built by saying “community.” It is built by designing the moments where someone decides if they belong.",
      "If the newest, slowest, most nervous runner feels protected, the whole club gets stronger.",
      "The photo is proof. Not vanity. Proof that people showed up. Proof that the hard thing happened. Proof that someone was part of it.",
      "Founders should start the fire, not become the oxygen. If GRYT only works when Nick and Laura carry every piece, then GRYT is not strong enough yet.",
      "Retention comes before acquisition. Bring-a-friend works when the friend walks into a system that can hold them.",
      "The tech stack matters. But only after the human layer is real. The stack scales the story. The people create it.",
    ],
  },
];

const SHARE_TEXT = "The Human Layer Comes First — a GRYT Club audit manifesto from Nick Merich.";

function ShareBar({ variant = "dark" }: { variant?: "dark" | "vintage" }) {
  const [copied, setCopied] = useState(false);
  const url = URL;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(SHARE_TEXT);
  const encodedTitle = encodeURIComponent(TITLE);

  const links = [
    {
      key: "twitter",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("share", { method: "copy_link", content_id: "manifesto" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  }

  const borderCls = variant === "vintage" ? "border-ink/25" : "border-foreground/25";
  const hoverCls = "hover:border-blue hover:text-foreground/70";
  const textCls = variant === "vintage" ? "text-ink/80" : "text-foreground/80";
  const labelCls = variant === "vintage" ? "text-ink/60" : "text-foreground/75";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${textCls}`}>
      <span
        className={`text-[11px] tracking-[0.22em] uppercase ${labelCls}`}
        style={mono}
      >
        Share
      </span>
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target={l.key === "email" ? undefined : "_blank"}
          rel={l.key === "email" ? undefined : "noopener noreferrer"}
          onClick={() =>
            track("share", { method: l.key, content_id: "manifesto" })
          }
          className={`inline-flex items-center px-3 py-2 text-[11px] font-bold tracking-[0.18em] uppercase border ${borderCls} ${hoverCls} transition-colors`}
          style={mono}
        >
          {l.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className={`inline-flex items-center px-3 py-2 text-[11px] font-bold tracking-[0.18em] uppercase border ${borderCls} ${hoverCls} transition-colors`}
        style={mono}
        aria-live="polite"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

function ManifestoPage() {
  return (
    <main className="bg-background text-foreground">
      <SiteNav />

      {/* HERO */}
      <section className="px-6 sm:px-12 lg:px-24 pt-20 md:pt-28 pb-16 md:pb-24 border-b border-foreground/15">
        <div className="max-w-[900px] mx-auto">
          <Link
            to="/resources"
            className="eyebrow text-foreground hover:text-foreground transition-colors"
            style={mono}
          >
            ← All resources
          </Link>
          <p className="eyebrow text-foreground mt-8 mb-5" style={mono}>
            SELF-REFLECTION · AUDIT MANIFESTO · FROM NICK
          </p>
          <h1
            className="uppercase text-[clamp(48px,9vw,140px)] leading-[0.88] tracking-tight"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            July 2026 Audit:<br />The Human Layer<br />Comes First
          </h1>
          <p className="mt-8 text-foreground/85 text-[18px] md:text-[22px] leading-[1.5] max-w-[720px]">
            A GRYT Club audit manifesto on what we learned, what we missed,
            and what we are building next.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-foreground/75" style={mono}>
            <span>By Nick Merich</span>
            <span aria-hidden>·</span>
            <span>Founder, GRYT Run Club</span>
          </div>
          <div className="mt-8">
            <ShareBar />
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-6 sm:px-12 lg:px-24 py-12 md:py-16 border-b border-foreground/15">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          {INTRO.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-foreground text-[22px] md:text-[26px] font-light leading-[1.4]"
                  : "text-foreground/85 text-[17px] leading-[1.7]"
              }
              style={i === 0 ? { fontFamily: "var(--font-display)" } : undefined}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* PULL QUOTES */}
      <section className="px-6 sm:px-12 lg:px-24 py-12 md:py-16 border-b border-foreground/15 bg-background">
        <div className="max-w-[900px] mx-auto grid md:grid-cols-3 gap-8 md:gap-12">
          {PULL_QUOTES.map((q, i) => (
            <blockquote
              key={i}
              className="border-l-2 border-blue pl-5 text-foreground/90 text-[17px] leading-[1.5]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {q}
            </blockquote>
          ))}
        </div>
      </section>

      {/* HUMAN LAYER — PHOTOS */}
      <section className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[1180px] mx-auto">
          <div className="max-w-[720px] mb-14">
            <p className="eyebrow text-foreground mb-5" style={mono}>
              The human layer
            </p>
            <h2
              className="uppercase text-[clamp(32px,5vw,72px)] leading-[0.92] tracking-tight"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              People. Family. Love.
            </h2>
            <p className="mt-6 text-foreground/80 text-[17px] leading-[1.7]">
              The dashboards do not remember anyone. The photos do. This is
              what the system is built to protect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            {HUMAN_LAYER_PHOTOS.map((p) => (
              <figure
                key={p.src}
                className={`${p.span} group relative overflow-hidden bg-background border border-foreground/10`}
              >
                <div className={`${p.ratio} w-full overflow-hidden`}>
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="p-5 md:p-6 border-t border-foreground/10">
                  <p
                    className="text-[10px] tracking-[0.24em] uppercase text-foreground mb-2"
                    style={mono}
                  >
                    {p.eyebrow}
                  </p>
                  <p className="text-foreground/90 text-[15px] md:text-[16px] leading-[1.5]">
                    {p.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <section className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[820px] mx-auto flex flex-col gap-20">
          {SECTIONS.map((s) => (
            <article key={s.id} id={s.id} className="border-t border-foreground/20 pt-12">
              {s.eyebrow && (
                <p className="eyebrow text-foreground mb-5" style={mono}>
                  {s.eyebrow}
                </p>
              )}
              <h2
                className="uppercase text-[clamp(28px,4.4vw,56px)] leading-[0.95] tracking-tight"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                {s.heading}
              </h2>
              <div className="mt-8 flex flex-col gap-5">
                {s.paragraphs.map((p, i) =>
                  Array.isArray(p) ? (
                    <ul
                      key={i}
                      className="list-none p-0 m-0 flex flex-col gap-3 border-l-2 border-blue/60 pl-5"
                    >
                      {p.map((item, j) => (
                        <li
                          key={j}
                          className="text-foreground/85 text-[16px] md:text-[17px] leading-[1.65]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      key={i}
                      className="text-foreground/85 text-[16px] md:text-[17px] leading-[1.7]"
                    >
                      {p}
                    </p>
                  )
                )}
              </div>
              <ShareButtons url={URL} title={TITLE} />
            </article>
          ))}
        </div>
      </section>

      {/* THE MANIFESTO — closing */}
      <section className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15 bg-background">
        <div className="max-w-[820px] mx-auto">
          <p className="eyebrow text-foreground mb-6" style={mono}>
            The manifesto
          </p>
          <h2
            className="uppercase text-[clamp(32px,5vw,72px)] leading-[0.92] tracking-tight"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Simple. Human. Operational. Built to grow.
          </h2>
          <div className="mt-10 flex flex-col gap-5 text-foreground/85 text-[17px] leading-[1.7]">
            <p>
              We are not building a running content brand. We are building a
              ritual people trust.
            </p>
            <p>
              We are not building a dashboard with occasional humans attached.
              We are building a human system that uses dashboards to remember
              better, follow up faster, and scale care without losing the point.
            </p>
            <p>
              We are not chasing a bigger crowd before we can protect the
              person at the back. We are building the kind of room where the
              first-timer gets named, the regular gets responsibility, the
              drifter gets checked on, and the founder does not have to be the
              only person holding the whole thing together.
            </p>
            <p className="text-foreground text-[20px] md:text-[24px] leading-[1.4] pt-4" style={{ fontFamily: "var(--font-display)" }}>
              The tech stack stays. The human layer leads. And once the human
              layer is real, the whole system can finally compound.
            </p>
          </div>

          <div className="mt-12">
            <ShareBar />
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/resources" className="btn-primary">
              Back to Resources →
            </Link>
            <Link
              to="/resources/conversations"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-foreground/40 text-foreground hover:border-blue hover:text-foreground/70 transition-colors"
            >
              Read Conversations
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
