import { GrytBear, GrytBrand } from "./BrandMarks";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitRecommendation } from "@/lib/recommendations.functions";
import insuranceAsset from "@/assets/certificate-of-insurance.pdf.asset.json";

const STRAVA_CLUB = "https://www.strava.com/clubs/1708552";

export function MonogramG({ className = "" }: { className?: string }) {
  return <GrytBear className={className} />;
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
          className="absolute left-[-2px] right-[-2px] -bottom-[0.14em] h-[0.1em] bg-blue"
          style={{ transform: "skewX(-8deg)" }}
          aria-hidden
        />
      </span>
    </div>
  );
}

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/#details", label: "Let's Run" },
  { href: "/#first", label: "Start Here" },
  { href: "/calendar", label: "Calendar" },
  { href: "/resources", label: "Learn" },
  { href: "/races", label: "Races" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/shop", label: "Shop" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [here, setHere] = useState("");
  useEffect(() => setHere(window.location.pathname), []);
  const isCurrent = (href: string) =>
    !href.includes("#") && (here === href || (href !== "/" && here.startsWith(`${href}/`)));
  return (
    <nav aria-label="Main" className="sticky top-0 z-50 bg-background border-b border-foreground/15">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] lg:flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 md:px-12 h-[68px]">
        <a href="/" className="flex min-w-0 items-center gap-2" aria-label="GRYT Run Club home">
          <GrytBrand />
        </a>
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={isCurrent(l.href) ? "page" : undefined}
              className={`eyebrow transition-colors hover:text-foreground/70 ${
                isCurrent(l.href) ? "text-foreground" : "text-foreground/80"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/#join"
            className="bg-blue text-ink px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-foreground hover:text-background transition-colors whitespace-nowrap"
            style={{ fontFamily: "var(--font-body)" }}
          >
            RSVP Saturday
          </a>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center h-11 w-11 border border-foreground/30 text-foreground hover:border-blue"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="text-[20px] leading-none">{open ? "×" : "≡"}</span>
          </button>
        </div>
      </div>
      {open ? (
        <div id="site-mobile-nav" className="lg:hidden border-t border-foreground/15 bg-background px-5 sm:px-8 pb-6">
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href} className="border-b border-foreground/10">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  className={`block py-4 text-[17px] font-bold ${isCurrent(l.href) ? "text-foreground" : "text-foreground"}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={STRAVA_CLUB}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-4 text-[15px] text-foreground/70"
              >
                Join the Strava club ↗
              </a>
            </li>
          </ul>
        </div>
      ) : null}
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
      <div className="border-t border-foreground/15 pt-10 pb-2">
        <p className="eyebrow text-foreground">THANKS — WE GOT IT.</p>
        <p className="text-sm text-foreground/70 mt-2">
          Nick and Laura read every suggestion.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-foreground/15 pt-10 pb-2">
      <p className="eyebrow text-foreground/70 mb-4">WHAT SHOULD WE DO NEXT?</p>
      <div className="flex flex-wrap gap-2.5 mb-4">
        {pills.map((p) => (
          <button
            key={p.label}
            disabled={submitting}
            onClick={() => send(p.category, p.label)}
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium uppercase tracking-wide border border-foreground/25 text-foreground/90 hover:bg-blue hover:text-ink hover:border-blue transition-colors disabled:opacity-40"
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
            className="eyebrow text-foreground/70 block mb-1.5"
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
            className="w-full bg-transparent border-0 border-b-2 border-foreground/20 text-foreground placeholder:text-foreground/55 pb-2 pt-1 text-base focus:outline-none focus:border-blue transition-colors"
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
    <footer className="bg-background text-foreground py-14 md:py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex justify-between gap-10 flex-wrap items-start pb-12 border-b border-foreground/15">
          <div>
            <MissionStamp size="md" align="left" className="text-foreground" />
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6">
              <a
                href={STRAVA_CLUB}
                target="_blank"
                rel="noopener"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Strava
              </a>
              <a
                href="/about"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                About
              </a>
              <a
                href="/press"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Press
              </a>
              <a
                href="/calendar"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Calendar
              </a>
              <a
                href="/resources"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Resources
              </a>
              <a
                href="https://www.instagram.com/grytrunclub/"
                target="_blank"
                rel="noopener"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Instagram
              </a>
              <Link
                to="/privacy"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Privacy
              </Link>
              <Link to="/partners" className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors">Partners</Link>
              <Link to="/review" className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors">Leave a review</Link>
              <Link
                to="/terms"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Terms
              </Link>
              <a
                href="/faq"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                FAQ
              </a>
              <a
                href="/shop"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Shop
              </a>
              <a
                href={insuranceAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow text-foreground/75 hover:text-foreground/70 transition-colors"
              >
                Proof of Insurance
              </a>
            </div>
          </div>
          <div className="flex-1 min-w-[260px] basis-[320px]">
            <div className="flex items-center gap-2.5 mb-4">
              <GrytBrand size="footer" />
            </div>
            <p className="text-sm leading-[1.6] text-foreground/70 max-w-[340px]">
              Pittsburgh, PA · Saturdays · 7 AM · Montour / Peters Trail.
            </p>
            <p className="text-sm leading-[1.6] text-foreground/75 max-w-[340px] mt-3">
              GRYT Run Club carries general liability insurance.{" "}
              <a
                href={insuranceAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                View proof of insurance (PDF)
              </a>
              .
            </p>
          </div>
        </div>
        <div className="border-t border-foreground/15 pt-10 pb-2">
          <Link
            to="/resources/recap"
            className="inline-flex items-center gap-3 px-5 py-3 border border-blue text-foreground text-[12px] tracking-[0.22em] uppercase hover:bg-blue hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue" aria-hidden="true" />
            Recap Run Generator · Open →
          </Link>
        </div>
        <RecommendationsBar />
        <div className="flex justify-between gap-4 pt-8 flex-wrap eyebrow text-foreground/70">
          <span>© 2026 GRYT Run Club. All rights reserved.</span>
          <span>Built by Laura & Nick Merich.</span>
        </div>
        <div className="pt-3 eyebrow text-foreground/75">
          Designed, written, and shipped by{" "}
          <a
            href="https://nick.pop.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/75 hover:text-foreground/70 underline underline-offset-2 decoration-foreground/20 hover:decoration-blue transition-colors"
          >
            Nick Merich
          </a>
          .
        </div>
        <p className="pt-3 text-sm leading-relaxed text-foreground/70">
          Executive produced by C.Y. Lee ·{" "}
          <a
            href="https://www.musicnerd.xyz/"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-4 hover:text-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
          >
            Music Nerd
          </a>
        </p>
      </div>
    </footer>
  );
}
