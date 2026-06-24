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

function ResourcesPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <Hero />
      <Playbooks />
      <Conversations />
      <ShareYourStory />
      <Graphics />
      <Merch />
      <NextPlaybook />
      <PartnerCTA />
      <GetInvolved />
      <SiteFooter />
    </main>
  );
}

/* ────────────────────────────  HERO  ──────────────────────────── */

function Hero() {
  return (
    <section className="relative bg-ink text-paper px-6 sm:px-12 lg:px-24 py-24 md:py-36 border-b border-paper/15 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, var(--blue) 0, transparent 50%), radial-gradient(circle at 80% 70%, var(--blue) 0, transparent 45%)",
        }}
        aria-hidden
      />
      <div className="relative max-w-[1180px] mx-auto">
        <p className="eyebrow text-blue mb-5">FROM THE FOUNDERS</p>
        <h1 className="display-condensed uppercase text-[clamp(64px,12vw,180px)] leading-[0.88] tracking-tight">
          Resources
        </h1>
        <p className="mt-8 text-paper/75 text-lg md:text-xl max-w-[640px] leading-[1.55]">
          Everything we've learned from showing up every Saturday — shared
          freely.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────  Shared building blocks  ───────────────── */

function SectionHeader({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-12 md:mb-16">
      <p className="eyebrow text-blue mb-4">{kicker}</p>
      <h2 className="display-condensed uppercase text-[clamp(36px,5.5vw,72px)] leading-[0.92]">
        {title}
      </h2>
    </div>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted" | "blue";
}) {
  const cls =
    tone === "blue"
      ? "bg-blue text-ink"
      : tone === "muted"
      ? "border border-paper/25 text-paper/55"
      : "border border-paper/40 text-paper/80";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${cls}`}
    >
      {children}
    </span>
  );
}

/* ───────────────────────────  PLAYBOOKS  ──────────────────────── */

const PLAYBOOKS: Array<{
  title: string;
  description: string;
  category: string;
  comingSoon?: boolean;
}> = [
  {
    title: "How to Find a Running Club That Actually Fits Your Life",
    description:
      "The no-BS guide to picking a run club: schedule, pace, cost, post-run culture, and what to watch out for.",
    category: "Community",
  },
  {
    title: "How to Start a Run Club From Zero",
    description:
      "The full playbook Nick used to launch GRYT: picking a location, setting a time, finding the first 10 members, and keeping them coming back.",
    category: "Community",
  },
  {
    title: "Consistency Over Intensity: The Saturday System",
    description:
      "Why showing up every Saturday at the same time changes how you see yourself — and the data behind it.",
    category: "Training",
  },
  {
    title: "Building Community in Home Services",
    description:
      "How the same principles that built GRYT apply to franchise growth and local brand trust.",
    category: "Business",
    comingSoon: true,
  },
  {
    title: "The Comeback Runner's Guide",
    description:
      "For former athletes returning to endurance sport: mindset resets, training principles, and what actually matters.",
    category: "Running",
  },
];

function Playbooks() {
  return (
    <section className="bg-ink text-paper px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15">
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader kicker="LONG-FORM FROM NICK" title="Playbooks" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
          {PLAYBOOKS.map((p) => (
            <article
              key={p.title}
              className={`group relative flex flex-col gap-5 p-7 md:p-9 border border-paper/15 bg-black/40 hover:border-blue transition-colors ${
                p.comingSoon ? "opacity-55" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Badge tone="blue">{p.category}</Badge>
                {p.comingSoon && <Badge tone="muted">Coming Soon</Badge>}
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold leading-[1.15] tracking-tight">
                {p.title}
              </h3>
              <p className="text-paper/70 text-[15px] leading-[1.6]">
                {p.description}
              </p>
              <div className="pt-3 mt-auto">
                {p.comingSoon ? (
                  <span className="eyebrow text-paper/40">Coming Soon</span>
                ) : (
                  <Link
                    to="/resources/playbooks"
                    className="eyebrow text-blue hover:text-paper transition-colors"
                  >
                    Read the playbook collection →
                  </Link>
                )}
              </div>
            </article>

          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────  CONVERSATIONS  ────────────────────── */

const CONVERSATIONS: Array<{
  guest: string;
  title: string;
  quote: string;
  tag: string;
  comingSoon?: boolean;
}> = [
  {
    guest: "Nick Merich",
    title: "Founder Q&A",
    quote:
      "On why Saturday morning became the most important appointment of the week.",
    tag: "Founder",
  },
  {
    guest: "Laura Merich",
    title: "Co-Founder's Perspective",
    quote:
      "On community, parenthood, and why consistency beats perfection.",
    tag: "Interview",
  },
  {
    guest: "[Your Story Here]",
    title: "Community Member",
    quote:
      "Community members, partners, and coaches we've featured.",
    tag: "Community",
    comingSoon: true,
  },
];

function Conversations() {
  return (
    <section className="bg-black text-paper px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15">
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader kicker="INTERVIEWS & FEATURES" title="Conversations" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
          {CONVERSATIONS.map((c) => (
            <article
              key={c.guest}
              className={`flex flex-col gap-5 p-7 border border-paper/15 bg-ink hover:border-blue transition-colors ${
                c.comingSoon ? "opacity-55" : ""
              }`}
            >
              <Badge tone={c.comingSoon ? "muted" : "blue"}>{c.tag}</Badge>
              <div>
                <p className="eyebrow text-paper/55 mb-2">{c.title}</p>
                <h3 className="text-[20px] md:text-[22px] font-bold leading-[1.15] tracking-tight">
                  {c.guest}
                </h3>
              </div>
              <blockquote className="text-paper/75 text-[15px] leading-[1.6] border-l-2 border-blue pl-4 italic">
                "{c.quote}"
              </blockquote>
              <div className="pt-3 mt-auto">
                {c.comingSoon ? (
                  <span className="eyebrow text-paper/40">Coming Soon</span>
                ) : (
                  <Link
                    to="/resources/conversations"
                    className="eyebrow text-blue hover:text-paper transition-colors"
                  >
                    Read founder conversations →
                  </Link>
                )}
              </div>
            </article>

          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────  GRAPHICS  ─────────────────────── */

const GRAPHICS: Array<{
  name: string;
  format: string;
  description: string;
  comingSoon?: boolean;
  href?: string;
  cta?: string;
}> = [
  {
    name: "Recap Run Graphic Generator",
    format: "INTERACTIVE",
    description:
      "Build your own GRYT-branded recap. Upload a photo, drop in your splits, download a share-ready image.",
    href: "/resources/recap",
    cta: "Open the generator →",
  },
  {
    name: "GRYT Run Club Logo Pack",
    format: "PNG + SVG",
    description: "Official logo files for partners and media.",
  },
  {
    name: "Saturday Morning Poster",
    format: "PDF",
    description: "Printable 8.5×11 poster for bulletin boards and coffee shops.",
  },
  {
    name: "Social Media Kit",
    format: "ZIP",
    description:
      "Instagram story templates, highlight covers, profile graphics.",
    comingSoon: true,
  },
  {
    name: "Race Day Pace Card",
    format: "PDF",
    description:
      "Nick's pacing reference card for marathon and half-marathon runners.",
  },
];

function Graphics() {
  return (
    <section className="bg-ink text-paper px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15">
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader kicker="FREE TO USE & SHARE" title="Graphics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {GRAPHICS.map((g) => (
            <article
              key={g.name}
              className={`flex flex-col border border-paper/15 hover:border-blue transition-colors ${
                g.comingSoon ? "opacity-55" : ""
              }`}
            >
              <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden border-b border-paper/15">
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, var(--blue) 0 2px, transparent 2px 12px)",
                  }}
                  aria-hidden
                />
                <MonogramG className="h-24 w-24 relative" />
              </div>
              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={g.comingSoon ? "muted" : "default"}>
                    {g.format}
                  </Badge>
                  {g.comingSoon && <Badge tone="muted">Coming Soon</Badge>}
                </div>
                <h3 className="text-[18px] font-bold leading-[1.2] tracking-tight">
                  {g.name}
                </h3>
                <p className="text-paper/65 text-[14px] leading-[1.55]">
                  {g.description}
                </p>
                <div className="pt-2">
                  {g.comingSoon ? (
                    <span className="eyebrow text-paper/40">Coming Soon</span>
                  ) : (
                    <Link
                      to={g.href ?? "/resources/graphics"}
                      className="eyebrow text-blue hover:text-paper transition-colors"
                    >
                      {g.cta ?? "Download →"}
                    </Link>
                  )}
                </div>
              </div>

            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────  MERCH  ─────────────────────────── */

const MERCH_ITEMS = [
  { name: "Technical Running Singlet", position: "0% 0%" },
  { name: "Compression Half-Zip", position: "33% 0%" },
  { name: "Packable Windbreaker Jacket", position: "66% 0%" },
  { name: "5-Panel Running Cap", position: "0% 50%" },
];

function Merch() {
  return (
    <section className="bg-black text-paper px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15">
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader kicker="WEAR IT ON THE TRAIL" title="Merch" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {MERCH_ITEMS.map((item) => (
            <article
              key={item.name}
              className="group relative flex flex-col border border-paper/15 bg-ink overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden border-b border-paper/15">
                <img
                  src={lookbookAsset.url}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover blur-[12px] brightness-50 scale-110"
                  style={{ objectPosition: item.position }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-ink/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="eyebrow text-blue tracking-[0.2em]">
                    COMING SOON
                  </span>
                  <h3 className="display-condensed uppercase text-[clamp(20px,3vw,28px)] leading-[0.95] text-paper text-center px-4">
                    {item.name}
                  </h3>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-5 flex-1">
                <p className="text-paper/55 text-[13px] leading-[1.55]">
                  Part of the GRYT Running Supply collection. Drops soon.
                </p>
                <div className="pt-2 mt-auto">
                  <span className="inline-flex items-center px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] border border-paper/25 text-paper/55">
                    Notify Me
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 text-paper/55 text-sm max-w-[640px] leading-[1.55]">
          All merch ships from Pittsburgh. 100% of proceeds support trail events
          and club gear.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────  GET INVOLVED  ─────────────────────── */

const PARTNER_PILLS = [
  { emoji: "🧃", label: "Post-Run Sponsor" },
  { emoji: "👟", label: "Gear + Kit Partner" },
  { emoji: "🎙️", label: "Podcast / Content Feature" },
  { emoji: "📍", label: "Location Partner" },
];

function GetInvolved() {
  return (
    <section id="get-involved" className="bg-ink text-paper px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15">

      <div className="max-w-[1180px] mx-auto">
        <SectionHeader
          kicker="PARTNERS & COLLABORATORS"
          title="Get Involved"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h3 className="display-condensed uppercase text-[clamp(32px,4.5vw,56px)] leading-[0.95]">
              We're building something real in Pittsburgh.
            </h3>
            <p className="mt-7 text-paper/75 text-[16px] leading-[1.65] max-w-[520px]">
              If you're a local business, brand, coach, or creator who believes
              in community-driven fitness — there's a place for you here. We
              keep it simple: genuine partnerships that add value to the crew.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              {PARTNER_PILLS.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-paper/25 text-paper/85"
                >
                  <span aria-hidden>{p.emoji}</span>
                  <span className="uppercase tracking-wide font-medium">
                    {p.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <PartnerForm />
        </div>
      </div>
    </section>
  );
}

const partnerInputCls =
  "w-full bg-transparent border-0 border-b-2 border-paper/20 text-paper placeholder:text-paper/30 pb-2 pt-1 text-base focus:outline-none focus:border-blue transition-colors";

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
      <div className="p-8 border border-blue bg-black/40">
        <p className="eyebrow text-blue mb-3">MESSAGE RECEIVED</p>
        <h3 className="text-2xl font-bold leading-tight mb-3">
          We'll be in touch.
        </h3>
        <p className="text-paper/75 text-[15px] leading-[1.6]">
          Nick reads every partner inquiry personally. Expect a reply within a
          few days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="p-7 md:p-9 border border-paper/15 bg-black/40 flex flex-col gap-6"
    >
      <div>
        <label htmlFor="p-name" className="eyebrow text-paper/55 block mb-2">
          Name
        </label>
        <input
          id="p-name"
          type="text"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={partnerInputCls}
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="p-email" className="eyebrow text-paper/55 block mb-2">
          Email
        </label>
        <input
          id="p-email"
          type="email"
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={partnerInputCls}
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label htmlFor="p-org" className="eyebrow text-paper/55 block mb-2">
          Organization / Business
        </label>
        <input
          id="p-org"
          type="text"
          maxLength={160}
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className={partnerInputCls}
          placeholder="Company, brand, or yourself"
        />
      </div>
      <div>
        <label
          htmlFor="p-involvement"
          className="eyebrow text-paper/55 block mb-2"
        >
          How do you want to get involved?
        </label>
        <select
          id="p-involvement"
          value={involvement}
          onChange={(e) => setInvolvement(e.target.value as Involvement)}
          className={`${partnerInputCls} appearance-none pr-8`}
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 50%, var(--blue) 50%), linear-gradient(135deg, var(--blue) 50%, transparent 50%)",
            backgroundPosition:
              "calc(100% - 14px) 1.1em, calc(100% - 8px) 1.1em",
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
      <div>
        <label
          htmlFor="p-message"
          className="eyebrow text-paper/55 block mb-2"
        >
          Message <span className="text-paper/35 normal-case">(optional)</span>
        </label>
        <textarea
          id="p-message"
          maxLength={1500}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${partnerInputCls} resize-none`}
          placeholder="Tell us what you have in mind."
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary disabled:opacity-40 self-start"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {submitting ? "Sending..." : "LET'S TALK →"}
      </button>
    </form>
  );
}

/* ──────────────────────  NEXT PLAYBOOK SIGNUP  ─────────────────── */

const CONTACT_EMAIL = "hello@grytrunclub.com";

function NextPlaybook() {
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
    <section className="bg-ink text-paper px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
      <div className="max-w-[760px] mx-auto">
        <p className="eyebrow text-blue mb-4">STAY IN THE LOOP</p>
        <h2 className="display-condensed uppercase text-[clamp(32px,5vw,60px)] leading-[0.95]">
          Want the next playbook?
        </h2>
        <p className="mt-6 text-paper/75 text-[16px] leading-[1.65] max-w-[560px]">
          We'll send new GRYT resources when they're ready. No spam.
        </p>

        {done ? (
          <div className="mt-8 p-6 border border-blue bg-black/40">
            <p className="eyebrow text-blue mb-2">YOU'RE ON THE LIST</p>
            <p className="text-paper/80 text-[15px] leading-[1.6]">
              We'll email <span className="text-paper">{email}</span> when the next one drops.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-end"
          >
            <div className="flex-1 min-w-0">
              <label htmlFor="np-name" className="eyebrow text-paper/55 block mb-2">
                First name
              </label>
              <input
                id="np-name"
                type="text"
                maxLength={80}
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={partnerInputCls}
                placeholder="First name"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="np-email" className="eyebrow text-paper/55 block mb-2">
                Email
              </label>
              <input
                id="np-email"
                type="email"
                maxLength={255}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={partnerInputCls}
                placeholder="you@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-40 whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {submitting ? "Sending..." : "Send me the next one"}
            </button>
          </form>
        )}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </section>
  );
}

/* ─────────────────────────  PARTNER CTA  ───────────────────────── */

function PartnerCTA() {
  return (
    <section className="bg-black text-paper px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
      <div className="max-w-[760px] mx-auto">
        <p className="eyebrow text-blue mb-4">PARTNERSHIPS</p>
        <h2 className="display-condensed uppercase text-[clamp(32px,5vw,60px)] leading-[0.95]">
          Want to build something with GRYT?
        </h2>
        <p className="mt-6 text-paper/75 text-[16px] leading-[1.65] max-w-[560px]">
          Coffee shops, gyms, brands, coaches, and local builders — if it helps the crew, we're open.
        </p>
        <div className="mt-8">
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=GRYT%20partnership`}
            className="btn-primary"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Start a partnership conversation
          </a>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────  SHARE YOUR STORY  ─────────────────────── */


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
    <section
      id="share-your-story"
      className="bg-ink text-paper px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15"
    >
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader kicker="WE WANT TO HEAR FROM YOU" title="Share Your Story" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h3 className="display-condensed uppercase text-[clamp(32px,4.5vw,56px)] leading-[0.95]">
              Got a story worth telling?
            </h3>
            <p className="mt-7 text-paper/75 text-[16px] leading-[1.65] max-w-[520px]">
              Comeback runners. First-timers. People who built community out of nothing.
              If running changed something for you and you think your story could help
              someone else show up — tell us about it. Nick reads every submission.
            </p>
            <ul className="mt-8 space-y-3 text-paper/75 text-[15px] leading-[1.6] max-w-[520px]">
              <li className="flex gap-3">
                <span className="text-blue">→</span>
                You don't have to be fast, experienced, or a "real" runner.
              </li>
              <li className="flex gap-3">
                <span className="text-blue">→</span>
                The best interviews come from people doing hard things on ordinary days.
              </li>
              <li className="flex gap-3">
                <span className="text-blue">→</span>
                Features can run as written Q&amp;A, podcast, or short video.
              </li>
            </ul>
          </div>

          {done ? (
            <div className="p-8 border border-blue bg-black/40">
              <p className="eyebrow text-blue mb-3">STORY RECEIVED</p>
              <h3 className="text-2xl font-bold leading-tight mb-3">
                Thanks for sharing.
              </h3>
              <p className="text-paper/75 text-[15px] leading-[1.6]">
                Nick reads every story personally. If it's a fit, we'll reach out
                to <span className="text-paper">{email}</span> about an interview.
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="p-7 md:p-9 border border-paper/15 bg-black/40 flex flex-col gap-6"
            >
              <div>
                <label htmlFor="s-name" className="eyebrow text-paper/55 block mb-2">
                  Name
                </label>
                <input
                  id="s-name"
                  type="text"
                  maxLength={120}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={partnerInputCls}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="s-email" className="eyebrow text-paper/55 block mb-2">
                  Email
                </label>
                <input
                  id="s-email"
                  type="email"
                  maxLength={255}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={partnerInputCls}
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label htmlFor="s-location" className="eyebrow text-paper/55 block mb-2">
                  Location <span className="text-paper/35 normal-case">(optional)</span>
                </label>
                <input
                  id="s-location"
                  type="text"
                  maxLength={160}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={partnerInputCls}
                  placeholder="City, state, or club"
                />
              </div>
              <div>
                <label htmlFor="s-story" className="eyebrow text-paper/55 block mb-2">
                  Your story
                </label>
                <textarea
                  id="s-story"
                  required
                  maxLength={4000}
                  rows={5}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className={`${partnerInputCls} resize-none`}
                  placeholder="What's the short version? Where you started, what changed, where you are now."
                />
                <p className="mt-2 text-xs text-paper/40">{story.length}/4000</p>
              </div>
              <div>
                <label htmlFor="s-why" className="eyebrow text-paper/55 block mb-2">
                  Why should we interview you?
                </label>
                <textarea
                  id="s-why"
                  required
                  maxLength={2000}
                  rows={4}
                  value={whyInterview}
                  onChange={(e) => setWhyInterview(e.target.value)}
                  className={`${partnerInputCls} resize-none`}
                  placeholder="What would other runners get out of hearing it?"
                />
                <p className="mt-2 text-xs text-paper/40">{whyInterview.length}/2000</p>
              </div>
              <div>
                <label htmlFor="s-links" className="eyebrow text-paper/55 block mb-2">
                  Links <span className="text-paper/35 normal-case">(optional)</span>
                </label>
                <input
                  id="s-links"
                  type="text"
                  maxLength={600}
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  className={partnerInputCls}
                  placeholder="Strava, Instagram, blog — anything that adds context"
                />
              </div>
              <label className="flex items-start gap-3 text-[14px] text-paper/75 leading-[1.5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentContact}
                  onChange={(e) => setConsentContact(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--blue)]"
                />
                <span>
                  It's okay to email me about featuring this story.
                </span>
              </label>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-40 self-start"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {submitting ? "Sending..." : "SUBMIT MY STORY →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

