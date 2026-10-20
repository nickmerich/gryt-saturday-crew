import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import { byId } from "@/lib/library";

export const guideLink =
  "text-blue underline underline-offset-4 hover:text-paper transition-colors";

export function GH2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-2xl md:text-3xl font-bold mt-14 mb-3 scroll-mt-24">
      {children}
    </h2>
  );
}

export function GH3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-paper font-bold text-[18px] md:text-[20px] mt-8 mb-1.5">{children}</h3>
  );
}

export type Source = { label: string; href: string; note?: string };

/**
 * Shared layout for runner tools and guides: nav, breadcrumb, title block,
 * body, sources, the Saturday invite, related reading, and footer.
 */
export function GuideShell({
  eyebrow,
  title,
  dek,
  url,
  updated,
  children,
  sources,
  related,
}: {
  eyebrow: string;
  title: string;
  dek: string;
  url: string;
  updated: string;
  children: ReactNode;
  sources: Source[];
  related: string[];
}) {
  const updatedLabel = new Date(`${updated}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[820px] mx-auto">
          <Link to="/resources" className="eyebrow text-blue hover:text-paper transition-colors">
            ← Runner library
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">{eyebrow}</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,92px)] leading-[0.95]">
            {title}
          </h1>
          <p className="mt-7 text-paper/80 text-lg md:text-xl leading-[1.55] max-w-[640px]">{dek}</p>
          <p className="mt-5 text-[12px] tracking-[0.2em] uppercase text-paper/55 font-mono">
            Reviewed {updatedLabel} · By Nick Merich, GRYT Run Club
          </p>

          <div className="mt-12 text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">{children}</div>

          <section aria-labelledby="sources" className="mt-16 border-t border-paper/15 pt-8">
            <h2 id="sources" className="eyebrow text-paper/60 mb-4">
              Sources we checked
            </h2>
            <ul className="space-y-2 text-[14.5px] text-paper/75">
              {sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={guideLink}>
                    {s.label}
                  </a>
                  {s.note ? <span className="text-paper/55"> · {s.note}</span> : null}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13.5px] text-paper/55 leading-[1.6]">
              General guidance, not medical advice. If you have a heart, lung, or other health
              condition, check with your doctor before changing how you train.
            </p>
          </section>

          <SaturdayInvite />

          <section aria-labelledby="related" className="mt-14">
            <h2 id="related" className="eyebrow text-paper/60 mb-4">
              Keep learning
            </h2>
            <ul className="grid gap-px bg-paper/15 border border-paper/15 sm:grid-cols-3">
              {related.map((id) => {
                const e = byId(id);
                return (
                  <li key={id} className="bg-ink">
                    <Link
                      to={e.to as any}
                      hash={e.hash}
                      className="block h-full p-5 hover:bg-blue hover:text-ink transition-colors group"
                    >
                      <span className="text-[11px] tracking-[0.2em] uppercase text-blue group-hover:text-ink font-mono">
                        {e.kind === "tool" ? "Tool" : e.minutes ? `${e.minutes} min read` : "Read"}
                      </span>
                      <span className="mt-2 block font-bold leading-[1.3]">{e.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="mt-12">
            <ShareButtons url={url} title={title} />
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}

export function SaturdayInvite() {
  return (
    <aside className="mt-14 border border-blue bg-blue/[0.07] p-6 md:p-8">
      <p className="eyebrow text-blue mb-3">Put it to use Saturday</p>
      <p className="text-[18px] md:text-[20px] font-bold leading-[1.35]">
        Every Saturday, 7 AM, Peterswood Park lot, 212 Valley Brook Road, McMurray. Free, no-drop,
        every pace.
      </p>
      <p className="mt-2 text-paper/75 text-[15px]">
        Two minutes to RSVP. Someone will be waiting at the lot to learn your name.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/" hash="join" className="btn-primary">
          RSVP for Saturday →
        </Link>
        <Link to="/" hash="first" className="btn-ghost">
          First time? Start here
        </Link>
      </div>
    </aside>
  );
}
