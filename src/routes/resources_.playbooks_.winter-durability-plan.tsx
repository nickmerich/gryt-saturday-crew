import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import crewTrail800Img from "@/assets/img/crew-trail-800.webp";
import crewTrailImg from "@/assets/img/crew-trail.webp";
import { siteUrl } from "@/lib/site";

const URL = siteUrl("/resources/playbooks/winter-durability-plan");
const TITLE = "Built for Winter: 12-Week Durability Plan | GRYT Run Club";
const H1 = "Built for Winter: The GRYT 12-Week Durability Plan";
const DESCRIPTION =
  "A free 12-week strength and running plan to help newer runners get stronger and stay consistent through winter. Farmer walks, carries, pull-ups, and easy miles.";
const OG_IMAGE = siteUrl("/og-resources.jpg");
const CSV_HREF = "/downloads/gryt-12-week-durability-plan.csv";
const CSV_NAME = "gryt-12-week-durability-plan.csv";
const XLSX_HREF = "/downloads/gryt-12-week-durability-plan.xlsx";
const XLSX_NAME = "gryt-12-week-durability-plan.xlsx";

const BLOCKS = [
  { weeks: "Weeks 1 to 3", name: "Base", body: "Build load tolerance. 50 to 60 lb carries, easy run mileage, pull-up volume." },
  { weeks: "Week 4", name: "Deload", body: "Drop volume about 40%. Recovery, mobility, one quality run." },
  { weeks: "Weeks 5 to 7", name: "Build", body: "70 to 85 lb carries, run mileage up about 10% a week, weighted pull-ups begin." },
  { weeks: "Week 8", name: "Deload", body: "Drop volume about 40%. Test day: max farmer walk and max pull-ups." },
  { weeks: "Weeks 9 to 11", name: "Peak", body: "90 to 100 lb event-specific loading. Race-pace runs. Full send." },
  { weeks: "Week 12", name: "Taper / Event", body: "Volume down about 60%, event day at the end. Sharpness only." },
];

const MODALITIES = [
  { name: "Farmer walks", body: "Distance times load. Grip, posture, and full-body durability under load." },
  { name: "Carries (front-rack, sandbag, zercher)", body: "Awkward-object strength. Trains the odd-angle resilience that real life and event day demand." },
  { name: "Pull-up work", body: "Bodyweight to weighted. Vertical pull strength and shoulder durability." },
  { name: "Run mileage", body: "Weekly volume with one quality session (tempo or intervals). Trail and road mix." },
  { name: "50 to 100 lb loading", body: "Ruck, sandbag, deadlift, or squat carries on a progressive load ladder." },
];

const PHONE_STEPS = [
  { t: "Open it in Excel or the Google Sheets app.", b: "Frozen headers and a narrow first column keep it readable on a phone screen." },
  { t: "Log every session in the Daily Log.", b: "You only touch three columns: Completed?, Load (lb), and Notes. Everything else calculates on its own." },
  { t: "Check the Dashboard Sunday night.", b: "Charts flag undertraining (more than a 15% drop) and overreaching (more than a 10% jump with high effort)." },
  { t: "Follow the rules. Don't freelance.", b: "The Progression Rules and Missed-Session Logic tabs are your guardrails. Trust them for 12 weeks." },
];

export const Route = createFileRoute("/resources_/playbooks_/winter-durability-plan")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: H1,
          description: DESCRIPTION,
          author: { "@type": "Person", name: "Nick Merich" },
          publisher: { "@type": "Organization", name: "GRYT Run Club" },
          datePublished: "2026-10-22",
          mainEntityOfPage: URL,
        }),
      },
    ],
  }),
  component: WinterPlanPage,
});

function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="display-condensed uppercase text-[clamp(28px,5vw,44px)] leading-[1] mt-16 mb-5 scroll-mt-24">
      {children}
    </h2>
  );
}

function DownloadBlock({ id }: { id?: string }) {
  return (
    <section id={id} aria-label="Download the plan" className="mt-14 border border-blue bg-blue/[0.07] p-6 md:p-8 scroll-mt-24">
      <p className="eyebrow text-foreground mb-3">Free download · No signup</p>
      <p className="text-[18px] md:text-[20px] font-bold leading-[1.35]">The GRYT 12-Week Durability Plan</p>
      <p className="mt-2 text-foreground/75 text-[15px]">
        The full workbook: weekly plan, 84-day log, progression rules, missed-session logic, dashboard and load targets. Opens in Excel or Google Sheets.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">
        <a href={XLSX_HREF} download={XLSX_NAME} className="btn-primary inline-flex">
          Download the workbook (.xlsx)
        </a>
        <a href={CSV_HREF} download={CSV_NAME} type="text/csv" className="text-foreground underline underline-offset-4 hover:text-foreground transition-colors text-[15px]">
          Quick reference (CSV)
        </a>
      </div>
    </section>
  );
}

const WORKBOOK_TABS = [
  { name: "Weekly Plan", body: "The 12-week roadmap. Volume, intensity and key sessions for each week." },
  { name: "Daily Log", body: "All 84 days. Fill in Completed?, Load, effort and Notes. The rest calculates on its own." },
  { name: "Progression Rules", body: "When to add weight, distance or reps. The decision tree." },
  { name: "Missed-Session Logic", body: "What to do when life happens. Not every miss is equal." },
  { name: "Dashboard", body: "Charts and totals. Weekly load, run mileage trend, adherence and warning flags." },
  { name: "Load Targets", body: "Reference table: what load for what week." },
];

function WinterPlanPage() {
  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      <article className="border-b border-foreground/15">
        <header className="relative overflow-hidden">
          <img
            src={crewTrailImg}
            srcSet={`${crewTrail800Img} 800w, ${crewTrailImg} 1594w`}
            sizes="100vw"
            alt="GRYT runners heading down the trail together"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/75" aria-hidden="true" />
          <div className="relative px-6 sm:px-12 lg:px-24 py-14 md:py-24">
            <div className="max-w-[820px] mx-auto">
              <Link to="/resources/playbooks" className="eyebrow text-foreground hover:text-foreground transition-colors">
                ← Playbooks
              </Link>
              <p className="eyebrow text-foreground mt-8 mb-5">Training · Winter</p>
              <h1 className="display-condensed uppercase text-[clamp(38px,7vw,88px)] leading-[0.95]">{H1}</h1>
              <p className="mt-6 text-foreground/85 text-lg md:text-xl leading-[1.55] max-w-[640px]">
                Winter doesn't have to be the season you lose your fitness. It can be the season you get harder to break.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a href={XLSX_HREF} download={XLSX_NAME} className="btn-primary">
                  Download the workbook
                </a>
                <a href={CSV_HREF} download={CSV_NAME} type="text/csv" className="text-foreground underline underline-offset-4 hover:text-foreground transition-colors text-[15px]">
                  Quick reference (CSV)
                </a>
                <Link to="/" hash="join" className="text-foreground underline underline-offset-4 hover:text-foreground transition-colors text-[15px]">
                  First time running with us? RSVP Saturday
                </Link>
              </div>
              <p className="mt-3 text-[12px] tracking-[0.14em] uppercase text-foreground/75 font-mono">
                .xlsx · Opens in Excel or Google Sheets
              </p>
            </div>
          </div>
        </header>

        <div className="px-6 sm:px-12 lg:px-24 py-12 md:py-16">
          <div className="max-w-[820px] mx-auto text-foreground/85 text-[16px] md:text-[17px] leading-[1.7] space-y-5">
            <p>
              If you started running this year, winter can feel like the end of the road. It's dark at 5 PM. The trails are muddy, then frozen. The motivation that got you out the door in June gets a lot quieter in January.
            </p>
            <p>
              Here's the thing: the runners who come into spring strong usually didn't spend winter chasing pace. They spent it building a body that can handle the miles. That's what this plan is for.
            </p>
            <p>
              The GRYT 12-Week Durability Plan is the plan Nick built for himself to get ready for trail, road, and strength events. Farmer walks, carries, pull-ups, loaded work, and steady running, all in one place. We're sharing it with the crew because the same idea works whether you're training for an event or just trying to stay consistent until the weather turns.
            </p>

            <H2>Why durability matters when you're newer to running</H2>
            <p>
              When you're new, your lungs usually catch up faster than the rest of you. Your cardio improves in weeks. Your tendons, joints, feet, and hips take longer to adapt. That gap is where a lot of new runners get hurt or burned out.
            </p>
            <p>
              Strength work helps close it. Carrying heavy things, pulling yourself up, and holding good posture under load builds the grip, core, hips, and upper back that keep your form together late in a run. It's also work you can do in a garage, basement, or gym when the sidewalks are ice.
            </p>
            <p>
              Winter is the right time for it. There's no race pressure. Easy miles are easy to fit in. And strength gains you build now carry into spring.
            </p>

            <H2>How the 12 weeks are built</H2>
            <p>The plan runs in blocks. You build, you back off, you build again.</p>
            <ol className="border-l-2 border-blue ml-1 space-y-6 pl-6 !mt-8">
              {BLOCKS.map((b, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[33px] top-1.5 h-3 w-3 bg-blue" aria-hidden="true" />
                  <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-foreground">{b.weeks}</p>
                  <h3 className="display-condensed uppercase text-[24px] leading-[1.1] text-foreground mt-1">{b.name}</h3>
                  <p className="mt-1">{b.body}</p>
                </li>
              ))}
            </ol>
            <p className="font-bold text-foreground">The deload weeks are not optional. They're where the work actually sticks.</p>

            <H2>The five things you'll train</H2>
            <ul className="grid gap-px bg-foreground/15 border border-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
              {MODALITIES.map((m) => (
                <li key={m.name} className="bg-background p-5">
                  <h3 className="font-bold text-foreground text-[17px] leading-[1.3]">{m.name}</h3>
                  <p className="mt-2 text-[15px] text-foreground/80">{m.body}</p>
                </li>
              ))}
            </ul>

            <H2>Making it work if you're just getting started</H2>
            <p>
              The load numbers in the plan are Nick's. They're not a requirement. If you're newer to running or lifting, here's how to make it yours:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pick a starting weight you can carry with tall posture and a relaxed walk. If your shoulders round or your steps get short, it's too heavy.</li>
              <li>Keep the structure, scale the numbers. Base, deload, build, deload, peak, taper works at any load.</li>
              <li>Can't do a pull-up yet? Use band-assisted pull-ups, slow negatives, or dead hangs. Same goal, different starting point.</li>
              <li>Keep most runs easy. Conversational pace. The one quality session a week is plenty.</li>
              <li>Nothing fancy required. Kettlebells, dumbbells, a backpack with books, or a sandbag all count.</li>
            </ul>

            <H2>Winter-proofing tips</H2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Plan strength days for the coldest or darkest nights. Run when conditions are safest.</li>
              <li>Use traction on icy trails and wear reflective gear or a light for early or late runs.</li>
              <li>Warm up a little longer when it's cold.</li>
              <li>Show up Saturdays. Training alone all winter is hard. Training with a crew is a lot easier.</li>
            </ul>

            <H2>What's in the workbook</H2>
            <ul className="grid gap-px bg-foreground/15 border border-foreground/15 sm:grid-cols-2">
              {WORKBOOK_TABS.map((t) => (
                <li key={t.name} className="bg-background p-5">
                  <h3 className="font-bold text-foreground text-[17px] leading-[1.3]">{t.name}</h3>
                  <p className="mt-2 text-[15px] text-foreground/80">{t.body}</p>
                </li>
              ))}
            </ul>

            <H2>How to use it on your phone</H2>
            <ol className="space-y-4">
              {PHONE_STEPS.map((s, i) => (
                <li key={i} className="flex gap-4 border border-foreground/15 p-5">
                  <span className="display-condensed text-foreground text-[32px] leading-none w-8 shrink-0" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3 className="font-bold text-foreground leading-[1.35]"><span className="sr-only">Step {i + 1}: </span>{s.t}</h3>
                    <p className="mt-1 text-[15px] text-foreground/80">{s.b}</p>
                  </div>
                </li>
              ))}
            </ol>

            <DownloadBlock id="download" />

            <p className="mt-10 text-[13.5px] text-foreground/75 leading-[1.6]">
              This plan is shared for general fitness and is not medical advice. If you're new to exercise, coming back from an injury, or have a health condition, check with a doctor or physical therapist first. Scale loads to what you can move with good form, and stop if something hurts.
            </p>

            <aside className="mt-14 border border-foreground/20 p-6 md:p-8">
              <h2 className="display-condensed uppercase text-[clamp(28px,5vw,44px)] leading-[1]">Don't do winter alone.</h2>
              <p className="mt-3 text-foreground/80">
                Bring the plan, bring a friend, and come run with us. All paces welcome. No membership required.
              </p>
              <Link to="/" hash="join" className="btn-primary mt-5 inline-flex">RSVP Saturday</Link>
            </aside>

            <div className="mt-12">
              <ShareButtons url={URL} title={H1} />
            </div>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
