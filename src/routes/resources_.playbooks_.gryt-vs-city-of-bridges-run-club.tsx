import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ComparisonPlaybook,
  CompareTable,
  PH2,
  comparisonHead,
  type ComparisonConfig,
} from "@/components/site/ComparisonPlaybook";

const CONFIG: ComparisonConfig = {
  slug: "gryt-vs-city-of-bridges-run-club",
  title: "GRYT Run Club vs City of Bridges Run Club (CBRC) · gryt",
  headline: "GRYT Run Club vs City of Bridges Run Club: Which Fits Your Week?",
  description:
    "GRYT Run Club vs City of Bridges Run Club: schedules, cost, South Hills runs, pace groups, and how to stay motivated with a free Pittsburgh run club.",
  published: "2026-10-29",
  modified: "2026-10-29",
  readTime: "7 MIN READ",
  keywords:
    "GRYT Run Club vs City of Bridges Run Club, City of Bridges Run Club, CBRC Pittsburgh, CBRC South Hills group run, free run club Pittsburgh, South Hills run club, McMurray run club, stay motivated running Pittsburgh",
  about: ["GRYT Run Club", "City of Bridges Run Club", "Pittsburgh running"],
  breadcrumb: "GRYT Run Club vs City of Bridges Run Club",
  faqs: [
    {
      q: "Is City of Bridges Run Club free?",
      a: "CBRC says all of its runs are free and open to all, and it asks runners to register for each run. An optional adult membership is $55 a year and includes a member shirt, local race and business discounts, access to certified coaches, and training plans.",
    },
    {
      q: "Does City of Bridges Run Club run in the South Hills?",
      a: "Yes. CBRC lists a Thursday 6:30 PM South Hills Group Run that rotates between spots such as Mt. Lebanon, Castle Shannon, the Galleria, and Carnegie. Its Saturday 8 AM run rotates around city neighborhoods.",
    },
    {
      q: "What's the difference between GRYT Run Club and City of Bridges Run Club?",
      a: "CBRC is a larger volunteer nonprofit with runs most days of the week, rotating locations, pace groups, and certified coaches. GRYT is one free run, every Saturday at 7 AM, at the same place in McMurray on the Montour/Peters Trail, with a no-drop rule and coffee after.",
    },
    {
      q: "How do you stay motivated running with a free community group in Pittsburgh?",
      a: "Pick one fixed run close to home, tell someone you'll be there, and count showing up instead of pace. A no-drop group keeps a slow day from turning into a solo run. GRYT recognizes 5, 10, 25, 50, and 100 Saturdays, and walking counts.",
    },
    {
      q: "Can I run with both CBRC and GRYT?",
      a: "Yes. CBRC's South Hills run is Thursday evening and its Saturday run starts at 8 AM in the city. GRYT is Saturday at 7 AM in McMurray. A Thursday CBRC run plus a Saturday GRYT run is an easy two-run week with community on both days.",
    },
  ],
};

const SECTIONS = [
  { id: "cbrc", label: "What City of Bridges Run Club Is" },
  { id: "gryt", label: "What GRYT Run Club Is" },
  { id: "compare", label: "Side-by-Side" },
  { id: "motivation", label: "Staying Motivated With a Free Club" },
  { id: "who", label: "Who Each Club Fits" },
  { id: "both", label: "Running With Both" },
];

export const Route = createFileRoute("/resources_/playbooks_/gryt-vs-city-of-bridges-run-club")({
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
            Both are free to run with. City of Bridges Run Club (CBRC) is a volunteer nonprofit with runs most days
            of the week at rotating Pittsburgh spots, pace groups, certified coaches, and an optional $55 yearly
            membership. GRYT Run Club is one run, every Saturday at 7 AM, at the same trailhead in McMurray, with a
            no-drop rule and coffee after.
          </p>
          <p>
            Want lots of options and pace groups? CBRC. Want one fixed Saturday ritual in the South Hills? GRYT. A
            Thursday CBRC South Hills run plus Saturday GRYT is a great combo.
          </p>
        </>
      }
      sourcesNote={
        <>
          City of Bridges details come from cityofbridgesrunclub.com (home, Join, and Group Runs pages), checked
          October 29, 2026. Locations rotate, so check CBRC's calendar before you go.
        </>
      }
    >
      <p>
        Pittsburgh has more free running groups than most people realize. Two that come up a lot for South Hills
        runners are City of Bridges Run Club and GRYT. They're built differently, and the right one depends on
        which days you can actually protect.
      </p>

      <PH2 id="cbrc">What City of Bridges Run Club Is</PH2>
      <p>
        CBRC is an all-volunteer 501(c)(3) nonprofit and a member of the Road Runners Club of America. Its coaches
        are RRCA- and USATF-certified, and the club welcomes everyone from first-5K runners to people chasing their
        twentieth marathon.
      </p>
      <p>The weekly lineup on CBRC's Group Runs page looks like this:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Monday Track Attack, Schenley Oval, 6:30 PM</li>
        <li>Tuesday Robinson Group Run, rotating spots, 6:30 PM</li>
        <li>Wednesday City Area Run, rotating neighborhoods, 6:30 PM</li>
        <li>Thursday South Hills Group Run, rotating spots like Mt. Lebanon, Castle Shannon, and Carnegie, 6:30 PM</li>
        <li>Saturday Group Run, rotating city locations, 8:00 AM</li>
      </ul>
      <p>
        CBRC says all runs are free and open to all, and asks you to register. The optional $55 adult membership
        adds a shirt, race and business discounts, coach access, and training plans.
      </p>

      <PH2 id="gryt">What GRYT Run Club Is</PH2>
      <p>
        GRYT Run Club is a free community run club in Pittsburgh's South Hills, founded by Laura and Nick Merich.
        It does one thing on purpose: every Saturday at 7 AM at 212 Valley Brook Road in McMurray, the crew runs
        the Montour/Peters Trail, a flat, paved rail trail, roughly four miles out and back.
      </p>
      <p>
        Walk, jog, or run. GRYT is no-drop, so nobody finishes alone. There's no membership, no fee, and no
        rotating location to look up. First-timers RSVP on the site and sign a short waiver. After the run, people
        stick around the parking lot with coffee.
      </p>

      <PH2 id="compare">Side-by-Side</PH2>
      <CompareTable
        left="City of Bridges Run Club"
        right="GRYT Run Club"
        rows={[
          ["Cost", "Runs free (register); optional $55/yr membership", "Free, no membership"],
          ["Schedule", "Mon to Thu evenings + Saturday 8 AM", "Saturday 7 AM, every week"],
          ["Location", "Rotates around the city and suburbs", "Same place: 212 Valley Brook Rd, McMurray"],
          ["South Hills", "Thursday 6:30 PM, rotating spots", "Home base every Saturday"],
          ["Pace", "Pace groups on bigger runs", "No-drop, walkers welcome"],
          ["Coaching", "RRCA/USATF-certified coaches, training plans for members", "Peer-led, no coaching program"],
          ["Organization", "All-volunteer 501(c)(3), RRCA member", "Founder-led community club"],
        ]}
      />

      <PH2 id="motivation">Staying Motivated With a Free Club</PH2>
      <p>
        Free is great until a cold Saturday when nothing is pulling you out of bed. The runners who stick with a
        free group usually do a few simple things:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong className="text-paper">Protect one run.</strong> More options can mean more decisions. Pick the
          one run you'll never skip. For a lot of South Hills families, that's Saturday at 7 AM.
        </li>
        <li>
          <strong className="text-paper">Make it the same place.</strong> A fixed trailhead removes the "where is
          it this week?" step. That small friction is where habits break.
        </li>
        <li>
          <strong className="text-paper">Count Saturdays, not splits.</strong> GRYT's{" "}
          <Link to="/milestones" className="underline hover:text-blue">
            Milestone Club
          </Link>{" "}
          marks 5, 10, 25, 50, and 100 Saturdays. Walking counts.
        </li>
        <li>
          <strong className="text-paper">Run no-drop.</strong> If a bad day means finishing alone, you'll stop
          coming. No-drop fixes that.
        </li>
        <li>
          <strong className="text-paper">Add a second run with a different club.</strong> A weeknight group like
          CBRC's Thursday South Hills run gives you a midweek reason to lace up.
        </li>
      </ul>

      <PH2 id="who">Who Each Club Fits</PH2>
      <p>
        <strong className="text-paper">Choose CBRC if</strong> you want several group runs a week, track workouts,
        pace groups, or access to certified coaches, and you don't mind checking where each run starts.
      </p>
      <p>
        <strong className="text-paper">Choose GRYT if</strong> you're in McMurray, Peters Township, Canonsburg,
        Upper St. Clair, Bethel Park, or Washington County, Saturday morning is your window, and you want the same
        place, same time, same people every week, with no one getting dropped.
      </p>

      <PH2 id="both">Running With Both</PH2>
      <p>
        The schedules fit together. Thursday evening with CBRC in the South Hills and Saturday morning with GRYT
        is a two-run week with community on both ends. If you're building toward a race, the{" "}
        <Link to="/plan" className="underline hover:text-blue">
          GRYT run plan builder
        </Link>{" "}
        fills in the rest of the week, and the{" "}
        <Link to="/races" className="underline hover:text-blue">
          races page
        </Link>{" "}
        keeps verified dates for upcoming Pittsburgh races.
      </p>
      <p>
        Comparing more options? Read{" "}
        <Link to="/resources/playbooks/best-free-run-clubs-south-hills-2026" className="underline hover:text-blue">
          the South Hills run club guide
        </Link>{" "}
        and{" "}
        <Link to="/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs" className="underline hover:text-blue">
          GRYT vs Fleet Feet Pittsburgh
        </Link>
        .
      </p>
    </ComparisonPlaybook>
  );
}
