import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_TITLE, SITE_DESCRIPTION } from "./__root";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { signWaiver } from "@/lib/waiver.functions";
import { clearSignupSession, loadSignupSession } from "@/lib/signup-session.functions";
import { SaturdayWeather } from "@/components/site/SaturdayWeather";
import { MontourRouteMap } from "@/components/site/MontourRouteMap";
import { ClubStats } from "@/components/site/ClubStats";
import { useRegularsLabel } from "@/hooks/useRegularsLabel";

import { submitRecommendation } from "@/lib/recommendations.functions";
import {
  getGoogleReviews,
  type GoogleReviewsPayload,
} from "@/lib/google-reviews.functions";
import { captureAttribution, getSignupAttribution } from "@/lib/attribution";
import { useHeroVariant } from "@/lib/ab-hero";
import { track } from "@/lib/analytics";
import {
  
  nextSaturdayLabel,
  nextSaturdayLabelLong,
  nextSaturdayISOs,
  nextSaturdayIcsDataUrl,
  nextSaturdayIcsFilename,
  SKIPPED_RUN_DATES,
  upcomingRunSaturday,
  upcomingRunLabel,
  getOccurrence,
  upcomingOccurrences,


} from "@/lib/run-schedule";
import pittsburghBridge from "@/assets/pittsburgh-bridge.webp.asset.json";
import photo1 from "@/assets/photos/run-club-1.jpg.asset.json";
import photo2 from "@/assets/photos/run-club-2.jpg.asset.json";
import photo3 from "@/assets/photos/run-club-3.jpg.asset.json";
import photo4 from "@/assets/photos/run-club-4.jpg.asset.json";
import photo5 from "@/assets/photos/run-club-5.jpg.asset.json";
import photo6 from "@/assets/photos/run-club-6.jpg.asset.json";
import photoBridge from "@/assets/photos/run-club-bridge.jpg.asset.json";
import photo7 from "@/assets/photos/run-club-7.jpg.asset.json";
import photo8 from "@/assets/photos/run-club-8.jpg.asset.json";
import nickLauraAsset from "@/assets/photos/nick-laura.jpg.asset.json";
import grytBearAsset from "@/assets/gryt-bear.png.asset.json";
import insuranceAsset from "@/assets/certificate-of-insurance.pdf.asset.json";
import { SupportBlock } from "@/components/SupportBlock";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const heroImgAsset = photo1;
const heroImg = photo4.url;
const circleImg = photo6.url;
const foundersImg = nickLauraAsset.url;

function PhotoColorToggle() {
  const [color, setColor] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("photos-color", color);
    return () => { document.body.classList.remove("photos-color"); };
  }, [color]);
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="eyebrow">Photos</span>
      <div className="inline-flex border border-paper/20">
        <button
          type="button"
          onClick={() => setColor(false)}
          className={`px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] uppercase transition-colors ${!color ? "bg-blue text-ink" : "text-paper/70 hover:text-paper"}`}
        >
          B&W
        </button>
        <button
          type="button"
          onClick={() => setColor(true)}
          className={`px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] uppercase transition-colors ${color ? "bg-blue text-ink" : "text-paper/70 hover:text-paper"}`}
        >
          Color
        </button>
      </div>
    </div>
  );
}

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

import {
  STRAVA_MEMBERS_LABEL,
  INSTAGRAM_LABEL,
} from "@/lib/club-stats";

const SITE_URL = "https://grytrunclub.com";
const ABS_HERO_IMG = heroImg.startsWith("http") ? heroImg : `${SITE_URL}${heroImg}`;

// Computed per request: server clocks can read zero at startup, which froze
// these at Jan 1970 on the live site.
const canonicalOccurrence = () => getOccurrence();
// This calendar Saturday, when the club has called it off (organizer exception).
const skippedThisWeek = () => {
  const soon = upcomingOccurrences(1);
  const first = soon[0];
  return first && first.status === "cancelled" ? first : null;
};



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GRYT Run Club" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: ABS_HERO_IMG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },

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
            "GRYT is a free Pittsburgh running group and South Hills run club for former athletes, busy parents, and comeback runners. Saturdays at 7 AM on the Montour / Peters Trail in McMurray.",
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
          startDate: canonicalOccurrence().startUtc,
          endDate: canonicalOccurrence().endUtc,

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


// Milliseconds until the next Saturday 7:00 AM in America/New_York.
// Uses toLocaleString to translate "now" into NY wall time so DST is handled
// implicitly. Returns 0 during the live window (Sat 7:00–7:59 AM ET).
function msUntilNextSaturday7amET(from: Date = new Date()): number {
  const nyNow = new Date(from.toLocaleString("en-US", { timeZone: "America/New_York" }));
  // Live window only counts on a Saturday the club is actually running.
  const todayKey = `${nyNow.getFullYear()}-${String(nyNow.getMonth() + 1).padStart(2, "0")}-${String(nyNow.getDate()).padStart(2, "0")}`;
  if (nyNow.getDay() === 6 && nyNow.getHours() === 7 && !SKIPPED_RUN_DATES.includes(todayKey)) {
    return 0;
  }
  const sat = upcomingRunSaturday(nyNow);
  const target = new Date(sat);
  target.setHours(7, 0, 0, 0);
  return Math.max(0, target.getTime() - nyNow.getTime());
}


function RunCountdown({ className = "" }: { className?: string }) {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(msUntilNextSaturday7amET());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Reserve height on SSR/first paint to avoid layout shift.
  if (ms === null) {
    return (
      <div className={className} aria-hidden="true" style={{ minHeight: 92 }} />
    );
  }

  const live = ms === 0;
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const label = live
    ? "We're running right now"
    : `UNTIL ${upcomingRunLabel(new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))).toUpperCase()}`;

  return (
    <div
      className={`border border-paper/15 bg-paper/[0.03] px-5 py-4 ${className}`}
      role="timer"
      aria-live="off"
      aria-label={
        live
          ? "The Saturday run is happening now"
          : `Countdown to next Saturday 7 AM: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
      }
    >
      <div className="eyebrow eyebrow-blue mb-2">{label}</div>
      {live ? (
        <div className="display-condensed text-paper text-[clamp(28px,5vw,44px)] leading-none tracking-[0.01em]">
          Live now · trailhead
        </div>
      ) : (
        <div
          className="flex items-end gap-4 sm:gap-6 tabular-nums text-paper"
          style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
        >
          {[
            [days, "DAYS"],
            [hours, "HRS"],
            [minutes, "MIN"],
            [seconds, "SEC"],
          ].map(([n, u]) => (
            <div key={u as string} className="flex flex-col items-start">
              <span className="text-[clamp(28px,5vw,44px)] leading-none font-bold">
                {pad(n as number)}
              </span>
              <span className="text-[10px] tracking-[0.18em] text-paper/50 mt-1">
                {u}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type RsvpDay = "sat";

const DAY_LABEL: Record<RsvpDay, string> = { sat: "Saturday · GRYT Run" };
const DAY_CAL: Record<RsvpDay, string> = { sat: SAT_CAL_URL };
const dayEventLabel = (_d: RsvpDay) => nextSaturdayLabel();

const STRAVA_EVENT =
  "https://www.strava.com/clubs/1708552/group_events/3480014931408029926";
const STRAVA_EVENT_URL: Record<RsvpDay, string> = {
  sat: STRAVA_EVENT,
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
          className="absolute left-[-2px] right-[-2px] -bottom-[0.08em] h-[0.1em] bg-blue"
          style={{ transform: "skewX(-8deg)" }}
          aria-hidden
        />
      </span>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links: Array<[string, string]> = [
    ["#details", "Let's Run"],
    ["#first", "Start Here"],
    ["#community", "Community"],
    ["/resources", "Resources"],
  ];
  return (
    <nav className="sticky top-0 z-50 bg-ink border-b border-paper/15">
      <div className="flex items-center justify-between px-5 sm:px-8 md:px-12 h-[68px]">
        <a href="#top" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <MonogramG className="h-11 w-11" />
          <span className="wordmark uppercase text-[20px] leading-none [text-shadow:2px_2px_0_var(--blue)]">
            Run Club
          </span>
        </a>
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="eyebrow text-paper/80 hover:text-blue transition-colors">
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://www.strava.com/clubs/1708552"
            target="_blank"
            rel="noopener"
            className="bg-blue text-ink px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-paper transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Join on Strava
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex flex-col justify-center items-center w-11 h-11 border border-paper/25 text-paper hover:border-blue hover:text-blue transition-colors"
          >
            <span className={`block h-[2px] w-5 bg-current transition-transform ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`block h-[2px] w-5 bg-current mt-1 transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-[2px] w-5 bg-current mt-1 transition-transform ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-paper/15 bg-ink">
          <div className="flex flex-col px-5 py-3">
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="eyebrow text-paper/85 hover:text-blue transition-colors py-3 border-b border-paper/10 last:border-b-0"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  const regularsLabel = useRegularsLabel();
  const stats: Array<[string, string]> = [
    [regularsLabel, "regulars each Saturday"],
    [STRAVA_MEMBERS_LABEL, "runners on Strava"],
    [INSTAGRAM_LABEL, "followers on Instagram"],
  ];

  // Sticky 50/50 A/B on the hero headline + subcopy. Variant A is the current
  // "You used to have a team" line; variant B leads with the specific
  // Saturday commitment. Falls back to A during SSR and until the hook
  // hydrates so the layout never shifts.
  const variant = useHeroVariant();
  const isB = variant === "b";

  return (
    <section
      id="top"
      data-hero-variant={variant ?? "a"}
      className="relative overflow-hidden text-paper bg-ink py-10 md:py-24 lg:py-28 px-6 sm:px-12 lg:px-24"
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

      <div className="relative max-w-[1240px] mx-auto flex flex-wrap items-center gap-8 lg:gap-16">
        <div className="flex-1 min-w-[300px] basis-[480px]">
          <div className="eyebrow-blue eyebrow mb-4 md:mb-6 flex items-center gap-2.5 flex-wrap">
            <span className="w-2 h-2 bg-blue rounded-full" />
            THE GO-TO SOUTH HILLS PITTSBURGH PARENTS RUN CLUB
          </div>
          <h1 className="display-condensed text-paper text-[clamp(38px,7.2vw,108px)] leading-[0.9] [word-spacing:-0.02em] break-words">
            {isB ? (
              <>
                Do hard things
                <br />
                <span className="relative inline-block">
                  together.
                  <span
                    className="absolute left-[-2px] right-[-2px] -bottom-[0.1em] h-[0.09em] bg-blue"
                    style={{ transform: "skewX(-8deg)" }}
                  />
                </span>
              </>
            ) : (
              <>
                A RUN CLUB FOR BUSY,
                <br />
                <span className="relative inline-block">
                  ATHLETIC PARENTS.
                  <span
                    className="absolute left-[-2px] right-[-2px] -bottom-[0.1em] h-[0.09em] bg-blue"
                    style={{ transform: "skewX(-8deg)" }}
                  />
                </span>

              </>
            )}
          </h1>

          <div className="mt-4 md:mt-7 max-w-[540px] flex flex-col gap-3">
            <p className="text-[15px] md:text-lg leading-[1.5] md:leading-[1.55] text-paper/85">
              {isB
                ? "GRYT is a free Pittsburgh running group and South Hills run club — 7 AM sharp Saturdays on the Montour / Peters Trail in McMurray. Former athletes. Busy parents. Comeback runners. Same trail, same time, every week."
                : "GRYT is a free Pittsburgh running group and South Hills run club for former athletes, busy parents, and comeback runners who miss having a team. We meet every Saturday at 7 AM on the Montour / Peters Trail in McMurray. Come walk, jog, or run and do the hard thing together."}
            </p>
            <p className="text-base md:text-[17px] font-semibold leading-[1.5] text-paper">
              Show up. Do the work. Earn your day.
            </p>
          </div>

          <div className="mt-5 md:mt-7 flex flex-wrap border border-paper/20 max-w-[560px]">
            {stats.map(([n, l], i) => (
              <div
                key={l}
                className={`flex-1 basis-[104px] px-3 py-3 md:px-4 md:py-4 ${
                  i !== stats.length - 1 ? "border-r border-paper/15" : ""
                }`}
              >
                <div className="display-condensed text-blue text-[26px] md:text-[34px] leading-[0.85]">{n}</div>
                <div className="text-[11px] font-semibold tracking-[0.06em] text-paper/70 mt-1.5 uppercase">
                  {l}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 md:mt-6 border-l-2 border-blue pl-3">
            <div className="eyebrow text-blue">Next run</div>
            <p className="text-[15px] md:text-base text-paper mt-1 leading-[1.45]">
              {nextSaturdayLabelLong()} · 212 Valley Brook Road, McMurray (Montour / Peters Trail)
            </p>
          </div>

          <div className="mt-5 md:mt-6 flex flex-wrap gap-3">
            <a href="#join" className="btn-primary">
              RSVP This Saturday →
            </a>
            <a
              href={STRAVA_CLUB}
              target="_blank"
              rel="noopener"
              className="btn-ghost"
            >
              JOIN THE STRAVA
            </a>
          </div>
          <p className="mt-3 text-sm text-paper/80">
            <a
              href="#first"
              className="underline underline-offset-4 decoration-blue hover:text-blue transition-colors"
            >
              First time? Start here
            </a>
            <span className="text-paper/55"> · No membership, no fee, no training plan required.</span>
          </p>
        </div>

        <div className="relative flex-[0_1_400px] min-w-[260px]">
          <div className="absolute left-[18px] top-[18px] -right-[18px] -bottom-[18px] bg-blue" />
          <div className="relative overflow-hidden border border-paper/10">
            <img
              src={heroImgAsset.url}
              alt="GRYT runner at night — motion, grit, and forward momentum"
              className="block w-full h-[300px] md:h-[520px] object-cover"
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
  const regularsLabel = useRegularsLabel();
  const items = [
    "Do hard things together",
    "Real people",
    "Real miles",
    `${regularsLabel} regulars`,
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
  const heroVariant = useHeroVariant();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [source, setSource] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [firstTimer, setFirstTimer] = useState(false);
  const [submittedParty, setSubmittedParty] = useState(1);
  const [submittedFirstTimer, setSubmittedFirstTimer] = useState(false);
  const [days, setDays] = useState<Record<RsvpDay, boolean>>({ sat: true });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedDays, setSubmittedDays] = useState<RsvpDay[]>([]);
  const [waiverOnFile, setWaiverOnFile] = useState(false);


  // Hand the RSVP details to the waiver in memory — no URL parameters.
  const waiverPrefill = useMemo(() => {
    const c = contact.trim();
    const isEmail = /@/.test(c);
    return {
      name: name.trim(),
      email: isEmail ? c.toLowerCase() : "",
      phone: isEmail ? "" : c,
    };
  }, [name, contact]);

  const toggleDay = (d: RsvpDay) => setDays((p) => ({ ...p, [d]: !p[d] }));

  // Allow "RSVP Saturday" buttons elsewhere on the page to deep-link into this form.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      const h = window.location.hash.replace("#", "").toLowerCase();
      if (h === "join-sat" || h === "join-tue" || h === "join-both") {
        setDays({ sat: true });
        document.getElementById("join")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // Restore a completed submission from secure server-side storage. The
  // browser only carries an opaque httpOnly cookie — nothing in the URL.
  useEffect(() => {
    let cancelled = false;
    loadSignupSession()
      .then((session) => {
        if (cancelled || !session || !session.rsvpAt) return;
        setName(session.name ?? "");
        setContact(session.contact ?? "");
        setWaiverOnFile(Boolean(session.waiver));
        // Only show the confirmation when the stored RSVP is for the run that
        // is actually coming up. Otherwise prefill the form so a returning
        // runner can RSVP for this week.
        if (session.eventLabel && session.eventLabel === dayEventLabel("sat")) {
          setSubmittedDays(["sat"]);
          setSubmitted(true);
        }
      })
      .catch(() => {
        // no stored submission — show the form
      });
    return () => {
      cancelled = true;
    };
  }, []);


  const submit = async () => {
    if (!name.trim() || !contact.trim()) {
      setError("Add your name and an email or phone so we can send the reminder.");
      track("rsvp_submit_blocked", {
        reason: "missing_contact",
        hero_variant: heroVariant ?? "unknown",
      });
      return;
    }
    const selected = (Object.keys(days) as RsvpDay[]).filter((d) => days[d]);
    if (selected.length === 0) {
      setError("Confirm Saturday to lock it in.");
      track("rsvp_submit_blocked", {
        reason: "no_day_selected",
        hero_variant: heroVariant ?? "unknown",
      });
      return;
    }
    setError(null);
    setSubmitting(true);
    const contactIsEmail = /@/.test(contact.trim());
    track("rsvp_submit_attempt", {
      hero_variant: heroVariant ?? "unknown",
      days: selected.join(","),
      day_count: selected.length,
      contact_kind: contactIsEmail ? "email" : "phone",
      source: source || "unspecified",
    });
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
              eventLabel: dayEventLabel(d),
              ...(d === "sat"
                ? { eventId: canonicalOccurrence().id, eventVersion: canonicalOccurrence().version }
                : {}),

              heroVariant: heroVariant ?? null,
              partySize,
              firstTimer,
            }),
          }),
        ),
      );
      const failed = results.find((r) => !r.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        setError(data?.error || "Something went wrong. Try again in a moment.");
        track("rsvp_submit_error", {
          hero_variant: heroVariant ?? "unknown",
          status: failed.status,
          reason: "server_error",
        });
        return;
      }
      setSubmittedDays(selected);
      setSubmittedParty(partySize);
      setSubmittedFirstTimer(firstTimer);
      setSubmitted(true);
      track("rsvp_submit_success", {
        hero_variant: heroVariant ?? "unknown",
        days: selected.join(","),
        day_count: selected.length,
        party_size: partySize,
        first_timer: firstTimer,
        contact_kind: contactIsEmail ? "email" : "phone",
        source: source || "unspecified",
      });
      // Also emit a Saturday-only conversion so GA4 goals can key off it.
      let saturdayFired = false;
      if (selected.includes("sat")) {
        track("rsvp_saturday_success", {
          hero_variant: heroVariant ?? "unknown",
        });
        saturdayFired = true;
      }
      // Client-side validation: if the selected day label contains "Saturday"
      // but the conversion event did not fire, warn loudly so the GA4 goal
      // wiring can be fixed. Runs on a microtask so any thrown track() error
      // settles first.
      queueMicrotask(() => {
        const hasSaturday = selected.some((d) =>
          (DAY_LABEL[d] ?? "").toLowerCase().includes("saturday"),
        );
        if (hasSaturday && !saturdayFired) {
          // eslint-disable-next-line no-console
          console.warn(
            "[analytics] rsvp_saturday_success was NOT fired despite a Saturday selection.",
            { selected, hero_variant: heroVariant ?? "unknown" },
          );
          track("rsvp_saturday_missing", {
            hero_variant: heroVariant ?? "unknown",
            days: selected.join(","),
          });
        }
      });
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
      track("rsvp_submit_error", {
        hero_variant: heroVariant ?? "unknown",
        reason: "network_error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="join"
      className="relative overflow-hidden bg-ink text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24 border-b border-paper/10"
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
          {skippedThisWeek() ? (
            <div className="mb-5 border border-brand/60 bg-brand/10 px-4 py-3 text-[15px] leading-[1.5] text-paper">
              <span className="eyebrow eyebrow-blue block mb-1">Run cancelled</span>
              {skippedThisWeek()!.note ?? "This Saturday's run is off."} Next run:{" "}
              {canonicalOccurrence().localDate}, 7:00 AM.
            </div>
          ) : null}

          <h2 className="display-condensed text-paper text-[clamp(38px,5vw,68px)] mb-5">
            RSVP for this Saturday.
          </h2>
          <p className="text-[17px] leading-[1.6] text-paper/80 max-w-[440px] mb-6">
            Tell us you're coming and we'll send one nudge Friday and a wave Saturday morning.
            That's it. No spam, no funnel — just a standing invite to the trailhead.
          </p>
          <RunCountdown className="mb-6 max-w-[440px]" />
          <div id="details" className="scroll-mt-24 border-t-2 border-paper/70 max-w-[440px]">
            {([
              ["When", <>Every Saturday · 7:00 AM<span className="block text-[13px] font-normal text-paper/60 mt-0.5">Next: Saturday, {new Date(canonicalOccurrence().startUtc).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })}</span></>],
              ["Where", <>212 Valley Brook Road, McMurray · <a href="https://www.google.com/maps/dir/?api=1&destination=212%20Valley%20Brook%20Road%2C%20McMurray%2C%20PA" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">Get directions</a></>],
              ["Route", "Montour / Peters Trail · Peters Township & Upper St. Clair"],
              ["Distance", "About 4 miles · out and back"],
              ["Pace", "Walk, jog, run · all welcome"],
              ["Cost", "Free, always"],
              ["After", "Coffee, water, sometimes fruit in the lot"],
              ["First?", "Most people come alone. Show up 10 min early."],
            ] as [string, ReactNode][]).map(([k, v], i, arr) => (
              <div
                key={k}
                className={`flex justify-between gap-5 py-3.5 ${
                  i !== arr.length - 1 ? "border-b border-paper/15" : ""
                }`}
              >
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-blue/80 shrink-0 basis-[78px] pt-1">
                  {k}
                </span>
                <span className="text-[15px] md:text-[16px] font-semibold text-right text-paper/90">
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 max-w-[440px]">
            <a
              href={nextSaturdayIcsDataUrl()}
              download={nextSaturdayIcsFilename()}
              className="inline-flex items-center gap-2 border border-paper/30 hover:border-blue hover:text-blue text-paper text-[12px] font-bold tracking-[0.14em] uppercase px-4 py-2.5 transition-colors"
            >
              ↓ Add to calendar (.ics)
            </a>
            <a
              href={SAT_CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-paper/15 hover:border-paper/40 text-paper/70 hover:text-paper text-[12px] font-bold tracking-[0.14em] uppercase px-4 py-2.5 transition-colors"
            >
              Google Calendar →
            </a>
          </div>
        </div>

        <div className="flex-1 min-w-[300px] basis-[360px] bg-[#f4f2ed] text-ink p-7 md:p-9">
          {!submitted ? (
            <div>
              <div className="display-condensed text-ink text-[26px] mb-5">
                I'm in this week
              </div>
              <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-ink/55 mb-2">
                This week's run
              </label>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-3 border-[1.5px] border-ink bg-white px-3.5 py-3">
                  <span className="w-4 h-4 flex items-center justify-center bg-ink text-paper text-[10px]">✓</span>
                  <span className="text-sm font-semibold text-ink">Saturday · GRYT Run</span>
                  <span className="text-xs text-ink/55 ml-auto">7:00 AM</span>
                </div>
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
                How many coming?
              </label>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPartySize(n)}
                    aria-pressed={partySize === n}
                    className={`flex-1 border-[1.5px] py-3 text-sm font-bold transition-colors ${
                      partySize === n
                        ? "border-ink bg-ink text-paper"
                        : "border-[#cfcabe] bg-white text-ink hover:border-ink"
                    }`}
                  >
                    {n === 5 ? "5+" : n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFirstTimer((v) => !v)}
                aria-pressed={firstTimer}
                className={`w-full flex items-center gap-3 border-[1.5px] px-3.5 py-3 mb-4 text-left transition-colors ${
                  firstTimer ? "border-ink bg-white" : "border-[#cfcabe] bg-white hover:border-ink"
                }`}
              >
                <span
                  className={`w-4 h-4 shrink-0 flex items-center justify-center text-[10px] border-[1.5px] border-ink ${
                    firstTimer ? "bg-ink text-paper" : "bg-white text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="text-sm font-semibold text-ink">
                  First time running with us
                </span>
              </button>
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
            <RSVPConfirmation
              name={name}
              contact={contact}
              days={submittedDays}
              prefill={waiverPrefill}
              waiverOnFile={waiverOnFile}
              partySize={submittedParty}
              firstTimer={submittedFirstTimer}
              onReset={() => {
                void clearSignupSession().catch(() => {});
                setWaiverOnFile(false);
                setSubmitted(false);
                setSubmittedDays([]);
                setName("");
                setContact("");
                setSource("");
                setPartySize(1);
                setFirstTimer(false);


              }}
            />
          )}

        </div>
      </div>
    </section>
  );
}

/** Mask the contact so the confirmation can echo it back without exposing it in full. */
function maskContact(raw: string): string {
  const c = raw.trim();
  if (!c) return "";
  if (c.includes("@")) {
    const [user, domain] = c.split("@");
    const head = user.slice(0, 2);
    return `${head}${"•".repeat(Math.max(user.length - 2, 2))}@${domain}`;
  }
  const digits = c.replace(/\D/g, "");
  return digits.length >= 4 ? `••• ••• ${digits.slice(-4)}` : c;
}

function RSVPConfirmation({
  name,
  contact,
  days,
  prefill,
  waiverOnFile = false,
  partySize = 1,
  firstTimer = false,
  onReset,
}: {
  name: string;
  contact: string;
  days: RsvpDay[];
  prefill?: WaiverPrefill;
  waiverOnFile?: boolean;
  partySize?: number;
  firstTimer?: boolean;
  onReset: () => void;
}) {
  const [waiverSigned, setWaiverSigned] = useState(waiverOnFile);

  const firstName = name.trim().split(/\s+/)[0] || "Runner";
  const masked = maskContact(contact);

  const rows: Array<[string, React.ReactNode]> = [
    ["Runner", name.trim() || "—"],
    ["Contact", masked || "—"],
    ["RSVP", days.map((d) => DAY_LABEL[d]).join(" · ") || "Saturday · GRYT Run"],
    [
      "Heads",
      partySize > 1
        ? `${partySize === 5 ? "5+" : partySize} · you plus ${partySize === 5 ? "4 or more" : partySize - 1}`
        : "Just you",
    ],
    ...(firstTimer
      ? ([["First run", "We'll look for you. Come 10 min early."]] as Array<
          [string, React.ReactNode]
        >)
      : []),
    ["Waiver", waiverSigned ? "Signed · covered through Dec 31, 2026" : "Not signed yet"],
    ["When", nextSaturdayLabelLong()],
    [
      "Where",
      <>
        212 Valley Brook Road, McMurray ·{" "}
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=212%20Valley%20Brook%20Road%2C%20McMurray%2C%20PA"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          Directions
        </a>
      </>,
    ],
  ];

  return (
    <div role="status" aria-live="polite">
      <div className="flex items-center gap-2.5 mb-3.5">
        <span className="w-[34px] h-[34px] bg-blue flex items-center justify-center display-condensed text-ink text-xl">
          ✓
        </span>
        <span className="display-condensed text-ink text-[24px]">
          You're in, {firstName}.
        </span>
      </div>

      <div className="border-[1.5px] border-ink mb-5">
        <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-paper bg-ink px-3.5 py-2">
          Your confirmation
        </div>
        <dl className="divide-y divide-[#d8d4cb]">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-3 px-3.5 py-2.5">
              <dt className="w-[76px] shrink-0 text-[10px] font-bold tracking-[0.14em] uppercase text-ink/55 pt-[3px]">
                {label}
              </dt>
              <dd className="text-[13px] leading-[1.5] text-ink/85">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-y border-[#d8d4cb] py-4 mb-5 flex flex-col gap-3">
        <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink/55">
          Add to your calendar
        </div>
        <div className="flex flex-col gap-2">
          {days.map((d) => (
            <a
              key={d}
              href={DAY_CAL[d]}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between gap-3 border-[1.5px] border-ink px-3.5 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              <span>Add {DAY_LABEL[d]}</span>
              <span className="text-xs tracking-[0.1em] uppercase opacity-70">7:00 AM</span>
            </a>
          ))}
          <a
            href={nextSaturdayIcsDataUrl()}
            download={nextSaturdayIcsFilename()}
            className="flex items-center justify-between gap-3 border border-[#d8d4cb] px-3.5 py-2.5 text-sm font-semibold text-ink hover:border-ink transition-colors"
          >
            <span>Download .ics (Apple, Outlook)</span>
            <span className="text-xs tracking-[0.1em] uppercase opacity-70">One run</span>
          </a>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {days.map((d) => (
            <a
              key={d}
              href={STRAVA_EVENT_URL[d]}
              target="_blank"
              rel="noopener"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/70 hover:text-ink underline underline-offset-4"
            >
              Open Saturday on Strava →
            </a>
          ))}
        </div>
        <div className="text-xs text-ink/55">
          Recurring weekly event — shows up every Saturday.
        </div>
      </div>

      <RSVPWaiverBlock prefill={prefill} onStatusChange={setWaiverSigned} />

      <a
        href={STRAVA_CLUB}
        target="_blank"
        rel="noopener"
        className="text-[13px] font-bold tracking-[0.1em] uppercase py-4 bg-transparent text-ink border-[1.5px] border-ink text-center hover:bg-ink hover:text-paper transition-colors block mt-4"
      >
        Join the Strava club
      </a>
      <button
        onClick={onReset}
        className="mt-4 w-full bg-transparent text-xs font-semibold text-ink/55 underline"
      >
        RSVP someone else
      </button>
      <p className="mt-3 text-[11px] leading-[1.5] text-ink/45 text-center">
        Your details stay on this device and in our private roster — nothing personal is ever put in the web address.
      </p>
    </div>
  );
}


function CorePromise() {
  const stats = [
    {
      stat: "1 IN 5",
      headline: "Feel lonely or isolated most or all of the time.",
      source: "Pew Research Center, 2025",
      sourceUrl:
        "https://www.pewresearch.org/short-reads/2025/03/06/how-many-americans-say-they-are-lonely/",
      sourceDetail:
        "Pew Research Center survey on how often U.S. adults report feeling lonely or isolated (2025).",
    },
    {
      stat: "73%",
      headline: "Say technology contributes to loneliness.",
      source: "Harvard Making Caring Common, 2024",
      sourceUrl: "https://mcc.gse.harvard.edu/reports/on-edge",
      sourceDetail:
        "Harvard Graduate School of Education, Making Caring Common — 'On Edge' report on loneliness and technology (2024).",
    },
    {
      stat: "75%",
      headline: "Say more community events would help.",
      source: "Harvard Making Caring Common, 2024",
      sourceUrl: "https://mcc.gse.harvard.edu/reports/on-edge",
      sourceDetail:
        "Harvard Making Caring Common survey on what Americans say would reduce loneliness (2024).",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-paper py-14 md:py-20">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(137,207,240,0.14) 1.5px, transparent 2px)",
          backgroundSize: "11px 11px",
          maskImage: "radial-gradient(ellipse at 90% 0%, #000, transparent 65%)",
          WebkitMaskImage: "radial-gradient(ellipse at 90% 0%, #000, transparent 65%)",
        }}
      />
      <div className="relative max-w-[1180px] mx-auto px-6 sm:px-12 lg:px-24">
        <div className="eyebrow eyebrow-blue mb-6">The data behind the feeling</div>
        <h2 className="display-condensed text-paper text-[clamp(34px,5.4vw,78px)] leading-[0.95] max-w-[980px] mb-6">
          Loneliness is not a you problem. It is what adult life looks like when everything gets{" "}
          <span className="text-blue">fragmented.</span>
        </h2>
        <p className="text-[17px] leading-[1.6] text-paper/75 max-w-[720px]">
          Most adults are not failing at connection — they are living in a system that makes real
          connection harder to keep. That is why IRL clubs like GRYT matter.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 border-t-2 border-l-2 border-paper/20">
          {stats.map((c) => (
            <article
              key={c.stat}
              className="border-r-2 border-b-2 border-paper/20 p-6 md:p-8 flex flex-col"
            >
              <div className="display-condensed text-blue text-[clamp(40px,5vw,64px)] leading-[0.92] mb-4">
                {c.stat}
              </div>
              <h3 className="display-condensed text-paper text-[18px] md:text-[21px] leading-[1.15] uppercase mb-5">
                {c.headline}
              </h3>
              <a
                href={c.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={c.sourceDetail}
                aria-label={`Source: ${c.source}. ${c.sourceDetail} Opens in a new tab.`}
                className="mt-auto inline-flex items-center gap-1.5 self-start eyebrow text-paper/50 border-b border-paper/20 pb-0.5 hover:text-blue hover:border-blue transition-colors"
              >
                <span>Source · {c.source}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
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
      body: "You miss being around people who get it — the quiet competitiveness, the jokes before the work, and the feeling that nobody needs a speech because everyone already knows why they came. GRYT brings that back without making it complicated.",
    },
    {
      tag: "02 — The early hour",
      title: "You're a parent.",
      body: "You need something that is yours, early enough that the rest of the day still works. Saturday at 7 AM gives you the workout, the headspace, and the reset before most people are fully awake.",
    },
    {
      tag: "03 — The rhythm",
      title: "You're getting consistent again.",
      body: "Maybe you used to run. Maybe you are starting over. Maybe you just need a reason not to bail when the alarm goes off. One Saturday is a run; twelve Saturdays is a rhythm.",
    },
    {
      tag: "04 — The crew",
      title: "You want a real crew.",
      body: "Not another group chat you ignore. Not a networking event disguised as fitness. Just real people who learn your name, notice when you miss, and make the miles go faster.",
    },
  ];

  return (
    <section id="who" className="bone-panel py-14 md:py-20 px-6 sm:px-12 lg:px-24">
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
      className="bg-blue text-ink py-14 md:py-20 px-6 sm:px-12 lg:px-24"
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
        <div className="mt-[2px] border-2 border-t-0 border-ink bg-ink text-paper p-7 md:p-9 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="display-condensed text-paper text-[24px] mb-2.5 uppercase">Sign the waiver before you come.</h3>
            <p className="text-[15px] leading-[1.6] text-paper/75">
              One signature covers every gryt run activity through Dec 31, 2026. Takes about a minute. Do it from your couch so Saturday morning is just showing up.
            </p>
          </div>
          <Link
            to="/waiver"
            className="inline-block text-[13px] font-bold tracking-[0.1em] uppercase px-6 py-4 bg-blue text-ink text-center hover:bg-paper transition-colors whitespace-nowrap"
          >
            Sign the 2026 waiver →
          </Link>
        </div>
        
        <div className="mt-8 border-2 border-ink p-6 md:p-8 max-w-[720px]">
          <p className="text-[15px] leading-[1.6] text-[#13313f]">
            <span className="font-semibold">First time? Come 10 minutes early.</span> Nick, Laura, or one of the regulars will introduce you to someone before we start.
          </p>
        </div>

        <div className="mt-10 border-2 border-ink">
          <div className="border-b-2 border-ink bg-ink px-6 py-3 md:px-8">
            <span className="eyebrow text-paper/80">First-timer questions</span>
          </div>
          <dl className="m-0 grid grid-cols-1 gap-[2px] bg-ink md:grid-cols-3">
            {[
              {
                q: "Where do I park?",
                a: "212 Valley Brook Road in McMurray. Free lot at the trailhead, always room at 7 AM. Look for the group near the trail sign.",
              },
              {
                q: "What happens at mile two?",
                a: "The pack has spread into small groups and you are talking to somebody. Mile two is where it stops feeling like a workout and starts feeling like a Saturday.",
              },
              {
                q: "Is there a required pace?",
                a: "No. Walkers, joggers, and runners all start together and nobody gets dropped. Turn around whenever you want — the route is an out-and-back.",
              },
            ].map((f) => (
              <div key={f.q} className="bg-blue p-6 md:p-7">
                <dt className="display-condensed text-ink text-[20px] mb-2">{f.q}</dt>
                <dd className="m-0 text-[15px] leading-[1.6] text-[#13313f]">{f.a}</dd>
              </div>
            ))}
          </dl>
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

/** RSVP details handed to the waiver in memory only — never via the URL. */
type WaiverPrefill = { name?: string; email?: string; phone?: string };


function RSVPWaiverBlock({
  prefill,
  onStatusChange,
}: {
  prefill?: WaiverPrefill;
  onStatusChange?: (signed: boolean) => void;
}) {
  const [waiver, setWaiver] = useState<{ id: string; signed_on: string; name: string } | null>(null);

  useEffect(() => {
    const stored = readStoredWaiver();
    if (stored) {
      setWaiver(stored);
      onStatusChange?.(true);
    }
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
    <div>
      <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink/55 mb-2">
        Last step · Sign the 2026 waiver
      </div>
      <p className="text-[13px] leading-[1.55] text-ink/70 mb-3">
        We carried your name and contact over — one signature covers you through Dec 31, 2026.
      </p>
      <InlineWaiver
        prefill={prefill}
        autoOpen
        compact
        onSigned={() => onStatusChange?.(true)}
      />

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

function InlineWaiver({
  prefill,
  autoOpen = false,
  compact = false,
  onSigned,
}: {
  prefill?: WaiverPrefill;
  autoOpen?: boolean;
  compact?: boolean;
  onSigned?: () => void;
}) {
  const sign = useServerFn(signWaiver);
  const [open, setOpen] = useState(autoOpen);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<WaiverForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; signed_on: string; name: string } | null>(null);

  useEffect(() => {
    const stored = readStoredWaiver();
    if (stored) {
      setDone(stored);
      onSigned?.();
    }
  }, []);


  // Carry RSVP details straight across in memory — never through the URL.
  useEffect(() => {
    if (!prefill) return;
    setForm((f) => ({
      ...f,
      full_name: f.full_name || (prefill.name ?? ""),
      email: f.email || (prefill.email ?? ""),
      phone: f.phone || (prefill.phone ?? ""),
    }));
  }, [prefill?.name, prefill?.email, prefill?.phone]);

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
      onSigned?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={compact ? "" : "mt-6"} role="status" aria-live="polite">
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
    <div className={`border-2 border-ink bg-ink text-paper ${compact ? "" : "mt-10"}`}>
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

      <div className={compact ? "p-5" : "p-7 md:p-10"}>
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
                activities for promotional purposes, revocable in writing. Runners under 18 are
                welcome: a parent or legal guardian signs the full waiver on their behalf.
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
                    Under 18. A parent or legal guardian signs for them on the{" "}
                    <a href="/waiver" className="underline">
                      full waiver page
                    </a>
                    .
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
      className="bg-ink text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24"
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
            THE ROUTE IS EASY. WAKING UP AND SHOWING UP IS THE HARD PART.
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

function AffiliationList({ name, items }: { name: string; items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const COLLAPSED = 2;
  const showToggle = items.length > COLLAPSED;
  const visible = expanded || !showToggle ? items : items.slice(0, COLLAPSED);

  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLUListElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (!innerRef.current) return;
    const next = innerRef.current.scrollHeight;
    setHeight(next);
    const t = setTimeout(() => setHeight("auto"), 320);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, items.length]);

  return (
    <div>
      <div className="display-condensed text-ink text-[18px] mb-3">{name}</div>
      <div
        ref={wrapRef}
        style={{
          height: height === "auto" ? "auto" : `${height}px`,
          transition: "height 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          overflow: "hidden",
        }}
      >
        <ul ref={innerRef} className="flex flex-wrap gap-1.5">
          {visible.map((b, i) => {
            const isExtra = i >= COLLAPSED;
            return (
              <li
                key={b}
                className={`border border-ink/25 px-2 py-1 text-[10px] sm:text-[11px] leading-tight uppercase tracking-[0.08em] text-ink/80 break-words ${
                  isExtra
                    ? "animate-in fade-in slide-in-from-top-1 duration-300 ease-out fill-mode-both"
                    : ""
                }`}
                style={{
                  fontFamily: "var(--font-body)",
                  animationDelay: isExtra ? `${(i - COLLAPSED) * 60}ms` : undefined,
                }}
              >
                {b}
              </li>
            );
          })}
          {showToggle && (
            <li>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="border border-ink/40 px-2 py-1 text-[10px] sm:text-[11px] leading-tight uppercase tracking-[0.08em] text-ink hover:bg-ink hover:text-paper transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {expanded ? "Show less" : `+${items.length - COLLAPSED} more`}
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}


function Founders() {
  const regularsLabel = useRegularsLabel();
  const stats: Array<[string, string]> = [
    [INSTAGRAM_LABEL, "followers on Instagram"],
    ["2014", "running together since"],
    [regularsLabel, "regulars each Saturday"],
    [STRAVA_MEMBERS_LABEL, "total Strava members"],
  ];

  return (
    <section id="founders" className="bone-panel py-14 md:py-20 px-6 sm:px-12 lg:px-24">
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
              Laura and Nick have run plenty of miles together, but GRYT is not about medals. It
              is about consistency, community, and becoming the kind of person who keeps promises to
              themselves.
            </p>
          </div>

          <div className="mt-10">
            <div className="eyebrow mb-4" style={{ color: "#3a7ca5" }}>
              Where they've shown up
            </div>
            <div className="grid gap-6 sm:grid-cols-2 max-w-[520px]">
              <AffiliationList
                name="Laura"
                items={[
                  "LULULEMON RUN CLUB AMBASSADOR",
                  "NUUN ATHLETE",
                  "DUQUESNE UNIVERSITY SOCCER PLAYER",
                ]}
              />
              <AffiliationList
                name="Nick"
                items={[
                  "FREAK ATHLETE PARTNER",
                  "DAD DAY RUN CLUB LEADER",
                  "POPSITE ATHLETE",
                  "POINT PARK UNIVERSITY BASEBALL PLAYER",
                ]}
              />
            </div>


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
    <section id="community" className="bg-ink text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24">
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

        <PhotoColorToggle />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
          <img
            src={photo2.url}
            alt="Sunny morning crew before heading out"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
          />
          <img
            src={photo3.url}
            alt="Cooling down on the trail after a Saturday run"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
          />
          <img
            src={photoBridge.url}
            alt="The crew running over the bridge on the Montour Trail"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
          />
          <img
            src={photo5.url}
            alt="Three runners heading down the trail at sunrise"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
          />
          <img
            src={photo7.url}
            alt="Crew in the lot before a Saturday run"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
          />
          <img
            src={photo8.url}
            alt="Big crew huddled up after a Saturday run"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
          />
          <img
            src={photo1.url}
            alt="Crew posted up at the trailhead before the Saturday run"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
          />
          <img
            src={photo4.url}
            alt="Runners rolling out on the Montour Trail at first light"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
          />
          <img
            src={photo6.url}
            alt="Post-run coffee and hangs in the lot"
            className="block w-full h-[clamp(160px,22vw,260px)] object-cover border border-paper/15 photo-hover"
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
                {nextSaturdayLabel()}
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
            RSVP This Saturday →
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
    <section id="why" className="bone-panel py-14 md:py-20 px-6 sm:px-12 lg:px-24">
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
    <section id="faq" className="bone-panel py-14 md:py-20 px-6 sm:px-12 lg:px-24">
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
      className="relative overflow-hidden bg-ink text-paper py-16 md:py-24 px-6 sm:px-12 lg:px-24"
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
          STOP WAITING TO FEEL READY. START NOW.
        </h2>
        <p className="text-lg leading-[1.6] text-paper/80 max-w-[580px] mx-auto mb-3.5">
          You do not need to get in better shape first.&nbsp;<br />
          You do not need to know someone.&nbsp;<br />
          You do not need the perfect Saturday.&nbsp;<br />
          You just need to show up.
        </p>
        <p className="display-condensed text-blue text-[clamp(26px,3.6vw,44px)] mb-9">
          Saturday. 7 AM. McMurray.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <a href="/#join" className="btn-primary">
            RSVP This Saturday →
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
              <a
                href="/faq"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                FAQ
              </a>
              <a
                href={insuranceAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Proof of Insurance
              </a>
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
        <div className="border-t border-paper/15 pt-10 pb-2" />

        <RecommendationsBar />
        <div className="flex justify-between gap-4 pt-8 flex-wrap eyebrow text-paper/40">
          <span>© 2026 GRYT Run Club. All rights reserved.</span>
          <span>{"\n"}</span>
        </div>
        <div className="pt-3 eyebrow text-paper/35">
          Designed, written, and shipped by{" "}
          <a
            href="https://nick.pop.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper/60 hover:text-blue underline underline-offset-2 decoration-paper/20 hover:decoration-blue transition-colors"
          >
            NICK & LAURA MERICH
          </a>
          .
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
      photo: "" as string,
    },
    {
      quote:
        "GRYT Run Club has been a source of inspiration for me. It keeps me accountable once a week to push myself out of my comfort zone. I love the feeling of being connected to a community of like-minded people doing hard things together.",
      name: "Dr. Michael DiVella",
      title:
        "Orthopedic surgeon and sports medicine specialist, UPMC Orthopaedic Care, Washington, Pennsylvania",
      photo: "" as string,
    },
  ];

  const initials = (name: string) =>
    name
      .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("");

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = testimonials[index];

  const prev = () =>
    setIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  // Auto-rotate every 7s. Pause on hover/focus and when the user prefers
  // reduced motion or the tab is hidden.
  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const onVisibility = () => {
      if (document.hidden) window.clearInterval(id);
    };
    const id = window.setInterval(() => {
      setIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
    }, 7000);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, testimonials.length]);

  return (
    <section className="bg-ink text-paper py-14 md:py-16 px-6 sm:px-12 lg:px-24 border-t border-paper/10">
      <div
        className="max-w-[780px] mx-auto text-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="eyebrow eyebrow-blue mb-6">From the community</div>

        <div className="relative">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-10 text-paper/40 hover:text-blue transition-colors hidden sm:block"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div
            className="px-2 sm:px-8"
            aria-live="polite"
            aria-atomic="true"
            key={index}
          >
            <div className="relative mb-6 animate-fade-in">
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

            <div className="flex flex-col items-center gap-3 animate-fade-in">
              {active.photo ? (
                <img
                  src={active.photo}
                  alt={active.name}
                  className="w-16 h-16 rounded-full object-cover grayscale border border-paper/20"
                  loading="lazy"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-16 h-16 rounded-full bg-blue text-ink flex items-center justify-center display-condensed text-[22px] tracking-normal border border-paper/10"
                >
                  {initials(active.name)}
                </div>
              )}
              <div className="slash mx-auto" />
              <span className="display-condensed text-paper text-[22px]">{active.name}</span>
              <span className="text-[13px] text-paper/60 max-w-[420px] leading-[1.5]">
                {active.title}
              </span>
            </div>
          </div>

          <button
            type="button"
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
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === index}
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

  return (
    <section id="rhythm" className="bg-ink text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24 border-t border-paper/10">
      <div className="max-w-[1180px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-4">One run · one crew · one cadence</div>
        <h2 className="display-condensed text-paper text-[clamp(40px,6vw,80px)] leading-[0.95] max-w-[900px]">
          Do hard things. <span className="text-blue">Together.</span>
          <br />
          Every Saturday.
        </h2>

        <p className="mt-6 max-w-[760px] text-paper/80 text-lg md:text-xl leading-relaxed">
          One crew. One rhythm. Same standing appointment, every week. Same people. Same promise. Show up once and you're halfway. Show up every week and you're in.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:gap-7">

          <article className="relative overflow-hidden bone-panel border-2 border-ink p-7 md:p-10 flex flex-col text-ink">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-24 opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-20deg, var(--blue) 0 10px, transparent 10px 22px)",
                maskImage: "linear-gradient(to left, black, transparent)",
                WebkitMaskImage: "linear-gradient(to left, black, transparent)",
              }}
            />
            <div aria-hidden className="absolute left-0 top-0 h-1.5 w-full bg-blue" />

            <div className="relative flex flex-col gap-6 sm:gap-8">
              <header className="flex flex-col gap-3 sm:gap-4">
                <div className="eyebrow" style={{ color: "#3a7ca5" }}>
                  Saturday · GRYT Run
                </div>
                <h3 className="display-condensed text-ink text-[clamp(30px,9vw,56px)] leading-[0.95]">
                  TIME TO
                  <br />
                  LOCK IN!
                </h3>
                <p className="text-ink/80 text-[15px] sm:text-[16px] leading-[1.55] sm:leading-[1.6] max-w-[460px]">
                  7 AM sharp. One hour. The big effort. The crew. Home before the day gets away
                  from you.
                </p>
              </header>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="inline-block h-[3px] w-8 bg-blue"
                    style={{ transform: "skewX(-20deg)" }}
                  />
                  <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-ink/70">
                    Meetup pin
                  </span>
                </div>
                <div className="relative">
                  <div aria-hidden className="absolute left-2 top-2 -right-2 -bottom-2 bg-blue" />
                  <div className="relative overflow-hidden border border-ink/30 aspect-[4/3] sm:aspect-[16/10] bg-ink/5">
                    <iframe
                      src="https://maps.google.com/maps?q=212+Valley+Brook+Rd,+McMurray,+PA+15317&z=15&ie=UTF8&iwloc=&output=embed"
                      title="Saturday GRYT Run meetup — 212 Valley Brook Rd, McMurray"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 h-full w-full grayscale contrast-110"
                    />
                    <div className="pointer-events-none absolute left-0 right-0 bottom-0 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gradient-to-t from-black/85 to-transparent">
                      <span className="display-condensed text-paper text-[13px] sm:text-[15px] leading-none">
                        Montour / Peters Trailhead
                      </span>
                      <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-ink bg-blue px-2 py-1 whitespace-nowrap">
                        Sat · 7 AM
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=212%20Valley%20Brook%20Rd%2C%20McMurray%2C%20PA%2015317"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-ink hover:text-[#3a7ca5] transition-colors"
                >
                  <span>Get directions</span>
                  <span aria-hidden>→</span>
                </a>
              </div>

              <dl className="border-t border-ink/20">
                {[
                  ["When", "Saturdays · 7:00 AM"],
                  ["Meet", "212 Valley Brook Rd, McMurray"],
                  ["Distance", "~4 miles out & back"],
                  ["Pace", "All paces · all parents welcome"],
                  ["Hosts", "Nick & Laura Merich"],
                  ["After", "Coffee in the lot"],
                ].map(([k, v]) => (
                  <div
                    key={k as string}
                    className="grid grid-cols-[72px_1fr] sm:grid-cols-[96px_1fr] gap-3 sm:gap-4 py-2.5 sm:py-3 border-b border-ink/15 items-baseline"
                  >
                    <dt className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] sm:tracking-[0.16em] uppercase text-ink/55">
                      {k}
                    </dt>
                    <dd className="text-[14px] sm:text-[15px] leading-[1.4] sm:leading-[1.45] text-ink/90 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[auto_auto_auto] sm:gap-3 sm:justify-start">
                <a
                  href="#join-sat"
                  className="inline-flex items-center justify-center h-11 px-5 text-[12px] font-bold uppercase tracking-[0.12em] bg-ink text-paper hover:bg-[#3a7ca5] transition-colors"
                >
                  RSVP This Saturday →
                </a>
                <a
                  href={satCal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-11 px-5 text-[12px] font-bold uppercase tracking-[0.12em] border border-ink/50 text-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  Add to Calendar
                </a>
                <a
                  href={STRAVA_EVENT_URL.sat}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-11 px-5 text-[12px] font-bold uppercase tracking-[0.12em] border border-ink/50 text-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  Strava event →
                </a>
              </div>
            </div>
          </article>
        </div>






      </div>
    </section>
  );
}

// RFC-5322-lite: local@domain.tld, no whitespace, TLD >= 2 chars.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "trashmail.com",
  "yopmail.com",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "throwawaymail.com",
]);

// Popular domains we can auto-suggest a fix for when the user has an obvious typo.
const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "comcast.net",
  "verizon.net",
  "att.net",
];

// Hard-coded fixes for the most common misspellings — cheaper and more reliable
// than fuzzy-matching for these.
const DOMAIN_TYPO_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.comm": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahho.com": "yahoo.com",
  "yaoo.com": "yahoo.com",
  "hotnail.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hormail.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "iclould.com": "icloud.com",
  "icloud.co": "icloud.com",
  "icould.com": "icloud.com",
};

// Damerau-Levenshtein distance, capped for speed. Used to catch typos we
// didn't hard-code above (e.g. "gmail.cim" → "gmail.com").
function editDistance(a: string, b: string, max = 2): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array(n + 1).fill(0);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    let rowMin = dp[0];
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
      if (dp[j] < rowMin) rowMin = dp[j];
    }
    if (rowMin > max) return max + 1;
  }
  return dp[n];
}

function suggestDomain(domain: string): string | null {
  if (!domain) return null;
  const fixed = DOMAIN_TYPO_FIXES[domain];
  if (fixed) return fixed;
  if (COMMON_DOMAINS.includes(domain)) return null;
  let best: { d: string; dist: number } | null = null;
  for (const candidate of COMMON_DOMAINS) {
    const dist = editDistance(domain, candidate, 2);
    if (dist === 0) return null;
    if (dist <= 2 && (!best || dist < best.dist)) best = { d: candidate, dist };
  }
  return best?.d ?? null;
}

type EmailValidation = { ok: boolean; error?: string; suggestion?: string };

function validateEmail(raw: string): EmailValidation {
  const value = raw.trim();
  if (!value) return { ok: false };
  if (value.length > 255) return { ok: false, error: "Email is too long — try shortening it." };
  if (/\s/.test(value)) return { ok: false, error: "Emails can't contain spaces." };
  const atCount = (value.match(/@/g) || []).length;
  if (atCount === 0) return { ok: false, error: "Missing an @ — try you@email.com." };
  if (atCount > 1) return { ok: false, error: "Only one @ allowed." };
  if (!EMAIL_RE.test(value)) {
    if (!value.includes(".", value.indexOf("@")))
      return { ok: false, error: "Add a domain like gmail.com after the @." };
    return { ok: false, error: "That doesn't look like a valid email." };
  }
  const [local, domain] = value.toLowerCase().split("@");
  if (local.length > 64) return { ok: false, error: "The part before @ is too long." };
  if (local.startsWith(".") || local.endsWith(".") || local.includes(".."))
    return { ok: false, error: "Remove the stray dots before the @." };
  if (!domain.includes(".") || domain.startsWith("-") || domain.endsWith("-"))
    return { ok: false, error: "That domain doesn't look right." };
  const tld = domain.split(".").pop() || "";
  if (tld.length < 2) return { ok: false, error: "The domain ending looks off." };
  if (DISPOSABLE_DOMAINS.has(domain))
    return { ok: false, error: "Please use a permanent email address." };
  const suggestion = suggestDomain(domain);
  if (suggestion) {
    return {
      ok: true,
      suggestion: `${local}@${suggestion}`,
    };
  }
  return { ok: true };
}

const NEWSLETTER_RESEND_UNTIL_KEY = "gryt.newsletter.resendUntil";
const NEWSLETTER_RESEND_EMAIL_KEY = "gryt.newsletter.resendEmail";

// Safe storage wrapper: falls back to an in-memory Map when localStorage
// is unavailable (SSR, private mode, blocked by CSP/quota, disabled cookies).
// Guarantees no throws so UI flows keep working even without persistence.
const memoryStore = new Map<string, string>();
const safeStorage = {
  get(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      /* fall through to memory */
    }
    return memoryStore.has(key) ? (memoryStore.get(key) ?? null) : null;
  },
  set(key: string, value: string): void {
    memoryStore.set(key, value);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      /* memory copy already saved */
    }
  },
  remove(key: string): void {
    memoryStore.delete(key);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  },
};

function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const successResendRegionRef = useRef<HTMLSpanElement | null>(null);
  const errorResendRegionRef = useRef<HTMLSpanElement | null>(null);

  const resendAnnouncement =
    resendStatus === "sending"
      ? "Resending confirmation email."
      : resendStatus === "sent"
      ? resendMsg ?? "Confirmation email sent again. Check your inbox and spam folder."
      : resendStatus === "error"
      ? resendMsg ?? "Couldn't resend confirmation. Try again in a minute."
      : "";

  // When resend resolves (sent or error) the active button is either removed
  // or switches to a disabled cooldown label — move focus to the status
  // region so keyboard users don't get stranded on a hidden/disabled control.
  useEffect(() => {
    if (resendStatus !== "sent" && resendStatus !== "error") return;
    const target = successResendRegionRef.current ?? errorResendRegionRef.current;
    if (target) {
      requestAnimationFrame(() => target.focus());
    }
  }, [resendStatus]);

  useEffect(() => {
    captureAttribution();
    const untilRaw = safeStorage.get(NEWSLETTER_RESEND_UNTIL_KEY);
    const savedEmail = safeStorage.get(NEWSLETTER_RESEND_EMAIL_KEY);
    const until = untilRaw ? parseInt(untilRaw, 10) : 0;
    const remainingMs = until - Date.now();
    if (remainingMs > 0) {
      setResendCooldown(Math.ceil(remainingMs / 1000));
      if (savedEmail) setSubmittedEmail(savedEmail);
    } else if (untilRaw) {
      safeStorage.remove(NEWSLETTER_RESEND_UNTIL_KEY);
      safeStorage.remove(NEWSLETTER_RESEND_EMAIL_KEY);
    }
  }, []);

  // Countdown timer for resend cooldown (throttles repeat clicks).
  useEffect(() => {
    if (resendCooldown <= 0) {
      safeStorage.remove(NEWSLETTER_RESEND_UNTIL_KEY);
      safeStorage.remove(NEWSLETTER_RESEND_EMAIL_KEY);
      return;
    }
    const id = setTimeout(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const validation = useMemo(() => validateEmail(email), [email]);
  const showFieldError = touched && !validation.ok && email.trim().length > 0;
  const showRequestError = status === "error" && !!msg && !showFieldError;
  const errorMessage = showFieldError
    ? validation.error || "Enter a valid email."
    : showRequestError
    ? msg
    : null;
  const suggestion =
    validation.ok && validation.suggestion && touched ? validation.suggestion : null;
  const describedBy = errorMessage
    ? "nl-email-error"
    : suggestion
    ? "nl-email-suggestion"
    : "nl-email-hint";

  async function subscribe(value: string) {
    const attribution = getSignupAttribution("homepage_bar");
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: value,
        source: "homepage_bar",
        ...attribution,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Sign-up failed");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!validation.ok) {
      setStatus("error");
      setMsg(validation.error || "Enter a valid email.");
      requestAnimationFrame(() => emailRef.current?.focus());
      return;
    }
    const value = email.trim();
    setStatus("loading");
    setMsg(null);
    try {
      await subscribe(value);
      setStatus("done");
      setSubmittedEmail(value);
      setEmail("");
      setTouched(false);
      setResendStatus("idle");
      setResendMsg(null);
    } catch (err: any) {
      setStatus("error");
      setSubmittedEmail(value);
      setMsg(err?.message || "Something went wrong.");
      requestAnimationFrame(() => emailRef.current?.focus());
    }
  }

  async function handleResend() {
    if (!submittedEmail || resendCooldown > 0 || resendStatus === "sending") return;
    setResendStatus("sending");
    setResendMsg(null);
    try {
      await subscribe(submittedEmail);
      setResendStatus("sent");
      setResendMsg("Sent again — check your inbox and spam.");
      setResendCooldown(30);
      safeStorage.set(
        NEWSLETTER_RESEND_UNTIL_KEY,
        String(Date.now() + 30 * 1000),
      );
      safeStorage.set(NEWSLETTER_RESEND_EMAIL_KEY, submittedEmail);
    } catch (err: any) {
      setResendStatus("error");
      setResendMsg(err?.message || "Couldn't resend. Try again in a minute.");
    }
  }

  const disableSubmit = status === "loading" || !validation.ok;

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="relative bg-blue text-ink border-y-2 border-ink"
    >
      {/* Screen-reader announcement for resend state transitions */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {resendAnnouncement}
      </div>
      {/* Diagonal stripe accent on the far edges — hidden on mobile so they don't crowd the form */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-12 opacity-70 hidden sm:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-20deg, rgba(0,0,0,0.85) 0 6px, transparent 6px 14px)",
          maskImage: "linear-gradient(to right, black, transparent)",
          WebkitMaskImage: "linear-gradient(to right, black, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 opacity-70 hidden sm:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-20deg, rgba(0,0,0,0.85) 0 6px, transparent 6px 14px)",
          maskImage: "linear-gradient(to left, black, transparent)",
          WebkitMaskImage: "linear-gradient(to left, black, transparent)",
        }}
      />

      <div className="relative max-w-[1180px] mx-auto flex items-center gap-3 sm:gap-6 px-6 sm:px-12 lg:px-24 py-8 sm:py-10 flex-wrap">
        <div className="flex items-center gap-3 shrink-0 basis-full sm:basis-auto">
          <span
            aria-hidden
            className="hidden sm:inline-block h-[3px] w-8 bg-ink"
            style={{ transform: "skewX(-20deg)" }}
          />
          <div className="flex flex-col leading-tight">
            <span
              id="newsletter-heading"
              className="display-condensed text-ink text-[18px] sm:text-[22px] tracking-[0.02em]"
            >
              DO HARD THINGS TOGETHER
            </span>
            <span className="eyebrow text-ink/70 text-[10px] sm:text-[11px] tracking-[0.16em] leading-[1.35]">
              <span className="sm:hidden">BIWEEKLY · RUNS, EVENTS, MERCH</span>
              <span className="hidden sm:inline">
                BIWEEKLY · RUNS, EVENTS, MERCH, PARTNERS, RESOURCES
              </span>
            </span>
          </div>
        </div>

        {status === "done" ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-1 min-w-[240px] items-stretch gap-3 bg-paper border-2 border-ink shadow-[3px_3px_0_var(--ink)] px-3 sm:px-4 py-2.5 animate-fade-in"
          >
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink text-blue"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="square"
                strokeLinejoin="miter"
                className="h-5 w-5"
              >
                <polyline points="4 12 10 18 20 6" />
              </svg>
            </span>
            <div className="flex min-w-0 flex-1 flex-col justify-center leading-tight gap-0.5">
              <span className="display-condensed text-ink text-[15px] sm:text-[17px] tracking-[0.02em]">
                Confirm your email.
              </span>
              <span className="text-[12px] sm:text-[13px] text-ink/75 font-medium">
                We just sent a confirmation link — click it to lock in the biweekly drop.
              </span>
              <span className="text-[11px] sm:text-[12px] text-ink/70 mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                {resendStatus === "sent" ? (
                  <span
                    ref={successResendRegionRef}
                    tabIndex={-1}
                    className="text-ink font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-1"
                  >
                    {resendMsg}
                  </span>
                ) : resendStatus === "error" ? (
                  <>
                    <span
                      ref={errorResendRegionRef}
                      tabIndex={-1}
                      className="text-red-800 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-800/40 focus-visible:ring-offset-1"
                    >
                      {resendMsg}
                    </span>
                    <button
                      type="button"
                      onClick={handleResend}
                      className="underline underline-offset-2 decoration-2 font-bold hover:text-ink"
                    >
                      Try again
                    </button>
                  </>
                ) : (
                  <>
                    <span>Not there in a few minutes?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendStatus === "sending" || resendCooldown > 0}
                      className="underline underline-offset-2 decoration-2 font-bold hover:text-ink disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed inline-flex items-center gap-1"
                    >
                      {resendStatus === "sending" ? (
                        <>
                          <span
                            aria-hidden
                            className="inline-block h-2.5 w-2.5 rounded-full border-2 border-ink border-t-transparent animate-spin"
                          />
                          Resending
                        </>
                      ) : resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        "Resend confirmation"
                      )}
                    </button>
                  </>
                )}
              </span>
            </div>
            <a
              href="https://www.strava.com/clubs/1708552"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex shrink-0 items-center justify-center bg-ink text-blue px-4 text-[12px] font-bold uppercase tracking-[0.14em] hover:bg-blue hover:text-ink hover:shadow-[inset_0_0_0_2px_var(--ink)] transition-all"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Join Strava →
            </a>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            aria-label="Subscribe to the biweekly GRYT email"
            className="flex flex-1 min-w-[240px] items-stretch gap-0 bg-paper border-2 border-ink shadow-[3px_3px_0_var(--ink)]"
          >
            <label htmlFor="nl-email" className="sr-only">Email address</label>
            <input
              ref={emailRef}
              id="nl-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="you@email.com"
              disabled={status === "loading"}
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={describedBy}
              aria-errormessage={errorMessage ? "nl-email-error" : undefined}
              className={`flex-1 min-w-0 bg-transparent border-0 text-ink placeholder:text-ink/40 px-3 sm:px-4 py-2.5 text-sm sm:text-[15px] focus:outline-none focus:bg-blue/10 transition-colors ${
                errorMessage ? "text-red-800" : ""
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            />
            <button
              type="submit"
              disabled={disableSubmit}
              aria-disabled={disableSubmit}
              aria-busy={status === "loading"}
              aria-describedby="nl-status"
              className="bg-ink text-blue px-4 sm:px-5 text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] hover:bg-blue hover:text-ink hover:shadow-[inset_0_0_0_2px_var(--ink)] transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 shrink-0"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              {status === "loading" && (
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full border-2 border-blue border-t-transparent animate-spin"
                />
              )}
              <span>{status === "loading" ? "Sending" : "Subscribe →"}</span>
            </button>
          </form>
        )}
        {status !== "done" && !errorMessage && (
          <p className="basis-full text-[11px] leading-[1.45] text-ink/70 flex flex-wrap items-center gap-x-1.5">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 shrink-0"
            >
              <rect x="4" y="10" width="16" height="10" rx="1" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <span>
              Biweekly. No spam, no sharing. Unsubscribe any time.{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-2 decoration-ink/40 hover:decoration-ink font-medium"
              >
                Privacy
              </Link>
              .
            </span>
          </p>
        )}
        <span id="nl-email-hint" className="sr-only">
          Enter your email to receive the biweekly GRYT email. We only use it to send the newsletter and you can unsubscribe any time.
        </span>
        <p
          id="nl-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {status === "loading" ? "Submitting your email, please wait." : ""}
        </p>
        <p
          id="nl-email-error"
          role="alert"
          aria-live="assertive"
          className={`text-xs font-medium text-ink basis-full flex items-center gap-1.5 ${errorMessage ? "" : "sr-only"}`}
        >
          {errorMessage ? (
            <>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="h-3.5 w-3.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
              {showRequestError && submittedEmail && (
                <>
                  <span aria-hidden className="opacity-40">·</span>
                  {resendStatus === "sent" ? (
                    <span
                      ref={successResendRegionRef}
                      tabIndex={-1}
                      className="text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-1"
                    >
                      {resendMsg}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendStatus === "sending" || resendCooldown > 0}
                      className="underline underline-offset-2 decoration-2 font-bold hover:text-ink/70 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed inline-flex items-center gap-1"
                    >
                      {resendStatus === "sending" ? (
                        <>
                          <span
                            aria-hidden
                            className="inline-block h-2.5 w-2.5 rounded-full border-2 border-ink border-t-transparent animate-spin"
                          />
                          Retrying
                        </>
                      ) : resendCooldown > 0 ? (
                        `Retry in ${resendCooldown}s`
                      ) : (
                        "Resend confirmation"
                      )}
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            ""
          )}
        </p>
        {suggestion && !errorMessage && (
          <p
            id="nl-email-suggestion"
            className="text-xs font-medium text-ink basis-full flex items-center gap-1.5"
          >
            <span className="opacity-75">Did you mean</span>
            <button
              type="button"
              onClick={() => {
                setEmail(suggestion);
                setTouched(false);
                requestAnimationFrame(() => emailRef.current?.focus());
              }}
              className="underline underline-offset-2 decoration-2 hover:text-ink/70 font-bold"
            >
              {suggestion}
            </button>
            <span className="opacity-75">?</span>
          </p>
        )}
      </div>
    </section>
  );
}

function ResourcesBlock() {
  return (
    <section
      id="resources"
      className="grit-panel relative overflow-hidden text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24"
    >
      <span
        aria-hidden="true"
        className="display-condensed pointer-events-none select-none absolute -right-[6%] top-1/2 -translate-y-1/2 text-paper/[0.045] leading-none text-[clamp(180px,34vw,460px)] tracking-[-0.04em]"
      >
        gryt
      </span>
      <div className="relative max-w-[1180px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-4">Runner resources</div>

        <h2 className="display-condensed uppercase text-[clamp(34px,6vw,76px)] leading-[0.94] max-w-[16ch]">
          MAKE RUNNING FUN.
        </h2>
        <p className="mt-6 max-w-[54ch] text-[15px] sm:text-[17px] leading-[1.65] text-paper/75">
          Free tools for the crew. Turn any run into a branded recap graphic in
          under a minute, then post it and pull someone else off the couch.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-[860px]">
          <Link
            to="/resources/recap"
            className="group relative block border-2 border-blue bg-blue text-ink p-6 sm:p-7 hover:bg-paper hover:border-paper transition-colors"
          >
            <div
              className="text-[11px] tracking-[0.22em] uppercase mb-3"
              style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
            >
              Featured tool
            </div>
            <div className="display-condensed uppercase text-[clamp(26px,3.6vw,40px)] leading-[0.98]">
              Recap run generator
            </div>
            <div className="mt-3 text-[14px] leading-[1.6] text-ink/75">
              Connect Strava or Garmin, pick a style, share it.
            </div>
            <div className="mt-6 text-[12px] tracking-[0.22em] uppercase font-bold">
              Open →
            </div>
          </Link>

          <Link
            to="/resources"
            className="group relative block border border-paper/25 bg-ink/60 backdrop-blur-[2px] p-6 sm:p-7 hover:border-blue transition-colors"
          >
            <div
              className="text-[11px] tracking-[0.22em] uppercase mb-3 text-blue"
              style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
            >
              More
            </div>
            <div className="display-condensed uppercase text-[clamp(26px,3.6vw,40px)] leading-[0.98]">
              All resources
            </div>
            <div className="mt-3 text-[14px] leading-[1.6] text-paper/70">
              Route notes, first-timer guides, and crew stories.
            </div>
            <div className="mt-6 text-[12px] tracking-[0.22em] uppercase font-bold text-blue">
              Browse →
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}





function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span aria-label={`${rating.toFixed(1)} out of 5`} className="text-blue tracking-[0.14em]">
      {"★★★★★".slice(0, rounded)}
      <span className="text-paper/25">{"★★★★★".slice(rounded)}</span>
    </span>
  );
}

function GoogleReviewsBlock() {
  const fetchReviews = useServerFn(getGoogleReviews);
  const [data, setData] = useState<GoogleReviewsPayload | null>(null);

  useEffect(() => {
    let active = true;
    fetchReviews()
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        if (active) setData(null);
      });
    return () => {
      active = false;
    };
  }, [fetchReviews]);

  if (!data || !data.configured || data.reviews.length === 0) return null;

  return (
    <section className="bg-ink text-paper border-t border-paper/10">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 py-14 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="eyebrow text-blue">Run reviews · Google</div>
            <h2 className="display-condensed text-[clamp(32px,7vw,64px)] leading-[0.95] mt-2">
              WHAT RUNNERS SAY
            </h2>
          </div>
          {data.rating !== null && (
            <div className="flex items-center gap-3 text-[13px] tracking-[0.14em] uppercase text-paper/70">
              <Stars rating={data.rating} />
              <span className="font-bold text-paper">{data.rating.toFixed(1)}</span>
              <span>· {data.total} reviews</span>
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.reviews.slice(0, 6).map((review, i) => (
            <figure
              key={`${review.author}-${i}`}
              className="border border-paper/15 bg-paper/[0.03] p-6 flex flex-col gap-4"
            >
              <Stars rating={review.rating} />
              <blockquote className="text-[15px] leading-[1.65] text-paper/85">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-auto pt-3 border-t border-paper/10 text-[12px] tracking-[0.14em] uppercase text-paper/60">
                {review.author}
                {review.relativeTime ? ` · ${review.relativeTime}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>

        {data.mapsUrl && (
          <div className="mt-8">
            <a
              href={data.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-13 px-7 py-4 border-2 border-blue text-blue text-[12px] tracking-[0.2em] uppercase font-bold hover:bg-blue hover:text-ink transition"
            >
              Read / leave a review on Google
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function RegionBand() {
  return (
    <section className="relative border-y border-paper/15 bg-ink">
      <figure className="relative m-0">
        <img
          src={pittsburghBridge.url}
          alt="Halftone illustration of a Pittsburgh bridge over the river at sunrise with the downtown skyline"
          loading="lazy"
          className="h-[38vw] max-h-[420px] min-h-[220px] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-blue">
              South Hills · Pittsburgh, PA
            </span>
            <p className="max-w-xl font-condensed text-2xl uppercase leading-[0.95] text-paper sm:text-4xl">
              Built on Pittsburgh roads, hills, and bridges.
            </p>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}

function Landing() {


  return (
    <main className="bg-ink text-paper">
      <Nav />
      <Hero />
      <div className="bg-ink border-b border-paper/10 px-6 py-3.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <span className="eyebrow text-paper/50">Featured in</span>
        {["The 51st", "TribLIVE", "The Founder Exhale"].map((o) => (
          <span key={o} className="display-condensed text-paper text-[17px] uppercase tracking-[0.05em]">{o}</span>
        ))}
        <a href="/press" className="eyebrow text-blue hover:text-paper transition-colors">View all coverage →</a>
      </div>
      <Marquee />
      <GoogleReviewsBlock />
      <RSVP />
      <SaturdayWeather />
      <MontourRouteMap />
      <ClubStats />
      <ResourcesBlock />

      <CorePromise />
      <WeeklyRhythm />
      <WhoItsFor />
      <MemberNamesMarquee />
      <FirstTimer />
      <TheRun />
      <Founders />
      <Testimonial />
      <Community />
      <RegionBand />
      <Beliefs />
      <FAQ />
      <FinalCTA />
      <SupportBlock />
      <PaymentTestModeBanner />
      <NewsletterBar />
      <Footer />
    </main>
  );
}
