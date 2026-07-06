import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav, SiteFooter, MonogramG } from "@/components/site/Chrome";
import { submitPartnerInquiry } from "@/lib/partner-inquiries.functions";
import { submitStorySubmission } from "@/lib/story-submissions.functions";
import lookbookAsset from "@/assets/lookbook-merch.png.asset.json";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources · gryt run club" },
      {
        name: "description",
        content:
          "Playbooks, interviews, free graphics, merch, and partner opportunities from the founders of gryt run club.",
      },
      { property: "og:title", content: "Resources · gryt run club" },
      {
        property: "og:description",
        content:
          "Everything we've learned from showing up every Saturday — shared freely.",
      },
    ],
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
          <Playbooks />
          <Conversations />
          <ShareYourStory />
          <ArtifactsAndTools />
          <Merch />
          <NextIssueAndPartner />
          <GetInvolved />
        </div>
        <SiteFooter />
      </main>
    </>
  );
}

/* Shared a11y helpers */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
const focusRingLight =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-blue";

/* ─────────────────────────  SHARED  ───────────────────────── */

function SectionRule({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-5 mb-10 md:mb-14">
      <span
        className="text-blue font-mono text-[11px] tracking-[0.22em] uppercase shrink-0"
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
      <div className="h-px flex-1 bg-paper/20 mb-3" />
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
      <p
        className="text-blue text-[11px] tracking-[0.28em] uppercase mb-6"
        style={mono}
      >
        Volume 01 · Issue 03 · From the founders
      </p>
      <h1
        className="uppercase leading-[0.82] tracking-tight text-[clamp(84px,13vw,200px)]"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        Resources
      </h1>
      <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <p className="text-[22px] md:text-[28px] font-light leading-[1.3] max-w-[720px] text-paper/95"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Everything we've learned from showing up every Saturday —{" "}
          <span className="text-blue">shared freely.</span> Playbooks,
          interviews, free graphics, and partner opportunities.
        </p>
        <p className="text-[12px] tracking-[0.24em] uppercase text-paper/70 shrink-0" style={mono}>
          An open field manual<br className="hidden md:block" /> · Pittsburgh, PA
        </p>
        <p className="text-[11px] tracking-[0.24em] uppercase text-paper/45 shrink-0" style={mono}>
          An open field manual<br className="hidden md:block" /> · Pittsburgh, PA
        </p>
      </div>
    </header>
  );
}

/* ─────────────────────────  PLAYBOOKS  ───────────────────── */

const PLAYBOOKS: Array<{
  n: string;
  title: string;
  description: string;
  category: string;
  featured?: boolean;
  comingSoon?: boolean;
}> = [
  {
    n: "01",
    title: "How to Find a Running Club That Actually Fits Your Life",
    description:
      "The no-BS field guide to picking a run club: schedule, pace, cost, post-run culture, and what to watch out for.",
    category: "Community",
    featured: true,
  },
  {
    n: "02",
    title: "How to Start a Run Club From Zero",
    description:
      "The full playbook Nick used to launch GRYT — location, time, first ten members, keeping them coming back.",
    category: "Community",
  },
  {
    n: "03",
    title: "Consistency Over Intensity",
    description:
      "Why showing up every Saturday at the same time changes how you see yourself — and the data behind it.",
    category: "Training",
  },
  {
    n: "04",
    title: "The Comeback Runner's Guide",
    description:
      "For former athletes returning to endurance sport: mindset resets, training principles, what actually matters.",
    category: "Running",
  },
  {
    n: "05",
    title: "Building Community in Home Services",
    description:
      "How the same principles that built GRYT apply to franchise growth and local brand trust.",
    category: "Business",
    comingSoon: true,
  },
];

function Playbooks() {
  const featured = PLAYBOOKS.find((p) => p.featured)!;
  const rest = PLAYBOOKS.filter((p) => !p.featured);

  return (
    <section className="mb-24 md:mb-32">
      <SectionRule number="§ 01" title="Playbooks" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-paper/20 border border-paper/20">
        {/* Featured */}
        <Link
          to="/resources/playbooks"
          className="md:col-span-8 bg-ink p-8 md:p-12 flex flex-col justify-between group cursor-pointer min-h-[420px] hover:bg-vintage transition-colors"
        >
          <div>
            <span className="text-blue text-[11px] tracking-[0.22em] uppercase mb-6 block" style={mono}>
              {featured.n} / {featured.category} · Featured
            </span>
            <h3
              className="text-[clamp(36px,5vw,68px)] font-bold leading-[0.95] tracking-tight max-w-[16ch]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {featured.title}
            </h3>
          </div>
          <div className="flex items-end justify-between gap-8 mt-10">
            <p className="max-w-md text-[15px] leading-[1.65] text-paper/70">
              {featured.description}
            </p>
            <span className="w-14 h-14 border border-paper flex items-center justify-center shrink-0 group-hover:bg-blue group-hover:border-blue group-hover:text-ink transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </Link>

        {/* Right column: 2 stacked */}
        <div className="md:col-span-4 grid grid-cols-1 md:grid-rows-2 gap-px bg-paper/20">
          {rest.slice(0, 2).map((p) => (
            <PlaybookMini key={p.title} p={p} />
          ))}
        </div>

        {/* Bottom row: 3 across */}
        {rest.slice(2).map((p) => (
          <div key={p.title} className="md:col-span-4">
            <PlaybookMini p={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PlaybookMini({ p }: { p: (typeof PLAYBOOKS)[number] }) {
  const Wrap: any = p.comingSoon ? "div" : Link;
  const wrapProps = p.comingSoon
    ? {}
    : { to: "/resources/playbooks" };

  return (
    <Wrap
      {...wrapProps}
      className={`h-full block bg-vintage p-7 md:p-8 flex flex-col justify-between min-h-[220px] transition-colors ${
        p.comingSoon
          ? "opacity-60 cursor-default"
          : "hover:bg-blue hover:text-ink group cursor-pointer"
      }`}
    >
      <span
        className="text-[11px] tracking-[0.22em] uppercase text-paper/50 group-hover:text-ink/60"
        style={mono}
      >
        {p.n} / {p.category}
      </span>
      <h4
        className="text-[22px] md:text-[26px] font-bold leading-[1.1] tracking-tight mt-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {p.title}
      </h4>
      <p className="mt-3 text-[13.5px] leading-[1.55] text-paper/60 group-hover:text-ink/70 line-clamp-2">
        {p.description}
      </p>
      <p className="mt-5 text-[10px] tracking-[0.24em] uppercase text-paper/50 group-hover:text-ink/70" style={mono}>
        {p.comingSoon ? "Coming Soon" : "Read →"}
      </p>
    </Wrap>
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
            <span className="text-blue text-[11px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
              § 02
            </span>
            <h2
              className="uppercase text-[clamp(36px,4.5vw,64px)] leading-[0.9] tracking-tight"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Conversations
            </h2>
            <p className="mt-5 text-paper/60 text-[14px] leading-[1.6] max-w-[280px]">
              Unfiltered dialogue with the founders and the crew — on
              community, consistency, and doing hard things together.
            </p>
            <Link
              to="/resources/conversations"
              className="mt-6 inline-block text-[11px] tracking-[0.22em] uppercase text-blue hover:text-paper transition-colors"
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
                i < CONVERSATIONS.length - 1 ? "border-b border-paper/10 pb-16 md:pb-20" : ""
              } ${c.comingSoon ? "opacity-70" : ""}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-blue text-[11px] tracking-[0.24em] uppercase" style={mono}>
                  Transcript {c.n}
                </span>
                {c.comingSoon && (
                  <span className="text-[10px] tracking-[0.22em] uppercase text-paper/40 border border-paper/25 px-2 py-1" style={mono}>
                    Coming Soon
                  </span>
                )}
              </div>
              <blockquote
                className="text-[clamp(24px,3.4vw,44px)] font-light leading-[1.15] tracking-tight max-w-[22ch] group-hover:text-blue transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                &ldquo;{c.quote}&rdquo;
              </blockquote>
              <cite
                className="not-italic block mt-8 uppercase tracking-[0.14em] text-[13px]"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                — {c.guest}
                <span className="text-paper/50"> · {c.role}</span>
              </cite>
            </article>
          ))}
        </div>
      </div>
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
  const interactive = GRAPHICS.find((g) => g.interactive)!;
  const rest = GRAPHICS.filter((g) => !g.interactive);

  return (
    <section className="mb-24 md:mb-32">
      <div className="bg-vintage p-8 md:p-14 border border-paper/10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12 md:mb-16">
          <div>
            <span className="text-blue text-[11px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
              § 03 · Free to use & share
            </span>
            <h2
              className="uppercase leading-[0.9] tracking-tight text-[clamp(40px,6vw,80px)]"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Artifacts<br />&amp; Tools
            </h2>
          </div>
          <Link
            to={interactive.href!}
            className="inline-flex items-center gap-3 px-5 py-3 border border-blue text-blue text-[11px] tracking-[0.22em] uppercase hover:bg-blue hover:text-ink transition-colors self-start"
            style={mono}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            {interactive.name} · Open →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {rest.map((g) => {
            const Wrap: any = g.comingSoon ? "div" : Link;
            const props = g.comingSoon ? {} : { to: g.href ?? "/resources/graphics" };
            return (
              <Wrap
                key={g.name}
                {...props}
                className={`block group ${g.comingSoon ? "opacity-55 cursor-default" : "cursor-pointer"}`}
              >
                <div className="relative aspect-[4/5] bg-ink border border-paper/10 group-hover:border-blue transition-colors overflow-hidden">
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
                    className="absolute top-3 left-3 text-[10px] tracking-[0.22em] uppercase text-paper/60"
                    style={mono}
                  >
                    {g.format}
                  </span>
                </div>
                <div className="pt-4">
                  <h4
                    className="font-bold text-[15px] leading-[1.2] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {g.name}
                  </h4>
                  <p className="mt-1.5 text-[12.5px] text-paper/55 leading-[1.5]">
                    {g.description}
                  </p>
                  <p className="mt-3 text-[10px] tracking-[0.22em] uppercase text-blue group-hover:text-paper transition-colors" style={mono}>
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
      <div className="flex items-baseline justify-between gap-6 mb-10 md:mb-14 border-b border-paper/15 pb-5">
        <div className="flex items-baseline gap-5">
          <span className="text-blue text-[11px] tracking-[0.22em] uppercase" style={mono}>
            § 04
          </span>
          <h2
            className="uppercase text-[clamp(34px,5.2vw,72px)] leading-[0.9] tracking-tight"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            The Drop
          </h2>
        </div>
        <span className="text-[10px] tracking-[0.24em] uppercase text-paper/50 hidden sm:block" style={mono}>
          Collection 01 · Notify me
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {MERCH_ITEMS.map((item, i) => (
          <article key={item.name} className="group cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden bg-vintage border border-paper/10 group-hover:border-blue transition-colors">
              <img
                src={lookbookAsset.url}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                style={{ objectPosition: item.position }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-ink/25 group-hover:bg-ink/10 transition-colors" />
              <span
                className="absolute top-3 left-3 text-[10px] tracking-[0.22em] uppercase text-paper bg-ink/70 px-2 py-1"
                style={mono}
              >
                0{i + 1} / SS26
              </span>
            </div>
            <div className="pt-4 flex items-baseline justify-between gap-3">
              <h5
                className="text-[15px] font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.name}
              </h5>
              <span className="text-blue text-[11px] tracking-[0.14em] uppercase shrink-0" style={mono}>
                {item.drop}
              </span>
            </div>
            <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-paper/45" style={mono}>
              {item.price}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-8 text-paper/50 text-[13px] leading-[1.6] max-w-[560px]">
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
      <span className="text-blue text-[11px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
        § 05 · Next Issue
      </span>
      <h2
        className="uppercase text-[clamp(28px,3.6vw,44px)] leading-[0.95] tracking-tight mb-6"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        Want the next playbook?
      </h2>
      <p className="text-[15px] leading-[1.65] text-paper/70 mb-8 max-w-[380px]">
        We send new GRYT resources when they're ready. No spam. No noise.
      </p>

      {done ? (
        <div className="border border-blue p-5">
          <p className="text-blue text-[11px] tracking-[0.22em] uppercase mb-2" style={mono}>
            You're on the list
          </p>
          <p className="text-paper/80 text-[14px] leading-[1.55]">
            We'll email <span className="text-paper">{email}</span> when the next one drops.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              maxLength={80}
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="FIRST NAME"
              className="bg-transparent border-b border-paper/25 pb-2 text-[14px] tracking-[0.14em] uppercase placeholder:text-paper/30 focus:outline-none focus:border-blue transition-colors"
              style={mono}
            />
            <input
              type="email"
              maxLength={255}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL"
              className="bg-transparent border-b border-paper/25 pb-2 text-[14px] tracking-[0.14em] uppercase placeholder:text-paper/30 focus:outline-none focus:border-blue transition-colors"
              style={mono}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 self-start px-6 py-3 border border-paper text-[11px] tracking-[0.22em] uppercase hover:bg-paper hover:text-ink transition-colors disabled:opacity-40"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            {submitting ? "Sending…" : "Notify Me →"}
          </button>
        </form>
      )}
      {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}
    </div>
  );
}

function PartnerSplit() {
  return (
    <div className="bg-blue text-ink p-10 md:p-14 flex flex-col justify-between min-h-[360px]">
      <div>
        <span className="text-ink/60 text-[11px] tracking-[0.22em] uppercase mb-4 block" style={mono}>
          § 06 · Partnerships
        </span>
        <h2
          className="uppercase text-[clamp(28px,3.6vw,44px)] leading-[0.95] tracking-tight"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Build with GRYT.
        </h2>
        <p className="mt-5 text-[15px] leading-[1.65] text-ink/80 max-w-[380px]">
          Coffee shops, gyms, brands, coaches, local builders — if it helps
          the crew, we're open.
        </p>
      </div>
      <a
        href="#get-involved"
        className="mt-10 self-start px-7 py-4 bg-ink text-paper text-[11px] tracking-[0.22em] uppercase hover:bg-paper hover:text-ink transition-colors"
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
          <p className="mt-6 text-paper/70 text-[15px] leading-[1.65]">
            Local business, brand, coach, or creator who believes in
            community-driven fitness? There's a place for you here. Simple,
            genuine partnerships that add value to the crew.
          </p>
          <div className="flex flex-wrap gap-2 mt-8">
            {PARTNER_PILLS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center px-3 py-1.5 border border-paper/25 text-[10px] tracking-[0.2em] uppercase text-paper/75"
                style={mono}
              >
                {label}
              </span>
            ))}
          </div>
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
  "w-full bg-vintage border border-paper/10 px-4 py-3.5 text-[14px] text-paper placeholder:text-paper/35 focus:outline-none focus:border-blue transition-colors";
const swissLabel =
  "block text-[10px] tracking-[0.22em] uppercase text-paper/55 mb-2";

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
      <div className="p-8 border border-blue bg-vintage">
        <p className="text-blue text-[11px] tracking-[0.22em] uppercase mb-3" style={mono}>
          Message received
        </p>
        <h3
          className="text-2xl font-bold leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          We'll be in touch.
        </h3>
        <p className="text-paper/75 text-[14px] leading-[1.6]">
          Nick reads every partner inquiry personally. Expect a reply within a
          few days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <label htmlFor="p-name" className={swissLabel} style={mono}>Name</label>
        <input
          id="p-name" type="text" maxLength={120} required
          value={name} onChange={(e) => setName(e.target.value)}
          className={swissInput} placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="p-email" className={swissLabel} style={mono}>Email</label>
        <input
          id="p-email" type="email" maxLength={255} required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className={swissInput} placeholder="you@company.com"
        />
      </div>
      <div>
        <label htmlFor="p-org" className={swissLabel} style={mono}>Organization</label>
        <input
          id="p-org" type="text" maxLength={160}
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
          Message <span className="text-paper/35 normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="p-msg" rows={5} maxLength={1500}
          value={message} onChange={(e) => setMessage(e.target.value)}
          className={`${swissInput} resize-none`}
          placeholder="Tell us what you have in mind."
        />
      </div>
      {error && <p className="sm:col-span-2 text-[13px] text-red-400">{error}</p>}
      <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-2">
        <p className="text-[11px] tracking-[0.2em] uppercase text-paper/40" style={mono}>
          Nick reads every note.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="px-7 py-4 border border-paper text-[11px] tracking-[0.22em] uppercase hover:bg-blue hover:border-blue hover:text-ink transition-colors disabled:opacity-40"
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
          <p className="mt-6 text-paper/70 text-[15px] leading-[1.65] max-w-[440px]">
            Comeback runners. First-timers. People who built community out of
            nothing. If running changed something for you and you think your
            story could help someone else show up — tell us about it. Nick
            reads every submission.
          </p>
          <ul className="mt-8 space-y-3 text-paper/70 text-[14px] leading-[1.6] max-w-[440px]">
            {[
              "You don't have to be fast, experienced, or a \"real\" runner.",
              "The best interviews come from people doing hard things on ordinary days.",
              "Features can run as written Q&A, podcast, or short video.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="text-blue shrink-0" style={mono}>→</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          {done ? (
            <div className="p-8 border border-blue bg-vintage">
              <p className="text-blue text-[11px] tracking-[0.22em] uppercase mb-3" style={mono}>
                Story received
              </p>
              <h3 className="text-2xl font-bold leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Thanks for sharing.
              </h3>
              <p className="text-paper/75 text-[14px] leading-[1.6]">
                Nick reads every story personally. If it's a fit, we'll reach out
                to <span className="text-paper">{email}</span> about an interview.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="s-name" className={swissLabel} style={mono}>Name</label>
                <input id="s-name" type="text" maxLength={120} required
                  value={name} onChange={(e) => setName(e.target.value)}
                  className={swissInput} placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="s-email" className={swissLabel} style={mono}>Email</label>
                <input id="s-email" type="email" maxLength={255} required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={swissInput} placeholder="you@email.com" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s-loc" className={swissLabel} style={mono}>
                  Location <span className="text-paper/35 normal-case tracking-normal">(optional)</span>
                </label>
                <input id="s-loc" type="text" maxLength={160}
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  className={swissInput} placeholder="City, state, or club" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s-story" className={swissLabel} style={mono}>Your story</label>
                <textarea id="s-story" required rows={5} maxLength={4000}
                  value={story} onChange={(e) => setStory(e.target.value)}
                  className={`${swissInput} resize-none`}
                  placeholder="Where you started, what changed, where you are now." />
                <p className="mt-1.5 text-[11px] text-paper/40" style={mono}>{story.length}/4000</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s-why" className={swissLabel} style={mono}>Why should we interview you?</label>
                <textarea id="s-why" required rows={4} maxLength={2000}
                  value={whyInterview} onChange={(e) => setWhyInterview(e.target.value)}
                  className={`${swissInput} resize-none`}
                  placeholder="What would other runners get out of hearing it?" />
                <p className="mt-1.5 text-[11px] text-paper/40" style={mono}>{whyInterview.length}/2000</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s-links" className={swissLabel} style={mono}>
                  Links <span className="text-paper/35 normal-case tracking-normal">(optional)</span>
                </label>
                <input id="s-links" type="text" maxLength={600}
                  value={links} onChange={(e) => setLinks(e.target.value)}
                  className={swissInput}
                  placeholder="Strava, Instagram, blog — anything that adds context" />
              </div>
              <label className="sm:col-span-2 flex items-start gap-3 text-[14px] text-paper/70 leading-[1.5] cursor-pointer">
                <input type="checkbox" checked={consentContact}
                  onChange={(e) => setConsentContact(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--blue)]" />
                <span>It's okay to email me about featuring this story.</span>
              </label>
              {error && <p className="sm:col-span-2 text-[13px] text-red-400">{error}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={submitting}
                  className="px-7 py-4 border border-paper text-[11px] tracking-[0.22em] uppercase hover:bg-blue hover:border-blue hover:text-ink transition-colors disabled:opacity-40"
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
