import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/races`;
const TITLE = "Pittsburgh Races 2026–27 · Training Guide · gryt run club";
const DESCRIPTION =
  "Upcoming Pittsburgh races — Great Race, EQT 10 Miler, the 2027 Pittsburgh Marathon, Peters Township 5Ks, and South Hills trail runs. Pick your goal and train with GRYT.";

type Race = {
  name: string;
  date: string;
  iso?: string;
  distance: string;
  location: string;
  url?: string;
  blurb: string;
  tier: "signature" | "local" | "trail";
};

const RACES: Race[] = [
  {
    name: "Great Race",
    date: "September 27, 2026",
    iso: "2026-09-27",
    distance: "10K · 5K",
    location: "Squirrel Hill → Point State Park",
    url: "https://www.rungreatrace.com/",
    blurb:
      "One of the largest 10Ks in the country. Net-downhill, fast course, big crowds. A rite of passage for Pittsburgh runners. Four weeks out — the Saturday long run is the whole plan now.",
    tier: "signature",
  },
  {
    name: "EQT Pittsburgh 10 Miler",
    date: "November 2026",
    distance: "10 Miles · 5K",
    location: "North Shore → South Side",
    url: "https://www.pittsburghtenmiler.com/",
    blurb:
      "A late-season classic. Great fall goal race if the marathon isn't your thing but you still want something long and honest. Ten weeks out — start the build now.",
    tier: "signature",
  },
  {
    name: "Pittsburgh Marathon (DICK'S Sporting Goods)",
    date: "May 2027",
    distance: "Marathon · Half · Relay · 5K",
    location: "Downtown Pittsburgh",
    url: "https://www.thepittsburghmarathon.com/",
    blurb:
      "The city's flagship race weekend. Fast half, brutal-but-loved full through every neighborhood. If you pick one Pittsburgh race per year, this is it. Builds start in January.",
    tier: "signature",
  },
  {
    name: "Peters Township Community Day 5K",
    date: "June 2027",
    distance: "5K",
    location: "Peters Township Community Park",
    blurb:
      "A hometown 5K on familiar roads. Good first race, good tune-up, and everyone at GRYT knows the course.",
    tier: "local",
  },
  {
    name: "Just a Short Run",
    date: "March 2027",
    distance: "Half · 15K · 5K · 1M",
    location: "North Park",
    url: "https://elitrunners.com/",
    blurb:
      "Early-season half in North Park. Rolling, honest, and the traditional spring tune-up for anyone building toward Pittsburgh in May.",
    tier: "local",
  },
  {
    name: "Montour Trail Half Marathon",
    date: "Fall 2026",
    distance: "Half Marathon",
    location: "Montour Trail",
    blurb:
      "Flat crushed-limestone half on the same trail GRYT runs every Saturday. The friendliest 13.1 in the South Hills.",
    tier: "trail",
  },
  {
    name: "North Park Trail Runs (Steel City Road Runners)",
    date: "Series · Spring–Fall",
    distance: "5K–15K",
    location: "North Park",
    blurb:
      "Casual trail series. Cheap, low-key, and a great way to dip a toe into off-road racing without committing to an ultra.",
    tier: "trail",
  },
  {
    name: "Rachel Carson Trail Challenge",
    date: "June 2027",
    distance: "34 Miles (point-to-point)",
    location: "Harrison Hills → North Park",
    url: "https://rachelcarsontrails.org/",
    blurb:
      "A sunrise-to-sunset gut check. Not for your first race — but if you've been running consistently for a year and want a story, this is it.",
    tier: "trail",
  },
];

const FAQS = [
  {
    q: "What's the next big Pittsburgh race?",
    a: "The Great Race (10K and 5K) runs September 27, 2026, then the EQT Pittsburgh 10 Miler in November. The next DICK'S Sporting Goods Pittsburgh Marathon weekend lands in early May 2027 — confirm the exact date on the official race site.",
  },
  {
    q: "What's a good first race in Pittsburgh?",
    a: "For a first 5K, the Peters Township Community Day 5K or the Pittsburgh Marathon weekend 5K are both flat and welcoming. For a first half, Just a Short Run in North Park (March) or the Pittsburgh Half in May are the two most popular options.",
  },
  {
    q: "Are there trail races near Pittsburgh?",
    a: "Yes. The Montour Trail Half Marathon, Steel City Road Runners' North Park trail series, and the Rachel Carson Trail Challenge are the main options. North Park and the Montour Trail are the two most-used venues.",
  },
  {
    q: "How should I train for the Pittsburgh Marathon?",
    a: "Most local runners start a 16–18 week build in early January for a May race. Saturday long runs with a group make the plan stick — GRYT meets every Saturday at 7 AM on the Montour Trail in McMurray, free, all paces welcome.",
  },
];

export const Route = createFileRoute("/races")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "races pittsburgh, pittsburgh marathon, pittsburgh races 2026, peters township running events, south hills races, montour trail races, pittsburgh half marathon, great race pittsburgh",
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
          "@type": ["SportsClub", "LocalBusiness"],
          name: "GRYT Run Club",
          url: "https://grytrunclub.com",
          logo: "https://grytrunclub.com/images/gryt-logo.png",
          description:
            "Pittsburgh-based running club offering training plans, group runs, and race guides for the Great Race, EQT 10 Miler, Pittsburgh Marathon, and South Hills trail races.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Pittsburgh",
            addressRegion: "PA",
            addressCountry: "US",
          },
          areaServed: { "@type": "City", name: "Pittsburgh" },
          sameAs: [
            "https://www.instagram.com/grytrunclub",
            "https://www.facebook.com/grytrunclub",
            "https://www.strava.com/clubs/grytrunclub",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: "https://grytrunclub.com/about",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Upcoming Pittsburgh Races 2026–27",
          itemListElement: RACES.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "SportsEvent",
              name: r.name,
              ...(r.iso ? { startDate: r.iso } : {}),
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              location: {
                "@type": "Place",
                name: r.location,
                address: { "@type": "PostalAddress", addressLocality: "Pittsburgh", addressRegion: "PA" },
              },
              description: r.blurb,
              ...(r.url ? { url: r.url } : {}),
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
  const groups: { title: string; tier: Race["tier"]; sub: string }[] = [
    { title: "Signature Pittsburgh Races", tier: "signature", sub: "The three you circle on the calendar first." },
    { title: "Local & South Hills Races", tier: "local", sub: "Peters Township, North Park, and neighborhood classics." },
    { title: "Trail & Ultra", tier: "trail", sub: "Off-road options within an hour of the city." },
  ];

  return (
    <main className="bg-ink text-paper">
      <SiteNav />

      <section className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[1080px] mx-auto">
          <p className="eyebrow text-blue mb-5">RACES · PITTSBURGH · 2026–27</p>
          <h1 className="display-condensed uppercase text-[clamp(44px,8vw,112px)] leading-[0.92]">
            Upcoming Pittsburgh<br />Races 2026–27
          </h1>
          <p className="mt-7 max-w-[720px] text-paper/75 text-lg md:text-xl leading-[1.55]">
            {DESCRIPTION}
          </p>
          <p className="mt-6 max-w-[720px] text-paper/60 text-base leading-[1.6]">
            Pick a goal. Then show up Saturday at 7 AM on the Montour Trail in McMurray and train for it with people who'll notice if you don't come back.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">
              Train with GRYT Saturdays →
            </Link>
            <Link
              to="/resources/playbooks/best-free-running-clubs-pittsburgh-2026"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
            >
              Free Pittsburgh Run Clubs
            </Link>
          </div>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.tier} className="px-6 sm:px-12 lg:px-24 py-16 md:py-20 border-b border-paper/15">
          <div className="max-w-[1080px] mx-auto">
            <p className="eyebrow text-blue mb-3">{g.sub}</p>
            <h2 className="display-condensed uppercase text-[clamp(28px,4.5vw,56px)] leading-[0.95] mb-10">
              {g.title}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {RACES.filter((r) => r.tier === g.tier).map((r) => (
                <article key={r.name} className="border border-paper/20 p-6 md:p-7 hover:border-blue transition-colors">
                  <p className="eyebrow text-blue mb-2">{r.date}</p>
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">{r.name}</h3>
                  <p className="mt-2 text-paper/60 text-sm">
                    {r.distance} · {r.location}
                  </p>
                  <p className="mt-4 text-paper/80 text-[15px] leading-[1.6]">{r.blurb}</p>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-blue text-sm font-bold uppercase tracking-[0.12em] hover:text-paper transition-colors"
                    >
                      Race site ↗
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="px-6 sm:px-12 lg:px-24 py-20 border-b border-paper/15">
        <div className="max-w-[820px] mx-auto">
          <h2 className="display-condensed uppercase text-[clamp(28px,4.5vw,56px)] leading-[0.95] mb-10">
            Peters Township & South Hills Running
          </h2>
          <div className="space-y-5 text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>
              Most Pittsburgh race guides forget the South Hills exist. Peters Township, McMurray, Upper St. Clair, Bethel Park — these are runner-heavy neighborhoods with almost no dedicated race coverage.
            </p>
            <p>
              The Montour / Peters Trail is the training backbone for anyone south of the tunnels. It’s flat, crushed limestone, well-maintained, and it connects all the way from Peters Township toward Coraopolis. If you’re building toward the Pittsburgh Half or Marathon in May, this is where the miles happen.
            </p>
            <p>
              GRYT Run Club runs the trail every Saturday at 7 AM out of McMurray. No cost, no pace requirement, no one gets dropped. Coffee after in the parking lot.
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
            <Link
              to="/resources/playbooks"
              className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
            >
              More Playbooks
            </Link>
          </div>
          <p className="mt-8 text-paper/50 text-sm">
            Race dates are our best current read — always confirm on the official race site before registering.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
