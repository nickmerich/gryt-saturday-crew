import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/races`;
const TITLE = "Pittsburgh Races 2026-2027: Dates & Training | GRYT";
const DESCRIPTION =
  "Verified dates for Pittsburgh races in 2026-2027: EQT 10 Miler, Thanksgiving 5Ks, the 2027 Pittsburgh Marathon, and more. Pick a goal and train with GRYT.";

type Race = {
  name: string;
  /** Display date, verified against the official race site. */
  date: string;
  /** Race day (YYYY-MM-DD) used for countdowns and schema. */
  iso: string;
  distance: string;
  location: string;
  url: string;
  blurb: string;
  tier: "signature" | "local" | "trail";
  guide?: string;
};

/** Last checked against official race sites on October 20, 2026. */
const VERIFIED = "October 20, 2026";

const RACES: Race[] = [
  {
    name: "EQT Pittsburgh 10 Miler & 10K",
    date: "Sunday, November 8, 2026",
    iso: "2026-11-08",
    distance: "10 Miles · 10K · 10K Walk",
    location: "North Shore, Pittsburgh",
    url: "https://www.pittsburgh10miler.org/",
    blurb:
      "The late-season classic. The 10K starts at 7:30 AM by PNC Park and the 10 Miler at 8:30 AM on West Carson Street by F.N.B. Stadium. A great fall goal if you want something long and honest without a marathon build.",
    tier: "signature",
    guide: "/resources/eqt-pittsburgh-10-miler-2026",
  },
  {
    name: "DICK'S Sporting Goods Pittsburgh Marathon",
    date: "Sunday, May 2, 2027",
    iso: "2027-05-02",
    distance: "Marathon · Half · race-weekend events",
    location: "Downtown Pittsburgh",
    url: "https://www.thepittsburghmarathon.com/",
    blurb:
      "The city's flagship race weekend, April 30 to May 2. The marathon starts at 7:00 AM on Liberty Avenue near 10th Street and finishes by Point State Park. A typical 16 to 18 week marathon plan starts in early January.",
    tier: "signature",
  },
  {
    name: "Richard S. Caliguiri City of Pittsburgh Great Race",
    date: "Weekend of September 25 to 26, 2027",
    iso: "2027-09-26",
    distance: "10K · 5K · 5K Fitness Walk",
    location: "Squirrel Hill to Point State Park",
    url: "https://www.rungreatrace.com/",
    blurb:
      "Pennsylvania's largest 10K and a rite of passage for Pittsburgh runners. The 2026 edition ran September 27 with nearly 10,000 runners and walkers. Fast, net-downhill, and loud.",
    tier: "signature",
  },
  {
    name: "The Gratitude Run",
    date: "Thanksgiving morning, November 26, 2026",
    iso: "2026-11-26",
    distance: "5K · 9:00 AM",
    location: "Peterswood Park, Peters Township",
    url: "https://www.thegratituderun.org/",
    blurb:
      "A Thanksgiving morning 5K at 9:00 AM that supports local families. It starts at Peterswood Park, the same park GRYT meets at every Saturday.",
    tier: "local",
  },
  {
    name: "YMCA of Greater Pittsburgh Turkey Trot",
    date: "Thanksgiving, November 26, 2026",
    iso: "2026-11-26",
    distance: "5 Mile · 5K · Double Gobble · 1 Mile Family Run",
    location: "Pittsburgh",
    url: "https://p3r.org/races/ymca-turkey-trot",
    blurb:
      "The city's big Thanksgiving run, benefiting YMCA food pantry programs and the Greater Pittsburgh Community Food Bank. The 5 Mile starts at 7:30 AM and the 5K at 8:30 AM.",
    tier: "local",
  },
  {
    name: "Just A Short Run",
    date: "Saturday, March 27, 2027",
    iso: "2027-03-27",
    distance: "30K · Half · 8.1 Mile · 5K",
    location: "North Park, Allison Park",
    url: "https://runsignup.com/Race/PA/AllisonPark/JASR",
    blurb:
      "The traditional spring tune-up on hilly North Park roads. Pick the 30K or half if you're building toward the Pittsburgh Marathon in May.",
    tier: "local",
  },
  {
    name: "Rachel Carson Trail Challenge",
    date: "Saturday, June 19, 2027",
    iso: "2027-06-19",
    distance: "37 miles · one-day endurance hike",
    location: "Rachel Carson Trail, north of Pittsburgh",
    url: "https://www.rachelcarsontrails.org/events/challenge",
    blurb:
      "A sunrise-to-sunset push on nearly the entire rugged Rachel Carson Trail, held the Saturday nearest the summer solstice. Not a first race. If you've been consistent for a year and want a story, this is it.",
    tier: "trail",
  },
];

const FAQS = [
  {
    q: "What's the next big Pittsburgh race?",
    a: "The EQT Pittsburgh 10 Miler & 10K is Sunday, November 8, 2026. Thanksgiving morning, November 26, brings the Gratitude Run in Peters Township and the YMCA Turkey Trot in the city. The 2027 DICK'S Sporting Goods Pittsburgh Marathon is Sunday, May 2, 2027.",
  },
  {
    q: "What's a good first race in the South Hills?",
    a: "The Gratitude Run on Thanksgiving morning is a 5K at Peterswood Park, the same park GRYT starts from on Saturdays. If you've been coming on Saturdays, you already know the area.",
  },
  {
    q: "How should I train for the Pittsburgh Marathon?",
    a: "A typical 16 to 18 week plan for the May race starts in early January. Let the Saturday group run anchor your week, and use the pace calculator to set realistic goal paces.",
  },
  {
    q: "Is this list complete?",
    a: "No. We only list races we've checked against the official race site. If your favorite local race is missing, tell us on Saturday or through the suggestion box at the bottom of the page.",
  },
];

/** Training phase advice by weeks remaining. */
function phase(weeks: number): string {
  if (weeks <= 0) return "Race week. Keep Saturday easy.";
  if (weeks < 2) return "Taper time. Run easy, sleep more, trust it.";
  if (weeks < 6) return "Sharpen. Saturday is your long run.";
  if (weeks < 12) return "Build. Add a little each week.";
  return "Plenty of time. Build your base first.";
}

function useToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  return today;
}

function weeksUntil(iso: string, today: Date): number {
  const race = new Date(`${iso}T12:00:00`);
  return Math.floor((race.getTime() - today.getTime()) / (7 * 24 * 3600 * 1000));
}

function isPast(iso: string, today: Date | null): boolean {
  const ref = today ?? new Date();
  return new Date(`${iso}T23:59:59`).getTime() < ref.getTime();
}

export const Route = createFileRoute("/races")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "races pittsburgh, pittsburgh marathon, pittsburgh races 2026, peters township running events, south hills races, gratitude run peters township, thanksgiving 5k pittsburgh, pittsburgh half marathon, great race pittsburgh",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
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
          "@type": "ItemList",
          name: "Upcoming Pittsburgh Races 2026 to 2027",
          itemListElement: RACES.filter((r) => !isPast(r.iso, null)).map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Event",
              name: r.name,
              startDate: r.iso,
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              location: {
                "@type": "Place",
                name: r.location,
                address: { "@type": "PostalAddress", addressLocality: "Pittsburgh", addressRegion: "PA" },
              },
              description: r.blurb,
              url: r.url,
            },
          })),
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
    ],
  }),
  component: RacesPage,
});

function RacesPage() {
  const today = useToday();
  const groups: { title: string; tier: Race["tier"]; sub: string }[] = [
    { title: "Signature Pittsburgh Races", tier: "signature", sub: "The three you circle on the calendar first." },
    { title: "Local & South Hills Races", tier: "local", sub: "Thanksgiving traditions and spring tune-ups." },
    { title: "Trail & Ultra", tier: "trail", sub: "Off-road and all-day options near the city." },
  ];
  const upcoming = RACES.filter((r) => !isPast(r.iso, today)).sort((a, b) => a.iso.localeCompare(b.iso));
  const past = RACES.filter((r) => isPast(r.iso, today));
  const next = upcoming[0];
  const btnGhost =
    "inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors";

  return (
    <main className="bg-ink text-paper">
      <SiteNav />

      <section className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[1080px] mx-auto">
          <p className="eyebrow text-blue mb-5">RACES · PITTSBURGH · 2026 to 2027</p>
          <h1 className="display-condensed uppercase text-[clamp(44px,8vw,112px)] leading-[0.92]">
            Upcoming Pittsburgh<br />Races
          </h1>
          <p className="mt-7 max-w-[720px] text-paper/75 text-lg md:text-xl leading-[1.55]">
            Pick a goal. Then show up Saturday at 7 AM at Peterswood Park and train for it with people
            who'll notice if you don't come back.
          </p>
          <p className="mt-4 text-[12px] tracking-[0.2em] uppercase text-paper/50 font-mono">
            Every date checked against the official race site · {VERIFIED}
          </p>

          {next ? (
            <div className="mt-10 border border-blue bg-blue/[0.07] p-6 md:p-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="eyebrow text-blue mb-2">Next up</p>
                <p className="text-[24px] md:text-[30px] font-bold leading-tight">{next.name}</p>
                <p className="mt-1 text-paper/70">{next.date} · {next.distance}</p>
                {today ? (
                  <p className="mt-3 text-paper/85">{phase(weeksUntil(next.iso, today))}</p>
                ) : null}
              </div>
              {today ? (
                <div className="text-left md:text-right">
                  <p className="display-condensed text-[64px] md:text-[80px] leading-none tabular-nums">
                    {Math.max(0, weeksUntil(next.iso, today))}
                  </p>
                  <p className="eyebrow text-paper/60">weeks out</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              Train with GRYT Saturdays →
            </Link>
            <Link to="/resources/pace-calculator" className={btnGhost}>
              Set your race pace
            </Link>
          </div>
        </div>
      </section>

      {groups.map((g) => {
        const list = upcoming.filter((r) => r.tier === g.tier);
        if (!list.length) return null;
        return (
          <section key={g.tier} className="px-6 sm:px-12 lg:px-24 py-16 md:py-20 border-b border-paper/15">
            <div className="max-w-[1080px] mx-auto">
              <p className="eyebrow text-blue mb-3">{g.sub}</p>
              <h2 className="display-condensed uppercase text-[clamp(28px,4.5vw,56px)] leading-[0.95] mb-10">
                {g.title}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {list.map((r) => {
                  const w = today ? weeksUntil(r.iso, today) : null;
                  return (
                    <article key={r.name} className="flex flex-col border border-paper/20 p-6 md:p-7 hover:border-blue transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <p className="eyebrow text-blue mb-2">{r.date}</p>
                        {w != null ? (
                          <p className="shrink-0 text-[11px] tracking-[0.18em] uppercase font-mono bg-paper/10 px-2 py-1">
                            {w <= 0 ? "This week" : `${w} wk${w === 1 ? "" : "s"} out`}
                          </p>
                        ) : null}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold leading-tight">{r.name}</h3>
                      <p className="mt-2 text-paper/60 text-sm">
                        {r.distance} · {r.location}
                      </p>
                      <p className="mt-4 text-paper/80 text-[15px] leading-[1.6] flex-1">{r.blurb}</p>
                      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue text-sm font-bold uppercase tracking-[0.12em] hover:text-paper transition-colors"
                        >
                          Race site ↗
                        </a>
                        {r.guide ? (
                          <Link
                            to={r.guide as any}
                            className="text-blue text-sm font-bold uppercase tracking-[0.12em] hover:text-paper transition-colors"
                          >
                            Our race guide →
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {past.length ? (
        <section className="px-6 sm:px-12 lg:px-24 py-10 border-b border-paper/15">
          <div className="max-w-[1080px] mx-auto">
            <p className="eyebrow text-paper/55 mb-3">Recently run</p>
            <ul className="flex flex-wrap gap-x-8 gap-y-2 text-paper/70 text-[15px]">
              {past.map((r) => (
                <li key={r.name}>
                  {r.name} · {r.date}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="px-6 sm:px-12 lg:px-24 py-20 border-b border-paper/15">
        <div className="max-w-[820px] mx-auto">
          <h2 className="display-condensed uppercase text-[clamp(28px,4.5vw,56px)] leading-[0.95] mb-10">
            Peters Township & South Hills Running
          </h2>
          <div className="space-y-5 text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>
              Most Pittsburgh race guides forget the South Hills exist. Peters Township, McMurray, Upper
              St. Clair, and Bethel Park are runner-heavy neighborhoods with almost no dedicated race
              coverage.
            </p>
            <p>
              The Montour Trail is the training backbone for anyone south of the tunnels: mostly flat,
              crushed limestone, and well maintained. If you're building toward the Pittsburgh Half or
              Marathon in May, this is where the miles happen.
            </p>
            <p>
              GRYT Run Club runs it every Saturday at 7 AM from the Peterswood Park lot in McMurray. No
              cost, no pace requirement, no one gets dropped. Coffee after.
            </p>
          </div>

          <h2 className="display-condensed uppercase text-[clamp(28px,4.5vw,56px)] leading-[0.95] mt-16 mb-8">
            FAQ
          </h2>
          <div className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <p className="font-bold text-paper">{f.q}</p>
                <p className="mt-2 text-paper/80">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              RSVP This Saturday →
            </Link>
            <Link to="/resources" className={btnGhost}>
              Runner library
            </Link>
          </div>
          <p className="mt-8 text-paper/50 text-sm">
            Dates last checked {VERIFIED}. Race organizers can change details, so confirm on the
            official race site before you register.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
