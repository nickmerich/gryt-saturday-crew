import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ComparisonPlaybook,
  CompareTable,
  PH2,
  comparisonHead,
  type ComparisonConfig,
} from "@/components/site/ComparisonPlaybook";

const CONFIG: ComparisonConfig = {
  slug: "gryt-vs-parkrun-pittsburgh",
  title: "GRYT Run Club vs parkrun Pittsburgh: Free Saturday Runs · gryt",
  headline: "GRYT Run Club vs parkrun Pittsburgh: Two Free Saturday Mornings",
  description:
    "GRYT Run Club vs Three Rivers Heritage Trail parkrun: a no-drop group run in McMurray at 7 AM or a free timed 5K on the North Shore at 9 AM. Who each one fits.",
  published: "2026-10-29",
  modified: "2026-10-29",
  readTime: "6 MIN READ",
  keywords:
    "GRYT Run Club vs parkrun, parkrun Pittsburgh, Three Rivers Heritage Trail parkrun, free Saturday run Pittsburgh, free 5K Pittsburgh, South Hills run club, McMurray run club, no-drop run club Pittsburgh",
  about: ["GRYT Run Club", "parkrun", "Three Rivers Heritage Trail parkrun", "Pittsburgh running"],
  breadcrumb: "GRYT Run Club vs parkrun Pittsburgh",
  faqs: [
    {
      q: "Is there a parkrun in Pittsburgh?",
      a: "Yes. Three Rivers Heritage Trail parkrun is a free, volunteer-run 5K every Saturday at 9 AM on the North Shore section of the Three Rivers Heritage Trail. You register once with parkrun and bring your barcode to get a time.",
    },
    {
      q: "What's the difference between GRYT Run Club and parkrun?",
      a: "parkrun is a free timed 5K event run by volunteers. GRYT Run Club is a free weekly group run, not a timed event. GRYT meets Saturdays at 7 AM in McMurray on the Montour/Peters Trail, runs roughly four miles out and back, is no-drop, and ends with coffee in the parking lot.",
    },
    {
      q: "Can I do GRYT and parkrun on the same Saturday?",
      a: "The times don't overlap. GRYT starts at 7 AM in McMurray and usually wraps up around 8:15, and parkrun starts at 9 AM on the North Shore. A double is possible if you're ambitious, but most people use one as their weekly anchor and the other as a change of pace.",
    },
    {
      q: "Which is better for beginners or people who aren't fast?",
      a: "Both welcome walkers. parkrun is a 5K with a timer, which some beginners love and some find intimidating. GRYT has no clock and a no-drop rule: the group waits, faster runners loop back, and everyone finishes together. If a timer stresses you out, start with GRYT.",
    },
    {
      q: "Do either cost money?",
      a: "No. Both are free. parkrun asks you to register once online. GRYT asks first-timers to RSVP on grytrunclub.com and sign a short liability waiver.",
    },
    {
      q: "Can I bring a stroller or a dog?",
      a: "parkrun's Three Rivers Heritage Trail course welcomes strollers and one dog on a short, handheld lead, though not both at once. For GRYT's policy on kids, strollers, and dogs, see the GRYT FAQ page.",
    },
  ],
};

const SECTIONS = [
  { id: "parkrun", label: "What parkrun Pittsburgh Is" },
  { id: "gryt", label: "What GRYT Run Club Is" },
  { id: "compare", label: "Side-by-Side" },
  { id: "who-parkrun", label: "Who Should Choose parkrun" },
  { id: "who-gryt", label: "Who Should Choose GRYT" },
  { id: "both", label: "Doing Both" },
];

export const Route = createFileRoute("/resources_/playbooks_/gryt-vs-parkrun-pittsburgh")({
  head: () => comparisonHead(CONFIG),
  component: Page,
});

function Page() {
  return (
    <ComparisonPlaybook
      config={CONFIG}
      sections={SECTIONS}
      quickAnswer={
        <>
          <p>
            Both are free and both happen Saturday morning. Three Rivers Heritage Trail parkrun is a timed 5K at
            9 AM on the North Shore, organized entirely by volunteers. GRYT Run Club is a no-drop group run at 7 AM
            on the Montour/Peters Trail in McMurray, about four miles out and back, with coffee after.
          </p>
          <p>
            Want a weekly time to chase? parkrun. Want a crew in the South Hills that waits for you and knows your
            name? GRYT.
          </p>
        </>
      }
      sourcesNote={
        <>
          parkrun details come from the Three Rivers Heritage Trail parkrun event and course pages on parkrun.us,
          checked October 29, 2026. Confirm on parkrun's site before you go.
        </>
      }
    >
      <p>
        If you search for free Saturday runs in Pittsburgh, two names keep coming up: parkrun and the local run
        clubs. They sound similar. They are not the same thing, and the difference matters for whether you keep
        showing up.
      </p>

      <PH2 id="parkrun">What parkrun Pittsburgh Is</PH2>
      <p>
        parkrun is a global network of free, weekly, timed 5K events. Pittsburgh's is Three Rivers Heritage Trail
        parkrun, every Saturday at 9 AM. The course is an out-and-back on the North Shore section of the trail,
        turning just before the science center and returning to the start. It's all on permanent paths, though
        parts can collect mud, leaves, and puddles after rain.
      </p>
      <p>
        You register with parkrun once, print or save your barcode, and get scanned at the finish. No barcode, no
        time. Volunteers run everything. Strollers are welcome, and you can bring one dog on a short handheld lead.
        Parking right at the start is limited, so plan on street parking or a nearby trail lot.
      </p>

      <PH2 id="gryt">What GRYT Run Club Is</PH2>
      <p>
        GRYT Run Club is a free community run club in Pittsburgh's South Hills, founded by Laura and Nick Merich.
        The crew meets every Saturday at 7 AM at 212 Valley Brook Road in McMurray and runs the Montour/Peters
        Trail, a flat, paved rail trail. The route is roughly four miles out and back. Walk, jog, or run.
      </p>
      <p>
        There's no clock and no results list. GRYT is no-drop, so the run ends when the last person finishes, not
        the first. After the run, people hang out in the parking lot with coffee. First-timers RSVP on the site and
        sign a quick waiver, and a founder or regular will find you before the start.
      </p>
      <p>
        GRYT tracks something different from finish times: showing up. The{" "}
        <Link to="/milestones" className="underline hover:text-blue">
          GRYT Milestone Club
        </Link>{" "}
        recognizes 5, 10, 25, 50, and 100 Saturdays, and walking counts.
      </p>

      <PH2 id="compare">Side-by-Side</PH2>
      <CompareTable
        left="parkrun (Three Rivers Heritage Trail)"
        right="GRYT Run Club"
        rows={[
          ["Cost", "Free", "Free"],
          ["When", "Saturday 9:00 AM", "Saturday 7:00 AM"],
          ["Where", "North Shore, Three Rivers Heritage Trail", "McMurray, Montour/Peters Trail"],
          ["Distance", "5K, out and back", "About 4 miles, out and back; turn early anytime"],
          ["Format", "Timed event with barcode results", "Group run, no clock"],
          ["Pace policy", "Run or walk at your pace", "No-drop: the group waits"],
          ["Sign-up", "Register once with parkrun", "RSVP + waiver before your first run"],
          ["Organized by", "Volunteers", "Founders Laura and Nick Merich and the crew"],
          ["After", "Suggested coffee at PA Market, Strip District", "Coffee in the parking lot"],
        ]}
      />

      <PH2 id="who-parkrun">Who Should Choose parkrun</PH2>
      <ul className="list-disc pl-6 space-y-1">
        <li>You want a weekly 5K time to track and improve</li>
        <li>You live in or near the city and 9 AM works for you</li>
        <li>You like the idea of volunteering some weeks and running others</li>
        <li>You travel and want the same free format in other cities</li>
      </ul>

      <PH2 id="who-gryt">Who Should Choose GRYT</PH2>
      <ul className="list-disc pl-6 space-y-1">
        <li>You live in McMurray, Peters Township, Canonsburg, Upper St. Clair, Bethel Park, or Washington County</li>
        <li>A timer makes you anxious and you'd rather just run with people</li>
        <li>You want to be done early and have the rest of Saturday back</li>
        <li>You're coming back after a long break and want a no-drop group that won't judge your pace</li>
        <li>You want the same faces every week, not a new crowd</li>
      </ul>

      <PH2 id="both">Doing Both</PH2>
      <p>
        They don't compete. Some runners use GRYT as the weekly anchor and hit parkrun on a week they want a time
        check. Others race parkrun most weeks and join GRYT when they want an easy, social run. If you're training
        for something specific, the{" "}
        <Link to="/plan" className="underline hover:text-blue">
          GRYT run plan builder
        </Link>{" "}
        fits your week around the Saturday run, and the{" "}
        <Link to="/resources/pace-calculator" className="underline hover:text-blue">
          pace calculator
        </Link>{" "}
        turns a parkrun 5K into predicted times for longer races.
      </p>
      <p>
        Looking at other options too? Read{" "}
        <Link to="/resources/playbooks/best-free-running-clubs-pittsburgh-2026" className="underline hover:text-blue">
          the best free running clubs in Pittsburgh
        </Link>{" "}
        and{" "}
        <Link to="/resources/playbooks/best-free-run-clubs-south-hills-2026" className="underline hover:text-blue">
          the South Hills guide
        </Link>
        .
      </p>
    </ComparisonPlaybook>
  );
}
