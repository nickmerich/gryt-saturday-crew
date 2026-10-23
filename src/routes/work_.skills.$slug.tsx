import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { SaturdayInvite } from "@/components/site/GuideShell";
import { byId } from "@/lib/library";
import { WORKFLOWS, skillBySlug, type SkillCategory } from "@/lib/the-work";

const SITE = "https://grytrunclub.com";
const CATEGORY_LABEL: Record<SkillCategory, string> = {
  run: "Run skill",
  strength: "Strength skill",
  durability: "Durability skill",
  life: "Real-life skill",
};

export const Route = createFileRoute("/work_/skills/$slug")({
  loader: ({ params }) => {
    const skill = skillBySlug(params.slug);
    if (!skill) throw notFound();
    return { slug: skill.slug };
  },
  head: ({ params }) => {
    const s = skillBySlug(params.slug);
    if (!s)
      return {
        meta: [
          { title: "Skill not found · GRYT Run Club" },
          { name: "robots", content: "noindex" },
        ],
      };
    const url = `${SITE}/work/skills/${s.slug}`;
    const title = `${s.name} · Start, Build, Own | GRYT Run Club`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${s.oneLiner} Three levels, cues, and common mistakes from GRYT Run Club.`,
        },
        { property: "og:title", content: `${s.name} · GRYT` },
        { property: "og:description", content: s.oneLiner },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: `${SITE}/og-resources.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: SkillPage,
  notFoundComponent: () => (
    <main className="bg-ink text-paper min-h-screen">
      <SiteNav />
      <div className="px-6 py-24 max-w-[820px] mx-auto">
        <h1 className="display-condensed uppercase text-5xl">Skill not found</h1>
        <Link to="/work" hash="skills" className="btn-primary mt-8">
          All skills
        </Link>
      </div>
      <SiteFooter />
    </main>
  ),
});

function SkillPage() {
  const { slug } = Route.useLoaderData();
  const s = skillBySlug(slug)!;
  const usedIn = WORKFLOWS.filter((w) => w.skills.includes(s.slug));
  const related = (s.related ?? []).flatMap((id) => {
    try {
      return [byId(id)];
    } catch {
      return [];
    }
  });

  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20">
        <div className="max-w-[900px] mx-auto">
          <Link
            to="/work"
            hash="skills"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All skills
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">{CATEGORY_LABEL[s.category]}</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,88px)] leading-[0.95]">
            {s.name}
          </h1>
          <p className="mt-6 text-paper/80 text-lg md:text-xl leading-[1.55] max-w-[680px]">
            {s.oneLiner}
          </p>
          <p className="mt-4 font-mono text-[12px] tracking-[0.18em] uppercase text-paper/60">
            {s.minutes} · {s.equipment}
          </p>

          <div className="mt-12 grid gap-10 md:grid-cols-2 text-[16.5px] leading-[1.65] text-paper/85">
            <section aria-labelledby="why">
              <h2 id="why" className="eyebrow text-paper/60 mb-3">
                Why it matters
              </h2>
              <p>{s.why}</p>
            </section>
            <section aria-labelledby="std">
              <h2 id="std" className="eyebrow text-paper/60 mb-3">
                What good looks like
              </h2>
              <p>{s.standard}</p>
            </section>
          </div>

          <section aria-labelledby="levels" className="mt-14">
            <h2 id="levels" className="display-condensed uppercase text-[clamp(28px,5vw,44px)]">
              Start, Build, Own
            </h2>
            <ol className="mt-6 grid gap-px bg-paper/15 border border-paper/15 md:grid-cols-3">
              {s.levels.map((l) => (
                <li key={l.name} className="bg-ink p-6">
                  <p className="display-condensed uppercase text-[28px] text-blue">{l.name}</p>
                  <p className="mt-3 text-[16px] leading-[1.6]">{l.dose}</p>
                  <p className="mt-4 text-[14px] text-paper/65 leading-[1.55]">
                    <span className="font-bold text-paper/80">Move up when: </span>
                    {l.moveUp}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <section aria-labelledby="cues">
              <h2 id="cues" className="eyebrow text-paper/60 mb-3">
                Cues
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[16px] text-paper/85">
                {s.cues.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="mistakes">
              <h2 id="mistakes" className="eyebrow text-paper/60 mb-3">
                Common mistakes
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[16px] text-paper/85">
                {s.mistakes.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="mt-14 border-l-4 border-blue pl-5">
            <p className="eyebrow text-blue mb-2">On Saturday</p>
            <p className="text-[18px] font-bold leading-[1.45]">{s.saturday}</p>
          </aside>

          {usedIn.length ? (
            <section aria-labelledby="used" className="mt-14">
              <h2 id="used" className="eyebrow text-paper/60 mb-4">
                Used in these workflows
              </h2>
              <ul className="flex flex-wrap gap-2">
                {usedIn.map((w) => (
                  <li key={w.slug}>
                    <Link
                      to="/work/workflows/$slug"
                      params={{ slug: w.slug }}
                      className="btn-ghost min-h-[44px]"
                    >
                      {w.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {related.length ? (
            <section aria-labelledby="read" className="mt-10">
              <h2 id="read" className="eyebrow text-paper/60 mb-4">
                Read next
              </h2>
              <ul className="space-y-2">
                {related.map((e) => (
                  <li key={e.id}>
                    <Link
                      to={e.to as "/"}
                      hash={e.hash}
                      className="text-blue underline underline-offset-4 hover:text-paper"
                    >
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-14 text-[13.5px] text-paper/55 leading-[1.6]">
            General guidance, not medical advice. Soreness is normal; sharp pain or pain that
            changes how you move means stop and get it checked.
          </p>
          <SaturdayInvite />
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
