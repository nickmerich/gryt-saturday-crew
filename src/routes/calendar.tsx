import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { nyNow } from "@/lib/run-schedule";

const SAT = { day: 6, time: "7:00 AM", label: "Saturday Long Run", short: "SAT 7 AM" };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const escIcs = (s: string) =>
  s.replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");

function icsForMonth(year: number, month: number) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GRYT Run Club//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "BEGIN:STANDARD",
    "DTSTART:20071104T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:20070311T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];
  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const run = date.getDay() === SAT.day ? SAT : null;
    if (!run) continue;
    const ymd = `${year}${pad(month + 1)}${pad(d)}`;
    const start = "070000";
    const end = "080000";
    lines.push(
      "BEGIN:VEVENT",
      `UID:gryt-${ymd}-${start}@grytrunclub.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${ymd}T${start}`,
      `DTEND;TZID=America/New_York:${ymd}T${end}`,
      `SUMMARY:${escIcs(`GRYT ${run.label}`)}`,
      `LOCATION:${escIcs("212 Valley Brook Rd, McMurray, PA 15317")}`,
      `DESCRIPTION:${escIcs("All paces. Nobody gets dropped. https://grytrunclub.com")}`,
      "URL:https://grytrunclub.com",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
}

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Run Calendar · Saturdays 7 AM | GRYT Run Club" },
      {
        name: "description",
        content:
          "Every GRYT Run Club run, month by month. Saturday long runs at 7 AM in McMurray, PA. Free, all paces, add it to your calendar.",
      },
      {
        property: "og:title",
        content: "Run Calendar · Saturdays 7 AM | GRYT Run Club",
      },
      {
        property: "og:description",
        content:
          "The full monthly schedule for GRYT Run Club in the South Hills — Saturday 7 AM long runs.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grytrunclub.com/calendar" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/calendar" }],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const today = nyNow();
  const [cursor, setCursor] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  });

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: ({ d: number; run: typeof SAT | null; isToday: boolean } | null)[] = [];
    for (let i = 0; i < first; i++) out.push(null);
    for (let d = 1; d <= days; d++) {
      const dow = new Date(cursor.y, cursor.m, d).getDay();
      out.push({
        d,
        run: dow === SAT.day ? SAT : null,
        isToday:
          d === today.getDate() &&
          cursor.m === today.getMonth() &&
          cursor.y === today.getFullYear(),
      });
    }
    return out;
  }, [cursor, today]);

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <>
      <SiteNav />
      <main id="main-content">
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-24">
          <div className="eyebrow text-blue mb-4">EVERY WEEK · ALL PACES · FREE</div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.92] tracking-tight"
            style={{ fontFamily: "var(--font-display-condensed)" }}
          >
            Run Calendar
          </h1>
          <p className="mt-5 max-w-xl text-paper/70 leading-relaxed">
            One run a week, same spot, no signup. Saturday mornings we go long.
            Show up once and you're one of us.
          </p>

          <section className="calendar-intro mt-8 max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl uppercase mb-3"
              style={{ fontFamily: "var(--font-display-condensed)" }}
            >
              Upcoming South Hills Run Events
            </h2>
            <p className="text-paper/70 leading-relaxed">
              Browse all scheduled group runs, races, and community meetups for South Hills Run Club. Every Saturday morning GRYT gathers at 212 Valley Brook Rd in McMurray, PA for a long run on the Montour Trail and Peters Township trail system. All paces are welcome — nobody gets dropped, nobody runs alone. Events are updated weekly, so check back often or{" "}
              <Link to="/faq" className="text-blue underline underline-offset-4 hover:text-paper transition-colors">
                read the FAQ
              </Link>{" "}
              to learn what to expect at your first run.
            </p>
          </section>

          <div className="mt-8">
            <div className="border border-blue/50 p-5">
              <div className="eyebrow text-blue mb-2">{SAT.short}</div>
              <div
                className="text-2xl uppercase"
                style={{ fontFamily: "var(--font-display-condensed)" }}
              >
                {SAT.label}
              </div>
              <p className="mt-2 text-sm text-paper/65">
                212 Valley Brook Rd, McMurray · Montour / Peters Trail · coffee in the lot after.
              </p>
              <p className="mt-2 text-sm text-paper/65">
                Distance varies by the group — typically 6–14 miles depending on who shows up and what everyone is training for. Bring water, wear layers in cooler months, and plan for a post-run chat in the parking lot. It's the best part.
              </p>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between gap-4 border-b border-paper/15 pb-4">
            <button
              onClick={() => shift(-1)}
              className="eyebrow border border-paper/25 px-4 py-2 hover:bg-blue hover:text-ink hover:border-blue transition-colors"
            >
              ← Prev
            </button>
            <div
              className="text-3xl sm:text-4xl uppercase"
              style={{ fontFamily: "var(--font-display-condensed)" }}
            >
              {MONTHS[cursor.m]} {cursor.y}
            </div>
            <button
              onClick={() => shift(1)}
              className="eyebrow border border-paper/25 px-4 py-2 hover:bg-blue hover:text-ink hover:border-blue transition-colors"
            >
              Next →
            </button>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-px bg-paper/15 border border-paper/15">
            {DOW.map((d, i) => (
              <div
                key={i}
                className="bg-ink py-2 text-center eyebrow text-paper/45"
              >
                {d}
              </div>
            ))}
            {cells.map((cell, i) => (
              <div
                key={i}
                className={`bg-ink min-h-[86px] sm:min-h-[104px] p-2 ${
                  cell?.run ? "" : "opacity-70"
                }`}
              >
                {cell && (
                  <>
                    <div
                      className={`text-sm ${
                        cell.isToday
                          ? "inline-flex h-6 w-6 items-center justify-center bg-blue text-ink font-bold"
                          : "text-paper/55"
                      }`}
                    >
                      {cell.d}
                    </div>
                    {cell.run && (
                      <div
                        className={`mt-2 px-1.5 py-1 text-[11px] uppercase tracking-[0.08em] leading-tight ${
                          cell.run === SAT
                            ? "bg-blue text-ink font-bold"
                            : "border border-paper/35 text-paper/85"
                        }`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {cell.run.time}
                        <span className="block opacity-80">Long run</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={icsForMonth(cursor.y, cursor.m)}
              download={`gryt-${cursor.y}-${pad(cursor.m + 1)}.ics`}
              className="bg-blue text-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-paper transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Add {MONTHS[cursor.m]} to your calendar
            </a>
            <Link
              to="/faq"
              className="border border-paper/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-paper hover:text-ink transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              First time? Read this
            </Link>
          </div>

          <section className="mt-16 max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl uppercase mb-6"
              style={{ fontFamily: "var(--font-display-condensed)" }}
            >
              Run Day FAQ
            </h2>
            <div className="space-y-6 text-paper/70 leading-relaxed">
              <div>
                <h3 className="text-paper font-bold uppercase tracking-wide text-sm mb-1">Do I need to register?</h3>
                <p>No registration, no fees, no forms. Just show up at 212 Valley Brook Rd, McMurray, PA 15317 by 7:00 AM on Saturday. Introductions happen in the parking lot before the group heads out.</p>
              </div>
              <div>
                <h3 className="text-paper font-bold uppercase tracking-wide text-sm mb-1">What pace is this run?</h3>
                <p>All paces are welcome. The group naturally spreads out over the first mile and nobody gets left behind. Whether you're training for your first 5K or your tenth marathon, you'll find people running your speed.</p>
              </div>
              <div>
                <h3 className="text-paper font-bold uppercase tracking-wide text-sm mb-1">What should I bring?</h3>
                <p>Water or a hydration vest for longer distances, weather-appropriate layers, and a good attitude. There are no aid stations on the trail, so carry what you need. In summer, sunscreen and extra water are a must. In winter, dress in moisture-wicking base layers and plan for wind on exposed trail sections.</p>
              </div>
              <div>
                <h3 className="text-paper font-bold uppercase tracking-wide text-sm mb-1">How far do we run?</h3>
                <p>Distance varies week to week based on who shows up and what people are training for — typically anywhere from 6 to 14 miles. If you have a target distance, mention it at the start and you'll find a group that matches. The Montour Trail out-and-back format makes it easy to turn around at any point.</p>
              </div>
              <div>
                <h3 className="text-paper font-bold uppercase tracking-wide text-sm mb-1">Is the run cancelled in bad weather?</h3>
                <p>GRYT runs in rain, cold, and most conditions short of dangerous ice or lightning. Check the club's social channels if you're unsure — cancellations are rare but announced there first. When in doubt, show up; someone will likely be there.</p>
              </div>
              <div>
                <h3 className="text-paper font-bold uppercase tracking-wide text-sm mb-1">What happens after the run?</h3>
                <p>Coffee in the parking lot. It's informal and optional, but it's where the community actually happens. Runners swap training tips, talk races, and generally decompress after the effort. Stick around if you can.</p>
              </div>
            </div>
          </section>

          <section className="mt-16 border border-blue/40 p-6 sm:p-8 max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl uppercase mb-3"
              style={{ fontFamily: "var(--font-display-condensed)" }}
            >
              Join the Club
            </h2>
            <p className="text-paper/70 leading-relaxed mb-4">
              GRYT Run Club is free, open, and community-run. There are no dues, no tryouts, and no pace requirements. If you're in the South Hills of Pittsburgh and want a consistent group to run with, this is it. We show up every Saturday regardless of weather, season, or how hard the week was.
            </p>
            <p className="text-paper/70 leading-relaxed mb-6">
              Have an event, race, or group run you'd like to add to the community calendar? Reach out — we're happy to spread the word about local running events across the South Hills, Peters Township, and greater Pittsburgh area.
            </p>
            <Link
              to="/faq"
              className="inline-block bg-blue text-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-paper transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Learn more about GRYT
            </Link>
          </section>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
