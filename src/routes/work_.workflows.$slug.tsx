import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { SaturdayInvite } from "@/components/site/GuideShell";
import {
  BenchmarkTool,
  CheckInTool,
  GoalCardTool,
  ProgramBuilder,
} from "@/components/site/work/WorkTools";
import { WORKFLOWS, skillBySlug, workflowBySlug } from "@/lib/the-work";

const SITE = "https://grytrunclub.com";

export const Route = createFileRoute("/work_/workflows/$slug")({
  loader: ({ params }) => {
    const w = workflowBySlug(params.slug);
    if (!w) throw notFound();
    return { slug: w.slug };
  },
  head: ({ params }) => {
    const w = workflowBySlug(params.slug);
    if (!w)
      return {
        meta: [
          { title: "Workflow not found · GRYT Run Club" },
          { name: "robots", content: "noindex" },
        ],
      };
    const url = `${SITE}/work/workflows/${w.slug}`;
    return {
      meta: [
        { title: `${w.name} · Free workflow | GRYT Run Club` },
        { name: "description", content: `${w.oneLiner} ${w.output}` },
        { property: "og:title", content: `${w.name} · GRYT` },
        { property: "og:description", content: w.oneLiner },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: `${SITE}/og-resources.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: WorkflowPage,
  notFoundComponent: () => (
    <main className="bg-ink text-paper min-h-screen">
      <SiteNav />
      <div className="px-6 py-24 max-w-[820px] mx-auto">
        <h1 className="display-condensed uppercase text-5xl">Workflow not found</h1>
        <Link to="/work" hash="workflows" className="btn-primary mt-8">
          All workflows
        </Link>
      </div>
      <SiteFooter />
    </main>
  ),
});

function WorkflowPage() {
  const { slug } = Route.useLoaderData();
  const w = workflowBySlug(slug)!;
  const i = WORKFLOWS.findIndex((x) => x.slug === w.slug);
  const next = WORKFLOWS[(i + 1) % WORKFLOWS.length];

  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20">
        <div className="max-w-[1000px] mx-auto">
          <Link
            to="/work"
            hash="workflows"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All workflows
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">Workflow · {w.time}</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,88px)] leading-[0.95]">
            {w.name}
          </h1>
          <p className="mt-6 text-paper/80 text-lg md:text-xl leading-[1.55] max-w-[680px]">
            {w.oneLiner}
          </p>

          <dl className="mt-8 grid gap-px bg-paper/15 border border-paper/15 sm:grid-cols-2">
            <div className="bg-ink p-5">
              <dt className="eyebrow text-paper/60">You walk away with</dt>
              <dd className="mt-2 text-[16px]">{w.output}</dd>
            </div>
            <div className="bg-ink p-5">
              <dt className="eyebrow text-paper/60">When</dt>
              <dd className="mt-2 text-[16px]">{w.when}</dd>
            </div>
          </dl>

          <section aria-labelledby="steps" className="mt-14">
            <h2 id="steps" className="display-condensed uppercase text-[clamp(28px,5vw,44px)]">
              The steps
            </h2>
            <ol className="mt-6 space-y-px bg-paper/15 border border-paper/15">
              {w.steps.map((s, n) => (
                <li key={s.title} className="bg-ink p-5 sm:p-6 grid gap-3 sm:grid-cols-[56px_1fr]">
                  <span className="font-mono text-blue text-[14px] tracking-[0.2em]">
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[19px] font-bold">{s.title}</p>
                    <p className="mt-1.5 text-[16px] text-paper/85 leading-[1.6]">{s.do}</p>
                    <p className="mt-2 text-[14px] text-paper/60">
                      <span className="font-bold text-paper/75">Done when: </span>
                      {s.done}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {w.tool === "program-builder" ? <ProgramBuilder /> : null}
          {w.tool === "goal-card" ? <GoalCardTool /> : null}
          {w.tool === "benchmark" ? <BenchmarkTool /> : null}
          {w.tool === "check-in" ? <CheckInTool /> : null}

          <section aria-labelledby="skills" className="mt-14">
            <h2 id="skills" className="eyebrow text-paper/60 mb-4">
              Skills behind it
            </h2>
            <ul className="flex flex-wrap gap-2">
              {w.skills.map((slug) => {
                const s = skillBySlug(slug);
                return s ? (
                  <li key={slug}>
                    <Link
                      to="/work/skills/$slug"
                      params={{ slug }}
                      className="btn-ghost min-h-[44px]"
                    >
                      {s.name}
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          </section>

          <div className="mt-12">
            <Link
              to="/work/workflows/$slug"
              params={{ slug: next.slug }}
              className="text-blue underline underline-offset-4 hover:text-paper"
            >
              Next workflow: {next.name} →
            </Link>
          </div>
          <SaturdayInvite />
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
