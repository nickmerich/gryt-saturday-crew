import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav, SiteFooter, MonogramG } from "@/components/site/Chrome";
import { submitPartnerInquiry } from "@/lib/partner-inquiries.functions";
import { submitStorySubmission } from "@/lib/story-submissions.functions";
import { TwoDoors, StartHere, Library } from "@/components/site/RunnerLibrary";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Running Resources · South Hills Pittsburgh | GRYT Run Club" },
      {
        name: "description",
        content:
          "Free running guides and tools from GRYT, a free South Hills run club in Pittsburgh: pace calculator, what to wear by temperature, first-run guides, training, racing, and safety.",
      },
      { property: "og:title", content: "Running Resources · South Hills Pittsburgh | GRYT Run Club" },
      {
        property: "og:description",
        content:
          "Everything we've learned running the South Hills every Saturday. Guides, free tools, and start-here paths, shared openly.",
      },

      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grytrunclub.com/resources" },
      { property: "og:image", content: "https://grytrunclub.com/og-resources.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://grytrunclub.com/og-resources.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/resources" }],
  }),
  component: ResourcesPage,
});

type Involvement =
  | "Post-Run Sponsor"
  | "Gear Partner"
  | "Content Feature"
  | "Location Partner"
  | "Other";

/* ═══════════════════════════════════════════════════════════════
   RESOURCES — Editorial Swiss Grid
   Vol. 01 · Issue 03
   ═══════════════════════════════════════════════════════════════ */

function ResourcesPage() {
  return (
    <>
      <a
        href="#resources-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue focus:text-ink focus:text-[12px] focus:tracking-[0.2em] focus:uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-paper"
        style={mono}
      >
        Skip to content
      </a>
      <main id="resources-main" className="bg-ink text-paper">
        <SiteNav />
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-16 md:pt-24 pb-24">
          <Masthead />
          <TwoDoors />
          <StartHere />
          <Library />
          <Conversations />
          <ManifestoCallout />
          <ShareYourStory />
          <ArtifactsAndTools />
          <GetInvolved />
        </div>
        <SiteFooter />
      </main>
    </>
  );
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
const focusRingLight =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-blue";

/* ─────────────────────────  SHARED  ───────────────────────── */

function SectionRule({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-5 mb-10 md:mb-14">
      <span
        className="text-blue font-mono text-[12px] tracking-[0.22em] uppercase shrink-0"
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
      >
        {number}
      </span>
      <h2
        className="uppercase text-[clamp(34px,5.2vw,72px)] leading-[0.9] tracking-tight"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        {title}
      </h2>
      <div className="h-px flex-1 bg-paper/35 mb-3" aria-hidden="true" />
    </div>
  );
}

const mono = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

/* ─────────────────────────  MASTHEAD  ────────────────────── */

function Masthead() {
  return (
    <header className="border-b-2 border-paper pb-10 md:pb-14 mb-20 md:mb-28">
      <h1
        className="uppercase leading-[0.82] tracking-tight text-[clamp(64px,13vw,200px)]"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        Resources
      </h1>
      <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <p className="text-[22px] md:text-[28px] font-light leading-[1.3] max-w-[720px] text-paper/95"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Some people come here for Saturday. Some come to learn.{" "}
          <span className="text-blue">Both are welcome.</span> Everything we've
          learned from showing up every week, shared freely.
        </p>
        <p className="text-[12px] tracking-[0.24em] uppercase text-paper/70 shrink-0" style={mono}>
          An open field manual<br className="hidden md:block" /> · Pittsburgh, PA
        </p>
      </div>
      <div className="mt-10 grid md:grid-cols-2 gap-6 md:gap-10 max-w-[1040px] text-paper/80 text-[16px] leading-[1.7]">
        <p>
          This is the free runner library from GRYT Run Club, a no-drop community run club in Pittsburgh's
          South Hills that meets every Saturday at 7 AM on the Montour/Peters Trail in McMurray. The guides cover
          the questions people actually ask us at the trailhead: how to start running again after a long break,
          how to build a running base, how to add mileage without getting hurt, what to eat before a run, and
          how to stay safe running at night or in a Pittsburgh winter.
        </p>
        <p>
          You'll also find free tools, including a pace and race time calculator, a what-to-wear guide that reads
          the Saturday forecast, and a run plan builder, plus honest comparisons of Pittsburgh run clubs like Fleet
          Feet, City of Bridges, parkrun, and Yinz. Everything here is free to read, with no email required. If it
          helps you get out the door, come run with us on Saturday.
        </p>
      </div>
    </header>
  );
}

/* ─────────────────────────  CONVERSATIONS  ───────────────── */

const CONVERSATIONS: Array<{
  n: string;
  guest: string;
  role: string;
  quote: string;
  comingSoon?: boolean;
}> = [
  {
    n: "042",
    guest: "Nick Merich",
    role: "Founder, GRYT Run Club",
    quote:
      "Saturday morning became the most important appointment of the week. Not because of the run — because of who was at the trailhead.",
  },
  {
    n: "039",
    guest: "Laura Merich",
    role: "Co-Founder · Parent · Runner",
    quote:
      "Consistency beats perfection. Show up when it's cold, when you're tired, when you don't feel like it. That's the whole program.",
  },
  {
    n: "035",
    guest: "The Community",
    role: "Members, partners, coaches — soon",
    quote:
      "The people who kept showing up built the club. This is where their stories will live.",
    comingSoon: true,
  },
];

function Conversations() {
  return (
    <section className="mb-24 md:mb-32">
      <div className="flex flex-col md:flex-row gap-12 md:gap-20">
        <aside className="md:w-1/4 shrink-0">
          <div className="md:sticky md:top-24">
            <span className="text-blue text-[12px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
              § 02
            </span>
            <h2
              className="uppercase text-[clamp(36px,4.5vw,64px)] leading-[0.9] tracking-tight"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Conversations
            </h2>
            <p className="mt-5 text-paper/80 text-[15px] leading-[1.65] max-w-[280px]">
              Unfiltered dialogue with the founders and the crew — on
              community, consistency, and doing hard things together.
            </p>
            <Link
              to="/resources/conversations"
              className={`mt-6 inline-block text-[12px] tracking-[0.22em] uppercase text-blue underline underline-offset-4 decoration-blue/40 hover:decoration-blue hover:text-paper transition-colors ${focusRing}`}
              style={mono}
            >
              Read all →
            </Link>
          </div>
        </aside>

        <div className="md:w-3/4 space-y-16 md:space-y-20">
          {CONVERSATIONS.map((c, i) => (
            <article
              key={c.n}
              className={`group ${
                i < CONVERSATIONS.length - 1 ? "border-b border-paper/20 pb-16 md:pb-20" : ""
              } ${c.comingSoon ? "opacity-80" : ""}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-blue text-[12px] tracking-[0.24em] uppercase" style={mono}>
                  Transcript {c.n}
                </span>
                {c.comingSoon && (
                  <span className="text-[11px] tracking-[0.22em] uppercase text-paper/80 border border-paper/40 px-2 py-1" style={mono}>
                    Coming Soon
                  </span>
                )}
              </div>
              <blockquote
                className="text-[clamp(22px,3.4vw,44px)] font-light leading-[1.25] tracking-tight max-w-[22ch] group-hover:text-blue transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                &ldquo;{c.quote}&rdquo;
              </blockquote>
              <cite
                className="not-italic block mt-8 uppercase tracking-[0.14em] text-[13px]"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                — {c.guest}
                <span className="text-paper/75"> · {c.role}</span>
              </cite>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  MANIFESTO CALLOUT  ───────────── */

function ManifestoCallout() {
  return (
    <section className="mb-24 md:mb-32">
      <Link
        to="/resources/manifesto"
        className={`group block border border-paper/25 bg-vintage p-8 md:p-14 hover:border-blue transition-colors ${focusRing}`}
      >
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
          <div className="md:col-span-8">
            <span className="text-blue text-[12px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
              § 02.5 · Self-reflection · Audit manifesto · From Nick
            </span>
            <h2
              className="uppercase text-[clamp(36px,5.6vw,80px)] leading-[0.9] tracking-tight group-hover:text-blue transition-colors"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              July 2026 Audit:<br />The Human Layer<br />Comes First
            </h2>
            <p className="mt-6 text-paper/85 text-[16px] md:text-[17px] leading-[1.65] max-w-[560px]">
              What the GRYT audit revealed: we built the tech stack before the
              ritual. Here is what we missed, and what we are building next.
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <span
              className="inline-flex items-center gap-3 text-[12px] tracking-[0.22em] uppercase text-blue group-hover:text-paper transition-colors"
              style={mono}
            >
              Read the manifesto
              <span
                className="w-11 h-11 border border-blue flex items-center justify-center group-hover:bg-blue group-hover:text-ink transition-colors"
                aria-hidden="true"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}

/* ─────────────────  ARTIFACTS & TOOLS (Graphics)  ────────── */

const GRAPHICS: Array<{
  name: string;
  format: string;
  description: string;
  href?: string;
  comingSoon?: boolean;
  interactive?: boolean;
}> = [
  {
    name: "Recap Run Generator",
    format: "Interactive",
    description: "Upload a photo, drop in your splits, download a share-ready recap.",
    href: "/resources/recap",
    interactive: true,
  },
  {
    name: "GRYT Logo Pack",
    format: "PNG + SVG",
    description: "Official logo files for partners and media.",
  },
  {
    name: "Saturday Poster",
    format: "PDF",
    description: "Printable 8.5×11 for bulletin boards and coffee shops.",
  },
  {
    name: "Race Day Pace Card",
    format: "PDF",
    description: "Nick's pacing reference for marathon and half-marathon.",
  },
  {
    name: "Social Media Kit",
    format: "ZIP",
    description: "Story templates, highlight covers, profile graphics.",
    comingSoon: true,
  },
];

function ArtifactsAndTools() {
  const rest = GRAPHICS.filter((g) => !g.interactive);

  return (
    <section className="mb-24 md:mb-32">
      <div className="bg-vintage p-8 md:p-14 border border-paper/25">
        <div className="mb-12 md:mb-16">
          <span className="text-blue text-[12px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
            § 03 · Free to use & share
          </span>
          <h2
            className="uppercase leading-[0.95] tracking-tight text-[clamp(38px,6vw,80px)]"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Artifacts<br />&amp; Tools
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {rest.map((g) => {
            const Wrap: any = g.comingSoon ? "div" : Link;
            const props = g.comingSoon ? {} : { to: g.href ?? "/resources/graphics" };
            return (
              <Wrap
                key={g.name}
                {...props}
                className={`block group ${
                  g.comingSoon
                    ? "opacity-70 cursor-default"
                    : `cursor-pointer ${focusRing}`
                }`}
                {...(g.comingSoon ? { "aria-disabled": true } : {})}
              >
                <div className="relative aspect-[4/5] bg-ink border border-paper/25 group-hover:border-blue transition-colors overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, var(--blue) 0 2px, transparent 2px 14px)",
                    }}
                    aria-hidden
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MonogramG className="h-20 w-20" />
                  </div>
                  <span
                    className="absolute top-3 left-3 text-[11px] tracking-[0.22em] uppercase text-paper/85"
                    style={mono}
                  >
                    {g.format}
                  </span>
                </div>
                <div className="pt-4">
                  <h4
                    className="font-bold text-[16px] leading-[1.25] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {g.name}
                  </h4>
                  <p className="mt-1.5 text-[13.5px] text-paper/80 leading-[1.55]">
                    {g.description}
                  </p>
                  <p className="mt-3 text-[11px] tracking-[0.22em] uppercase text-blue group-hover:text-paper transition-colors" style={mono}>
                    {g.comingSoon ? "Soon" : "Download →"}
                  </p>
                </div>
              </Wrap>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  MERCH  ───────────────────────── */

const MERCH_ITEMS = [
  { name: "Technical Singlet", price: "Coming Soon", drop: "September", position: "0% 0%" },
  { name: "Compression Half-Zip", price: "Coming Soon", drop: "October", position: "33% 0%" },
  { name: "Packable Windbreaker", price: "Coming Soon", drop: "November", position: "66% 0%" },
  { name: "5-Panel Running Cap", price: "Coming Soon", drop: "September", position: "0% 50%" },
];

function Merch() {
  return (
    <section id="merch" className="mb-24 md:mb-32">
      <div className="flex items-baseline justify-between gap-6 mb-10 md:mb-14 border-b border-paper/30 pb-5">
        <div className="flex items-baseline gap-5">
          <span className="text-blue text-[12px] tracking-[0.22em] uppercase" style={mono}>
            § 04
          </span>
          <h2
            className="uppercase text-[clamp(34px,5.2vw,72px)] leading-[0.9] tracking-tight"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            The Drop
          </h2>
        </div>
        <span className="text-[11px] tracking-[0.24em] uppercase text-paper/75 hidden sm:block" style={mono}>
          Collection 01 · Notify me
        </span>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 list-none p-0">
        {MERCH_ITEMS.map((item, i) => (
          <li key={item.name} className="group">
            <article aria-label={`${item.name}, drops ${item.drop}, ${item.price}`}>
              <div className="relative aspect-[3/4] overflow-hidden bg-vintage border border-paper/25 group-hover:border-blue transition-colors">
                <img
                  src="/img/lookbook-merch.webp"
                  width={900}
                  height={900}
                  decoding="async"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                  style={{ objectPosition: item.position }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-ink/25 group-hover:bg-ink/10 transition-colors" aria-hidden="true" />
                <span
                  className="absolute top-3 left-3 text-[11px] tracking-[0.22em] uppercase text-paper bg-ink/85 px-2 py-1"
                  style={mono}
                >
                  0{i + 1} / SS26
                </span>
              </div>
              <div className="pt-4 flex items-baseline justify-between gap-3">
                <h5
                  className="text-[16px] font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.name}
                </h5>
                <span className="text-blue text-[12px] tracking-[0.14em] uppercase shrink-0" style={mono}>
                  {item.drop}
                </span>
              </div>
              <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-paper/75" style={mono}>
                {item.price}
              </p>
            </article>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-paper/75 text-[14px] leading-[1.65] max-w-[560px]">
        Ships from Pittsburgh. 100% of proceeds support trail events and club gear.
      </p>
    </section>
  );
}

/* ────────────────  NEXT ISSUE  +  PARTNER  ──────────────── */

function NextIssueAndPartner() {
  return (
    <section className="mb-24 md:mb-32 grid md:grid-cols-2 gap-px bg-paper/20 border border-paper/20">
      <NextIssue />
      <PartnerSplit />
    </section>
  );
}

function NextIssue() {
  const submit = useServerFn(submitPartnerInquiry);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !email.trim()) {
      setError("First name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        data: {
          name: firstName.trim(),
          email: email.trim(),
          organization: "",
          involvement: "Other",
          message: "Playbook list signup — send the next GRYT resource when it's ready.",
        },
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-ink p-10 md:p-14">
      <span className="text-blue text-[12px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
        § 05 · Next Issue
      </span>
      <h2
        className="uppercase text-[clamp(28px,3.6vw,44px)] leading-[1.02] tracking-tight mb-6"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        Want the next playbook?
      </h2>
      <p className="text-[15px] leading-[1.65] text-paper/85 mb-8 max-w-[380px]">
        We send new GRYT resources when they're ready. No spam. No noise.
      </p>

      {done ? (
        <div role="status" aria-live="polite" className="border border-blue p-5">
          <p className="text-blue text-[12px] tracking-[0.22em] uppercase mb-2" style={mono}>
            You're on the list
          </p>
          <p className="text-paper/90 text-[14px] leading-[1.55]">
            We'll email <span className="text-paper">{email}</span> when the next one drops.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ni-first" className="sr-only">First name</label>
              <input
                id="ni-first"
                type="text"
                maxLength={80}
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="FIRST NAME"
                autoComplete="given-name"
                className={`w-full bg-transparent border-b border-paper/50 pb-2 text-[14px] tracking-[0.14em] uppercase placeholder:text-paper/60 focus:outline-none focus:border-blue focus-visible:border-blue transition-colors ${focusRing}`}
                style={mono}
              />
            </div>
            <div>
              <label htmlFor="ni-email" className="sr-only">Email</label>
              <input
                id="ni-email"
                type="email"
                maxLength={255}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL"
                autoComplete="email"
                className={`w-full bg-transparent border-b border-paper/50 pb-2 text-[14px] tracking-[0.14em] uppercase placeholder:text-paper/60 focus:outline-none focus:border-blue focus-visible:border-blue transition-colors ${focusRing}`}
                style={mono}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`mt-2 self-start px-6 py-3 min-h-[44px] border border-paper text-[12px] tracking-[0.22em] uppercase hover:bg-paper hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            {submitting ? "Sending…" : "Notify Me →"}
          </button>
        </form>
      )}
      {error && <p role="alert" className="mt-4 text-[14px] text-red-300">{error}</p>}
    </div>
  );
}

function PartnerSplit() {
  return (
    <div className="bg-blue text-ink p-10 md:p-14 flex flex-col justify-between min-h-[360px]">
      <div>
        <span className="text-ink/85 text-[12px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
          § 06 · Partnerships
        </span>
        <h2
          className="uppercase text-[clamp(28px,3.6vw,44px)] leading-[1.02] tracking-tight"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Build with GRYT.
        </h2>
        <p className="mt-5 text-[15px] leading-[1.65] text-ink/90 max-w-[380px]">
          Coffee shops, gyms, brands, coaches, local builders — if it helps
          the crew, we're open.
        </p>
      </div>
      <a
        href="#get-involved"
        className={`mt-10 self-start px-7 py-4 min-h-[44px] bg-ink text-paper text-[12px] tracking-[0.22em] uppercase hover:bg-paper hover:text-ink transition-colors ${focusRingLight}`}
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        Start the conversation →
      </a>
    </div>
  );
}

/* ─────────────────────  GET INVOLVED  ────────────────────── */

const PARTNER_PILLS = [
  "Post-Run Sponsor",
  "Gear + Kit Partner",
  "Podcast / Content Feature",
  "Location Partner",
  "Ambassador",
  "Community Contributor",
];

function GetInvolved() {
  return (
    <section id="get-involved" className="pt-16 md:pt-20 border-t border-paper/20">
      <SectionRule number="§ 07" title="Get Involved" />

      <div className="grid md:grid-cols-3 gap-12 md:gap-16">
        <div className="md:col-span-1">
          <h3
            className="uppercase text-[clamp(26px,2.6vw,36px)] leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            We're building something real in Pittsburgh.
          </h3>
          <p className="mt-6 text-paper/85 text-[15px] leading-[1.65]">
            Local business, brand, coach, or creator who believes in
            community-driven fitness? There's a place for you here. Simple,
            genuine partnerships that add value to the crew.
          </p>
          <ul className="flex flex-wrap gap-2 mt-8 list-none p-0" aria-label="Partnership types">
            {PARTNER_PILLS.map((label) => (
              <li
                key={label}
                className="inline-flex items-center px-3 py-1.5 border border-paper/45 text-[11px] tracking-[0.2em] uppercase text-paper/90"
                style={mono}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <PartnerForm />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────  PARTNER FORM  ────────────────────── */

const swissInput =
  `w-full bg-vintage border border-paper/40 px-4 py-3.5 text-[15px] text-paper placeholder:text-paper/55 focus:outline-none focus:border-blue transition-colors ${focusRing}`;
const swissLabel =
  "block text-[11px] tracking-[0.22em] uppercase text-paper/85 mb-2";

function PartnerForm() {
  const submit = useServerFn(submitPartnerInquiry);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [involvement, setInvolvement] = useState<Involvement>("Post-Run Sponsor");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        data: {
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
          involvement,
          message: message.trim(),
        },
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div role="status" aria-live="polite" className="p-8 border border-blue bg-vintage">
        <p className="text-blue text-[12px] tracking-[0.22em] uppercase mb-3" style={mono}>
          Message received
        </p>
        <h3
          className="text-2xl font-bold leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          We'll be in touch.
        </h3>
        <p className="text-paper/90 text-[15px] leading-[1.65]">
          Nick reads every partner inquiry personally. Expect a reply within a
          few days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5" noValidate>
      <div>
        <label htmlFor="p-name" className={swissLabel} style={mono}>Name</label>
        <input
          id="p-name" type="text" maxLength={120} required autoComplete="name"
          value={name} onChange={(e) => setName(e.target.value)}
          className={swissInput} placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="p-email" className={swissLabel} style={mono}>Email</label>
        <input
          id="p-email" type="email" maxLength={255} required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className={swissInput} placeholder="you@company.com"
        />
      </div>
      <div>
        <label htmlFor="p-org" className={swissLabel} style={mono}>Organization</label>
        <input
          id="p-org" type="text" maxLength={160} autoComplete="organization"
          value={organization} onChange={(e) => setOrganization(e.target.value)}
          className={swissInput} placeholder="Company, brand, or yourself"
        />
      </div>
      <div>
        <label htmlFor="p-inv" className={swissLabel} style={mono}>Involvement</label>
        <select
          id="p-inv"
          value={involvement}
          onChange={(e) => setInvolvement(e.target.value as Involvement)}
          className={`${swissInput} appearance-none pr-10`}
          style={{
            ...mono,
            backgroundImage:
              "linear-gradient(45deg, transparent 50%, var(--blue) 50%), linear-gradient(135deg, var(--blue) 50%, transparent 50%)",
            backgroundPosition: "calc(100% - 18px) 1.35em, calc(100% - 12px) 1.35em",
            backgroundSize: "6px 6px, 6px 6px",
            backgroundRepeat: "no-repeat",
          }}
        >
          <option className="bg-ink text-paper">Post-Run Sponsor</option>
          <option className="bg-ink text-paper">Gear Partner</option>
          <option className="bg-ink text-paper">Content Feature</option>
          <option className="bg-ink text-paper">Location Partner</option>
          <option className="bg-ink text-paper">Other</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p-msg" className={swissLabel} style={mono}>
          Message <span className="text-paper/70 normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="p-msg" rows={5} maxLength={1500}
          value={message} onChange={(e) => setMessage(e.target.value)}
          className={`${swissInput} resize-none`}
          placeholder="Tell us what you have in mind."
        />
      </div>
      {error && <p role="alert" className="sm:col-span-2 text-[14px] text-red-300">{error}</p>}
      <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-2">
        <p className="text-[12px] tracking-[0.2em] uppercase text-paper/75" style={mono}>
          Nick reads every note.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className={`px-7 py-4 min-h-[44px] border border-paper text-[12px] tracking-[0.22em] uppercase hover:bg-blue hover:border-blue hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          {submitting ? "Sending…" : "Submit Inquiry →"}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────  SHARE YOUR STORY  ─────────────────── */

function ShareYourStory() {
  const submit = useServerFn(submitStorySubmission);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [story, setStory] = useState("");
  const [whyInterview, setWhyInterview] = useState("");
  const [links, setLinks] = useState("");
  const [consentContact, setConsentContact] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !story.trim() || !whyInterview.trim()) {
      setError("Name, email, your story, and why we should interview you are required.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        data: {
          name: name.trim(),
          email: email.trim(),
          location: location.trim(),
          story: story.trim(),
          whyInterview: whyInterview.trim(),
          links: links.trim(),
          consentContact,
        },
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="share-your-story" className="mb-24 md:mb-32">
      <SectionRule number="§ 02.5" title="Share Your Story" />

      <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-start">
        <div className="md:col-span-2">
          <h3
            className="uppercase text-[clamp(28px,3.4vw,44px)] leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Got a story worth telling?
          </h3>
          <p className="mt-6 text-paper/85 text-[15px] leading-[1.65] max-w-[440px]">
            Comeback runners. First-timers. People who built community out of
            nothing. If running changed something for you and you think your
            story could help someone else show up — tell us about it. Nick
            reads every submission.
          </p>
          <ul className="mt-8 space-y-3 text-paper/85 text-[14.5px] leading-[1.6] max-w-[440px]">
            {[
              "You don't have to be fast, experienced, or a \"real\" runner.",
              "The best interviews come from people doing hard things on ordinary days.",
              "Features can run as written Q&A, podcast, or short video.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="text-blue shrink-0" style={mono} aria-hidden="true">→</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          {done ? (
            <div role="status" aria-live="polite" className="p-8 border border-blue bg-vintage">
              <p className="text-blue text-[12px] tracking-[0.22em] uppercase mb-3" style={mono}>
                Story received
              </p>
              <h3 className="text-2xl font-bold leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Thanks for sharing.
              </h3>
              <p className="text-paper/90 text-[15px] leading-[1.65]">
                Nick reads every story personally. If it's a fit, we'll reach out
                to <span className="text-paper">{email}</span> about an interview.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5" noValidate>
              <div>
                <label htmlFor="s-name" className={swissLabel} style={mono}>Name</label>
                <input id="s-name" type="text" maxLength={120} required autoComplete="name"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className={swissInput} placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="s-email" className={swissLabel} style={mono}>Email</label>
                <input id="s-email" type="email" maxLength={255} required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={swissInput} placeholder="you@email.com" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s-loc" className={swissLabel} style={mono}>
                  Location <span className="text-paper/70 normal-case tracking-normal">(optional)</span>
                </label>
                <input id="s-loc" type="text" maxLength={160} autoComplete="address-level2"
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  className={swissInput} placeholder="City, state, or club" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s-story" className={swissLabel} style={mono}>Your story</label>
                <textarea id="s-story" required rows={5} maxLength={4000}
                  value={story} onChange={(e) => setStory(e.target.value)}
                  className={`${swissInput} resize-none`}
                  placeholder="Where you started, what changed, where you are now." />
                <p className="mt-1.5 text-[12px] text-paper/75" style={mono} aria-live="polite">{story.length}/4000</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s-why" className={swissLabel} style={mono}>Why should we interview you?</label>
                <textarea id="s-why" required rows={4} maxLength={2000}
                  value={whyInterview} onChange={(e) => setWhyInterview(e.target.value)}
                  className={`${swissInput} resize-none`}
                  placeholder="What would other runners get out of hearing it?" />
                <p className="mt-1.5 text-[12px] text-paper/75" style={mono} aria-live="polite">{whyInterview.length}/2000</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s-links" className={swissLabel} style={mono}>
                  Links <span className="text-paper/70 normal-case tracking-normal">(optional)</span>
                </label>
                <input id="s-links" type="url" maxLength={600} autoComplete="url"
                  value={links} onChange={(e) => setLinks(e.target.value)}
                  className={swissInput}
                  placeholder="Strava, Instagram, blog — anything that adds context" />
              </div>
              <label className="sm:col-span-2 flex items-start gap-3 text-[14.5px] text-paper/90 leading-[1.5] cursor-pointer">
                <input type="checkbox" checked={consentContact}
                  onChange={(e) => setConsentContact(e.target.checked)}
                  className={`mt-1 h-4 w-4 accent-[var(--blue)] ${focusRing}`} />
                <span>It's okay to email me about featuring this story.</span>
              </label>
              {error && <p role="alert" className="sm:col-span-2 text-[14px] text-red-300">{error}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={submitting}
                  className={`px-7 py-4 min-h-[44px] border border-paper text-[12px] tracking-[0.22em] uppercase hover:bg-blue hover:border-blue hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
                  style={{ fontFamily: "var(--font-condensed)" }}>
                  {submitting ? "Sending…" : "Submit My Story →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
