import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { SaturdayInvite } from "@/components/site/GuideShell";
import { ShareButtons } from "@/components/site/ShareButtons";
import { getRunReports } from "@/lib/run-reports.functions";
import { RUN_REPORT_NOTES } from "@/content/run-reports";
import { MILESTONE_LINES, MILESTONE_NAMES } from "@/lib/run-reports";
import { playlistName, spotifyEmbedSrc, spotifyOpenUrl, spotifyPlaylistId } from "@/lib/soundtrack";
import { nyDateKey, occurrenceFor, RUN_LOCATION } from "@/lib/run-schedule";
import {
  RUN_REPORTS_QUERY_KEY,
  StatTile,
  dateForRunNumber,
  longDate,
  plural,
} from "@/components/site/RunReportBits";

const SITE = "https://grytrunclub.com";

export const Route = createFileRoute("/runs_/$number")({
  params: {
    parse: (p) => {
      const n = Number(p.number);
      if (!Number.isInteger(n) || n < 1 || n > 5000) throw notFound();
      return { number: String(n) };
    },
    stringify: (p) => ({ number: p.number }),
  },
  head: ({ params }) => {
    const n = Number(params.number);
    const date = dateForRunNumber(n);
    const note = RUN_REPORT_NOTES[n];
    const title = `GRYT Run #${n} Report · ${longDate(date)} · gryt run club`;
    const description =
      note?.headline ??
      `Who showed up, who was new, and who hit a milestone at GRYT Run #${n}, the free Saturday 7 AM run at Peterswood Park in McMurray.`;
    const url = `${SITE}/runs/${n}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `GRYT Run #${n} Report` },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: note?.photo ?? `${SITE}/og-resources.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `GRYT Run #${n}`,
            startDate: `${date}T07:00:00`,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: RUN_LOCATION.name,
              address: RUN_LOCATION.address,
            },
            organizer: { "@type": "SportsOrganization", name: "gryt run club", url: SITE },
            isAccessibleForFree: true,
            url,
          }),
        },
      ],
    };
  },
  component: RunReportPage,
});

function RunReportPage() {
  const { number } = Route.useParams();
  const n = Number(number);
  const date = dateForRunNumber(n);
  const note = RUN_REPORT_NOTES[n];
  // Upcoming until the run has actually finished (Saturday ~8:30 AM).
  const isFuture = date >= nyDateKey() && occurrenceFor(date).status !== "completed";
  const fetchReports = useServerFn(getRunReports);
  const { data, isPending } = useQuery({
    queryKey: RUN_REPORTS_QUERY_KEY,
    queryFn: () => fetchReports(),
    staleTime: 5 * 60 * 1000,
    enabled: !isFuture,
  });
  const report = data?.reports.find((r) => r.runNumber === n);
  const trackedSince = data?.totals.trackedSince ?? null;
  const url = `${SITE}/runs/${n}`;

  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[900px] mx-auto">
          <Link to="/runs" className="eyebrow text-blue hover:text-paper transition-colors">
            ← All run reports
          </Link>
          <p className="eyebrow text-blue mt-8 mb-4">{longDate(date)} · 7 AM · Peterswood Park</p>
          <h1 className="display-condensed uppercase text-[clamp(52px,10vw,132px)] leading-[0.9]">
            Run #{n}
          </h1>
          {note?.headline ? (
            <p className="mt-6 text-[22px] md:text-[28px] font-bold leading-[1.25] max-w-[720px]">{note.headline}</p>
          ) : null}

          {isFuture ? (
            <div className="mt-10 border border-paper/20 p-6 md:p-8">
              <p className="font-bold text-[20px]">This run hasn't happened yet.</p>
              <p className="mt-2 text-paper/75">The report posts after Saturday. Be in it.</p>
              <p className="mt-4 text-paper/75">
                Add one song when you RSVP and it goes on the {playlistName(n)} playlist in this report.
              </p>
            </div>
          ) : isPending ? (
            <p className="mt-10 text-paper/60" role="status">
              Loading the report…
            </p>
          ) : report ? (
            <>
              <div
                className={`mt-10 grid gap-px bg-paper/20 border border-paper/20 grid-cols-1 ${report.firstTimers != null ? "sm:grid-cols-3" : ""}`}
              >
                <StatTile label="Showed up" value={String(report.runners)} sub="Checked in at the lot" />
                {report.firstTimers != null ? (
                  <StatTile
                    label="First-timers"
                    value={String(report.firstTimers)}
                    sub={report.firstTimers ? "Welcome to the crew" : "Bring one next week"}
                  />
                ) : null}
                {report.returning != null ? (
                  <StatTile label="Came back" value={String(report.returning)} sub="Back for another Saturday" />
                ) : null}
              </div>
              {report.firstTimers == null ? (
                <p className="mt-3 text-[14px] text-paper/60">
                  This was the first Saturday we checked people in, so first-timer and came-back counts start next week.
                </p>
              ) : null}

              {report.milestones.length ? (
                <section aria-labelledby="ms" className="mt-10 border border-blue bg-blue/[0.07] p-6 md:p-8">
                  <h2 id="ms" className="eyebrow text-blue mb-4">
                    Milestone Club
                  </h2>
                  <ul className="space-y-4">
                    {report.milestones.map((m) => (
                      <li key={m.milestone}>
                        <p className="text-[20px] md:text-[24px] font-bold leading-tight">
                          {plural(m.count, "runner", "runners")} joined {MILESTONE_NAMES[m.milestone]}
                        </p>
                        <p className="mt-1 text-paper/75">{MILESTONE_LINES[m.milestone]}</p>
                      </li>
                    ))}
                  </ul>
                  <Link to="/milestones" className="mt-5 inline-block text-blue underline underline-offset-4 hover:text-paper">
                    Check your own Saturdays →
                  </Link>
                </section>
              ) : null}
            </>
          ) : (
            <div className="mt-10 border border-paper/20 p-6 md:p-8">
              <p className="font-bold text-[20px]">No check-ins on file for this run.</p>
              <p className="mt-2 text-paper/75">
                {trackedSince && date < trackedSince
                  ? `Check-ins started ${longDate(trackedSince)}, so earlier runs don't have reports. They still happened. They just weren't counted.`
                  : "Either the run was called off, or check-ins haven't been entered yet. Check back soon."}
              </p>
            </div>
          )}

          {note?.photo ? (
            <figure className="mt-10">
              <img src={note.photo} alt={note.photoAlt ?? `GRYT Run #${n}`} className="w-full h-auto border border-paper/15" loading="lazy" />
            </figure>
          ) : null}

          {note?.weather || note?.story ? (
            <section className="mt-10 text-paper/85 text-[17px] leading-[1.7] space-y-4">
              {note.weather ? (
                <p>
                  <span className="eyebrow text-paper/60 mr-2">Conditions</span>
                  {note.weather}
                </p>
              ) : null}
              {note.story ? <p>{note.story}</p> : null}
            </section>
          ) : null}

          <Soundtrack runNumber={n} soundtrack={note?.soundtrack} />

          {note?.welcomed?.length ? (
            <section className="mt-10">
              <h2 className="eyebrow text-paper/60 mb-3">Welcome to the crew</h2>
              <p className="text-[18px] font-bold">{note.welcomed.join(", ")}</p>
            </section>
          ) : null}

          {note?.shoutouts?.length ? (
            <section className="mt-8">
              <h2 className="eyebrow text-paper/60 mb-3">Thank you</h2>
              <p className="text-[18px] font-bold">{note.shoutouts.join(", ")}</p>
              <p className="mt-1 text-paper/70 text-[15px]">For greeting, buddying, and sweeping so nobody ran alone.</p>
            </section>
          ) : null}

          <nav aria-label="Other runs" className="mt-14 flex justify-between gap-4 text-[13px] tracking-[0.18em] uppercase font-mono">
            {n > 1 ? (
              <Link to="/runs/$number" params={{ number: String(n - 1) }} className="text-blue hover:text-paper">
                ← Run #{n - 1}
              </Link>
            ) : (
              <span />
            )}
            {!isFuture ? (
              <Link to="/runs/$number" params={{ number: String(n + 1) }} className="text-blue hover:text-paper">
                Run #{n + 1} →
              </Link>
            ) : null}
          </nav>

          <SaturdayInvite />
          <div className="mt-10">
            <ShareButtons url={url} title={`GRYT Run #${n} Report`} />
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}

type SoundtrackNote = NonNullable<(typeof RUN_REPORT_NOTES)[number]["soundtrack"]>;

/**
 * The Saturday Soundtrack: the run's playlist, built from songs runners added
 * to their RSVP. Renders nothing until an organizer adds a valid Spotify link.
 */
function Soundtrack({ runNumber, soundtrack }: { runNumber: number; soundtrack?: SoundtrackNote }) {
  const id = spotifyPlaylistId(soundtrack?.spotifyUrl);
  if (!id) return null;
  const credits = soundtrack?.credits ?? [];
  const name = playlistName(runNumber);
  return (
    <section aria-labelledby="soundtrack" className="mt-10 border border-paper/20 p-6 md:p-8">
      <h2 id="soundtrack" className="eyebrow text-blue mb-2">
        The Saturday Soundtrack
      </h2>
      <p className="text-[20px] md:text-[24px] font-bold leading-tight">{name}</p>
      <p className="mt-1 text-paper/75">
        {credits.length
          ? `${credits.length === 1 ? "One song" : `${credits.length} songs`} from the people who RSVP'd. One song each, picked to get out the door.`
          : "Songs from the people who RSVP'd. One song each, picked to get out the door."}
      </p>
      <iframe
        title={`${name} playlist on Spotify`}
        src={spotifyEmbedSrc(id)}
        className="mt-5 w-full border-0 rounded-[12px]"
        height={352}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
      {credits.length ? (
        <ul className="mt-5 divide-y divide-paper/15 border-y border-paper/15">
          {credits.map((c, i) => (
            <li key={`${c.song}-${i}`} className="flex justify-between gap-4 py-2.5 text-[15px]">
              <span className="text-paper/90">{c.song}</span>
              {c.name ? <span className="shrink-0 font-bold">{c.name}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
        <a
          href={spotifyOpenUrl(id)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue underline underline-offset-4 hover:text-paper"
        >
          Open in Spotify
        </a>
        <a href="/#join" className="text-blue underline underline-offset-4 hover:text-paper">
          Add yours to next week's playlist
        </a>
      </div>
    </section>
  );
}
