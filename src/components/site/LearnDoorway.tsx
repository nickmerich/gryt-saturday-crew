import { Link } from "@tanstack/react-router";
import { LIBRARY, byId } from "@/lib/library";

const PICKS = ["what-to-wear", "pace-calculator", "saturday-what-to-expect", "build-a-base"];

/** Homepage doorway for visitors who came to learn, not (yet) to RSVP. */
export function LearnDoorway() {
  const guides = LIBRARY.filter((e) => e.kind !== "tool").length;
  const tools = LIBRARY.filter((e) => e.kind === "tool").length;
  return (
    <section
      id="learn"
      aria-labelledby="learn-heading"
      className="border-t border-foreground/15 px-6 sm:px-12 lg:px-24 py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow text-foreground mb-3">Here to learn?</p>
            <h2
              id="learn-heading"
              className="display-condensed uppercase text-[clamp(32px,6vw,72px)] leading-[0.92]"
            >
              The runner library
            </h2>
            <p className="mt-4 max-w-[560px] text-foreground/75 text-[16px] leading-[1.6]">
              {guides} guides and {tools} free tools from what we see every Saturday. Useful whether
              you run with us or not.
            </p>
          </div>
          <Link
            to="/resources"
            className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-foreground/40 text-foreground hover:border-blue hover:text-foreground/70 transition-colors self-start md:self-auto"
          >
            Browse everything →
          </Link>
        </div>
        <ul className="grid gap-px bg-foreground/15 border border-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
          {PICKS.map((id) => {
            const e = byId(id);
            return (
              <li key={id} className="bg-background">
                <Link
                  to={e.to as any}
                  hash={e.hash}
                  className="group flex flex-col h-full p-6 hover:bg-blue hover:text-ink transition-colors"
                >
                  <span className="text-[11px] tracking-[0.2em] uppercase text-foreground group-hover:text-ink font-mono">
                    {e.kind === "tool" ? "Free tool" : `${e.minutes} min read`}
                  </span>
                  <span className="mt-3 block text-[19px] font-bold leading-[1.22]">{e.title}</span>
                  <span className="mt-2 block text-[14px] leading-[1.55] text-foreground/70 group-hover:text-ink/80 flex-1">
                    {e.summary}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
