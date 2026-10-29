import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter, MissionStamp } from "@/components/site/Chrome";
import mountainAsset from "@/assets/photos/founders-mountain.jpg.asset.json";
import surfCityAsset from "@/assets/photos/founders-surf-city.jpg.asset.json";
import bostonAsset from "@/assets/photos/founders-boston.jpg.asset.json";
import { siteUrl } from "@/lib/site";

const TITLE = "About GRYT Run Club | Nick & Laura Merich";
const DESC =
  "Meet Nick and Laura Merich, the founders of GRYT Run Club. Free Saturday runs in Pittsburgh's South Hills for former athletes, busy parents, and comeback runners.";

const ABOUT_FAQS = [
  {
    q: "Is GRYT a good free running group in the Pittsburgh suburbs for people who aren't fast?",
    a: "That's who it's built for. GRYT is free, no-drop, and walk-friendly. The Saturday 7 AM route on the Montour/Peters Trail in McMurray is flat and out and back, so you can turn around early and still finish with everyone. Faster runners loop back so nobody finishes alone.",
  },
  {
    q: "I'm starting again after a long break. Will anyone judge my pace?",
    a: "No. Plenty of the crew are comeback runners, busy parents, and former athletes rebuilding. There's no clock, no results list, and no pace groups to qualify for. Walk, jog, or mix both. The goal is showing up next Saturday.",
  },
  {
    q: "How does GRYT help people stay motivated?",
    a: "One fixed time and place every week (Saturday, 7 AM, 212 Valley Brook Road), a crew that notices when you're there, coffee after the run, and the Milestone Club, which recognizes 5, 10, 25, 50, and 100 Saturdays. Walking counts.",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/about") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/about") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: ABOUT_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: AboutPage,
});

const condensed = { fontFamily: "var(--font-condensed)" };
const body = { fontFamily: "var(--font-body)" };

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`eyebrow mb-4 ${className}`} style={body}>
      {children}
    </div>
  );
}

function H2({ lines }: { lines: string[] }) {
  return (
    <h2 className="text-4xl sm:text-5xl lg:text-6xl uppercase leading-[0.92]" style={condensed}>
      {lines.map((l) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
    </h2>
  );
}

function Founder({ role, name, paras, linkedin, first }: { role: string; name: string; paras: string[]; linkedin: string; first: string }) {
  return (
    <article className="border-t-2 border-blue pt-6">
      <Eyebrow className="text-paper/60">{role}</Eyebrow>
      <h3 className="text-3xl sm:text-4xl uppercase leading-none mb-5" style={condensed}>
        {name}
      </h3>
      {paras.map((p, i) => (
        <p key={i} className="text-paper/80 leading-relaxed mb-4" style={body}>
          {p}
        </p>
      ))}
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="eyebrow text-blue hover:text-paper transition-colors"
      >
        Meet {first} on LinkedIn
      </a>
    </article>
  );
}

function Pillar({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-ink/15 p-6">
      <h3 className="text-2xl uppercase leading-tight mb-3" style={condensed}>
        {title}
      </h3>
      <p className="text-ink/80 leading-relaxed" style={body}>
        {text}
      </p>
    </div>
  );
}

function AboutPage() {
  return (
    <>
      <SiteNav />

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <Eyebrow className="text-blue">About GRYT Run Club / Pittsburgh, PA</Eyebrow>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.92]" style={condensed}>
              <span className="block">A team to</span>
              <span className="block">come back to.</span>
            </h1>
            <p className="mt-6 text-lg text-paper/80 max-w-xl" style={body}>
              GRYT Run Club is a free Pittsburgh-area running community for former athletes, busy
              parents, and comeback runners who miss having a team. We meet on Saturday mornings in
              the South Hills to walk, jog, run, and do hard things together.
            </p>
            <a href="/#join" className="btn-primary inline-block mt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue">
              RSVP Saturday
            </a>
            <p className="mt-4 eyebrow text-paper/70" style={body}>
              Saturdays, 7 AM · Montour / Peters Trail
            </p>
            <p className="mt-1 text-sm text-paper/60" style={body}>
              Free runs. All paces. No membership required.
            </p>
          </div>
          <img
            src={mountainAsset.url}
            alt="Nick and Laura Merich on a mountain summit"
            className="w-full h-auto object-cover"
            loading="eager"
          />
        </div>
      </section>

      <section className="bg-paper text-ink" aria-labelledby="origin-heading">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <Eyebrow className="text-ink/70">WHO'S BEHIND GRYT</Eyebrow>
          <h2 id="origin-heading" className="font-condensed font-bold text-4xl sm:text-5xl leading-tight">
            Built by people who've done hard things before.
          </h2>
          <div className="mt-6 space-y-4 text-lg text-ink/80 leading-relaxed" style={body}>
            <p>
              Before GRYT, Nick spent ten years in music tech. He co-founded Songlink, the music link millions of artists used in 180+ countries, and sold it to Linktree. He scaled growth at Mint Songs through its sale to Napster, then grew Kits AI until Splice bought it.
            </p>
            <p className="text-sm font-medium text-ink/70">The founders' perspective</p>
            <p>
              C.Y. Lee, CEO of Music Nerd, watched that whole run from the sidelines. He was also early on IRL. Before run clubs and real-world community became a cultural moment, C.Y. saw that people wanted to be in a room together again. When he and Nick finally sat down for coffee, C.Y. didn't want to talk about growth hacks. He wanted to hear the story. He left believing Nick was a storyteller, and he signed on to executive produce GRYT.
            </p>
            <p>
              That's the whole idea behind this crew. Somebody believed in us before there was anything to show. Every Saturday, we try to do that for each other.
            </p>
          </div>
          <figure className="mt-8 border-l-2 border-ink pl-6">
            <blockquote className="text-xl sm:text-2xl leading-relaxed font-medium">
              "C.Y. saw the storyteller before I did. GRYT is what I'm doing with that."
            </blockquote>
            <figcaption className="mt-4 text-sm text-ink/75">Nick Merich, co-founder, GRYT Run Club</figcaption>
          </figure>
          <img
            src={surfCityAsset.url}
            alt="Nick and Laura with finisher medals at the Surf City half marathon"
            className="mt-10 w-full h-auto"
            loading="lazy"
          />
          <a href="/#join" className="mt-6 inline-flex min-h-11 items-center text-ink underline underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
            Meet the crew on Saturday.
          </a>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <Eyebrow className="text-blue">The team behind GRYT</Eyebrow>
          <H2 lines={["Nick. Laura.", "And the crew."]} />
          <p className="mt-5 text-paper/75 max-w-xl" style={body}>
            Two different backgrounds. One shared belief: effort is better together.
          </p>
          <img
            src={bostonAsset.url}
            alt="Laura with her 2020 Boston Marathon virtual bib, next to Nick"
            className="mt-10 w-full max-w-md h-auto"
            loading="lazy"
          />
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            <Founder
              role="Co-founder / Runner / Community host"
              name="Laura Merich"
              first="Laura"
              linkedin="https://www.linkedin.com/in/laura-tlumack-0b0a0a63"
              paras={[
                "Laura played Division I soccer at Duquesne, where she started every match as a freshman and went on to appear on the 2011 roster. Her running background includes a 3:25:24 finish at the 2019 Mountains 2 Beach Marathon.",
                "Off the trail, she holds a master's degree in biotechnology from Georgetown and leads eCommerce operations as a VP at Quartzy. At GRYT, she co-hosts the Saturday runs and helps newcomers find their footing with the crew.",
              ]}
            />
            <Founder
              role="Co-founder / Builder / Community host"
              name="Nick Merich"
              first="Nick"
              linkedin="https://www.linkedin.com/in/nick-merich"
              paras={[
                "Nick played college baseball as a Point Park University pitcher. He later co-founded Songlink/Odesli and held growth leadership roles at Mint Songs and Kits AI; Songlink was acquired by Linktree in 2021.",
                "He's also been the busy parent trying to find his way back to fitness, a comeback he has shared publicly. At GRYT, he brings his community-building background to the same practical job as Laura: getting people to the trailhead and making them feel welcome when they arrive.",
              ]}
            />
          </div>
          <p className="mt-12 text-xl text-paper/85" style={body}>
            The founders start the circle. The people who keep showing up make it a club.
          </p>
        </div>
      </section>

      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <Eyebrow className="text-ink/60">What GRYT does</Eyebrow>
          <H2 lines={["Less scrolling.", "More showing up."]} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Pillar
              title="Free Saturday runs"
              text="We meet Saturdays at 7 AM on the Montour / Peters Trail in McMurray, with an out-and-back route and room to walk, jog, or run. A regular time and place means one less thing to figure out."
            />
            <Pillar
              title="People beyond the miles"
              text="The run starts with introductions and ends with time for coffee and conversation in the lot. Getting to know the people beside you is part of the point."
            />
            <Pillar
              title="Practical runner resources"
              text="GRYT shares first-timer guides, route notes, training explainers, and crew stories. Use what helps, then come put it into practice with people."
            />
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <Eyebrow className="text-blue">What makes GRYT different</Eyebrow>
          <H2 lines={["Hard things.", "Open door."]} />
          <p className="mt-5 text-paper/75 max-w-xl" style={body}>
            Take the effort seriously. You don't have to take yourself so seriously.
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              [
                "No paywall at the trailhead",
                "Our recurring community runs are free, with no membership or training-plan purchase required. Come because you want to, not because you're locked into something.",
              ],
              [
                "A Saturday you can plan around",
                "Our recurring anchor is Saturday at 7 AM in McMurray. Check the current run page for weather or schedule updates before heading out.",
              ],
              [
                "Effort without a pace test",
                "Walkers, joggers, and runners are welcome, and the out-and-back format lets people turn around at different points. You don't have to keep up with someone else's goal to work on yours.",
              ],
            ].map(([t, d]) => (
              <div key={t} className="border-t-2 border-blue pt-5">
                <h3 className="text-2xl uppercase leading-tight mb-3" style={condensed}>
                  {t}
                </h3>
                <p className="text-paper/80 leading-relaxed" style={body}>
                  {d}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-wrap items-end justify-between gap-8">
            <MissionStamp size="lg" className="text-paper" />
            <a href="/#join" className="btn-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue">
              RSVP Saturday
            </a>
          </div>
        </div>
      </section>

      <section className="bg-paper text-ink" aria-labelledby="not-fast-heading">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <Eyebrow className="text-ink/70">If you're not fast</Eyebrow>
          <h2 id="not-fast-heading" className="font-condensed font-bold text-4xl sm:text-5xl leading-tight">
            A free run club for every pace in Pittsburgh's South Hills
          </h2>
          <div className="mt-8 space-y-8" style={body}>
            {ABOUT_FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">{f.q}</h3>
                <p className="mt-2 text-lg text-ink/80 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-lg text-ink/80 leading-relaxed" style={body}>
            Comparing options? Read our guide to{" "}
            <a href="/resources/playbooks/best-free-running-clubs-pittsburgh-2026" className="underline underline-offset-4">
              free running clubs in Pittsburgh
            </a>{" "}
            or see how GRYT compares with{" "}
            <a href="/resources/playbooks/gryt-vs-parkrun-pittsburgh" className="underline underline-offset-4">
              parkrun
            </a>
            ,{" "}
            <a href="/resources/playbooks/gryt-vs-city-of-bridges-run-club" className="underline underline-offset-4">
              City of Bridges
            </a>
            , and{" "}
            <a href="/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs" className="underline underline-offset-4">
              Fleet Feet
            </a>
            .
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
