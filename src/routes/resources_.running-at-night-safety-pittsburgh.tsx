import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { ShareButtons } from "@/components/site/ShareButtons";
import heroAsset from "@/assets/hero-night-run.png.asset.json";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/running-at-night-safety-pittsburgh`;
const HERO = `${SITE}${heroAsset.url}`;
const TITLE = "Running at Night: How to Stay Safe on Evening Runs in Pittsburgh · gryt";
const DESCRIPTION =
  "Night running safety for Pittsburgh and the South Hills: headlamps, reflective gear, route choice, fog, wet leaves, ice, and why running with a group helps.";
const PUBLISHED = "2026-09-24";

const SECTIONS = [
  { id: "rules", label: "Why Pittsburgh night running has its own rules" },
  { id: "gear", label: "The gear that actually matters" },
  { id: "routes", label: "Route selection for South Hills runners" },
  { id: "visibility", label: "Visibility: being seen is more important than seeing" },
  { id: "group", label: "Running with a group" },
  { id: "weather", label: "Weather and seasonal conditions" },
  { id: "tell", label: "What to tell someone before you go" },
  { id: "habit", label: "Building the habit, not just the checklist" },
  { id: "checklist", label: "Night running safety checklist" },
  { id: "faqs", label: "Frequently asked questions" },
];

const FAQS: Array<{ q: string; a: string }> = [
  { q: "Is it safe to run alone at night in Pittsburgh's South Hills?", a: "It depends on the route and your preparation. Trails are generally safer than unlit roads, but solo night running always carries more risk than running with a group. Bring a headlamp, wear reflective gear, share your route, and stick to familiar paths. Running with a crew removes much of that risk." },
  { q: "What gear do I need for night running on Pittsburgh trails?", a: "At minimum: a headlamp with at least 200 lumens, a reflective vest or jacket, and a rear flashing light. A charged phone with your route loaded is also standard." },
  { q: "When does it get dark enough in Pittsburgh to need a headlamp?", a: "By late September, sunset is before 7:30 PM. By November, it's closer to 5 PM. If you're running after work, plan for full darkness from fall onward." },
  { q: "Are Pittsburgh trails safe to run at night?", a: "Trails with regular foot traffic are generally safer than roads because you're separated from vehicle traffic. The main hazards are wet leaves, uneven footing, and sections that are genuinely dark. Know the route in daylight before you run it at night." },
  { q: "What should I do if I run into icy conditions mid-run?", a: "Shorten your stride, slow down, and move toward the center of the trail where ice is less likely to have formed. If you're uncertain about footing, turn around and take the shortest route back. No training run is worth a fall on ice." },
  { q: "Does running in a group actually make night running safer?", a: "Yes, in several concrete ways. A group is more visible to drivers than a solo runner. If someone goes down, help is right there. A no-drop policy means no one is isolated at the back of the pack. And the structure of a regular group makes preparation more consistent: you're not deciding whether to gear up, you're just showing up ready." },
  { q: "How do I find other runners in Pittsburgh's South Hills?", a: "GRYT Run Club runs every Saturday at 7 AM from the Peterswood Park lot, 212 Valley Brook Road in McMurray. It's free, no-drop, with no pace requirement. RSVP at grytrunclub.com." },
];

export const Route = createFileRoute("/resources_/running-at-night-safety-pittsburgh")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "running at night safety, night running Pittsburgh, headlamp running, reflective gear, South Hills running, winter running Pittsburgh, run club McMurray" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: HERO },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:author", content: "Nick Merich" },
      { property: "article:section", content: "Safety" },
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
          headline: "Running at Night: How to Stay Safe on Evening Runs in Pittsburgh",
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
            { "@type": "ListItem", position: 2, name: "Running at Night Safety", item: URL },
          ],
        }),
      },
    ],
  }),
  component: NightRunPage,
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="text-2xl md:text-3xl font-bold mt-12 mb-2 scroll-mt-24">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-paper font-bold text-[18px] md:text-[20px] mt-8 mb-1.5">{children}</h3>;
}
const link = "text-blue underline underline-offset-4 hover:text-paper transition-colors";

function NightRunPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <article className="px-6 sm:px-12 lg:px-24 py-14 md:py-20 border-b border-paper/15">
        <div className="max-w-[760px] mx-auto">
          <Link to="/resources" className="eyebrow text-blue hover:text-paper transition-colors">← All resources</Link>
          <p className="eyebrow text-blue mt-8 mb-5">SAFETY · 8 MIN READ</p>
          <h1 className="display-condensed uppercase text-[clamp(40px,7vw,96px)] leading-[0.95]">
            Running at Night: How to Stay Safe on Evening Runs in Pittsburgh
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl leading-[1.55]">
            Gear up. Know the route. Tell someone where you're going.
          </p>

          <figure className="mt-10 border border-paper/15">
            <img src={heroAsset.url} alt="Runner on a dark path at night" loading="eager" className="w-full h-auto" />
          </figure>

          <nav aria-label="Table of contents" className="mt-10 border border-paper/15 p-5">
            <p className="eyebrow text-paper/55 mb-3">In this guide</p>
            <ul className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="text-paper/80 hover:text-blue transition-colors text-[15px]">→ {s.label}</a></li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-5 text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">
            <p>Running at night in Pittsburgh is its own thing. The hills are steeper than they look on a map. The neighborhoods shift fast. And if you're on a trail south of the city, darkness comes early and comes hard. Night running safety isn't a checklist you print once and forget. It's a set of habits you build until they're automatic.</p>
            <p>This guide covers what actually matters for evening runs in Pittsburgh: gear, route selection, and the specific conditions South Hills runners deal with.</p>

            <H2 id="rules">Why Pittsburgh night running has its own rules</H2>
            <p>Pittsburgh's terrain punishes inattention. The South Hills, from Peters Township and Bethel Park to Mt. Lebanon and Canonsburg, are full of roads with no shoulders, trail sections that go dark fast, and intersections where drivers aren't expecting a runner.</p>
            <p>Then there's the seasonal reality. By late September, the sun sets before 7:30 PM. By November, it's dark by 5. If you run after work, you're running in the dark whether you planned for it or not.</p>
            <p>That's not a reason to stay inside. It's a reason to prepare correctly.</p>

            <H2 id="gear">The gear that actually matters</H2>
            <H3>A headlamp, not a handheld flashlight</H3>
            <p>A headlamp keeps your hands free and points light where your eyes go. On trails, that's non-negotiable. You need to see roots, wet leaves, and grade changes before your foot lands on them, not after.</p>
            <p>Look for at least 200 lumens for trail use, plus a red rear light mode. The rear light is for drivers. The front is for you.</p>
            <H3>Reflective gear that works at distance</H3>
            <p>A reflective strip on your shoe isn't enough. Drivers need to see you from 300 feet away, which means reflective material on your torso, not just your extremities. A reflective vest over your shirt is the simplest fix. Five seconds to put on.</p>
            <H3>A charged phone with your route loaded</H3>
            <p>Not for music. For navigation and emergency contact. Before you leave, share your route with someone. A quick text like "Montour Trail, back by 7" takes ten seconds and matters if something goes wrong.</p>

            <H2 id="routes">Route selection for South Hills runners</H2>
            <H3>Run new routes in daylight first</H3>
            <p>A trail that looks simple at 7 AM looks completely different at 9 PM. Run any new route in daylight first so you know where the grades change, where the trail narrows, and where the road crossings are. Then run it at night. Familiarity is a safety feature.</p>
            <H3>Avoid high-traffic roads with no shoulder</H3>
            <p>South Hills roads like Route 19 and portions of Bower Hill Road are not safe for night running. No amount of reflective gear makes up for a 45 mph road with no buffer. Use the trail network. If you have to run on roads, pick residential streets with sidewalks.</p>
            <H3>Know your exit points</H3>
            <p>On a 4-mile loop, you should know at least two places where you can cut the run short and reach a lit, accessible area. This matters if you roll an ankle, the weather changes, or your headlamp dies.</p>

            <H2 id="visibility">Visibility: being seen is more important than seeing</H2>
            <p>Many night running accidents involve a runner who assumed a driver saw them. Drivers often don't, especially on unlit suburban roads.</p>
            <p>The fix is simple: run toward traffic on roads, not with it. You see the car coming. The driver sees your reflective gear. You both have more time to react.</p>
            <p>On trails this is less relevant, but the principle holds. Don't assume anyone else knows you're there.</p>
            <p>Flashing rear lights are more visible than steady ones. If your light has a strobe mode, use it at road crossings.</p>

            <H2 id="group">Running with a group</H2>
            <p>This is the honest answer to most safety concerns: run with other people.</p>
            <p>A group is visible from a distance. You're louder, you take up more of the path, and if someone goes down, help is immediate. GRYT's no-drop policy means no one is left alone at the back of the pack. Every runner finishes with the crew.</p>
            <p>The same social accountability that gets you out the door is also what keeps you safe once you're out there. If you want a consistent group in the South Hills, GRYT runs every Saturday at 7 AM from the Peterswood Park lot on the Montour / Peters Trail in McMurray. Free, no pace requirement. Details are on the <Link to="/" hash="join" className={link}>homepage</Link>.</p>

            <H2 id="weather">Weather and seasonal conditions in Pittsburgh</H2>
            <H3>Fall and winter fog</H3>
            <p>Pittsburgh's river valleys create fog that rolls in fast. A clear evening can turn into a fog bank within the hour. Fog cuts how far drivers can see you, which means your reflective gear needs to work harder, not just be present.</p>
            <p>In heavy fog, shorten your route. Get back to a lit area sooner. This is not the night to push mileage.</p>
            <H3>Wet leaves on trails</H3>
            <p>From late September through November, wet leaves on trails are genuinely dangerous. They compress under your foot and slide. Slow down on descents. Shorten your stride on any section you can't see clearly.</p>
            <H3>Ice</H3>
            <p>By December, trail surfaces in the South Hills can ice overnight. A headlamp will show you ice on pavement. On packed dirt, it's harder to spot. If temperatures dropped below freezing the night before, assume there's ice on shaded sections until you've confirmed otherwise.</p>

            <H2 id="tell">What to tell someone before you go</H2>
            <p>This is the part most runners skip. Before every night run, tell someone:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where you're starting</li>
              <li>Your route or approximate area</li>
              <li>When you expect to be back</li>
              <li>Who to call if they don't hear from you by a specific time</li>
            </ul>
            <p>Running solo? Set a timer on your phone to remind you to check in. Running with a group? Make sure at least one person not on the run knows where you are.</p>

            <H2 id="habit">Building the habit, not just the checklist</H2>
            <p>The runners who stay safe at night aren't the ones who read a safety article once. They're the ones who put on the reflective vest every single time without thinking about it. The headlamp goes in the bag the night before. The route gets shared before they leave the parking lot.</p>
            <p>Consistency compounds. The habit of preparing correctly protects you more than any single piece of gear.</p>
            <p>That's also why running with a regular crew matters. When you know people are expecting you, preparation becomes part of the ritual. If you want to see what that looks like over time, <Link to="/resources/more-than-miles" className={link}>More Than Miles</Link> gets into what happens when a small crew shows up consistently. And if you're newer to Pittsburgh's running scene, the <Link to="/resources/playbooks/best-free-running-clubs-pittsburgh-2026" className={link}>best free running clubs in Pittsburgh for 2026</Link> is a useful place to start.</p>

            <H2 id="checklist">Night running safety checklist</H2>
            <p>Use this before every evening run:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Headlamp charged and tested</li>
              <li>Reflective vest or jacket on</li>
              <li>Rear flashing light attached</li>
              <li>Route shared with someone</li>
              <li>Phone charged and route loaded</li>
              <li>Expected return time communicated</li>
              <li>Weather checked (fog, rain, temperature)</li>
              <li>Trail conditions noted (wet leaves, ice risk)</li>
            </ul>
            <p className="border-l-2 border-blue pl-5 italic text-paper/90">Eight items. Two minutes. Every time.</p>

            <H2 id="faqs">Frequently asked questions</H2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="text-paper font-bold text-[17px] md:text-[18px] mb-1.5">{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>

            <p className="text-paper text-lg md:text-xl font-bold mt-12">
              Gear up. Know the route. Tell someone where you're going. Show up with people when you can. That's it. Everything else is just running.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link to="/" hash="join" className="btn-primary">See Saturday's run →</Link>
            <Link to="/resources" className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors">Back to Resources</Link>
          </div>
        </div>
        <ShareButtons url={URL} title={TITLE} />
      </article>
      <SiteFooter />
    </main>
  );
}
