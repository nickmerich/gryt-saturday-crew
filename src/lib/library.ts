/**
 * GRYT Runner Library catalog.
 *
 * One source of truth for every runner-facing guide and tool on the site.
 * The Resources hub, the homepage "Here to learn" doorway, and the
 * start-here paths all read from this list, so adding a guide means
 * adding one entry here.
 */

export type Topic =
  | "first-run"
  | "training"
  | "racing"
  | "safety"
  | "fuel"
  | "community";

export type LibraryKind = "guide" | "tool" | "story";

export type LibraryEntry = {
  id: string;
  title: string;
  summary: string;
  /** Router path. */
  to: string;
  /** Optional in-page anchor. */
  hash?: string;
  topic: Topic;
  kind: LibraryKind;
  /** Minutes to read, or undefined for tools. */
  minutes?: number;
  /** Last reviewed date (YYYY-MM-DD). */
  updated: string;
  /** Season-sensitive entries float to the top when in season. */
  seasonal?: "cold" | "fall-race";
};

export const TOPICS: Array<{ id: Topic | "all"; label: string }> = [
  { id: "all", label: "Everything" },
  { id: "first-run", label: "Your first run" },
  { id: "training", label: "Training" },
  { id: "racing", label: "Racing" },
  { id: "safety", label: "Safety & weather" },
  { id: "fuel", label: "Fuel & recovery" },
  { id: "community", label: "Community & local" },
];

export const LIBRARY: LibraryEntry[] = [
  // ── Tools ───────────────────────────────────────────────
  {
    id: "pace-calculator",
    title: "Pace, Effort & Race Time Calculator",
    summary:
      "Convert any run into pace per mile and per kilometer, predict your 5K to marathon times, and learn what easy actually feels like.",
    to: "/resources/pace-calculator",
    topic: "training",
    kind: "tool",
    updated: "2026-10-20",
  },
  {
    id: "what-to-wear",
    title: "What to Wear Running in Pittsburgh, by Temperature",
    summary:
      "Enter the temperature, wind, and conditions. Get a head-to-toe layering list for South Hills mornings, from humid July to icy January.",
    to: "/resources/what-to-wear-running",
    topic: "safety",
    kind: "tool",
    updated: "2026-10-20",
    seasonal: "cold",
  },
  {
    id: "run-plan",
    title: "Build Your Run Plan",
    summary:
      "A free week-by-week plan built around your goal and the Saturday group run.",
    to: "/plan",
    topic: "training",
    kind: "tool",
    updated: "2026-10-01",
  },
  {
    id: "race-calendar",
    title: "Pittsburgh Race Calendar",
    summary:
      "The local races worth circling, with dates, distances, and how many weeks you have left to train.",
    to: "/races",
    topic: "racing",
    kind: "tool",
    updated: "2026-10-20",
  },
  {
    id: "recap",
    title: "Run Recap Graphic Maker",
    summary: "Turn today's run into a shareable graphic. Free, no signup.",
    to: "/resources/recap",
    topic: "community",
    kind: "tool",
    updated: "2026-09-01",
  },

  {
    id: "milestones",
    title: "The GRYT Milestone Club",
    summary:
      "Five, ten, 25, 50, and 100 Saturdays. Check your own count privately and make a shareable milestone graphic.",
    to: "/milestones",
    topic: "community",
    kind: "tool",
    updated: "2026-10-20",
  },
  {
    id: "run-reports",
    title: "Weekly Run Reports",
    summary:
      "Every Saturday, counted: who showed up, who was new, who came back, and who hit a milestone.",
    to: "/runs",
    topic: "community",
    kind: "story",
    updated: "2026-10-20",
  },

  // ── First run ──────────────────────────────────────────
  {
    id: "saturday-what-to-expect",
    title: "Saturday Runs: What to Expect at Your First GRYT Run",
    summary:
      "Where to park, when to show up, how the no-drop format works, what to bring, and where coffee happens after.",
    to: "/resources/playbooks/saturday-runs-what-to-expect",
    topic: "first-run",
    kind: "guide",
    minutes: 7,
    updated: "2026-09-24",
  },
  {
    id: "winter-durability-plan",
    title: "Built for Winter: 12-Week Durability Plan",
    summary:
      "A free 12-week strength and running plan to get stronger, not slower, this winter. Download included.",
    to: "/resources/playbooks/winter-durability-plan",
    topic: "training",
    kind: "guide",
    minutes: 6,
    updated: "2026-10-22",
    seasonal: "cold",
  },
  {
    id: "articles",
    title: "Running Articles: Training, Gear, Racing & Clubs",
    summary:
      "Fact-checked guides on 5K to half marathon plans, easy pace, hills, shoes, socks, watches, apps, race day, and finding a run club near you.",
    to: "/resources/articles",
    topic: "training",
    kind: "guide",
    minutes: 5,
    updated: "2026-10-29",
  },
  {
    id: "should-you-join",
    title: "Should You Join a Running Club? An Honest Answer",
    summary:
      "Am I too slow? Do I have to talk? What does it cost? Straight answers to the questions people ask before showing up.",
    to: "/resources/should-you-join-a-running-club",
    topic: "first-run",
    kind: "guide",
    minutes: 6,
    updated: "2026-08-31",
  },
  {
    id: "running-with-a-group",
    title: "Running With a Group: Why It Makes You Faster and Less Likely to Quit",
    summary:
      "Social facilitation, no-drop crews, and why expectation beats motivation every Saturday at 7 AM.",
    to: "/resources/running-with-a-group",
    topic: "first-run",
    kind: "guide",
    minutes: 6,
    updated: "2026-08-28",
  },
  {
    id: "find-a-club",
    title: "How to Find a Running Club That Actually Fits Your Life",
    summary:
      "Schedule, pace, cost, post-run culture, and the red flags to watch for when you pick a crew.",
    to: "/resources/playbooks",
    hash: "find-a-running-club",
    topic: "first-run",
    kind: "guide",
    minutes: 8,
    updated: "2026-09-01",
  },

  // ── Training ───────────────────────────────────────────
  {
    id: "build-a-base",
    title: "How to Build a Running Base Before Your First Race",
    summary:
      "How long it takes, how many days a week, what easy pace feels like, and how you know you're ready for a plan.",
    to: "/resources/build-a-running-base",
    topic: "training",
    kind: "guide",
    minutes: 8,
    updated: "2026-08-31",
  },
  {
    id: "increase-mileage",
    title: "How to Increase Running Mileage Without Getting Injured",
    summary:
      "The 10 percent rule, recovery weeks, easy pace, long runs, strength work, and sleep.",
    to: "/resources/increase-running-mileage-without-injury",
    topic: "training",
    kind: "guide",
    minutes: 10,
    updated: "2026-09-24",
  },
  {
    id: "comeback-runner",
    title: "The Comeback Runner's Guide",
    summary:
      "For former athletes returning to endurance sport: mindset resets, training principles, and what actually matters.",
    to: "/resources/playbooks",
    hash: "comeback-runner",
    topic: "training",
    kind: "guide",
    minutes: 10,
    updated: "2026-09-01",
  },
  {
    id: "consistency",
    title: "Consistency Over Intensity: The Saturday System",
    summary:
      "Why showing up at the same time every week changes how you see yourself as a runner.",
    to: "/resources/playbooks",
    hash: "saturday-system",
    topic: "training",
    kind: "guide",
    minutes: 8,
    updated: "2026-09-01",
  },
  {
    id: "cross-training",
    title: "Cross-Training for Runners: Best Low-Impact Options",
    summary:
      "Cycling, swimming, elliptical, strength, yoga, hiking, and rowing, and how to fit them into a real running week.",
    to: "/resources/cross-training-for-runners",
    topic: "training",
    kind: "guide",
    minutes: 9,
    updated: "2026-08-31",
  },

  // ── Racing ─────────────────────────────────────────────
  {
    id: "eqt-10-miler",
    title: "EQT Pittsburgh 10 Miler 2026: Race Guide and Training Tips",
    summary:
      "Course terrain, hill work, pacing targets, and race-day logistics for Sunday, November 8.",
    to: "/resources/eqt-pittsburgh-10-miler-2026",
    topic: "racing",
    kind: "guide",
    minutes: 7,
    updated: "2026-10-20",
    seasonal: "fall-race",
  },

  // ── Safety & weather ───────────────────────────────────
  {
    id: "night-running",
    title: "Running at Night: How to Stay Safe on Evening Runs in Pittsburgh",
    summary:
      "Headlamps, reflective gear, route choice, fog, wet leaves, ice, and why running with a group helps.",
    to: "/resources/running-at-night-safety-pittsburgh",
    topic: "safety",
    kind: "guide",
    minutes: 8,
    updated: "2026-09-24",
    seasonal: "cold",
  },

  // ── Fuel & recovery ────────────────────────────────────
  {
    id: "what-to-eat",
    title: "What to Eat Before a Run: Timing and Portions",
    summary:
      "How long before a run to eat, portion sizes, foods that hold up, foods that cause problems, and what to eat after.",
    to: "/resources/what-to-eat-before-a-run",
    topic: "fuel",
    kind: "guide",
    minutes: 7,
    updated: "2026-08-31",
  },

  // ── Community & local ──────────────────────────────────
  {
    id: "more-than-miles",
    title: "More Than Miles: 5 Things You Wouldn't Guess From the Parking Lot",
    summary:
      "A Boston-standard marathoner waiting for the last runner, a 64-minute PR in 23 weeks, and route maps drawn by a real cartographer.",
    to: "/resources/more-than-miles",
    topic: "community",
    kind: "story",
    minutes: 6,
    updated: "2026-07-27",
  },
  {
    id: "south-hills-clubs",
    title: "Best Free Run Clubs in the South Hills (2026)",
    summary:
      "Cost, schedule, and drop policy compared for free run clubs south of the city.",
    to: "/resources/playbooks/best-free-run-clubs-south-hills-2026",
    topic: "community",
    kind: "guide",
    minutes: 8,
    updated: "2026-11-10",
  },
  {
    id: "pittsburgh-clubs",
    title: "Pittsburgh's Free Running Clubs in 2026",
    summary: "Who each club is for and when they meet, across the whole city.",
    to: "/resources/playbooks/best-free-running-clubs-pittsburgh-2026",
    topic: "community",
    kind: "guide",
    minutes: 9,
    updated: "2026-11-10",
  },
  {
    id: "fleet-feet-vs-independent",
    title: "Fleet Feet Pittsburgh vs. Independent Run Clubs",
    summary:
      "Store groups, independent crews, and where GRYT fits for South Hills and Washington County runners.",
    to: "/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs",
    topic: "community",
    kind: "guide",
    minutes: 9,
    updated: "2026-11-10",
  },
  {
    id: "start-a-club",
    title: "How to Start a Run Club From Zero",
    summary:
      "The playbook Nick used to launch GRYT: one location, one time, the first ten members, and keeping them coming back.",
    to: "/resources/playbooks",
    hash: "start-a-run-club",
    topic: "community",
    kind: "guide",
    minutes: 12,
    updated: "2026-09-01",
  },
  {
    id: "conversations",
    title: "Conversations",
    summary: "Interviews with the founders, members, and partners behind the miles.",
    to: "/resources/conversations",
    topic: "community",
    kind: "story",
    updated: "2026-09-01",
  },
];

export function byId(id: string): LibraryEntry {
  const e = LIBRARY.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown library entry: ${id}`);
  return e;
}

/** Start-here paths, each a short ordered reading list for one kind of visitor. */
export const PATHS: Array<{
  id: string;
  who: string;
  promise: string;
  steps: string[];
}> = [
  {
    id: "new",
    who: "I've never run with a group",
    promise: "Know exactly what Saturday looks like before you show up.",
    steps: ["saturday-what-to-expect", "should-you-join", "pace-calculator"],
  },
  {
    id: "comeback",
    who: "I'm getting back into running",
    promise: "Rebuild without the month-two injury.",
    steps: ["comeback-runner", "build-a-base", "increase-mileage"],
  },
  {
    id: "race",
    who: "I'm training for a race",
    promise: "Pick the race, set the pace, build the weeks.",
    steps: ["race-calendar", "pace-calculator", "run-plan"],
  },
  {
    id: "winter",
    who: "I want to keep running through winter",
    promise: "Cold, dark, and wet are all runnable with the right setup.",
    steps: ["what-to-wear", "night-running", "cross-training"],
  },
];

/** Entries that are in season for a given date (Pittsburgh). */
export function inSeason(e: LibraryEntry, now: Date = new Date()): boolean {
  const m = now.getMonth(); // 0 = Jan
  if (e.seasonal === "cold") return m >= 9 || m <= 2; // Oct through Mar
  if (e.seasonal === "fall-race") return m >= 7 && m <= 10 && now < new Date("2026-11-09T00:00:00-05:00");
  return false;
}
