import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { signWaiver } from "@/lib/waiver.functions";
import photo1 from "@/assets/photos/run-club-1.jpg.asset.json";
import photo2 from "@/assets/photos/run-club-2.jpg.asset.json";
import photo3 from "@/assets/photos/run-club-3.jpg.asset.json";
import photo4 from "@/assets/photos/run-club-4.jpg.asset.json";
import photo5 from "@/assets/photos/run-club-5.jpg.asset.json";
import photo6 from "@/assets/photos/run-club-6.jpg.asset.json";
import photoBridge from "@/assets/photos/run-club-bridge.jpg.asset.json";
import nickLauraAsset from "@/assets/photos/nick-laura.jpg.asset.json";
import grytBearAsset from "@/assets/gryt-bear.png.asset.json";

const heroImgAsset = photo1;
const heroImg = photo4.url;
const circleImg = photo6.url;
const foundersImg = nickLauraAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "gryt run club · Saturdays 7 AM · McMurray, PA" },
      {
        name: "description",
        content:
          "A Pittsburgh run club for former athletes, busy parents, and comeback runners. Every Saturday at 7 AM on the Montour / Peters Trail. Walk, jog, or run. No one gets dropped.",
      },
      { property: "og:title", content: "gryt run club · Saturdays 7 AM" },
      {
        property: "og:description",
        content: "Do hard things together. Saturday mornings on the Montour / Peters Trail.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: Landing,
});

const STRAVA_CLUB = "https://www.strava.com/clubs/1708552";
const STRAVA_EVENT =
  "https://www.strava.com/clubs/1708552/group_events/3480014931408029926";

function MonogramG({ className = "" }: { className?: string }) {
  return (
    <img
      src={grytBearAsset.url}
      alt="gryt club bear"
      className={className}
      width={124}
      height={124}
      loading="lazy"
    />
  );
}

function MissionStamp({
  size = "md",
  align = "left",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
}) {
  const scale =
    size === "lg"
      ? "text-[clamp(40px,5.6vw,72px)]"
      : size === "md"
      ? "text-[clamp(24px,2.6vw,36px)]"
      : "text-[15px]";
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div
      className={`display-condensed inline-flex flex-col leading-[0.92] ${alignCls} ${scale} ${className}`}
      aria-label="Do hard things together"
    >
      <span>Do hard</span>
      <span>things</span>
      <span className="relative inline-block">
        together.
        <span
          className="absolute left-[-2px] right-[-2px] bottom-[0.1em] h-[0.12em] bg-blue"
          style={{ transform: "skewX(-8deg)" }}
          aria-hidden
        />
      </span>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-ink border-b border-paper/15">
      <div className="flex items-center justify-between px-5 sm:px-8 md:px-12 h-[68px]">
        <a href="#top" className="flex items-center gap-2">
          <MonogramG className="h-11 w-11" />
          <span className="wordmark uppercase text-[20px] leading-none [text-shadow:2px_2px_0_var(--blue)]">
            Run Club
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#details" className="eyebrow text-paper/80 hover:text-blue transition-colors">
            The Run
          </a>
          <a href="#first" className="eyebrow text-paper/80 hover:text-blue transition-colors">
            First Time
          </a>
          <a href="#founders" className="eyebrow text-paper/80 hover:text-blue transition-colors">
            Who We Are
          </a>
          <a href="#faq" className="eyebrow text-paper/80 hover:text-blue transition-colors">
            FAQ
          </a>
        </div>
        <a
          href="#join"
          className="bg-blue text-ink px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-paper transition-colors"
          style={{ fontFamily: "var(--font-body)" }}
        >
          RSVP Saturday
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const stats: Array<[string, string]> = [
    ["7–15", "regulars each Saturday"],
    ["33", "on the Strava club"],
    ["27", "marathons combined"],
    ["0", "runners dropped, ever"],
  ];

  return (
    <section
      id="top"
      className="relative overflow-hidden text-paper bg-ink py-16 md:py-24 lg:py-28 px-6 sm:px-12 lg:px-24"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 18% 22%, rgba(70,70,70,0.5), transparent 55%), radial-gradient(ellipse at 88% 85%, rgba(4,4,4,0.95), transparent 60%), #0a0a0a",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1.2px), radial-gradient(rgba(0,0,0,0.55) 1px, transparent 1.2px)",
          backgroundSize: "3px 3px, 5px 5px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(82deg, transparent 12%, rgba(137,207,240,0.6) 12.4%, rgba(137,207,240,0.6) 13.0%, transparent 13.4%), linear-gradient(82deg, transparent 63%, rgba(137,207,240,0.4) 63.4%, rgba(137,207,240,0.4) 64.0%, transparent 64.4%)",
        }}
      />

      <div className="relative max-w-[1240px] mx-auto flex flex-wrap items-center gap-10 lg:gap-16">
        <div className="flex-1 min-w-[300px] basis-[480px]">
          <div className="eyebrow-blue eyebrow mb-6 flex items-center gap-2.5 flex-wrap">
            <span className="w-2 h-2 bg-blue rounded-full" />
            Live in Pittsburgh · Saturdays at 7 AM · McMurray, PA
          </div>
          <h1 className="display-condensed text-paper text-[clamp(48px,7.2vw,108px)] leading-[0.9]">
            You used to have a team.
            <br />
            Now you have{" "}
            <span className="relative inline-block">
              Saturday.
              <span
                className="absolute left-[-2px] right-[-2px] bottom-[0.06em] h-[0.11em] bg-blue"
                style={{ transform: "skewX(-8deg)" }}
              />
            </span>
          </h1>

          <div className="mt-7 max-w-[540px] flex flex-col gap-3.5">
            <p className="text-lg leading-[1.55] text-paper/85">
              A Pittsburgh run club for former athletes, busy parents, and comeback runners. Every
              Saturday at 7 AM on the Montour / Peters Trail in McMurray — walk, jog, or run, then
              hang in the lot after.
            </p>
            <p className="text-base md:text-[17px] font-semibold leading-[1.5] text-paper">
              No pace requirement. No awkward first day. No one gets dropped.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap border border-paper/20 max-w-[560px]">
            {stats.map(([n, l], i) => (
              <div
                key={l}
                className={`flex-1 basis-[130px] px-4 py-4 ${
                  i !== stats.length - 1 ? "border-r border-paper/15" : ""
                }`}
              >
                <div className="display-condensed text-blue text-[34px] leading-[0.85]">{n}</div>
                <div className="text-[11px] font-semibold tracking-[0.06em] text-paper/70 mt-1.5 uppercase">
                  {l}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3.5">
            <a href="#join" className="btn-primary">
              RSVP for this Saturday →
            </a>
            <a
              href={STRAVA_CLUB}
              target="_blank"
              rel="noopener"
              className="btn-ghost"
            >
              Join the Strava chat
            </a>
          </div>
          <p className="mt-5 text-[13px] leading-[1.5] text-paper/60">
            Most people come alone the first time. New? Come 10 minutes early — we'll be by the
            trailhead.
          </p>
        </div>

        <div className="relative flex-[0_1_400px] min-w-[260px]">
          <div className="absolute left-[18px] top-[18px] -right-[18px] -bottom-[18px] bg-blue" />
          <div className="relative overflow-hidden border border-paper/10">
            <img
              src={heroImgAsset.url}
              alt="GRYT runner at night — motion, grit, and forward momentum"
              className="block w-full h-[520px] object-cover"
            />
            <div className="absolute left-0 right-0 bottom-0 flex items-end justify-between gap-3 px-4 pt-5 pb-4 bg-gradient-to-t from-black/85 to-transparent">
              <span className="display-condensed text-paper text-[22px] leading-none">
                Montour / Peters Trail
              </span>
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ink bg-blue px-2 py-1.5 whitespace-nowrap">
                Sat · 7 AM
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Do hard things together",
    "Real people",
    "Real miles",
    "7–15 regulars",
    "All paces welcome",
    "Do hard things together",
    "Free forever",
    "Coffee after",
    "No one gets dropped",
  ];
  const Row = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
    <span className="flex" aria-hidden={ariaHidden}>
      {items.map((t) => (
        <span key={t} className="flex items-center">
          <span
            className="display-condensed text-ink px-5 text-[19px] tracking-[0.05em]"
            style={{ fontWeight: 700 }}
          >
            {t}
          </span>
          <span className="text-ink/40">●</span>
        </span>
      ))}
    </span>
  );
  return (
    <>
      <div className="bg-blue border-t-2 border-b-2 border-ink overflow-hidden py-4">
        <div className="marquee-track">
          <Row />
          <Row ariaHidden />
        </div>
      </div>
      <div className="bg-ink text-center py-3.5 px-6 border-b border-paper/10">
        <span className="eyebrow text-paper/55">Built by Laura & Nick Merich</span>
      </div>
    </>
  );
}

function RSVP() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invited, setInvited] = useState(false);

  const submit = async () => {
    if (!name.trim() || !contact.trim()) {
      setError("Add your name and an email or phone so we can send the reminder.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          source: source || null,
          eventLabel: "GRYT Run #11 · Sat, Jun 27 · 7 AM",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Something went wrong. Try again in a moment.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const invite = () => {
    const text =
      "Come run with GRYT this Saturday — 7 AM, Montour/Peters Trail in McMurray. Walk, jog, or run. No one gets dropped.";
    const url = typeof location !== "undefined" ? location.href : STRAVA_CLUB;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "GRYT Run Club", text, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(text + " " + url)
        .then(() => setInvited(true))
        .catch(() => setInvited(true));
    } else {
      setInvited(true);
    }
  };

  const firstName = name.trim().split(" ")[0];
  const calHref =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" +
    encodeURIComponent("GRYT Run #11") +
    "&dates=20260627T110000Z/20260627T120000Z" +
    "&details=" +
    encodeURIComponent(
      "GRYT Run Club — Saturday 7 AM. Walk, jog, or run the Montour/Peters Trail. No one gets dropped. " +
        STRAVA_CLUB,
    ) +
    "&location=" +
    encodeURIComponent("212 Valley Brook Road, McMurray, PA");

  return (
    <section
      id="join"
      className="relative overflow-hidden bg-ink text-paper py-16 md:py-24 px-6 sm:px-12 lg:px-24 border-b border-paper/10"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(137,207,240,0.12) 1.5px, transparent 2px)",
          backgroundSize: "12px 12px",
          maskImage: "radial-gradient(ellipse at 85% 10%, #000, transparent 60%)",
          WebkitMaskImage: "radial-gradient(ellipse at 85% 10%, #000, transparent 60%)",
        }}
      />
      <div className="relative max-w-[1080px] mx-auto flex flex-wrap gap-10 lg:gap-16 items-start">
        <div className="flex-1 min-w-[300px] basis-[380px]">
          <div className="eyebrow eyebrow-blue mb-4">Save your spot</div>
          <h2 className="display-condensed text-paper text-[clamp(38px,5vw,68px)] mb-5">
            RSVP for this Saturday.
          </h2>
          <p className="text-[17px] leading-[1.6] text-paper/80 max-w-[440px] mb-6">
            Tell us you're coming and we'll send one nudge Friday and a wave Saturday morning.
            That's it. No spam, no funnel — just a standing invite to the trailhead.
          </p>
          <div className="border-t border-paper/20 pt-5 flex flex-col gap-3 max-w-[440px]">
            {[
              ["WHEN", "GRYT Run #11 · Sat, Jun 27 · 7:00 AM"],
              ["WHERE", "212 Valley Brook Road, McMurray · trail parking"],
              ["FIRST?", "Most people come alone. Show up 10 min early."],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 items-baseline">
                <span className="display-condensed text-blue text-[15px] tracking-[0.06em] basis-[86px] shrink-0">
                  {k}
                </span>
                <span className="text-[15px] text-paper/90">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-[300px] basis-[360px] bg-[#f4f2ed] text-ink p-7 md:p-9">
          {!submitted ? (
            <div>
              <div className="display-condensed text-ink text-[26px] mb-5">
                I'm in for Saturday
              </div>
              {[
                {
                  label: "First name",
                  placeholder: "What do we call you?",
                  value: name,
                  set: setName,
                  type: "text",
                },
                {
                  label: "Email or phone",
                  placeholder: "So we can send the reminder",
                  value: contact,
                  set: setContact,
                  type: "text",
                },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-ink/55 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full text-base text-ink bg-white border-[1.5px] border-[#cfcabe] px-3.5 py-3 mb-4 outline-none focus:border-ink"
                  />
                </div>
              ))}
              <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-ink/55 mb-1.5">
                How'd you find us?
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-base text-ink bg-white border-[1.5px] border-[#cfcabe] px-3.5 py-3 mb-4 outline-none focus:border-ink"
              >
                <option value="">Pick one</option>
                <option value="Friend">A friend</option>
                <option value="Instagram">Instagram</option>
                <option value="Strava">Strava</option>
                <option value="Google">Google</option>
                <option value="Trail">Saw you on the trail</option>
                <option value="Other">Other</option>
              </select>
              {error && (
                <div className="text-[13px] text-[#b23a2e] mb-3.5">{error}</div>
              )}
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full text-sm font-bold tracking-[0.1em] uppercase py-4 bg-ink text-paper hover:bg-[#3a7ca5] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {submitting ? "Sending…" : "RSVP for this Saturday →"}
              </button>
              <p className="mt-3.5 text-xs leading-[1.5] text-ink/55 text-center">
                Free, always. One reminder Friday, one Saturday. Unsubscribe anytime.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="w-[34px] h-[34px] bg-blue flex items-center justify-center display-condensed text-ink text-xl">
                  ✓
                </span>
                <span className="display-condensed text-ink text-[24px]">
                  {firstName ? `You're in, ${firstName}.` : "You're in."}
                </span>
              </div>
              <p className="mb-4 text-[15px] leading-[1.6] text-ink/80">
                We've got you down for <strong>GRYT Run #11</strong> — Saturday, Jun 27 at 7:00 AM.
                Look for the group near the trail sign at 212 Valley Brook Road.
              </p>
              <div className="border-y border-[#d8d4cb] py-4 mb-5 flex flex-col gap-2">
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink/55">
                  What to expect Saturday
                </div>
                {[
                  "Park free at the trailhead lot — come 10 min early if it's your first time",
                  "Quick circle-up at 7, then we move — walk, jog, or run your pace",
                  "About 4 miles out and back · nobody gets dropped",
                  "Coffee, water, and sometimes fruit in the lot after",
                ].map((t) => (
                  <div key={t} className="text-sm leading-[1.5] text-ink/80">
                    · {t}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                <a
                  href={calHref}
                  target="_blank"
                  rel="noopener"
                  className="text-[13px] font-bold tracking-[0.1em] uppercase py-4 bg-ink text-paper text-center hover:bg-[#3a7ca5] transition-colors"
                >
                  Add to calendar
                </a>
                <button
                  onClick={invite}
                  className="text-[13px] font-bold tracking-[0.1em] uppercase py-4 bg-transparent text-ink border-[1.5px] border-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  {invited ? "Copied — go send it" : "Invite a friend"}
                </button>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setContact("");
                  setSource("");
                  setInvited(false);
                }}
                className="mt-4 w-full bg-transparent text-xs font-semibold text-ink/55 underline"
              >
                RSVP someone else
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function QuickDetails() {
  const rows: Array<[string, string]> = [
    ["When", "Saturday · 7:00 AM"],
    ["Where", "212 Valley Brook Road · McMurray, PA"],
    ["Route", "Montour / Peters Trail"],
    ["Distance", "About 4 miles · out and back"],
    ["Pace", "Walk, jog, run · all welcome"],
    ["Cost", "$0 · always"],
    ["After", "Coffee, water, sometimes fruit in the lot"],
  ];
  return (
    <section id="details" className="bg-[#f4f2ed] text-ink py-20 md:py-28 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1100px] mx-auto flex flex-wrap gap-12 lg:gap-20 items-start">
        <div className="flex-1 min-w-[280px] basis-[320px]">
          <div className="eyebrow mb-4" style={{ color: "#3a7ca5" }}>
            The plan is simple
          </div>
          <h2 className="display-condensed text-ink text-[clamp(40px,5vw,68px)] mb-5">
            Saturday is already planned.
          </h2>
          <p className="text-[17px] leading-[1.6] text-ink/75 max-w-[440px] mb-7">
            You do not need a training plan, a perfect week, or a fast pace. You just need shoes and
            the decision to show up.
          </p>
          <a
            href="#join"
            className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 bg-ink text-paper hover:bg-[#3a7ca5] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            I'm coming this Saturday
          </a>
        </div>
        <div className="flex-1 min-w-[300px] basis-[420px] border-t-2 border-ink">
          {rows.map(([k, v], i) => (
            <div
              key={k}
              className={`flex justify-between gap-5 py-4 ${
                i !== rows.length - 1 ? "border-b border-[#d8d4cb]" : ""
              }`}
            >
              <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-ink/45 shrink-0 basis-[78px]">
                {k}
              </span>
              <span className="text-[17px] font-semibold text-right">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CorePromise() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper py-24 md:py-32 px-6 sm:px-12 lg:px-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(137,207,240,0.14) 1.5px, transparent 2px)",
          backgroundSize: "11px 11px",
          maskImage: "radial-gradient(ellipse at 90% 0%, #000, transparent 65%)",
          WebkitMaskImage: "radial-gradient(ellipse at 90% 0%, #000, transparent 65%)",
        }}
      />
      <div className="relative max-w-[960px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-6">The core promise</div>
        <h2 className="display-condensed text-paper text-[clamp(40px,6vw,86px)] max-w-[880px] mb-9">
          At some point, fitness got <span className="text-blue">lonely.</span>
        </h2>
        <div className="flex flex-col gap-5 max-w-[680px]">
          <p className="text-[19px] leading-[1.6] text-paper/80">
            You started squeezing workouts between work, kids, errands, and everything else on the
            calendar. At some point, you used to have a team — and then you didn't.
          </p>
          <p className="text-[19px] leading-[1.6] text-paper/80">
            GRYT gives you one standing appointment that does not move. Same time. Same trail. Same
            kind of people. The ones who still want to push, even if life looks different now.
          </p>
          <p className="display-condensed text-paper text-[clamp(24px,3vw,38px)] pt-2">
            You do not have to be fast.
            <br />
            You just have to be willing.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  const cards = [
    {
      tag: "01 — The comeback",
      title: "You're a former athlete.",
      body: "You miss being around people who get it. The quiet competitiveness. The jokes before the work. The part where nobody needs a speech because everyone already knows why they came. GRYT brings that back without making it complicated.",
    },
    {
      tag: "02 — The early hour",
      title: "You're a parent.",
      body: "You need something that is yours, early enough that the day still works for everyone else. Saturday at 7 AM gives you the workout, the headspace, and the reset before most people are fully awake. You can be home before the day gets away from you.",
    },
    {
      tag: "03 — The rhythm",
      title: "You're getting consistent again.",
      body: "Maybe you used to run. Maybe you are starting over. Maybe you just need a reason not to bail when the alarm goes off. One Saturday is a run. Twelve Saturdays is a rhythm. Fifty Saturdays changes how you see yourself.",
    },
    {
      tag: "04 — The crew",
      title: "You want real community.",
      body: "Not another group chat you ignore. Not a networking event disguised as fitness. Not a pack of strangers sprinting away from you. A real crew. People who learn your name, notice when you miss, and make the miles go faster.",
    },
  ];

  return (
    <section id="who" className="bg-white text-ink py-20 md:py-28 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1180px] mx-auto">
        <div className="eyebrow mb-4" style={{ color: "#3a7ca5" }}>
          Who it's for
        </div>
        <h2 className="display-condensed text-ink text-[clamp(36px,5vw,72px)] max-w-[900px] mb-12">
          If this sounds like you, you belong here.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 border-t-2 border-l-2 border-ink">
          {cards.map((c) => (
            <article key={c.tag} className="border-r-2 border-b-2 border-ink p-7 md:p-10">
              <div
                className="text-[11px] font-bold tracking-[0.16em] uppercase mb-3.5"
                style={{ color: "#3a7ca5" }}
              >
                {c.tag}
              </div>
              <h3 className="display-condensed text-ink text-[30px] mb-3.5">{c.title}</h3>
              <p className="text-[15px] leading-[1.6] text-ink/70">{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FirstTimer() {
  const steps = [
    {
      n: "1",
      h: "Park at the trailhead.",
      b: "Pull into 212 Valley Brook Road in McMurray. Parking is free and easy. Look for the group near the trail sign. If you are new, come 10 minutes early. Someone will say hey.",
    },
    {
      n: "2",
      h: "We circle up at 7.",
      b: "Quick names, quick route, quick check for new people. Nothing formal. Just enough so you know who you are running with. Then we move.",
    },
    {
      n: "3",
      h: "You find your pace.",
      b: "Walkers, joggers, and runners naturally split into small groups. You can push, cruise, or take it easy. Nobody gets dropped. Nobody cares what your watch says.",
    },
    {
      n: "4",
      h: "We finish together.",
      b: "The route is an out-and-back, so everyone ends up back at the same place. Stay for coffee if you can. That is where strangers become regulars.",
    },
  ];

  return (
    <section
      id="first"
      className="bg-blue text-ink py-20 md:py-28 px-6 sm:px-12 lg:px-24"
    >
      <div className="max-w-[1180px] mx-auto">
        <div className="eyebrow text-ink/70 mb-4">First time?</div>
        <h2 className="display-condensed text-ink text-[clamp(38px,5.4vw,76px)] mb-3">
          Your first Saturday is simple.
        </h2>
        <p className="text-lg leading-[1.55] text-ink font-medium max-w-[560px] mb-12">
          No insider rules. No awkward guessing. Here is exactly what happens.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-ink border-2 border-ink">
          {steps.map((s) => (
            <div key={s.n} className="bg-blue p-7 md:p-9">
              <div className="display-condensed text-ink text-6xl leading-[0.85] mb-4">{s.n}</div>
              <h3 className="display-condensed text-ink text-[24px] mb-2.5">{s.h}</h3>
              <p className="text-[15px] leading-[1.6] text-[#13313f]">{s.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3">
          <a
            href="#join"
            className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 bg-ink text-paper hover:bg-white hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            I'm coming this Saturday
          </a>
          <Link
            to="/waiver"
            className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 border-2 border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Sign the 2026 waiver
          </Link>
        </div>
      </div>
    </section>
  );
}

function TheRun() {
  return (
    <section
      id="run"
      className="bg-ink text-paper py-20 md:py-28 px-6 sm:px-12 lg:px-24"
    >
      <div className="max-w-[1180px] mx-auto flex flex-wrap gap-10 lg:gap-16 items-center">
        <div className="relative flex-1 min-w-[280px] basis-[380px]">
          <div className="absolute -left-4 -top-4 bottom-4 w-[60%] bg-blue" />
          <img
            src={circleImg}
            alt="On the trail with GRYT"
            className="relative block w-full h-[440px] object-cover border border-paper/10"
          />
        </div>
        <div className="flex-1 min-w-[280px] basis-[380px]">
          <div className="eyebrow eyebrow-blue mb-4">The run</div>
          <h2 className="display-condensed text-paper text-[clamp(34px,4.4vw,62px)] mb-6">
            The route is easy. Showing up is the hard part.
          </h2>
          <div className="flex flex-col gap-4 max-w-[480px]">
            <p className="text-[17px] leading-[1.6] text-paper/80">
              We run the Montour / Peters Trail because it is flat, wide, simple, and friendly for
              every pace. The usual route is about four miles out and back — but you can turn around
              whenever you need.
            </p>
            <p className="text-[17px] leading-[1.6] text-paper/80">
              You can bring a friend, a stroller, a dog, or just yourself. Most people come alone
              the first time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 mt-6">
            {["Flat, simple, out and back", "Walkers, joggers, runners"].map((t) => (
              <span
                key={t}
                className="text-xs font-semibold tracking-[0.08em] uppercase text-paper border border-paper/30 px-3.5 py-2"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Founders() {
  const stats: Array<[string, string]> = [
    ["27", "marathons — Nick & Laura, combined"],
    ["2014", "running together since"],
    ["7–15", "regulars each Saturday"],
    ["33", "total Strava members"],
  ];

  return (
    <section id="founders" className="bg-[#f4f2ed] text-ink py-20 md:py-28 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1100px] mx-auto flex flex-wrap gap-8 lg:gap-16 items-start">
        <div className="flex-1 min-w-[300px] basis-[420px]">
          <div className="eyebrow mb-4" style={{ color: "#3a7ca5" }}>
            The people behind it
          </div>
          <h2 className="display-condensed text-ink text-[clamp(38px,5vw,72px)] mb-6">
            Started by Laura & Nick Merich.
          </h2>
          <div className="flex flex-col gap-4 max-w-[520px]">
            <p className="text-[17px] leading-[1.6] text-ink/80">
              GRYT started because we needed it too. Between work, family, training, and everything
              that fills a week, we wanted one non-negotiable place to keep showing up.
            </p>
            <p className="text-[17px] leading-[1.6] text-ink/80">
              Not a race team. Not a social club with running attached. A real Saturday morning
              ritual for people who still want to do hard things together.
            </p>
            <p className="text-[17px] leading-[1.6] text-ink/80">
              Laura and Nick have finished 27 marathons combined, but GRYT is not about medals. It
              is about consistency, community, and becoming the kind of person who keeps promises to
              themselves.
            </p>
          </div>
        </div>
        <div className="flex-[0_1_320px] min-w-[240px] bg-ink text-paper flex flex-col">
          <div className="relative">
            <img
              src={foundersImg}
              alt="Laura and Nick Merich at the Pittsburgh Marathon finish"
              className="block w-full h-[420px] object-cover"
              style={{ objectPosition: "center 20%" }}
            />
            <div className="absolute left-0 right-0 bottom-0 px-4 py-4 bg-gradient-to-t from-black/85 to-transparent flex items-center justify-between gap-2">
              <span className="display-condensed text-paper text-[20px]">Laura & Nick</span>
              <MonogramG className="h-7 w-7" />
            </div>
          </div>
          <div className="px-8">
            {stats.map(([n, l]) => (
              <div key={l} className="border-t border-paper/15 py-4">
                <div className="display-condensed text-blue text-[44px] leading-[0.9]">{n}</div>
                <div className="text-[13px] text-paper/75 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section id="community" className="bg-ink text-paper py-20 md:py-28 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1100px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-4">The community</div>
        <h2 className="display-condensed text-paper text-[clamp(38px,5.2vw,76px)] max-w-[760px] mb-6">
          This is not about one run.
        </h2>
        <div className="flex flex-col gap-4 max-w-[640px] mb-12">
          <p className="text-lg leading-[1.6] text-paper/80">
            The run is the entry point. The community is the reason people come back.
          </p>
          <p className="text-lg leading-[1.6] text-paper/80">
            We use Strava for weekly events and the Strava Group Message for the group chat. You do
            not need the app to show up the first time. But once you come once, you will probably
            want to join in.
          </p>
        </div>

        <div className="relative mb-12 overflow-hidden border border-paper/15">
          <img
            src={heroImg}
            alt="The GRYT crew at the trailhead before a Saturday run"
            className="block w-full h-[clamp(280px,42vw,520px)] object-cover"
            style={{ objectPosition: "center 38%" }}
          />
          <div className="absolute left-0 right-0 bottom-0 px-6 py-6 bg-gradient-to-t from-black/85 to-transparent flex items-end justify-between gap-4 flex-wrap">
            <span className="display-condensed text-paper text-[clamp(22px,3vw,38px)]">
              This is the crew.
            </span>
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-ink bg-blue px-3 py-1.5 whitespace-nowrap">
              Saturday · 7 AM · McMurray
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <img
            src={photo2.url}
            alt="Sunny morning crew before heading out"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15"
          />
          <img
            src={photo3.url}
            alt="Cooling down on the trail after a Saturday run"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15"
          />
          <img
            src={photoBridge.url}
            alt="The crew running over the bridge on the Montour Trail"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15"
          />
          <img
            src={photo5.url}
            alt="Three runners heading down the trail at sunrise"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15"
          />
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-paper/15 p-7 flex flex-col">
            <div className="display-condensed text-paper text-[26px] mb-2.5">Strava</div>
            <p className="text-[15px] leading-[1.6] text-paper/75 mb-5 flex-1">
              See the run, RSVP, and track the activity. Strava is where the weekly event lives.
            </p>
            <div className="flex items-center gap-2.5 mb-6 border-t border-paper/15 pt-4">
              <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-ink bg-blue px-2 py-1 whitespace-nowrap">
                Next up
              </span>
              <span className="text-sm font-semibold text-paper">
                GRYT Run #11 · Sat, Jun 27 · 7 AM
              </span>
            </div>
            <a
              href={STRAVA_EVENT}
              target="_blank"
              rel="noopener"
              className="text-[13px] font-bold tracking-[0.1em] uppercase text-blue hover:text-paper transition-colors"
            >
              View this week's run →
            </a>
          </div>
          <div className="border border-paper/15 p-7 flex flex-col">
            <div className="display-condensed text-paper text-[26px] mb-2.5">Group Message</div>
            <p className="text-[15px] leading-[1.6] text-paper/75 mb-6 flex-1">
              The Strava Group Message is where people coordinate, ask questions, share photos, and
              stay connected between Saturdays.
            </p>
            <a
              href={STRAVA_CLUB}
              target="_blank"
              rel="noopener"
              className="text-[13px] font-bold tracking-[0.1em] uppercase text-blue hover:text-paper transition-colors"
            >
              Join the group chat →
            </a>
          </div>
        </div>

        <div className="mt-5 border border-paper/15 p-5 md:p-7">
          <div className="eyebrow eyebrow-blue mb-4">Live from the club · Strava</div>
          <iframe
            allowTransparency
            frameBorder={0}
            height={454}
            scrolling="no"
            src="https://www.strava.com/clubs/1708552/latest-rides/b76ca42ddb400c392ceee3ee06c641b84d840862?show_rides=true"
            className="w-full max-w-[340px] block border-0"
            title="GRYT latest activities on Strava"
          />
        </div>

        <div className="flex flex-wrap gap-3.5 mt-9">
          <a href={STRAVA_CLUB} target="_blank" rel="noopener" className="btn-primary">
            Join the chat
          </a>
          <a href={STRAVA_EVENT} target="_blank" rel="noopener" className="btn-ghost">
            View the Strava event
          </a>
        </div>
      </div>
    </section>
  );
}

function Beliefs() {
  const items = [
    "Hard things are easier together.",
    "You do not need to be fast to be serious.",
    "Parents are still athletes.",
    <>
      Former athletes are <span className="text-blue">not finished.</span>
    </>,
    "Consistency beats intensity.",
    "The best conversations happen around mile two.",
    "Coffee after counts.",
    "If you keep showing up, you become someone different.",
  ];
  return (
    <section className="bg-white text-ink py-20 md:py-28 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1080px] mx-auto">
        <div className="eyebrow mb-4" style={{ color: "#3a7ca5" }}>
          What we believe
        </div>
        <div className="flex flex-col border-t-2 border-ink">
          {items.map((b, i) => (
            <div
              key={i}
              className={`display-condensed text-ink py-5 text-[clamp(26px,3.4vw,46px)] leading-[1.02] ${
                i !== items.length - 1 ? "border-b border-[#e0ddd4]" : ""
              }`}
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Do I need to be fast?",
      a: "No. We have walkers, joggers, comeback runners, and people training for races. If you can move for 30 minutes, you can come.",
    },
    {
      q: "Can I come alone?",
      a: "Yes. Most people come alone the first time. Arrive 10 minutes early and introduce yourself. You will know people before the run is over.",
    },
    {
      q: "What if I cannot run four miles?",
      a: "No problem. The route is out and back, so you can turn around whenever you want. Walk, jog, run, or mix all three.",
    },
    {
      q: "Do I need Strava?",
      a: "No. Strava is helpful for RSVPs and weekly event details, but you can show up without it.",
    },
    {
      q: "What is the Group Message for?",
      a: "The Strava Group Message is the group chat. That is where we post updates, answer questions, and keep the community moving between runs.",
    },
    {
      q: "What happens if it rains?",
      a: "We still run in normal rain, cold, and imperfect weather. If conditions are unsafe, like ice or lightning, we update the group chat.",
    },
    { q: "Can I bring a friend?", a: "Yes. Bring someone who needs this." },
    {
      q: "Can I bring a stroller or dog?",
      a: "Yes. The trail is flat, wide, and friendly for both.",
    },
    { q: "Is this free?", a: "Yes. GRYT is free." },
    {
      q: "What is the after like?",
      a: "We hang in the parking lot after the run with coffee, water, and sometimes fruit. Stay for 10 minutes or stay for an hour. Either way, you are invited.",
    },
  ];
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-[#f4f2ed] text-ink py-20 md:py-28 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[920px] mx-auto">
        <div className="flex justify-between items-end border-b-[3px] border-ink pb-3.5 mb-2 flex-wrap gap-3">
          <h2 className="display-condensed text-ink text-[clamp(36px,5vw,66px)] leading-[0.92] m-0">
            Questions before
            <br />
            you show up
          </h2>
          <span
            className="text-xs font-bold tracking-[0.16em] uppercase"
            style={{ color: "#3a7ca5" }}
          >
            Ask in the chat →
          </span>
        </div>
        {faqs.map((f, i) => {
          const isOpen = i === open;
          return (
            <div key={f.q} className="border-b-[1.5px] border-ink">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full py-6 bg-transparent border-0 flex justify-between items-center gap-5 cursor-pointer text-left"
              >
                <span className="display-condensed text-ink text-[clamp(20px,2.4vw,28px)]">
                  {f.q}
                </span>
                <span
                  className="display-condensed text-[30px] leading-none shrink-0"
                  style={{ color: "#3a7ca5" }}
                >
                  {isOpen ? "–" : "+"}
                </span>
              </button>
              {isOpen && (
                <p className="m-0 mb-6 text-base leading-[1.65] text-ink/70 max-w-[720px]">
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      id="ready"
      className="relative overflow-hidden bg-ink text-paper py-24 md:py-36 px-6 sm:px-12 lg:px-24"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 22% 28%, rgba(70,70,70,0.5), transparent 55%), radial-gradient(ellipse at 85% 82%, rgba(4,4,4,0.95), transparent 60%), #0a0a0a",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(82deg, transparent 20%, rgba(137,207,240,0.55) 20.4%, rgba(137,207,240,0.55) 21.1%, transparent 21.5%), linear-gradient(82deg, transparent 78%, rgba(137,207,240,0.4) 78.4%, rgba(137,207,240,0.4) 79.1%, transparent 79.5%)",
        }}
      />
      <div className="relative max-w-[920px] mx-auto text-center">
        <h2 className="display-condensed text-paper text-[clamp(44px,7vw,104px)] leading-[0.9] mb-6">
          Stop waiting to feel ready.
        </h2>
        <p className="text-lg leading-[1.6] text-paper/80 max-w-[580px] mx-auto mb-3.5">
          You do not need to be in better shape first. You do not need to know someone. You do not
          need the perfect Saturday. You just need to show up once.
        </p>
        <p className="display-condensed text-blue text-[clamp(26px,3.6vw,44px)] mb-9">
          Saturday. 7 AM. McMurray.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <a href={STRAVA_EVENT} target="_blank" rel="noopener" className="btn-primary">
            I'm coming this Saturday →
          </a>
          <a href={STRAVA_CLUB} target="_blank" rel="noopener" className="btn-ghost">
            Join the chat
          </a>
        </div>
        <p className="mt-8 text-[13px] text-paper/55">We'll be by the trailhead.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex justify-between gap-10 flex-wrap items-start pb-12 border-b border-paper/15">
          <div className="flex-1 min-w-[260px] basis-[320px]">
            <div className="flex items-center gap-2.5 mb-4">
              <MonogramG className="h-14 w-14" />
              <span className="wordmark uppercase text-[26px] leading-none [text-shadow:3px_3px_0_var(--blue)]">
                Run Club
              </span>
            </div>
            <p className="text-sm leading-[1.6] text-paper/70 max-w-[340px]">
              Pittsburgh, PA · Saturdays · 7 AM · Montour / Peters Trail.
            </p>
          </div>
          <div>
            <MissionStamp size="md" align="left" className="text-paper" />
            <div className="flex gap-6 mt-6">
              <a
                href={STRAVA_CLUB}
                target="_blank"
                rel="noopener"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Strava
              </a>
              <a
                href={STRAVA_CLUB}
                target="_blank"
                rel="noopener"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Group Message
              </a>
              <a
                href="#"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-4 pt-6 flex-wrap eyebrow text-paper/40">
          <span>© 2026 GRYT Run Club. All rights reserved.</span>
          <span>Built by Laura & Nick Merich.</span>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <main className="bg-ink text-paper">
      <Nav />
      <Hero />
      <Marquee />
      <RSVP />
      <QuickDetails />
      <CorePromise />
      <WhoItsFor />
      <FirstTimer />
      <TheRun />
      <Founders />
      <Community />
      <Beliefs />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
