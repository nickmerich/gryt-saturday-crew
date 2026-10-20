import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { SaturdayInvite } from "@/components/site/GuideShell";
import { getRunReports, lookupMilestones, type MilestoneLookup } from "@/lib/run-reports.functions";
import { MILESTONES, MILESTONE_LINES, MILESTONE_NAMES } from "@/lib/run-reports";
import { RUN_REPORTS_QUERY_KEY, longDate, plural } from "@/components/site/RunReportBits";
import { renderMilestoneGraphic } from "@/components/site/MilestoneGraphic";
import { track } from "@/lib/analytics";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/milestones`;
const TITLE = "The GRYT Milestone Club · 5, 10, 25, 50, 100 Saturdays · gryt run club";
const DESCRIPTION =
  "The GRYT Milestone Club celebrates showing up, not speed. Reach 5, 10, 25, 50, and 100 Saturdays at the free 7 AM run in McMurray. Walking, buddying, and sweeping all count.";

const FAQS = [
  {
    q: "What counts as a Saturday?",
    a: "Any Saturday you were checked in at the lot. Walk it, run it, buddy a first-timer, or sweep the back. It all counts the same.",
  },
  {
    q: "Do I lose a milestone if I miss a week?",
    a: "No. Milestones count every Saturday you've shown up, all time. Miss a month and you pick up right where you left off.",
  },
  {
    q: "My count looks low. Why?",
    a: "Counts start from the first Saturday we checked people in, and only include check-ins under the email or phone you gave. If something's off, tell an organizer on Saturday and we'll fix it.",
  },
  {
    q: "Is my name shown anywhere?",
    a: "Not unless you say yes. Run reports show totals. Your own count is only shown to you, here, after you enter your first name and the email or phone you check in with.",
  },
];

export const Route = createFileRoute("/milestones")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "The GRYT Milestone Club" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE}/og-resources.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
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
  component: MilestonesPage,
});

function MilestonesPage() {
  const fetchReports = useServerFn(getRunReports);
  const { data } = useQuery({
    queryKey: RUN_REPORTS_QUERY_KEY,
    queryFn: () => fetchReports(),
    staleTime: 5 * 60 * 1000,
  });
  const counts = new Map((data?.ok ? data.totals.clubCounts : []).map((c) => [c.milestone, c.members]));
  const trackedSince = data?.ok ? data.totals.trackedSince : null;

  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <section className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[1080px] mx-auto">
          <p className="eyebrow text-blue mb-5">Persistence over pace</p>
          <h1 className="display-condensed uppercase text-[clamp(44px,8vw,112px)] leading-[0.92]">
            The Milestone Club
          </h1>
          <p className="mt-7 max-w-[700px] text-paper/80 text-lg md:text-xl leading-[1.55]">
            At GRYT we celebrate showing up, not speed. Every Saturday you're checked in at the lot
            counts toward your next milestone, whether you walked, ran, buddied a first-timer, or swept
            the back.
          </p>
        </div>
      </section>

      <section aria-labelledby="tiers" className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[1080px] mx-auto">
          <h2 id="tiers" className="sr-only">
            Milestones
          </h2>
          <ol className="grid gap-px bg-paper/20 border border-paper/20 sm:grid-cols-2 lg:grid-cols-5">
            {MILESTONES.map((m) => {
              const members = counts.get(m) ?? 0;
              return (
                <li key={m} className="bg-ink p-6">
                  <p className="display-condensed text-[72px] leading-none">{m}</p>
                  <p className="mt-2 font-bold">{MILESTONE_NAMES[m]}</p>
                  <p className="mt-2 text-[14px] text-paper/70 leading-[1.5]">{MILESTONE_LINES[m]}</p>
                  {members > 0 ? (
                    <p className="mt-4 text-[12px] tracking-[0.16em] uppercase text-blue font-mono">
                      {plural(members, "member", "members")}
                    </p>
                  ) : (
                    <p className="mt-4 text-[12px] tracking-[0.16em] uppercase text-paper/50 font-mono">Be the first</p>
                  )}
                </li>
              );
            })}
          </ol>
          {trackedSince ? (
            <p className="mt-4 text-[13px] text-paper/55">Counted from check-ins since {longDate(trackedSince)}.</p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="lookup-title" className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[820px] mx-auto">
          <Lookup />

          <h2 className="text-2xl md:text-3xl font-bold mt-16 mb-6">Questions</h2>
          <div className="space-y-6 text-paper/85 text-[16px] leading-[1.7]">
            {FAQS.map((f) => (
              <div key={f.q}>
                <p className="font-bold text-paper">{f.q}</p>
                <p className="mt-1.5">{f.a}</p>
              </div>
            ))}
          </div>

          <p className="mt-10">
            <Link to="/runs" className="text-blue underline underline-offset-4 hover:text-paper">
              See this season's run reports →
            </Link>
          </p>
          <SaturdayInvite />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function Lookup() {
  const lookup = useServerFn(lookupMilestones);
  const [firstName, setFirstName] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MilestoneLookup | null>(null);
  const [graphic, setGraphic] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !contact.trim()) return;
    setBusy(true);
    setGraphic(null);
    try {
      const r = await lookup({ data: { firstName, contact } });
      setResult(r);
      track("milestone_lookup", { found: r.found ? 1 : 0 });
    } catch {
      setResult({ found: false, reason: "unavailable" });
    } finally {
      setBusy(false);
    }
  }

  async function makeGraphic() {
    if (!result?.found) return;
    const top = result.earned[result.earned.length - 1] ?? null;
    const url = await renderMilestoneGraphic({
      firstName,
      saturdays: result.saturdays,
      milestone: top,
      next: result.next,
    });
    setGraphic(url);
    track("milestone_graphic", { milestone: top ?? 0 });
  }

  const field =
    "w-full bg-ink border border-paper/30 px-4 py-3.5 text-[16px] placeholder:text-paper/40 focus:outline-none focus:border-blue";

  return (
    <div className="border border-paper/20 bg-vintage p-6 md:p-8">
      <h2 id="lookup-title" className="text-2xl md:text-3xl font-bold">
        Check your Saturdays
      </h2>
      <p className="mt-2 text-paper/75">
        Use the first name and email or phone you check in with. Only you see the result.
      </p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
        <label className="block">
          <span className="block text-[11px] tracking-[0.2em] uppercase text-paper/60 font-mono mb-1.5">First name</span>
          <input
            className={field}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            required
            maxLength={60}
          />
        </label>
        <label className="block">
          <span className="block text-[11px] tracking-[0.2em] uppercase text-paper/60 font-mono mb-1.5">Email or phone</span>
          <input
            className={field}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            autoComplete="email"
            inputMode="email"
            required
            maxLength={160}
          />
        </label>
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60 h-[52px]">
          {busy ? "Checking…" : "Check"}
        </button>
      </form>

      <div aria-live="polite">
        {result && !result.found ? (
          <p className="mt-6 border-l-4 border-blue bg-ink p-4 text-[15px]">
            {result.reason === "bad-contact"
              ? "Enter the email or phone number you use at check-in."
              : result.reason === "unavailable"
                ? "We couldn't reach the check-in records right now. Try again in a bit."
                : "We couldn't find check-ins for that name and contact. Try the other one you might have used, or ask an organizer on Saturday."}
          </p>
        ) : null}

        {result?.found ? (
          <div className="mt-8">
            <p className="display-condensed text-[88px] leading-none tabular-nums">{result.saturdays}</p>
            <p className="eyebrow text-paper/60 mt-1">
              {result.saturdays === 1 ? "Saturday" : "Saturdays"}
              {result.firstSaturday ? ` since ${longDate(result.firstSaturday)}` : ""}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {MILESTONES.map((m) => {
                const earned = result.earned.includes(m);
                return (
                  <span
                    key={m}
                    className={`px-3 py-1.5 text-[13px] border ${earned ? "bg-blue text-ink border-blue font-bold" : "border-paper/25 text-paper/50"}`}
                  >
                    {m}
                  </span>
                );
              })}
            </div>
            <p className="mt-4 text-[17px]">
              {result.next
                ? `${plural(result.toNext, "more Saturday", "more Saturdays")} to ${MILESTONE_NAMES[result.next]}.`
                : "You've reached every milestone. You are the club."}
            </p>
            <button type="button" onClick={makeGraphic} className="btn-primary mt-6">
              Make my milestone graphic
            </button>
            {graphic ? (
              <div className="mt-6">
                <img src={graphic} alt="Your GRYT milestone graphic" className="w-full max-w-[360px] border border-paper/20" />
                <a
                  href={graphic}
                  download={`gryt-milestone-${result.saturdays}.png`}
                  className="mt-3 inline-block text-blue underline underline-offset-4 hover:text-paper"
                >
                  Download PNG (1080 × 1350, Instagram-ready)
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
