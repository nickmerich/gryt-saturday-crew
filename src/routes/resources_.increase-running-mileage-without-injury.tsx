import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import heroAsset from "@/assets/mileage-build-pittsburgh.png.asset.json";
import hero768Img from "@/assets/img/mileage-build-pittsburgh-768.webp";
import heroImg from "@/assets/img/mileage-build-pittsburgh.webp";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/increase-running-mileage-without-injury`;
const HERO = `${SITE}${heroAsset.url}`;
const TITLE = "How to Increase Running Mileage Without Getting Injured · gryt";
const DESCRIPTION =
  "How to add running miles safely: the 10 percent rule, recovery weeks, easy pace, long runs, strength work, sleep, and why a group keeps you consistent.";
const PUBLISHED = "2026-09-24";

const SECTIONS = [
  { id: "rule", label: "The rule that prevents most overuse injuries" },
  { id: "base", label: "Build a base before you build volume" },
  { id: "easy", label: "What \u201Ceasy\u201D actually means" },
  { id: "structure", label: "How to structure a mileage build" },
  { id: "long-run", label: "Add one long run, not three medium ones" },
  { id: "signals", label: "What your body is actually telling you" },
  { id: "strength", label: "Strength work is not optional" },
  { id: "recovery", label: "Sleep and recovery are part of the training" },
  { id: "group", label: "Why running with a group changes your mileage trajectory" },
  { id: "comeback", label: "The comeback runner's specific challenge" },
  { id: "racing", label: "Racing as a mileage anchor" },
  { id: "shoes", label: "A note on shoes and surface" },
  { id: "together", label: "Putting it together" },
  { id: "faqs", label: "Frequently asked questions" },
];

const FAQS: Array<{ q: string; a: string }> = [
  { q: "How fast should I increase my running mileage?", a: "No more than 10 percent per week is the standard guideline, and it holds for most runners. More important than the exact percentage is the recovery week every fourth week. That's where your body actually adapts to the increased load." },
  { q: "How do I know if I'm adding too many miles too quickly?", a: "Watch for pain that's sharp, localized, or doesn't go away between runs. General muscle soreness that clears within 48 hours is normal. Pain in a specific spot, especially in tendons or along bones, is a signal to back off. Fatigue that doesn't clear after a rest day is another sign that volume has outpaced recovery." },
  { q: "Should I run every day when building mileage?", a: "Most recreational runners do better with four to five days of running per week rather than seven. Rest days aren't wasted days. They're when your tendons and ligaments catch up to your cardiovascular fitness. Running every day removes that window and increases injury risk." },
  { q: "Does running with a group help with mileage building?", a: "Yes, in two specific ways. Groups naturally regulate pace, which keeps easy days from becoming moderate days. And the social commitment improves consistency, the most important variable in a long-term mileage build. Runners who show up every week, even at modest mileage, build more durable fitness than runners who train hard for three weeks and then disappear." },
  { q: "What's the best surface for building mileage without injury?", a: "Softer surfaces like trails, packed gravel and grass reduce the impact stress on your joints compared to concrete or asphalt. If you have access to trail routes, prioritize them for your longer and easier runs. Save road running for shorter efforts or when trails aren't accessible." },
  { q: "How long does it take to safely double your weekly mileage?", a: "Roughly 10 to 16 weeks, depending on your starting point and how well you manage recovery weeks. Trying to double in four or five weeks is how most overuse injuries happen. The timeline feels slow. The alternative feels worse." },
  { q: "Can I build mileage while training for a race?", a: "Yes, but structure matters. Work backward from your race date and identify your peak week, which should fall three to four weeks before the event. Don't add new mileage in the final two weeks before a race. The fitness you need is already built. The taper is what lets you use it." },
];

export const Route = createFileRoute("/resources_/increase-running-mileage-without-injury")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "increase running mileage, 10 percent rule, running injury prevention, recovery week, long run, strength training for runners, comeback runner, Pittsburgh run club" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: HERO },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Training" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: HERO },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How to Increase Running Mileage Without Getting Injured",
          description: DESCRIPTION,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          author: { "@type": "Person", name: "Nick Merich" },
          publisher: { "@type": "Organization", name: "gryt run club", url: SITE },
          mainEntityOfPage: URL,
          image: HERO,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE}/resources` },
            { "@type": "ListItem", position: 2, name: "Increase Running Mileage Without Injury", item: URL },
          ],
        }),
      },
    ],
  }),
  component: MileagePage,
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-foreground font-bold text-[18px] md:text-[20px] mt-8 mb-1.5">{children}</h3>;
}
function B({ children }: { children: React.ReactNode }) {
  return <span className="text-foreground font-bold">{children}</span>;
}
const link = "text-foreground underline underline-offset-4 hover:text-foreground transition-colors";

function MileagePage() {
  return (
    <main className="bg-background text-foreground">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-foreground/15">
        <div className="max-w-[760px] mx-auto">
          <Link to="/resources" className="eyebrow text-foreground hover:text-foreground transition-colors">← All resources</Link>
          <p className="eyebrow text-foreground mt-8 mb-5">TRAINING · 10 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            How to Increase Running Mileage Without Getting Injured
          </h1>
          <p className="mt-7 text-foreground/75 text-lg md:text-xl leading-[1.55]">
            More miles, fewer setbacks. Structure beats willpower.
          </p>

          <figure className="mt-10 border border-foreground/15">
            <img src={heroImg} srcSet={`${hero768Img} 768w, ${heroImg} 1536w`} sizes="(max-width: 808px) 100vw, 760px" alt="Runner on a Pittsburgh riverfront path at night with the skyline behind and blue bars climbing toward a rising arrow" width={1536} height={1024} loading="eager" style={{ filter: "none" }} className="w-full h-auto" />
          </figure>

          <nav aria-label="Table of contents" className="mt-10 border border-foreground/15 p-5">
            <p className="eyebrow text-foreground/70 mb-3">In this guide</p>
            <ul className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="text-foreground/80 hover:text-foreground/70 transition-colors text-[15px]">→ {s.label}</a></li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-5 text-foreground/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>Most running injuries aren't bad luck. They're the result of doing too much, too soon, with too little recovery built in. If you want to build mileage without breaking down, the answer isn't more willpower. It's a smarter structure.</p>
            <p>This guide covers the principles that actually work: how to add miles gradually, when to hold back, what your body is telling you, and how showing up consistently with other people makes all of it easier to sustain.</p>

            <H2 id="rule">The rule that prevents most overuse injuries</H2>
            <p>You've probably heard the 10 percent rule: don't increase your weekly mileage by more than 10 percent from one week to the next. It's a reasonable starting point, and it holds up for most runners in most situations.</p>
            <p>But the rule isn't magic. It works because it forces a pace on your progression. Here's the real mechanism: your cardiovascular system adapts faster than your connective tissue does. Your lungs and heart will tell you that you can handle more long before your tendons, ligaments, and bones have caught up. The 10 percent rule keeps those two systems roughly in sync.</p>
            <p>Where runners get into trouble is when they feel good for two or three weeks and decide to skip ahead. That gap between "I feel ready" and "my body is actually ready" is where stress fractures and IT band syndrome live.</p>

            <H2 id="base">Build a base before you build volume</H2>
            <p>If you're coming back from a break, a race, or a long stretch of inconsistency, your first job isn't to add miles. It's to re-establish a base.</p>
            <p>A base means running regularly at a comfortable pace for four to six weeks before you start pushing volume. Three or four runs per week, each one feeling genuinely easy, with no soreness carrying over from the previous run. That's your baseline.</p>
            <p>Once you can hit that pattern without accumulating fatigue, you have something to build from. Before that point, adding miles is just adding risk. More on that phase: <Link to="/resources/build-a-running-base" className={link}>How to Build a Running Base</Link>.</p>

            <H2 id="easy">What "easy" actually means</H2>
            <p>Easy isn't slow for the sake of slow. Easy means you could hold a conversation without pausing to breathe. It keeps your effort low enough that you recover in time for the next run. Most runners run their easy days too hard, which means they arrive at their hard days already depleted.</p>
            <p className="border-l-2 border-blue pl-5 italic text-foreground/90">If your easy runs feel embarrassingly slow, you're probably doing them right.</p>

            <H2 id="structure">How to structure a mileage build</H2>
            <p>Here's a practical framework for increasing mileage over 12 weeks without overloading your body.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><B>Weeks 1 to 3:</B> Establish your current comfortable weekly mileage. Don't push. Just run what feels sustainable.</li>
              <li><B>Week 4:</B> Cut volume by 20 to 30 percent. This is a recovery week. Your body doesn't adapt during the hard weeks. It adapts during the rest.</li>
              <li><B>Weeks 5 to 7:</B> Increase from your week 3 total by 10 percent per week. One step at a time.</li>
              <li><B>Week 8:</B> Another recovery week. Same 20 to 30 percent reduction.</li>
              <li><B>Weeks 9 to 11:</B> Resume building from your week 7 total.</li>
              <li><B>Week 12:</B> Recovery week again.</li>
            </ul>
            <p>This three-weeks-up, one-week-down pattern isn't optional. It's the structure. Skipping the recovery weeks is the single most common way runners end up injured right when they were making real progress.</p>

            <H2 id="long-run">Add one long run, not three medium ones</H2>
            <p>When runners want more mileage, they often spread it across every day of the week. That approach keeps each run short but keeps your body in a constant state of low-level stress with no real recovery window.</p>
            <p>A better approach: keep most of your runs at their current length and add one longer run per week. That long run does most of the physiological work. It builds your aerobic base and prepares your legs for sustained effort.</p>
            <p>The rest of your runs stay shorter and easier. They maintain frequency without adding load.</p>
            <H3>How long is "long"?</H3>
            <p>For most recreational runners, the long run is 30 to 40 percent of your weekly total. If you're running 20 miles a week, your long run might be 7 or 8 miles. You don't need to run 15 miles every weekend to build fitness. You need to run consistently, with one run per week that's meaningfully longer than the others.</p>

            <H2 id="signals">What your body is actually telling you</H2>
            <p>There's a difference between soreness and pain. Knowing which one you're dealing with is the most important skill a runner can develop.</p>
            <p><B>Soreness</B> is diffuse, muscular, and shows up 24 to 48 hours after a hard effort. It fades with movement and is gone within two days. That's normal adaptation.</p>
            <p><B>Pain</B> is sharp, localized, and either gets worse during a run or doesn't go away between runs. That's your body asking you to stop.</p>
            <p>The most common mistake is treating pain like soreness and running through it. Two extra days off now is almost always better than six weeks off in three months.</p>
            <p>If something hurts in the same spot for more than three consecutive runs, take a week off and see a sports medicine doctor or a physical therapist. Don't wait until you can't walk.</p>

            <H2 id="strength">Strength work is not optional</H2>
            <p>Strength training is one of the most reliable ways runners can lower their injury risk, and sports medicine research keeps pointing the same direction.</p>
            <p>You don't need a gym membership or a complicated program. Three sessions per week of 20 minutes each, focused on your glutes, hips, and single-leg stability, will do more to prevent injury than any amount of foam rolling.</p>
            <p>The exercises that matter most:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Single-leg deadlifts</li>
              <li>Hip bridges and glute bridges</li>
              <li>Step-ups</li>
              <li>Calf raises, both straight-leg and bent-knee, to target both the gastrocnemius and soleus</li>
              <li>Side-lying clamshells</li>
            </ul>
            <p>If your glutes are weak, your knees and hips will compensate. That compensation is where IT band syndrome, runner's knee, and hip flexor problems come from. Strengthen the chain and the chain holds. More ideas: <Link to="/resources/cross-training-for-runners" className={link}>Cross-Training for Runners</Link>.</p>

            <H2 id="recovery">Sleep and recovery are part of the training</H2>
            <p>You can't outrun poor sleep. Adaptation happens during rest, not during the run itself. If you're consistently sleeping less than seven hours, you're limiting your ability to absorb the training you're putting in.</p>
            <p>This matters more as mileage goes up. At 15 miles a week, poor sleep is a minor drag. At 35 miles a week, it becomes a real injury risk.</p>
            <p>Hydration matters too. Drink water consistently through the day, not just around runs.</p>

            <H2 id="group">Why running with a group changes your mileage trajectory</H2>
            <p>Solo runners tend to do one of two things: push too hard on days when they feel good, or skip runs entirely when motivation is low. Both patterns make consistent mileage building harder.</p>
            <p>Running with a group solves both problems. A no-drop crew naturally keeps easy days easy. And the social commitment means you show up even on the days you would have talked yourself out of it alone.</p>
            <p>Consistency is the variable that matters most when you're trying to build mileage safely. Not any single run. The cumulative effect of showing up every week, at a pace that doesn't destroy you, over months and years. That's what compounds.</p>
            <p>If you're in Pittsburgh's South Hills and want a low-barrier, no-drop group to run with while you build your base, GRYT Run Club meets every Saturday at 7 AM on the Montour / Peters Trail in McMurray. No pace requirement. No training plan. Just a consistent route with the same crew every week.</p>

            <H2 id="comeback">The comeback runner's specific challenge</H2>
            <p>If you're returning to running after a break, whether that's a year off, a pregnancy, an injury, or just a long stretch where life got in the way, the rules above apply to you with extra weight.</p>
            <p>Your cardiovascular memory is real. You'll feel like your old self faster than your body actually is your old self. The temptation to jump back to your previous mileage is almost universal among comeback runners, and it's how a lot of comeback runners get hurt within the first six weeks.</p>
            <p>Start at 50 percent of where you left off, not 80 percent. Give yourself eight weeks before you try to match your previous volume. The goal in the first two months isn't fitness. It's durability.</p>
            <p>The runners who come back the fastest are the ones who came back the most patiently. That sounds like a contradiction. It isn't.</p>
            <p>For more on what the early weeks of getting back into a running routine actually look like, read <Link to="/resources/more-than-miles" className={link}>More Than Miles</Link> before you lace up for the first time.</p>

            <H2 id="racing">Racing as a mileage anchor</H2>
            <p>Having a race on the calendar is one of the most effective ways to stay consistent with mileage building. It gives your training a direction and a deadline.</p>
            <p>A 10K is a natural anchor for a mileage build. It's long enough to require real preparation but short enough that you can build to it in eight to ten weeks without risking overuse injury. Browse upcoming local options on our <Link to="/races" className={link}>races page</Link>.</p>
            <p>The key is to let the race date drive your structure, not your enthusiasm. Work backward from race day. Build your peak week three to four weeks out. Taper the final two weeks. Don't add miles in the final ten days before a race.</p>

            <H2 id="shoes">A note on shoes and surface</H2>
            <p>Worn-out shoes are a surprisingly common source of injury. Most running shoes are designed for 300 to 500 miles of use. After that, the midsole foam has compressed enough that you're no longer getting the cushioning the shoe was built to provide.</p>
            <p>If you're building mileage and your shoes have more than 400 miles on them, replace them before you start the build, not after your knee starts hurting.</p>
            <p>Surface matters too. Trails and grass are lower impact than asphalt, which is lower impact than concrete. If you have the option to run on softer surfaces, especially on your longer and easier days, take it.</p>

            <H2 id="together">Putting it together</H2>
            <p>Increasing mileage safely isn't complicated. It requires patience, structure, and the willingness to hold back when you feel like you could push. The principles are simple:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Add no more than 10 percent per week</li>
              <li>Build a base before you build volume</li>
              <li>Take a recovery week every fourth week</li>
              <li>Run easy days actually easy</li>
              <li>Add strength work three times a week</li>
              <li>Sleep and hydrate like training depends on it, because it does</li>
              <li>Run with people when you can</li>
            </ul>
            <p>None of these are difficult in isolation. The hard part is doing them consistently, week after week, when motivation fluctuates and life gets in the way.</p>
            <p>That's what a fixed schedule and a crew who expects you at 7 AM actually solves. Not the miles. The showing up.</p>

            <H2 id="faqs">Frequently asked questions</H2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="text-foreground font-bold text-[17px] md:text-[18px] mb-1.5">{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>

            <p className="text-foreground text-lg md:text-xl font-bold mt-12">
              Consistency compounds. Show up the same day, the same place, with the same crew, and the miles take care of themselves. That's the work.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">See Saturday's run →</Link>
            <Link to="/resources" className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-foreground/40 text-foreground hover:border-blue hover:text-foreground/70 transition-colors">Back to Resources</Link>
          </div>
        </div>
        <ShareButtons url={URL} title={TITLE} />
      </article>
      <SiteFooter />
    </main>
  );
}
