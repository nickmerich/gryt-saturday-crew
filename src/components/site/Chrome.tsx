import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitRecommendation } from "@/lib/recommendations.functions";
import grytBearAsset from "@/assets/gryt-bear.png.asset.json";
import insuranceAsset from "@/assets/certificate-of-insurance.pdf.asset.json";

const STRAVA_CLUB = "https://www.strava.com/clubs/1708552";

export function MonogramG({ className = "" }: { className?: string }) {
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

export function MissionStamp({
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
  const alignCls =
    align === "center" ? "items-center text-center" : "items-start text-left";
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

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 bg-ink border-b border-paper/15">
      <div className="flex items-center justify-between px-5 sm:px-8 md:px-12 h-[68px]">
        <a href="/" className="flex items-center gap-2">
          <MonogramG className="h-11 w-11" />
          <span className="wordmark uppercase text-[20px] leading-none [text-shadow:2px_2px_0_var(--blue)]">
            Run Club
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/#details"
            className="eyebrow text-paper/80 hover:text-blue transition-colors"
          >
            The Run
          </a>
          <a
            href="/#first"
            className="eyebrow text-paper/80 hover:text-blue transition-colors"
          >
            First Time
          </a>
          <a
            href="/#founders"
            className="eyebrow text-paper/80 hover:text-blue transition-colors"
          >
            Who We Are
          </a>
          <a
            href="/calendar"
            className="eyebrow text-paper/80 hover:text-blue transition-colors"
          >
            Calendar
          </a>
          <a
            href="/resources"
            className="eyebrow text-paper/80 hover:text-blue transition-colors"
          >
            Resources
          </a>
          <a
            href="/faq"
            className="eyebrow text-paper/80 hover:text-blue transition-colors"
          >
            FAQ
          </a>
        </div>
        <a
          href={STRAVA_CLUB}
          target="_blank"
          rel="noopener"
          className="bg-blue text-ink px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-paper transition-colors"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Join on Strava
        </a>
      </div>
    </nav>
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
        <p className="text-sm text-paper/70 mt-2">
          Nick and Laura read every suggestion.
        </p>
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
          <label
            htmlFor="rec-custom"
            className="eyebrow text-paper/40 block mb-1.5"
          >
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

export function SiteFooter() {
  return (
    <footer className="bg-black text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex justify-between gap-10 flex-wrap items-start pb-12 border-b border-paper/15">
          <div>
            <MissionStamp size="md" align="left" className="text-paper" />
            <div className="flex flex-wrap gap-6 mt-6">
              <a
                href={STRAVA_CLUB}
                target="_blank"
                rel="noopener"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Strava
              </a>
              <a
                href="/calendar"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Calendar
              </a>
              <a
                href="/resources"
                className="eyebrow text-paper/75 hover:text-blue transition-colors"
              >
                Resources
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
            <p className="text-sm leading-[1.6] text-paper/60 max-w-[340px] mt-3">
              GRYT Run Club carries general liability insurance.{" "}
              <a
                href={insuranceAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue underline underline-offset-2 hover:text-paper transition-colors"
              >
                View proof of insurance (PDF)
              </a>
              .
            </p>
          </div>
        </div>
        <div className="border-t border-paper/15 pt-10 pb-2">
          <Link
            to="/resources/recap"
            className="inline-flex items-center gap-3 px-5 py-3 border border-blue text-blue text-[12px] tracking-[0.22em] uppercase hover:bg-blue hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue" aria-hidden="true" />
            Recap Run Generator · Open →
          </Link>
        </div>
        <RecommendationsBar />
        <div className="flex justify-between gap-4 pt-8 flex-wrap eyebrow text-paper/40">
          <span>© 2026 GRYT Run Club. All rights reserved.</span>
          <span>Built by Laura & Nick Merich.</span>
        </div>
        <div className="pt-3 eyebrow text-paper/35">
          Designed, written, and shipped by{" "}
          <a
            href="https://nick.pop.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper/60 hover:text-blue underline underline-offset-2 decoration-paper/20 hover:decoration-blue transition-colors"
          >
            Nick Merich
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
