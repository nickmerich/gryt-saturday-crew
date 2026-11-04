import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LIBRARY, PATHS, TOPICS, byId, inSeason, type LibraryEntry, type Topic } from "@/lib/library";

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } as const;
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

function kindLabel(e: LibraryEntry) {
  if (e.kind === "tool") return "Free tool";
  if (e.kind === "story") return e.minutes ? `Story · ${e.minutes} min` : "Stories";
  return `${e.minutes ?? 5} min read`;
}

/* ─────────────  Two doors: run or learn  ───────────── */

export function TwoDoors() {
  return (
    <section aria-label="Choose your path" className="mb-20 md:mb-24 grid gap-px bg-foreground/20 border border-foreground/20 md:grid-cols-2">
      <Link
        to="/"
        hash="join"
        className={`group block bg-blue text-ink p-7 md:p-10 hover:bg-foreground hover:text-background transition-colors ${focusRing}`}
      >
        <span className="text-[12px] tracking-[0.22em] uppercase" style={mono}>
          Here to run
        </span>
        <span className="mt-3 block text-[clamp(26px,3.4vw,40px)] font-bold leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
          Saturday, 7 AM. Peterswood Park lot.
        </span>
        <span className="mt-3 block text-[15px] leading-[1.6] text-ink/80">
          Free, no-drop, every pace. RSVP takes about two minutes.
        </span>
        <span className="mt-6 inline-block text-[12px] tracking-[0.22em] uppercase font-bold" style={mono}>
          RSVP for Saturday →
        </span>
      </Link>
      <a
        href="#library"
        className={`group block bg-background p-7 md:p-10 hover:bg-background transition-colors ${focusRing}`}
      >
        <span className="text-[12px] tracking-[0.22em] uppercase text-foreground" style={mono}>
          Here to learn
        </span>
        <span className="mt-3 block text-[clamp(26px,3.4vw,40px)] font-bold leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
          {LIBRARY.filter((e) => e.kind !== "tool").length} guides &amp; stories. {LIBRARY.filter((e) => e.kind === "tool").length} free tools.
        </span>
        <span className="mt-3 block text-[15px] leading-[1.6] text-foreground/80">
          Written from what we see every Saturday, checked against sources we link.
        </span>
        <span className="mt-6 inline-block text-[12px] tracking-[0.22em] uppercase text-foreground" style={mono}>
          Browse the library ↓
        </span>
      </a>
    </section>
  );
}

/* ─────────────  Start here paths  ───────────── */

export function StartHere() {
  return (
    <section aria-labelledby="start-here" className="mb-24 md:mb-32">
      <div className="flex items-baseline gap-5 mb-10">
        <span className="text-foreground text-[12px] tracking-[0.22em] uppercase shrink-0" style={mono}>
          § 00
        </span>
        <h2
          id="start-here"
          className="uppercase text-[clamp(34px,5.2vw,72px)] leading-[0.9] tracking-tight"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Start where you are
        </h2>
        <div className="h-px flex-1 bg-foreground/35 mb-3" aria-hidden="true" />
      </div>
      <div className="grid gap-px bg-foreground/20 border border-foreground/20 md:grid-cols-2">
        {PATHS.map((p) => (
          <div key={p.id} className="bg-background p-6 md:p-8">
            <h3 className="text-[22px] md:text-[26px] font-bold leading-[1.15]" style={{ fontFamily: "var(--font-display)" }}>
              {p.who}
            </h3>
            <p className="mt-2 text-[15px] text-foreground/70">{p.promise}</p>
            <ol className="mt-5 space-y-px">
              {p.steps.map((id, i) => {
                const e = byId(id);
                return (
                  <li key={id}>
                    <Link
                      to={e.to as any}
                      hash={e.hash}
                      className={`group flex items-start gap-4 py-3 border-t border-foreground/15 hover:text-foreground/70 transition-colors ${focusRing}`}
                    >
                      <span className="text-foreground text-[12px] tracking-[0.18em] pt-1 shrink-0" style={mono}>
                        0{i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block font-bold leading-[1.3]">{e.title}</span>
                        <span className="block text-[12px] tracking-[0.16em] uppercase text-foreground/70 mt-1" style={mono}>
                          {kindLabel(e)}
                        </span>
                      </span>
                      <span aria-hidden="true" className="pt-0.5">→</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────  Library with filters  ───────────── */

export function Library() {
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [q, setQ] = useState("");

  // Allow deep links like /resources?topic=safety#library
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("topic");
    if (t && TOPICS.some((x) => x.id === t)) setTopic(t as Topic);
  }, []);

  function pick(t: Topic | "all") {
    setTopic(t);
    const url = new URL(window.location.href);
    if (t === "all") url.searchParams.delete("topic");
    else url.searchParams.set("topic", t);
    window.history.replaceState(window.history.state, "", url.toString());
  }

  const now = useMemo(() => new Date(), []);
  const seasonal = useMemo(() => LIBRARY.filter((e) => inSeason(e, now)), [now]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LIBRARY.filter((e) => (topic === "all" ? true : e.topic === topic)).filter((e) =>
      needle ? `${e.title} ${e.summary}`.toLowerCase().includes(needle) : true,
    ).sort((a, b) => (a.kind === "tool" ? -1 : 0) - (b.kind === "tool" ? -1 : 0));
  }, [topic, q]);

  return (
    <section id="library" aria-labelledby="library-title" className="mb-24 md:mb-32 scroll-mt-24">
      <div className="flex items-baseline gap-5 mb-8">
        <span className="text-foreground text-[12px] tracking-[0.22em] uppercase shrink-0" style={mono}>
          § 01
        </span>
        <h2
          id="library-title"
          className="uppercase text-[clamp(34px,5.2vw,72px)] leading-[0.9] tracking-tight"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Runner library
        </h2>
        <div className="h-px flex-1 bg-foreground/35 mb-3" aria-hidden="true" />
      </div>

      {seasonal.length ? (
        <div className="mb-10 border border-blue bg-blue/[0.06] p-5 md:p-6">
          <p className="text-[12px] tracking-[0.22em] uppercase text-foreground mb-3" style={mono}>
            Right now in Pittsburgh
          </p>
          <ul className="grid gap-3 md:grid-cols-3">
            {seasonal.map((e) => (
              <li key={e.id}>
                <Link to={e.to as any} hash={e.hash} className={`font-bold hover:text-foreground/70 transition-colors ${focusRing}`}>
                  {e.title} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between mb-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by topic">
          {TOPICS.map((t) => {
            const count = t.id === "all" ? LIBRARY.length : LIBRARY.filter((e) => e.topic === t.id).length;
            const active = topic === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => pick(t.id)}
                className={`px-3.5 py-2 text-[13px] border transition-colors ${focusRing} ${
                  active ? "bg-blue text-ink border-blue font-bold" : "border-foreground/30 text-foreground/85 hover:border-blue"
                }`}
              >
                {t.label} <span className={active ? "text-ink/60" : "text-foreground/70"}>{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block lg:w-[280px]">
          <span className="sr-only">Search the library</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: hills, shoes, ice…"
            className="w-full bg-background border border-foreground/30 px-4 py-2.5 text-[14px] placeholder:text-foreground/55 focus:outline-none focus:border-blue"
          />
        </label>
      </div>

      {items.length === 0 ? (
        <p className="border border-foreground/20 p-6 text-foreground/75">
          Nothing matches that yet. Ask us on Saturday, or{" "}
          <Link to="/faq" className="text-foreground underline underline-offset-4">
            check the FAQ
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-px bg-foreground/20 border border-foreground/20 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <li key={e.id} className="bg-background">
              <Link
                to={e.to as any}
                hash={e.hash}
                className={`group flex flex-col h-full p-6 md:p-7 hover:bg-blue hover:text-ink transition-colors ${focusRing}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span
                    className={`text-[11px] tracking-[0.2em] uppercase ${e.kind === "tool" ? "text-ink bg-blue px-2 py-0.5 group-hover:bg-background group-hover:text-foreground/70" : "text-foreground group-hover:text-ink"}`}
                    style={mono}
                  >
                    {kindLabel(e)}
                  </span>
                  <span className="text-[11px] tracking-[0.16em] uppercase text-foreground/70 group-hover:text-ink/60" style={mono}>
                    {TOPICS.find((t) => t.id === e.topic)?.label}
                  </span>
                </span>
                <span
                  className="mt-4 block text-[20px] md:text-[22px] font-bold leading-[1.18] tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {e.title}
                </span>
                <span className="mt-3 block text-[14.5px] leading-[1.6] text-foreground/75 group-hover:text-ink/80 flex-1">
                  {e.summary}
                </span>
                <span className="mt-5 text-[12px] tracking-[0.22em] uppercase" style={mono}>
                  {e.kind === "tool" ? "Open tool →" : "Read →"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
