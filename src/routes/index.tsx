import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { signWaiver, checkWaiverStatus } from "@/lib/waiver.functions";
import { submitRecommendation } from "@/lib/recommendations.functions";
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

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "Where do I park?", a: "Park near 212 Valley Brook Road in the South Hills and follow the group toward the Montour Peters Trail." },
  { q: "Are there bathrooms?", a: "Check the meeting-point details before you come, since restroom access can depend on what is open at that hour." },
  { q: "Do I need to be fast?", a: "No. We have walkers, joggers, comeback runners, and people training for races. If you can move for 30 minutes, you can come." },
  { q: "Can I come alone?", a: "Yes. Most people come alone the first time. Arrive 10 minutes early and introduce yourself. You will know people before the run is over." },
  { q: "What if I cannot run four miles?", a: "No problem. The route is out and back, so you can turn around whenever you want. Walk, jog, run, or mix all three." },
  { q: "Do I need Strava?", a: "No. Strava is helpful for RSVPs and weekly event details, but you can show up without it." },
  { q: "What is the Group Message for?", a: "The Strava Group Message is the group chat. That is where we post updates, answer questions, and keep the community moving between runs." },
  { q: "What happens if it rains?", a: "We still run in normal rain, cold, and imperfect weather. If conditions are unsafe, like ice or lightning, we update the group chat." },
  { q: "Can I bring a friend?", a: "Yes. Bring someone who needs this." },
  { q: "Can I bring a stroller or dog?", a: "Yes. The trail is flat, wide, and friendly for both." },
  { q: "Is this free?", a: "Yes. GRYT is free." },
  { q: "What is the after like?", a: "We hang in the parking lot after the run with coffee, water, and sometimes fruit. Stay for 10 minutes or stay for an hour. Either way, you are invited." },
];

const SITE_URL = "https://grytrunclub.com";
const ABS_HERO_IMG = heroImg.startsWith("http") ? heroImg : `${SITE_URL}${heroImg}`;

// Next 12 Saturday 7am occurrences for the recurring event schema.
function nextSaturdayISOs(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setUTCHours(11, 0, 0, 0); // 7:00 AM America/New_York ~= 11:00 UTC (EST). Best-effort.
  const day = d.getUTCDay();
  const add = (6 - day + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString());
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return out;
}
const EVENT_DATES = nextSaturdayISOs(12);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "gryt run club · Saturdays 7 AM · McMurray, PA" },
      {
        name: "description",
        content:
          "Pittsburgh Saturday 7 AM run club on the Montour / Peters Trail. Walk, jog, or run. No pace requirement. No one gets dropped.",
      },
      { property: "og:title", content: "gryt run club · Saturdays 7 AM" },
      {
        property: "og:description",
        content: "Do hard things together. Saturday mornings on the Montour / Peters Trail.",
      },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: ABS_HERO_IMG },
      { name: "twitter:image", content: ABS_HERO_IMG },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["SportsActivityLocation", "LocalBusiness"],
          "@id": "https://grytrunclub.com/#location",
          name: "GRYT Run Club",
          description:
            "A Pittsburgh run club for former athletes, busy parents, and comeback runners.",
          url: SITE_URL,
          image: ABS_HERO_IMG,
          logo: `${SITE_URL}/icon-512.png`,
          telephone: "",
          sport: "Running",
          priceRange: "Free",
          address: {
            "@type": "PostalAddress",
            streetAddress: "212 Valley Brook Road",
            addressLocality: "McMurray",
            addressRegion: "PA",
            addressCountry: "US",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "07:00",
              closes: "08:30",
            },
          ],
          sameAs: [
            "https://www.strava.com/clubs/1708552",
            "https://www.instagram.com/grytrunclub/",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: "GRYT Saturday Run",
          description:
            "Free Saturday morning group run on the Montour / Peters Trail. Walk, jog, or run — no pace requirement, no one gets dropped.",
          eventSchedule: {
            "@type": "Schedule",
            repeatFrequency: "P1W",
            byDay: "https://schema.org/Saturday",
            startTime: "07:00",
            endTime: "08:30",
            scheduleTimezone: "America/New_York",
          },
          startDate: EVENT_DATES[0],
          endDate: EVENT_DATES[0]?.replace("T11:00", "T12:30"),
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          url: SITE_URL,
          image: ABS_HERO_IMG,
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: SITE_URL,
          },
          organizer: {
            "@type": "SportsOrganization",
            "@id": "https://grytrunclub.com/#organization",
            name: "GRYT Run Club",
            url: SITE_URL,
            sameAs: [
              "https://www.strava.com/clubs/1708552",
              "https://www.instagram.com/grytrunclub/",
            ],
          },
          location: {
            "@type": "Place",
            name: "Montour / Peters Trail trailhead",
            address: {
              "@type": "PostalAddress",
              streetAddress: "212 Valley Brook Road",
              addressLocality: "McMurray",
              addressRegion: "PA",
              addressCountry: "US",
            },
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Landing,
});

const STRAVA_CLUB = "https://www.strava.com/clubs/1708552";

// Recurring Google Calendar links (America/New_York).
export const SAT_CAL_URL =
  "https://www.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("GRYT Run — Saturday Morning") +
  "&dates=20260103T070000/20260103T080000" +
  "&recur=" + encodeURIComponent("RRULE:FREQ=WEEKLY;BYDAY=SA") +
  "&ctz=America/New_York" +
  "&location=" + encodeURIComponent("212 Valley Brook Rd, McMurray, PA 15317") +
  "&details=" + encodeURIComponent("All paces. All parents. 7 AM sharp. Coffee in the lot after. Strava: " + STRAVA_CLUB);

export const TUE_CAL_URL =
  "https://www.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("GRYT Night Shift — Tuesday Run") +
  "&dates=20251230T210000/20251230T220000" +
  "&recur=" + encodeURIComponent("RRULE:FREQ=WEEKLY;BYDAY=TU") +
  "&ctz=America/New_York" +
  "&location=" + encodeURIComponent("Mt. Lebanon Public Library, 16 Castle Shannon Blvd, Pittsburgh, PA 15228") +
  "&details=" + encodeURIComponent("After dark. Bring a light and a friend. All paces. No one left behind. Strava: " + STRAVA_CLUB);

type RsvpDay = "tue" | "sat";
const DAY_LABEL: Record<RsvpDay, string> = { tue: "Tuesday · Night Shift", sat: "Saturday · GRYT Run" };
const DAY_CAL: Record<RsvpDay, string> = { tue: TUE_CAL_URL, sat: SAT_CAL_URL };
const DAY_EVENT_LABEL: Record<RsvpDay, string> = {
  tue: "GRYT Night Shift · Tuesday · 9 PM",
  sat: "GRYT Run #12 · Sat, July 4th · 7 AM",
};
const STRAVA_EVENT =
  "https://www.strava.com/clubs/1708552/group_events/3480014931408029926";
// Per-day Strava destination. Saturday points at the recurring group event;
// Tuesday falls back to the club's group_events list until a recurring Tue event ID is set.
const STRAVA_EVENT_URL: Record<RsvpDay, string> = {
  sat: STRAVA_EVENT,
  tue: "https://www.strava.com/clubs/1708552/group_events",
};

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
          <Link to="/resources" className="eyebrow text-paper/80 hover:text-blue transition-colors">
            Resources
          </Link>
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
    ["33", "runners on Strava"],
    ["27", "marathons — Laura & Nick combined"],
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
              A Pittsburgh run club in the South Hills for former athletes, busy parents, comeback runners, and anyone who wants a real crew again. We meet every Saturday at 7 AM in McMurray to walk, jog, or run, then hang in the lot after.
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
              RSVP for Saturday →
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
            One reminder on Friday. One wave at the trailhead. That's it.
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

function MemberNamesMarquee() {
  const names = [
    "Wilton Gorske",
    "Aaron Maize",
    "Michael DiVella",
    "Dave Friedman",
    "Maria Friedman",
    "Ian Baun",
    "Nick Merich",
    "Matt Pardon",
    "Kyle Bloser",
    "Jeana DeNardo",
    "Zac Kuch",
    "Pete Ross",
    "Matthew Bianco",
    "Nathan James",
    "Matt Messerley",
    "Laura Merich",
    "Jay Wysocki",
    "Eli Wysocki",
    "Caleb Wysocki",
  ];

  const Row = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
    <span className="flex" aria-hidden={ariaHidden}>
      {names.map((n) => (
        <span key={n} className="flex items-center shrink-0">
          <span className="display-condensed text-paper px-5 text-[clamp(18px,2.2vw,24px)] tracking-[0.05em] whitespace-nowrap">
            {n}
          </span>
          <span className="text-blue">/</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="bg-ink border-t border-b border-paper/15 overflow-hidden py-4">
      <div className="member-marquee-track">
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}

function RSVP() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [source, setSource] = useState("");
  const [days, setDays] = useState<Record<RsvpDay, boolean>>({ tue: false, sat: true });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedDays, setSubmittedDays] = useState<RsvpDay[]>([]);

  const toggleDay = (d: RsvpDay) => setDays((p) => ({ ...p, [d]: !p[d] }));

  const submit = async () => {
    if (!name.trim() || !contact.trim()) {
      setError("Add your name and an email or phone so we can send the reminder.");
      return;
    }
    const selected = (Object.keys(days) as RsvpDay[]).filter((d) => days[d]);
    if (selected.length === 0) {
      setError("Pick at least one run — Tuesday, Saturday, or both.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // One RSVP per selected day so each gets the right event label + calendar.
      const results = await Promise.all(
        selected.map((d) =>
          fetch("/api/public/rsvp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              contact: contact.trim(),
              source: source || null,
              eventLabel: DAY_EVENT_LABEL[d],
            }),
          }),
        ),
      );
      const failed = results.find((r) => !r.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        setError(data?.error || "Something went wrong. Try again in a moment.");
        return;
      }
      setSubmittedDays(selected);
      setSubmitted(true);
      // Save a tiny prefill so the waiver page can auto-populate.
      try {
        const contactStr = contact.trim();
        const looksLikeEmail = /@/.test(contactStr);
        localStorage.setItem(
          "gryt_rsvp_prefill",
          JSON.stringify({
            name: name.trim(),
            email: looksLikeEmail ? contactStr.toLowerCase() : "",
            phone: looksLikeEmail ? "" : contactStr,
          }),
        );
      } catch {
        // ignore
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
            {([
              ["WHEN", "GRYT Run #12 · Sat, July 4th · 7:00 AM"],
              ["WHERE", <>212 Valley Brook Road, McMurray · trail parking · <a href="https://www.google.com/maps/dir/?api=1&destination=212%20Valley%20Brook%20Road%2C%20McMurray%2C%20PA" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">Get directions</a></>],
              ["FIRST?", "Most people come alone. Show up 10 min early."],
            ] as [string, ReactNode][]).map(([k, v]) => (
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
                I'm in this week
              </div>
              <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-ink/55 mb-2">
                Which run(s)?
              </label>
              <div className="flex flex-col gap-2 mb-4">
                {(["sat", "tue"] as RsvpDay[]).map((d) => (
                  <label
                    key={d}
                    className={`flex items-center gap-3 border-[1.5px] px-3.5 py-3 cursor-pointer transition-colors ${
                      days[d] ? "border-ink bg-white" : "border-[#cfcabe] bg-white/60 hover:border-ink/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={days[d]}
                      onChange={() => toggleDay(d)}
                      className="w-4 h-4 accent-[#3a7ca5]"
                    />
                    <span className="text-sm font-semibold text-ink">{DAY_LABEL[d]}</span>
                    <span className="text-xs text-ink/55 ml-auto">
                      {d === "sat" ? "7:00 AM" : "9:00 PM"}
                    </span>
                  </label>
                ))}
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
                {submitting ? "Sending…" : "Lock it in →"}
              </button>
              <p className="mt-3.5 text-xs leading-[1.5] text-ink/55 text-center">
                Free, always. One reminder Friday, one Saturday. Unsubscribe anytime.
              </p>
              <p className="mt-2 text-xs leading-[1.5] text-ink/50 text-center">
                We'll only use this to send run reminders and GRYT updates. No spam.
              </p>
              <p className="mt-2 text-xs text-center">
                <Link to="/privacy" className="text-ink/50 underline hover:text-ink transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="w-[34px] h-[34px] bg-blue flex items-center justify-center display-condensed text-ink text-xl">
                  ✓
                </span>
                <span className="display-condensed text-ink text-[24px]">
                  {submittedDays.length === 2
                    ? "You're in for Tue + Sat."
                    : submittedDays[0] === "tue"
                      ? "You're in for Tuesday."
                      : "You're in for Saturday."}
                </span>
              </div>
              <div className="border-y border-[#d8d4cb] py-4 mb-5 flex flex-col gap-3">
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink/55">
                  Add to your calendar
                </div>
                <div className="flex flex-col gap-2">
                  {submittedDays.map((d) => (
                    <a
                      key={d}
                      href={DAY_CAL[d]}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-between gap-3 border-[1.5px] border-ink px-3.5 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
                    >
                      <span>Add {DAY_LABEL[d]}</span>
                      <span className="text-xs tracking-[0.1em] uppercase opacity-70">
                        {d === "sat" ? "7:00 AM" : "9:00 PM"}
                      </span>
                    </a>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {submittedDays.map((d) => (
                    <a
                      key={d}
                      href={STRAVA_EVENT_URL[d]}
                      target="_blank"
                      rel="noopener"
                      className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/70 hover:text-ink underline underline-offset-4"
                    >
                      Open {d === "sat" ? "Saturday" : "Tuesday"} on Strava →
                    </a>
                  ))}
                </div>
                <div className="text-xs text-ink/55">
                  Recurring weekly event — shows up every {submittedDays.length === 2 ? "Tuesday and Saturday" : submittedDays[0] === "tue" ? "Tuesday" : "Saturday"}.
                </div>
              </div>
              <RSVPWaiverBlock />
              <a
                href={STRAVA_CLUB}
                target="_blank"
                rel="noopener"
                className="text-[13px] font-bold tracking-[0.1em] uppercase py-4 bg-transparent text-ink border-[1.5px] border-ink text-center hover:bg-ink hover:text-paper transition-colors block mt-4"
              >
                Join the Strava club
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedDays([]);
                  setName("");
                  setContact("");
                  setSource("");
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
  const rows: Array<[string, React.ReactNode]> = [
    ["When", "Saturday · 7:00 AM"],
    ["Where", <>212 Valley Brook Road · McMurray, PA · <a href="https://www.google.com/maps/dir/?api=1&destination=212%20Valley%20Brook%20Road%2C%20McMurray%2C%20PA" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink/70">Get directions</a></>],
    ["Route", "Montour / Peters Trail · Peters Township & Upper St. Clair"],
    ["Distance", "About 4 miles · out and back"],
    ["Pace", "Walk, jog, run · all welcome"],
    ["Cost", "Free, always"],
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

function MeetingPointMap() {
  return (
    <div className="mt-10 border-2 border-ink">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-ink flex-wrap">
        <div className="flex items-center gap-2.5">
          <MonogramG className="h-8 w-8" />
          <span className="display-condensed text-paper text-[15px] tracking-[0.05em]">
            Meeting Point
          </span>
        </div>
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue">
          212 Valley Brook Rd · McMurray
        </span>
      </div>
      <div className="relative bg-n-100">
        <iframe
          src="https://maps.google.com/maps?q=212+Valley+Brook+Road,McMurray,PA&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="320"
          style={{ border: 0, display: "block", filter: "grayscale(30%) contrast(110%)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="GRYT Run Club meeting point near 212 Valley Brook Road, McMurray, PA"
        />
      </div>
      <div className="px-5 py-3 bg-ink flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-paper/70">
          Look for the group near the trail sign on the Montour / Peters Trail.
        </span>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=212%20Valley%20Brook%20Road%2C%20McMurray%2C%20PA"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold tracking-[0.1em] uppercase text-blue hover:text-paper transition-colors"
        >
          Get directions →
        </a>
      </div>
    </div>
  );
}

function FirstTimer() {
  const steps = [
    {
      n: "1",
      h: "Park at the trailhead.",
      b: <>Pull into <a href="https://www.google.com/maps/dir/?api=1&destination=212%20Valley%20Brook%20Road%2C%20McMurray%2C%20PA" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">212 Valley Brook Road in McMurray, Peters Township</a>. Parking is free and easy. Look for the group near the trail sign. If you are new, come 10 minutes early. Someone will say hey.</>,
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
        <MeetingPointMap />
        <div className="mt-8 border-2 border-ink p-6 md:p-8 max-w-[720px]">
          <p className="text-[15px] leading-[1.6] text-[#13313f]">
            <span className="font-semibold">First time? Come 10 minutes early.</span> Nick, Laura, or one of the regulars will introduce you to someone before we start.
          </p>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3">
          <a
            href="#join"
            className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 bg-ink text-paper hover:bg-white hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            I'm coming this Saturday
          </a>
        </div>
        <InlineWaiver />
      </div>
    </section>
  );
}

// ---------- Inline waiver flow ----------

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

type WaiverForm = {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  signature_text: string;
  agree_release: boolean;
  agree_fitness: boolean;
  agree_adult: boolean;
};

function RSVPWaiverBlock() {
  const [waiver, setWaiver] = useState<{ id: string; signed_on: string; name: string } | null>(null);

  useEffect(() => {
    const stored = readStoredWaiver();
    if (stored) setWaiver(stored);
  }, []);

  if (waiver) {
    return (
      <div className="border border-ink p-4 flex items-center gap-3 bg-ink/5">
        <span className="w-7 h-7 bg-blue flex items-center justify-center text-ink text-[12px] font-bold shrink-0">✓</span>
        <div>
          <p className="text-[13px] font-semibold text-ink">Waiver completed</p>
          <p className="text-[11px] text-ink/60">Signed {waiver.signed_on} · Covered through Dec 31, 2026</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Link
        to="/waiver"
        className="text-[13px] font-bold tracking-[0.1em] uppercase py-4 bg-ink text-paper text-center hover:bg-[#3a7ca5] transition-colors block"
      >
        Sign the waiver
      </Link>
      <p className="text-[12px] text-ink/60 text-center -mt-1">
        One signature covers you through Dec 31, 2026. Takes about a minute.
      </p>
    </div>
  );
}

const EMPTY_FORM: WaiverForm = {
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  signature_text: "",
  agree_release: false,
  agree_fitness: false,
  agree_adult: false,
};

const WAIVER_STORAGE_KEY = "gryt_waiver_2026";

function readStoredWaiver(): { id: string; signed_on: string; name: string } | null {
  try {
    const raw = localStorage.getItem(WAIVER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && parsed.signed_on && parsed.name) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveStoredWaiver(v: { id: string; signed_on: string; name: string }) {
  try {
    localStorage.setItem(WAIVER_STORAGE_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
}

function InlineWaiver() {
  const sign = useServerFn(signWaiver);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<WaiverForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; signed_on: string; name: string } | null>(null);

  useEffect(() => {
    const stored = readStoredWaiver();
    if (stored) setDone(stored);
  }, []);

  const set = <K extends keyof WaiverForm>(k: K, v: WaiverForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const age = useMemo(() => {
    if (!form.date_of_birth) return null;
    const d = new Date(form.date_of_birth);
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a;
  }, [form.date_of_birth]);

  const isMinor = age !== null && age < 18;
  const sigMatches =
    form.signature_text.trim().length > 0 &&
    form.signature_text.trim().toLowerCase() === form.full_name.trim().toLowerCase();

  const step2Valid =
    form.full_name.trim().length > 1 &&
    /.+@.+\..+/.test(form.email) &&
    form.date_of_birth.length > 0 &&
    !isMinor &&
    form.emergency_contact_name.trim().length > 0 &&
    form.emergency_contact_phone.trim().length > 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await sign({
        data: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          date_of_birth: form.date_of_birth,
          emergency_contact_name: form.emergency_contact_name,
          emergency_contact_phone: form.emergency_contact_phone,
          signature_text: form.signature_text,
          agree_release: form.agree_release as true,
          agree_fitness: form.agree_fitness as true,
          agree_adult: form.agree_adult as true,
        },
      });
      const result = { id: res.id, signed_on: res.signed_on, name: form.full_name.trim() };
      setDone(result);
      saveStoredWaiver(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6" role="status" aria-live="polite">
        <div className="inline-flex items-center gap-2.5 bg-ink text-paper px-4 py-3 border border-paper/20">
          <span className="w-6 h-6 bg-blue flex items-center justify-center text-ink text-[13px] font-bold">✓</span>
          <span className="text-[13px] font-semibold tracking-[0.04em]">
            Waiver completed — covered through Dec 31, 2026
          </span>
        </div>
        <p className="mt-2 text-[12px] text-[#13313f]">
          Signed on {done.signed_on} · {done.name}
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 border-2 border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Sign the 2026 waiver →
        </button>
        <p className="mt-3 text-[13px] text-[#13313f]">
          One signature covers you through Dec 31, 2026. Takes about a minute.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 border-2 border-ink bg-ink text-paper">
      {/* Step header */}
      <div className="flex items-stretch border-b border-paper/15">
        {[1, 2, 3].map((n) => {
          const labels = ["Read", "Your info", "Sign"];
          const active = step === n;
          const past = step > n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                if (n < step) setStep(n as 1 | 2 | 3);
              }}
              className={`flex-1 px-4 py-4 text-left border-r border-paper/15 last:border-r-0 transition-colors ${
                active ? "bg-blue text-ink" : past ? "bg-ink text-paper" : "bg-ink text-paper/50"
              }`}
            >
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-80">
                Step {n}
              </div>
              <div className="display-condensed text-[20px] leading-tight">{labels[n - 1]}</div>
            </button>
          );
        })}
      </div>

      <div className="p-7 md:p-10">
        {step === 1 && (
          <div>
            <h3 className="display-condensed text-paper text-[26px] mb-2">
              Release of liability · 2026 season
            </h3>
            <p className="text-[12px] tracking-[0.14em] uppercase text-paper/50 mb-5">
              gryt run club · v1
            </p>
            <div className="max-h-[320px] overflow-y-auto pr-4 border border-paper/15 p-5 bg-ink/40 flex flex-col gap-4 text-[14px] leading-[1.65] text-paper/85">
              <p>
                In consideration of being permitted to participate in any activity organized by{" "}
                <strong>gryt run club</strong>, I acknowledge that running and related activity
                involve inherent risks — falls, weather, traffic, trail conditions, and the actions
                of others — and I assume all such risks, known and unknown.
              </p>
              <p>
                I represent that I am physically able to participate and have consulted a physician
                as needed. I <strong>release, waive, and covenant not to sue</strong> the Club, its
                founders, volunteers, members, and any landowner whose property is used, from any
                liability arising out of my participation, to the fullest extent permitted by law.
              </p>
              <p>
                I agree to indemnify the released parties for any loss they incur due to my
                participation. I authorize the Club to seek emergency medical care on my behalf if
                I am unable to do so, and I am responsible for resulting expenses.
              </p>
              <p>
                I grant the Club permission to use photos, video, or audio of me taken during
                activities for promotional purposes, revocable in writing. Participants under 18
                must sign in person with a parent or guardian — the online form is for adults 18+.
              </p>
              <p>
                This agreement is effective from signing through <strong>December 31, 2026</strong>{" "}
                and is governed by the laws of the Commonwealth of Pennsylvania.
              </p>
              <p className="italic text-paper/70">
                By typing my name as a signature in step 3, I confirm I have read, understood, and
                agreed to this waiver, and that my electronic signature has the same legal effect
                as a handwritten signature.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[12px] font-bold tracking-[0.14em] uppercase text-paper/60 hover:text-paper"
              >
                ← Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm font-bold tracking-[0.1em] uppercase px-6 py-3 bg-blue text-ink hover:bg-paper transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                I've read it → Your info
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="display-condensed text-paper text-[26px] mb-1">Your info</h3>
            <p className="text-[14px] text-paper/70 mb-6">
              We use this for the waiver record and to reach you if there's a schedule change.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InlineField label="Full legal name" required>
                <input
                  type="text"
                  maxLength={120}
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className={inlineInputCls}
                  autoComplete="name"
                />
              </InlineField>
              <InlineField label="Email" required>
                <input
                  type="email"
                  maxLength={200}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inlineInputCls}
                  autoComplete="email"
                />
              </InlineField>
              <InlineField label="Phone (optional)">
                <input
                  type="tel"
                  maxLength={40}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inlineInputCls}
                  autoComplete="tel"
                />
              </InlineField>
              <InlineField label="Date of birth" required>
                <input
                  type="date"
                  max={TODAY_ISO()}
                  value={form.date_of_birth}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                  className={inlineInputCls}
                />
                {isMinor && (
                  <p className="mt-1.5 text-[13px] text-blue font-semibold">
                    Minors must sign in person with a parent or guardian.
                  </p>
                )}
              </InlineField>
              <InlineField label="Emergency contact" required>
                <input
                  type="text"
                  maxLength={120}
                  value={form.emergency_contact_name}
                  onChange={(e) => set("emergency_contact_name", e.target.value)}
                  className={inlineInputCls}
                />
              </InlineField>
              <InlineField label="Their phone" required>
                <input
                  type="tel"
                  maxLength={40}
                  value={form.emergency_contact_phone}
                  onChange={(e) => set("emergency_contact_phone", e.target.value)}
                  className={inlineInputCls}
                />
              </InlineField>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[12px] font-bold tracking-[0.14em] uppercase text-paper/60 hover:text-paper"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!step2Valid}
                onClick={() => setStep(3)}
                className="text-sm font-bold tracking-[0.1em] uppercase px-6 py-3 bg-blue text-ink hover:bg-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Continue → Sign
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={onSubmit}>
            <h3 className="display-condensed text-paper text-[26px] mb-1">Sign</h3>
            <p className="text-[14px] text-paper/70 mb-6">
              Confirm the three statements and type your full legal name to sign.
            </p>
            <div className="flex flex-col gap-3 mb-6">
              <InlineCheck
                checked={form.agree_release}
                onChange={(v) => set("agree_release", v)}
                label="I have read and agree to the release of liability."
              />
              <InlineCheck
                checked={form.agree_fitness}
                onChange={(v) => set("agree_fitness", v)}
                label="I am physically able to participate and have consulted a physician as needed."
              />
              <InlineCheck
                checked={form.agree_adult}
                onChange={(v) => set("agree_adult", v)}
                label="I am 18 years or older."
              />
            </div>
            <InlineField label="Type your full name to sign" required>
              <input
                type="text"
                maxLength={120}
                value={form.signature_text}
                onChange={(e) => set("signature_text", e.target.value)}
                className={`${inlineInputCls} font-serif italic text-[20px]`}
                placeholder={form.full_name || "Your full legal name"}
                autoComplete="off"
              />
              {form.signature_text.length > 0 && !sigMatches && (
                <p className="mt-1.5 text-[13px] text-blue font-semibold">
                  Signature must match your full legal name exactly.
                </p>
              )}
            </InlineField>
            <div className="text-[13px] text-paper/60 mt-4">
              Signing date: <span className="text-paper">{TODAY_ISO()}</span>
            </div>
            {error && (
              <div className="mt-4 border border-blue bg-blue/10 px-4 py-3 text-[14px] text-paper">
                {error}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-[12px] font-bold tracking-[0.14em] uppercase text-paper/60 hover:text-paper"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={
                  submitting ||
                  !sigMatches ||
                  !form.agree_release ||
                  !form.agree_fitness ||
                  !form.agree_adult
                }
                className="text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 bg-blue text-ink hover:bg-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {submitting ? "Signing…" : "Sign the 2026 waiver"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inlineInputCls =
  "w-full bg-ink border border-paper/25 px-3.5 py-2.5 text-paper text-[15px] focus:outline-none focus:border-blue";

function InlineField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-paper/70">
        {label}
        {required && <span className="text-blue"> *</span>}
      </span>
      {children}
    </label>
  );
}

function InlineCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-blue cursor-pointer"
      />
      <span className="text-[14px] leading-[1.5] text-paper/85 group-hover:text-paper">
        {label}
      </span>
    </label>
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
          <a href="/#join" className="btn-primary">
            RSVP for this Saturday →
          </a>
          <a href={STRAVA_CLUB} target="_blank" rel="noopener" className="btn-ghost">
            Join the Strava club
          </a>
          <a href={STRAVA_EVENT} target="_blank" rel="noopener" className="btn-ghost">
            View this week's Strava event
          </a>
        </div>
      </div>
    </section>
  );
}

function Beliefs() {
  const items = [
    "Growth is the goal.",
    "We show up no matter what.",
    <>
      Progress <span className="text-blue">{">"}</span> perfection.
    </>,
    "Hard is the point.",
    "Earn daily.",
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
              className={`flex items-center gap-4 sm:gap-6 py-5 ${
                i !== items.length - 1 ? "border-b border-[#e0ddd4]" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="display-condensed shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-ink text-white text-[18px] sm:text-[22px] leading-none"
                style={{ boxShadow: "3px 3px 0 var(--blue)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="display-condensed text-ink text-[clamp(26px,3.4vw,46px)] leading-[1.02]">
                {b}
              </div>
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
      q: "Where do I park?",
      a: "Park near 212 Valley Brook Road and follow the group toward the Montour Peters Trail.",
    },
    {
      q: "Are there bathrooms?",
      a: "Check the meeting-point details before you come, since restroom access can depend on what is open at that hour.",
    },
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
          <a href="/#join" className="btn-primary">
            I'm coming this Saturday →
          </a>
          <a href={STRAVA_CLUB} target="_blank" rel="noopener" className="btn-ghost">
            Join the Strava club
          </a>
        </div>
        <p className="mt-8 text-[13px] text-paper/55">We'll be by the trailhead.</p>
      </div>
    </section>
  );
}

function RecommendationsBar() {
  const submitRec = useServerFn(submitRecommendation);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const pills = [
    { label: "I want merch!", category: "merch" },
    { label: "Run longer", category: "distance" },
    { label: "Different route", category: "route" },
    { label: "Post-run coffee", category: "social" },
    { label: "Bring-a-friend promo", category: "growth" },
    { label: "Trail cleanup day", category: "event" },
    { label: "Earlier start", category: "time" },
    { label: "Later start", category: "time" },
  ];

  async function send(category: string, message: string) {
    setSubmitting(true);
    setError(null);
    try {
      await submitRec({ data: { category, message } });
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border-t border-paper/15 pt-10 pb-2">
        <p className="eyebrow text-blue">THANKS — WE GOT IT.</p>
        <p className="text-sm text-paper/70 mt-2">Nick and Laura read every suggestion.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-paper/15 pt-10 pb-2">
      <p className="eyebrow text-paper/55 mb-4">WHAT SHOULD WE DO NEXT?</p>
      <div className="flex flex-wrap gap-2.5 mb-4">
        {pills.map((p) => (
          <button
            key={p.label}
            disabled={submitting}
            onClick={() => send(p.category, p.label)}
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium uppercase tracking-wide border border-paper/25 text-paper/90 hover:bg-blue hover:text-ink hover:border-blue transition-colors disabled:opacity-40"
          >
            {p.label}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const msg = custom.trim();
          if (!msg) return;
          send("other", msg);
        }}
        className="flex gap-3 flex-wrap items-end"
      >
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="rec-custom" className="eyebrow text-paper/40 block mb-1.5">
            OR WRITE YOUR OWN
          </label>
          <input
            id="rec-custom"
            type="text"
            maxLength={500}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="I wish we had..."
            className="w-full bg-transparent border-0 border-b-2 border-paper/20 text-paper placeholder:text-paper/30 pb-2 pt-1 text-base focus:outline-none focus:border-blue transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !custom.trim()}
          className="btn-primary disabled:opacity-40"
        >
          {submitting ? "Sending..." : "Send idea →"}
        </button>
      </form>
      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-black text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex justify-between gap-10 flex-wrap items-start pb-12 border-b border-paper/15">
          <div>
            <MissionStamp size="md" align="left" className="text-paper" />
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
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
                href="https://www.instagram.com/grytrunclub/"
                target="_blank"
                rel="noopener"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Instagram
              </a>
              <Link
                to="/privacy"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
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
            <p className="text-sm leading-[1.6] text-paper/70 max-w-[340px] mt-3">
              Built for Pittsburgh runners, South Hills parents, former athletes, and anyone trying to get consistent again.
            </p>
          </div>
        </div>
        <RecommendationsBar />
        <div className="flex justify-between gap-4 pt-8 flex-wrap eyebrow text-paper/40">
          <span>© 2026 GRYT Run Club. All rights reserved.</span>
          <span>Built by Laura & Nick Merich.</span>
        </div>
      </div>
    </footer>
  );
}

function Testimonial() {
  const testimonials = [
    {
      quote:
        "Gryt RC is a game changer. I never really considered myself a serious runner, but I’ve found a new enjoyment in it through the run club. Doing hard things together makes everyone better, and it’s something I’d recommend to anyone.",
      name: "Aaron Maize",
      title: "Sr Manager, Retail Sciences & Optimization, DICK’S Sporting Goods",
    },
    {
      quote:
        "GRYT Run Club has been a source of inspiration for me. It keeps me accountable once a week to push myself out of my comfort zone. I love the feeling of being connected to a community of like-minded people doing hard things together.",
      name: "Dr. Michael DiVella",
      title: "Orthopedic surgeon and sports medicine specialist, UPMC Orthopaedic Care, Washington, Pennsylvania",
    },
  ];

  const [index, setIndex] = useState(0);
  const active = testimonials[index];

  const prev = () => setIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <section className="bg-ink text-paper py-14 md:py-16 px-6 sm:px-12 lg:px-24 border-t border-paper/10">
      <div className="max-w-[780px] mx-auto text-center">
        <div className="eyebrow eyebrow-blue mb-6">From the community</div>

        <div className="relative">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-10 text-paper/40 hover:text-blue transition-colors hidden sm:block"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div className="px-2 sm:px-8">
            <div className="relative mb-6">
              <span
                className="display-condensed text-blue text-[clamp(56px,7vw,84px)] leading-none absolute -top-3 left-0 md:-left-4 opacity-25 select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="text-[clamp(20px,2.4vw,28px)] leading-[1.5] font-light text-paper/95 italic">
                {active.quote}
              </blockquote>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="slash mx-auto" />
              <span className="display-condensed text-paper text-[22px]">{active.name}</span>
              <span className="text-[13px] text-paper/60 max-w-[420px] leading-[1.5]">
                {active.title}
              </span>
            </div>
          </div>

          <button
            onClick={next}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-10 text-paper/40 hover:text-blue transition-colors hidden sm:block"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === index ? "bg-blue" : "bg-paper/30 hover:bg-paper/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WeeklyRhythm() {
  const stravaUrl = STRAVA_CLUB;
  const satCal = SAT_CAL_URL;
  const tueCal = TUE_CAL_URL;

  return (
    <section id="rhythm" className="bg-ink text-paper py-20 md:py-28 px-6 sm:px-12 lg:px-24 border-t border-paper/10">
      <div className="max-w-[1180px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-4">Two runs · one crew · one cadence</div>
        <h2 className="display-condensed text-paper text-[clamp(40px,6vw,80px)] leading-[0.95] max-w-[900px]">
          Do hard things. <span className="text-blue">Together.</span>
          <br />
          Twice a week.
        </h2>

        <p className="mt-6 max-w-[760px] text-paper/80 text-lg md:text-xl leading-relaxed">
          One crew. One rhythm. Tuesday and Saturday aren't two events — they're the same standing appointment, twice a week. Same people. Same promise. Show up once and you're halfway. Show up for both and you're in.
        </p>






        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
          {/* TUESDAY — NIGHT SHIFT */}
          <article
            className="relative overflow-hidden border border-paper/15 p-7 md:p-10 flex flex-col"
            style={{
              background:
                "linear-gradient(160deg, #07080d 0%, #0d1220 55%, #111a2e 100%)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(137,207,240,0.18) 1px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1.4px)",
                backgroundSize: "22px 22px, 9px 9px",
                backgroundPosition: "0 0, 4px 7px",
                maskImage:
                  "radial-gradient(ellipse at 85% 10%, #000 0%, transparent 70%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at 85% 10%, #000 0%, transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="absolute top-6 right-6 text-[44px] leading-none select-none"
              style={{ filter: "drop-shadow(0 0 14px rgba(137,207,240,0.45))" }}
            >
              🌙
            </div>

            <div className="relative">
              <div className="eyebrow text-blue mb-3">Tuesday · Night Shift</div>
              <h3 className="display-condensed text-paper text-[clamp(34px,4.6vw,56px)] leading-[0.95]">
                Midweek pulse.
                <br />
                After dark.
              </h3>
              <p className="mt-5 text-paper/75 text-[16px] leading-[1.6] max-w-[460px]">
                The run that keeps the week from getting away from you. Lights on. Reflective gear.
                Same crew, different shift.
              </p>

              <dl className="mt-7 border-t border-paper/15">
                {[
                  ["When", "Tuesdays · 9:00 PM"],
                  ["Meet", "Mt. Lebanon Public Library"],
                  ["Distance", "4 miles · Beadling Loop"],
                  ["Pace", "All paces · no one left behind"],
                  ["Bring", "Light + reflective gear + a friend"],
                  ["After", "TBD — post-run spot"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 py-3 border-b border-paper/12"
                  >
                    <dt className="text-[11px] font-bold tracking-[0.16em] uppercase text-paper/45 shrink-0 basis-[88px]">
                      {k}
                    </dt>
                    <dd className="text-[15px] text-right text-paper/90">{v}</dd>
                  </div>
                ))}
              </dl>

              <div
                className="mt-7 inline-flex items-center gap-2 px-3.5 py-2 border border-blue/40 text-blue text-[11px] font-bold tracking-[0.14em] uppercase"
              >
                Half the cadence · bring a friend
              </div>


              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#join"
                  className="inline-flex items-center px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] bg-blue text-ink hover:bg-paper transition-colors"
                >
                  RSVP Tuesday
                </a>
                <a
                  href={tueCal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
                >
                  Add to Calendar
                </a>
                <a
                  href={STRAVA_EVENT_URL.tue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
                >
                  Strava event →
                </a>
              </div>
            </div>
          </article>

          {/* SATURDAY — GRYT RUN */}
          <article
            className="relative overflow-hidden border border-ink/10 p-7 md:p-10 flex flex-col text-ink"
            style={{
              background:
                "linear-gradient(160deg, #ffe8b8 0%, #ffd28a 35%, #f8b15a 70%, #e88f4a 100%)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-24 -right-24 w-[280px] h-[280px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,210,138,0) 65%)",
              }}
            />
            <div
              aria-hidden
              className="absolute top-6 right-7 text-[44px] leading-none select-none"
            >
              ☀️
            </div>

            <div className="relative">
              <div
                className="eyebrow mb-3"
                style={{ color: "#7a3a0e" }}
              >
                Saturday · GRYT Run
              </div>
              <h3 className="display-condensed text-ink text-[clamp(34px,4.6vw,56px)] leading-[0.95]">
                The weekend
                <br />
                anchor.
              </h3>
              <p className="mt-5 text-ink/80 text-[16px] leading-[1.6] max-w-[460px]">
                7 AM sharp. One hour. The big effort. The crew. Home before the day gets away from
                you.
              </p>

              <dl className="mt-7 border-t border-ink/20">
                {[
                  ["When", "Saturdays · 7:00 AM"],
                  ["Meet", "212 Valley Brook Rd, McMurray"],
                  ["Distance", "~4 miles out & back"],
                  ["Pace", "All paces · all parents welcome"],
                  ["Hosts", "Nick & Laura Merich"],
                  ["After", "Coffee in the lot"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 py-3 border-b border-ink/15"
                  >
                    <dt className="text-[11px] font-bold tracking-[0.16em] uppercase text-ink/55 shrink-0 basis-[88px]">
                      {k}
                    </dt>
                    <dd className="text-[15px] text-right text-ink/90 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 inline-flex items-center gap-2 px-3.5 py-2 border border-ink/40 text-ink text-[11px] font-bold tracking-[0.14em] uppercase">
                The other half · close the loop
              </div>


              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#join"
                  className="inline-flex items-center px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] bg-ink text-paper hover:bg-[#3a7ca5] transition-colors"
                >
                  RSVP Saturday
                </a>
                <a
                  href={satCal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] border border-ink/50 text-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  Add to Calendar
                </a>
                <a
                  href={STRAVA_EVENT_URL.sat}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] border border-ink/50 text-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  Strava event →
                </a>
              </div>
            </div>
          </article>
        </div>

        {/* Pull quote */}
        <figure className="mt-14 md:mt-16 max-w-[820px] mx-auto text-center">
          <blockquote className="display-condensed text-paper text-[clamp(24px,3.2vw,40px)] leading-[1.1]">
            <span className="text-blue">"</span>
            Tuesday made me a runner again. Saturday made me part of something. Together they made
            me consistent.
            <span className="text-blue">"</span>
          </blockquote>
          <figcaption className="mt-5 eyebrow text-paper/55">
            — GRYT regular · two runs a week
          </figcaption>
        </figure>

        {/* Primary CTA — one "RSVP for both" with day buttons */}
        <div className="mt-12 md:mt-14 flex flex-col items-center text-center gap-5">
          <div className="eyebrow eyebrow-blue">Lock in this week</div>
          <p className="display-condensed text-paper text-[clamp(22px,2.6vw,32px)] leading-[1.15] max-w-[720px]">
            One crew. One cadence.
            <br />
            <span className="text-blue">RSVP for both.</span>
          </p>

          {/* Primary action */}
          <a
            href="#join"
            className="inline-flex items-center px-9 py-5 text-[13px] font-bold uppercase tracking-[0.16em] bg-blue text-ink hover:bg-paper transition-colors"
          >
            RSVP for both runs →
          </a>

          {/* Day-specific options underneath */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="eyebrow text-paper/55">Or pick a day</div>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="#join"
                className="inline-flex items-center px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
              >
                Tuesday · 9:00 PM
              </a>
              <a
                href="#join"
                className="inline-flex items-center px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
              >
                Saturday · 7:00 AM
              </a>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center mt-1">
              <a
                href={STRAVA_EVENT_URL.tue}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-paper/70 hover:text-blue underline underline-offset-4"
              >
                Tuesday on Strava →
              </a>
              <a
                href={STRAVA_EVENT_URL.sat}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-paper/70 hover:text-blue underline underline-offset-4"
              >
                Saturday on Strava →
              </a>
            </div>
          </div>

          <p className="mt-2 text-paper/55 text-[13px] tracking-[0.04em] max-w-[520px]">
            Both runs on your calendar before you can talk yourself out of it.
          </p>
        </div>



      </div>
    </section>
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
      <WeeklyRhythm />
      <WhoItsFor />
      <MemberNamesMarquee />
      <FirstTimer />
      <TheRun />
      <Founders />
      <Testimonial />
      <Community />
      <Beliefs />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
