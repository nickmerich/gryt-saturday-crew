import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav, SiteFooter, MonogramG } from "@/components/site/Chrome";
import { submitPartnerInquiry } from "@/lib/partner-inquiries.functions";
import { submitStorySubmission } from "@/lib/story-submissions.functions";


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
}> = [
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
                      to="/resources/graphics"
                      className="eyebrow text-blue hover:text-paper transition-colors"
                    >
                      Download →
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

const MERCH: Array<{
  name: string;
  description: string;
  price: string;
  cta: string;
  comingSoon?: boolean;
}> = [
  {
    name: "GRYT Bear Tee",
    description: "The classic. Unisex, heavyweight, made to run in.",
    price: "$32",
    cta: "Shop →",
  },
  {
    name: "Saturday Morning Quarter-Zip",
    description: "For cold starts. GRYT across the chest.",
    price: "$65",
    cta: "Notify Me",
    comingSoon: true,
  },
  {
    name: "Finisher Hat",
    description:
      "Run 10 Saturdays, earn the hat. Structured, curved brim.",
    price: "$28",
    cta: "Shop →",
  },
  {
    name: "GRYT Sticker Pack",
    description: "5-sticker set. Bear, wordmark, motivational phrases.",
    price: "$8",
    cta: "Shop →",
  },
];

function Merch() {
  return (
    <section className="bg-black text-paper px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15">
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader kicker="WEAR IT ON THE TRAIL" title="Merch" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {MERCH.map((m) => (
            <article
              key={m.name}
              className={`flex flex-col border border-paper/15 bg-ink hover:border-blue transition-colors ${
                m.comingSoon ? "opacity-65" : ""
              }`}
            >
              <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden border-b border-paper/15">
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, var(--blue) 0 1px, transparent 1px 10px)",
                  }}
                  aria-hidden
                />
                <MonogramG className="h-28 w-28 relative" />
              </div>
              <div className="flex flex-col gap-3 p-5 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[17px] font-bold leading-[1.2] tracking-tight">
                    {m.name}
                  </h3>
                  <span className="eyebrow text-blue whitespace-nowrap">
                    {m.price}
                  </span>
                </div>
                <p className="text-paper/65 text-[14px] leading-[1.55] flex-1">
                  {m.description}
                </p>
                <div className="pt-2">
                  {m.comingSoon ? (
                    <span className="inline-flex items-center px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] border border-paper/25 text-paper/55">
                      {m.cta}
                    </span>
                  ) : (
                    <a
                      href="https://cidbxi-3p.myshopify.com/"
                      target="_blank"
                      rel="noopener"
                      className="btn-primary"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {m.cta}
                    </a>
                  )}
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
