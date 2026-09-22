import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { encodePayload, formatDuration } from "@/lib/timer-share";


export const Route = createFileRoute("/timer")({
  head: () => ({
    meta: [
      { title: "GRYT Event Timer" },
      {
        name: "description",
        content:
          "Simple, no-nonsense event timer for GRYT Run Club Saturday runs, start the clock, capture finishes, share results.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TimerPage,
});

// ---------- Types ----------
type Participant = {
  id: string;
  name: string;
  bib?: string;
  finishMs: number | null; // ms elapsed from event start when they crossed
};

// ---------- Helpers ----------



function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ---------- Page ----------
function TimerPage() {
  // Event metadata
  const [eventTitle, setEventTitle] = useState("Saturday Run");
  // Event clock
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (startAt === null) return;
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      setNow(Date.now());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startAt]);

  const elapsedMs = startAt === null ? 0 : now - startAt;

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [bib, setBib] = useState("");

  const addParticipant = () => {
    const n = name.trim();
    if (!n) return;
    setParticipants((prev) => [
      ...prev,
      { id: uid(), name: n, bib: bib.trim() || undefined, finishMs: null },
    ]);
    setName("");
    setBib("");
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const captureFinish = (id: string) => {
    if (startAt === null) return;
    const t = Date.now() - startAt;
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, finishMs: t } : p)),
    );
  };

  const undoFinish = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, finishMs: null } : p)),
    );
  };

  const startEvent = () => {
    if (startAt !== null) return;
    setStartAt(Date.now());
  };

  const resetEvent = () => {
    if (!confirm("Reset the clock and clear all finish times?")) return;
    setStartAt(null);
    setNow(Date.now());
    setParticipants((prev) => prev.map((p) => ({ ...p, finishMs: null })));
  };

  const clearAll = () => {
    if (!confirm("Remove all participants and reset the event?")) return;
    setStartAt(null);
    setNow(Date.now());
    setParticipants([]);
  };

  const results = useMemo(() => {
    const finished = participants
      .filter((p): p is Participant & { finishMs: number } => p.finishMs !== null)
      .sort((a, b) => a.finishMs - b.finishMs);
    return finished;
  }, [participants]);

  const pending = participants.filter((p) => p.finishMs === null);

  const exportCsv = () => {
    const rows = [
      ["place", "bib", "name", "time"],
      ...results.map((p, i) => [
        String(i + 1),
        p.bib ?? "",
        p.name,
        formatDuration(p.finishMs),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c))
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gryt-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildShareUrl = () => {
    const payload = encodePayload({
      v: 1,
      title: eventTitle.trim() || "Saturday Run",
      startedAt: startAt,
      finishers: results.map((p) => ({
        n: p.name,
        b: p.bib,
        t: p.finishMs,
      })),
    });
    return `${window.location.origin}/timer/results#${payload}`;
  };

  const shareResults = async () => {
    if (results.length === 0) return;
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <main className="min-h-screen bg-ink text-paper font-body">
      {/* Header */}
      <header className="border-b border-white/10 px-6 sm:px-10 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-[11px] tracking-[0.22em] uppercase text-white/50 font-body font-normal">
            GRYT · Event Timer
          </h1>
          <input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            aria-label="Event title"
            className="font-condensed uppercase text-3xl sm:text-4xl mt-1 bg-transparent border-b border-transparent hover:border-white/20 focus:border-blue focus:outline-none w-full max-w-md"
            style={{ letterSpacing: "0.01em" }}
          />

        </div>
        <a
          href="/"
          className="text-[11px] tracking-[0.22em] uppercase text-white/60 hover:text-blue"
        >
          ← Back
        </a>
      </header>

      {/* Clock */}
      <section className="px-6 sm:px-10 py-10 border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-3">
            Event Clock
          </div>
          <div
            className="font-condensed text-6xl sm:text-8xl tabular-nums tracking-tight"
            style={{
              color: startAt === null ? "#a8a39d" : "#89cff0",
              textShadow: startAt !== null ? "0 0 30px rgba(137,207,240,0.25)" : "none",
            }}
          >
            {formatDuration(elapsedMs)}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {startAt === null ? (
              <button
                onClick={startEvent}
                disabled={participants.length === 0}
                className="px-6 py-3 bg-blue text-ink font-condensed uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                Start Event
              </button>
            ) : (
              <button
                onClick={resetEvent}
                className="px-6 py-3 border border-white/30 text-paper font-condensed uppercase tracking-widest text-sm hover:border-blue hover:text-blue transition-colors"
              >
                Reset Clock
              </button>
            )}
            <button
              onClick={clearAll}
              className="px-6 py-3 border border-white/10 text-white/50 font-condensed uppercase tracking-widest text-sm hover:text-paper hover:border-white/30 transition-colors"
            >
              Clear All
            </button>
          </div>
          {startAt !== null && (
            <div className="mt-4 text-[10px] tracking-[0.25em] uppercase text-white/40">
              Started {new Date(startAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 grid gap-10 lg:grid-cols-2">
        {/* Participants */}
        <section>
          <SectionHeader
            eyebrow="01 · Roster"
            title={`Participants (${participants.length})`}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addParticipant();
            }}
            className="mt-6 grid grid-cols-[80px_1fr_auto] gap-2"
          >
            <input
              value={bib}
              onChange={(e) => setBib(e.target.value)}
              placeholder="Bib"
              className="bg-vintage border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-blue placeholder:text-white/30"
              inputMode="numeric"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Runner name"
              className="bg-vintage border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-blue placeholder:text-white/30"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-paper text-ink font-condensed uppercase tracking-widest text-xs hover:bg-blue transition-colors"
            >
              Add
            </button>
          </form>

          <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
            {pending.length === 0 && participants.length === 0 && (
              <li className="py-8 text-center text-white/40 text-sm">
                Add runners to begin.
              </li>
            )}
            {pending.map((p) => (
              <li
                key={p.id}
                className="py-3 flex items-center gap-3"
              >
                <span className="w-10 font-condensed text-white/50 tabular-nums text-sm">
                  {p.bib ?? "N/A"}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                <button
                  onClick={() => captureFinish(p.id)}
                  disabled={startAt === null}
                  className="px-3 py-1.5 bg-blue text-ink font-condensed uppercase tracking-widest text-[11px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Finish
                </button>
                <button
                  onClick={() => removeParticipant(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="text-white/30 hover:text-paper text-lg leading-none px-2"
                >
                  ×
                </button>
              </li>
            ))}
            {pending.length === 0 && participants.length > 0 && (
              <li className="py-6 text-center text-white/40 text-xs uppercase tracking-[0.2em]">
                All runners finished
              </li>
            )}
          </ul>
        </section>

        {/* Results */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow="02 · Results"
              title={`Finishers (${results.length})`}
            />
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-4">
                <button
                  onClick={shareResults}
                  disabled={results.length === 0}
                  className="text-[11px] tracking-[0.22em] uppercase text-white/60 hover:text-blue disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {shareStatus === "copied" ? "Link Copied ✓" : "Share Link"}
                </button>
                <button
                  onClick={exportCsv}
                  disabled={results.length === 0}
                  className="text-[11px] tracking-[0.22em] uppercase text-white/60 hover:text-blue disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>


          <div className="mt-6 border border-white/10">
            <div className="grid grid-cols-[48px_64px_1fr_120px] gap-2 px-4 py-2 bg-vintage text-[10px] tracking-[0.22em] uppercase text-white/50">
              <span>Pl</span>
              <span>Bib</span>
              <span>Name</span>
              <span className="text-right">Time</span>
            </div>
            <ul className="divide-y divide-white/10">
              {results.length === 0 && (
                <li className="py-10 text-center text-white/40 text-sm">
                  No finishers yet.
                </li>
              )}
              {results.map((p, i) => (
                <li
                  key={p.id}
                  className="grid grid-cols-[48px_64px_1fr_120px] gap-2 items-center px-4 py-3"
                >
                  <span className="font-condensed text-lg text-blue tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-white/60 tabular-nums text-sm">
                    {p.bib ?? "N/A"}
                  </span>
                  <span className="truncate">{p.name}</span>
                  <span className="text-right font-condensed tabular-nums text-sm flex items-center justify-end gap-2">
                    {formatDuration(p.finishMs)}
                    <button
                      onClick={() => undoFinish(p.id)}
                      className="text-white/30 hover:text-paper text-xs uppercase tracking-widest"
                      title="Undo finish"
                    >
                      ↺
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-[11px] text-white/40 leading-relaxed">
            Local session only, data lives in this browser tab. Export the CSV
            before closing.
          </p>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">
        {eyebrow}
      </div>
      <h2
        className="font-condensed uppercase text-2xl mt-1"
        style={{ letterSpacing: "0.01em" }}
      >
        {title}
      </h2>
    </div>
  );
}
