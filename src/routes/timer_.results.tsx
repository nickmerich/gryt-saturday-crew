import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { decodePayload, formatDuration, type SharedPayload } from "@/lib/timer-share";

export const Route = createFileRoute("/timer_/results")({
  head: () => ({
    meta: [
      { title: "GRYT Timer — Results" },
      { name: "description", content: "Read-only results for a GRYT Run Club timed event." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SharedResultsPage,
});

function SharedResultsPage() {
  const [payload, setPayload] = useState<SharedPayload | null | "loading">("loading");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) {
      setPayload(null);
      return;
    }
    setPayload(decodePayload(hash));
  }, []);

  if (payload === "loading") {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex items-center justify-center">
        <div className="text-foreground/70 text-sm tracking-[0.2em] uppercase">Loading…</div>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="min-h-screen bg-background text-foreground font-body flex items-center justify-center px-6 text-center">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-foreground/70">GRYT · Timer</div>
          <h1 className="font-condensed uppercase text-4xl mt-2">No results found</h1>
          <p className="mt-4 text-foreground/75 max-w-md">
            This link is missing or invalid. Ask the timer to re-share the event link.
          </p>
          <Link
            to="/timer"
            className="mt-8 inline-block px-6 py-3 border border-foreground/30 font-condensed uppercase tracking-widest text-sm hover:border-blue hover:text-foreground/70 transition-colors"
          >
            Open Timer
          </Link>
        </div>
      </main>
    );
  }

  const dateStr = payload.startedAt
    ? new Date(payload.startedAt).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <main className="min-h-screen bg-background text-foreground font-body">
      <header className="border-b border-foreground/10 px-6 sm:px-10 py-6 flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[0.22em] uppercase text-foreground/70">
            GRYT · Results
          </div>
          <h1
            className="font-condensed uppercase text-3xl sm:text-4xl mt-1"
            style={{ letterSpacing: "0.01em" }}
          >
            {payload.title || "Saturday Run"}
          </h1>
          <div className="text-[11px] tracking-[0.18em] uppercase text-foreground/70 mt-1">
            {dateStr}
          </div>
        </div>
        <Link
          to="/"
          className="text-[11px] tracking-[0.22em] uppercase text-foreground/75 hover:text-foreground/70"
        >
          ← gryt.club
        </Link>
      </header>

      <section className="max-w-3xl mx-auto px-6 sm:px-10 py-10">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase text-foreground/70">
              Finishers
            </div>
            <div className="font-condensed uppercase text-2xl mt-1">
              {payload.finishers.length} runners
            </div>
          </div>
          <div className="text-[11px] tracking-[0.22em] uppercase text-foreground/70">
            Read-only
          </div>
        </div>

        <div className="border border-foreground/10">
          <div className="grid grid-cols-[48px_64px_1fr_120px] gap-2 px-4 py-2 bg-background text-[10px] tracking-[0.22em] uppercase text-foreground/70">
            <span>Pl</span>
            <span>Bib</span>
            <span>Name</span>
            <span className="text-right">Time</span>
          </div>
          <ul className="divide-y divide-foreground/10">
            {payload.finishers.length === 0 && (
              <li className="py-10 text-center text-foreground/70 text-sm">
                No finishers recorded.
              </li>
            )}
            {payload.finishers.map((f, i) => (
              <li
                key={i}
                className="grid grid-cols-[48px_64px_1fr_120px] gap-2 items-center px-4 py-3"
              >
                <span className="font-condensed text-lg text-foreground tabular-nums">
                  {i + 1}
                </span>
                <span className="text-foreground/75 tabular-nums text-sm">
                  {f.b || "—"}
                </span>
                <span className="truncate">{f.n}</span>
                <span className="text-right font-condensed tabular-nums text-sm">
                  {formatDuration(f.t)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-[11px] text-foreground/70 leading-relaxed">
          Results snapshot shared from the GRYT event timer. Times were captured
          manually at the finish line.
        </p>
      </section>
    </main>
  );
}
