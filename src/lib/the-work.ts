/**
 * THE WORK: GRYT skills and workflows.
 *
 * One source of truth for the /work section. Skills are the building blocks
 * (what to practice and how it progresses). Workflows are step-by-step
 * processes that produce something you keep: a goal card, a written
 * four-week program, a benchmark, a weekly check-in.
 *
 * Everything here is general training guidance, not medical advice, and
 * nothing in this file stores or sends personal data. Tools that remember
 * entries use this device's localStorage only.
 */

export type SkillCategory = "run" | "strength" | "durability" | "life";

export type SkillLevel = {
  /** Start, Build, Own. */
  name: "Start" | "Build" | "Own";
  /** What the level looks like in practice. */
  dose: string;
  /** How you know you're ready to move up. */
  moveUp: string;
};

export type Skill = {
  slug: string;
  name: string;
  category: SkillCategory;
  oneLiner: string;
  why: string;
  /** What "good" looks like. */
  standard: string;
  cues: string[];
  levels: [SkillLevel, SkillLevel, SkillLevel];
  mistakes: string[];
  /** How the skill shows up on a GRYT Saturday. */
  saturday: string;
  equipment: string;
  minutes: string;
  /** Existing runner-library entry ids worth reading next. */
  related?: string[];
};

export const SKILL_CATEGORIES: Array<{ id: SkillCategory | "all"; label: string }> = [
  { id: "all", label: "All skills" },
  { id: "run", label: "Run" },
  { id: "strength", label: "Strength" },
  { id: "durability", label: "Durability" },
  { id: "life", label: "Real life" },
];

export const SKILLS: Skill[] = [
  // ── Run ────────────────────────────────────────────────
  {
    slug: "easy-pace",
    name: "Run easy on purpose",
    category: "run",
    oneLiner: "The skill most people skip. Slow enough to talk, often enough to matter.",
    why: "Most of your fitness gets built on easy days. Going easy lets you show up again tomorrow, which beats one hero workout followed by a week on the couch.",
    standard:
      "You can say full sentences the whole time. Effort feels like a 3 or 4 out of 10. Walking breaks are allowed and smart.",
    cues: [
      "If you can't talk, slow down or walk for a minute.",
      "Breathe through your nose for a few steps. If you can't, ease off.",
      "Finish feeling like you could do it again.",
    ],
    levels: [
      {
        name: "Start",
        dose: "20 to 30 minutes of run/walk, 2 or 3 times a week. Try 1 minute running, 1 minute walking.",
        moveUp: "Three weeks in a row of finishing every session without dreading the next one.",
      },
      {
        name: "Build",
        dose: "30 to 45 minutes continuous, 3 or 4 times a week. Saturday is your longest.",
        moveUp: "Easy pace feels genuinely easy and your legs feel fresh most mornings.",
      },
      {
        name: "Own",
        dose: "Most of your weekly running is easy. Hard days are hard, easy days stay easy.",
        moveUp: "You're there. Protect it.",
      },
    ],
    mistakes: [
      "Running every run at the same medium-hard pace.",
      "Skipping walk breaks because of ego.",
      "Racing the person next to you on a recovery day.",
    ],
    saturday:
      "Saturday is a no-drop run. Pick the group that lets you talk. That's the right group.",
    equipment: "Shoes. That's it.",
    minutes: "20 to 60 min",
    related: ["pace-calculator", "build-a-base"],
  },
  {
    slug: "strides",
    name: "Strides",
    category: "run",
    oneLiner: "Short, quick, relaxed pickups. The cheapest speed you'll ever buy.",
    why: "Strides teach your legs to move fast without the fatigue of a real workout. Former athletes usually remember this feeling right away.",
    standard:
      "15 to 20 seconds building to about 85 percent, smooth and tall, then a full walk or jog back until you feel normal.",
    cues: ["Quick feet, quiet landing.", "Relax your face and hands.", "Fast, not strained."],
    levels: [
      {
        name: "Start",
        dose: "4 x 15 seconds after an easy run, full walk recovery.",
        moveUp: "They feel smooth instead of sloppy.",
      },
      {
        name: "Build",
        dose: "6 x 20 seconds after an easy run, twice a week.",
        moveUp: "You can hold good form on the last one.",
      },
      {
        name: "Own",
        dose: "6 to 8 x 20 seconds, sometimes on a gentle uphill.",
        moveUp: "Keep them in year-round.",
      },
    ],
    mistakes: ["Sprinting all-out.", "Cutting the recovery short.", "Doing them on cold legs."],
    saturday: "Want to try them? Do four on the flat trail after the group finishes.",
    equipment: "A flat stretch of trail or road.",
    minutes: "5 to 8 min",
  },
  {
    slug: "hills",
    name: "Hill repeats",
    category: "run",
    oneLiner: "Strength work disguised as running. Pittsburgh hands you the gym for free.",
    why: "Hills build power and form with less pounding than flat speed work. They're the bridge between getting stronger and getting faster.",
    standard:
      "Strong but controlled uphill effort, around 7 out of 10, with an easy walk or jog back down as recovery.",
    cues: [
      "Short steps, drive your arms.",
      "Eyes up the hill, not at your feet.",
      "Same effort on the last rep as the first.",
    ],
    levels: [
      {
        name: "Start",
        dose: "4 to 6 x 30 seconds uphill, walk down.",
        moveUp: "The last rep feels like the first.",
      },
      {
        name: "Build",
        dose: "6 to 8 x 45 to 60 seconds uphill, jog down.",
        moveUp: "You recover on the way down without stopping.",
      },
      {
        name: "Own",
        dose: "8 to 10 x 60 to 90 seconds, or a 20-minute rolling hill route at steady effort.",
        moveUp: "Rotate with tempo work so you don't get stale.",
      },
    ],
    mistakes: [
      "Starting too hard.",
      "Leaning way forward from the waist.",
      "Bombing the downhill.",
    ],
    saturday:
      "The Montour Trail is flat on purpose. Save hill repeats for a weekday on a hill near your house.",
    equipment: "A hill that takes 30 to 90 seconds to climb.",
    minutes: "25 to 45 min with warm-up",
    related: ["increase-mileage"],
  },
  {
    slug: "tempo",
    name: "Tempo running",
    category: "run",
    oneLiner: "Comfortably hard. The pace that teaches you to hold on.",
    why: "Tempo work raises the pace you can hold for a long time. It's the most direct way to run a faster 5K, 10K, or half.",
    standard:
      "Effort around 6 or 7 out of 10. You can say a few words, not a full sentence. You could hold it longer than you do.",
    cues: [
      "Settle in. The first minute should feel too easy.",
      "Steady beats fast. Even splits win.",
      "If form falls apart, the rep is over.",
    ],
    levels: [
      {
        name: "Start",
        dose: "3 x 5 minutes at tempo effort, 2 minutes easy between.",
        moveUp: "All three reps at the same effort.",
      },
      {
        name: "Build",
        dose: "2 x 10 minutes at tempo effort, 3 minutes easy between.",
        moveUp: "The second rep feels in control.",
      },
      {
        name: "Own",
        dose: "20 to 30 minutes continuous at tempo effort.",
        moveUp: "Use race goals to set the effort from here.",
      },
    ],
    mistakes: [
      "Turning tempo into a race.",
      "Doing it the day before Saturday.",
      "Skipping the warm-up.",
    ],
    saturday: "Keep Saturday social and easy. Tempo lives midweek.",
    equipment: "A flat route or a track.",
    minutes: "30 to 50 min with warm-up",
    related: ["pace-calculator"],
  },
  {
    slug: "long-run",
    name: "The long run",
    category: "run",
    oneLiner: "Your weekly anchor. At GRYT, it's Saturday at 7.",
    why: "The long run builds the engine for every distance. Doing it with a crew makes it the part of the week people protect.",
    standard:
      "Easy effort the whole way. Longest run of your week. Grows slowly, about one route option at a time.",
    cues: [
      "Start slower than you think.",
      "Talk the whole time.",
      "Fuel and water if you're out past an hour.",
    ],
    levels: [
      {
        name: "Start",
        dose: "The 3 mile route, run/walk is welcome.",
        moveUp: "Three Saturdays in a row that leave you wanting more.",
      },
      {
        name: "Build",
        dose: "The 5 mile route at easy effort.",
        moveUp: "You finish strong and recover by Monday.",
      },
      {
        name: "Own",
        dose: "The 10K route, with an easy extension when your plan calls for more.",
        moveUp: "Let your race goal decide what comes next.",
      },
    ],
    mistakes: ["Jumping two distances at once.", "Racing it.", "Skipping the coffee after."],
    saturday: "This is Saturday. Pick your route at the lot and run it with people at your pace.",
    equipment: "Shoes, water if it's warm, layers if it's not.",
    minutes: "30 to 90 min",
    related: ["saturday-what-to-expect", "what-to-eat"],
  },

  // ── Strength ───────────────────────────────────────────
  {
    slug: "hinge",
    name: "Hinge",
    category: "strength",
    oneLiner:
      "Hips back, back flat. The movement behind every strong stride and every kid you've lifted.",
    why: "Hinging builds your glutes and hamstrings, the engine for running uphill and the thing that protects your back on a long day.",
    standard:
      "Flat back, soft knees, hips travel back. You feel it in the back of your legs, not your lower back.",
    cues: [
      "Push the wall behind you with your butt.",
      "Keep the weight close.",
      "Stand tall and squeeze at the top.",
    ],
    levels: [
      {
        name: "Start",
        dose: "Glute bridge or hip hinge with a broomstick, 2 x 10 to 12.",
        moveUp: "You can hinge with a flat back without thinking about it.",
      },
      {
        name: "Build",
        dose: "Dumbbell or kettlebell Romanian deadlift, 3 x 8 to 10.",
        moveUp: "Last two reps are hard but form holds.",
      },
      {
        name: "Own",
        dose: "Trap bar or barbell deadlift or single-leg RDL, 3 to 4 x 5 to 8.",
        moveUp: "Add weight slowly. Leave a rep or two in the tank.",
      },
    ],
    mistakes: [
      "Rounding your back.",
      "Squatting the weight down instead of hinging.",
      "Going too heavy too soon.",
    ],
    saturday: "Hinge day pairs best early in the week so your legs are fresh for Saturday.",
    equipment: "Nothing to start. Then a dumbbell, kettlebell, or bar.",
    minutes: "8 to 12 min",
    related: ["cross-training"],
  },
  {
    slug: "squat",
    name: "Squat",
    category: "strength",
    oneLiner: "Sit down and stand up with control. Sounds simple. Builds a lot.",
    why: "Squatting builds quads and knee strength that help on downhills and late in long runs.",
    standard: "Feet flat, chest up, knees track over your toes, as deep as you can control.",
    cues: [
      "Spread the floor with your feet.",
      "Sit between your heels.",
      "Drive up through the whole foot.",
    ],
    levels: [
      {
        name: "Start",
        dose: "Box or chair squat, 2 x 10 to 12.",
        moveUp: "Smooth reps without bouncing off the chair.",
      },
      {
        name: "Build",
        dose: "Goblet squat holding a dumbbell or kettlebell, 3 x 8 to 12.",
        moveUp: "Clean depth and control for every rep.",
      },
      {
        name: "Own",
        dose: "Front squat or heavier goblet squat, 3 to 4 x 5 to 8.",
        moveUp: "Progress the weight, not the ego.",
      },
    ],
    mistakes: ["Heels lifting.", "Knees caving in.", "Rushing the bottom."],
    saturday: "Pair squats with single-leg work on your second strength day.",
    equipment: "A chair, then a dumbbell or kettlebell.",
    minutes: "8 to 12 min",
  },
  {
    slug: "single-leg",
    name: "Single-leg strength",
    category: "strength",
    oneLiner: "Running is a single-leg sport. Train it that way.",
    why: "Every stride lands on one leg. Single-leg work builds balance and evens out the side that always gets tight.",
    standard: "Hips level, knee tracks over the middle of your foot, controlled down and up.",
    cues: ["Front foot does the work.", "Stay tall.", "Slow on the way down."],
    levels: [
      {
        name: "Start",
        dose: "Split squat or step-up to a low step, 2 x 8 each leg.",
        moveUp: "Both legs feel about the same.",
      },
      {
        name: "Build",
        dose: "Rear-foot elevated split squat or step-up holding weights, 3 x 8 each leg.",
        moveUp: "No wobble on the last rep.",
      },
      {
        name: "Own",
        dose: "Heavier split squats, step-ups, or single-leg RDLs, 3 x 6 to 8 each leg.",
        moveUp: "Rotate variations every few weeks.",
      },
    ],
    mistakes: ["Pushing off the back leg.", "Rushing.", "Only training your good side first."],
    saturday: "Start with your weaker leg and match the reps on the other side.",
    equipment: "A step or bench. Dumbbells later.",
    minutes: "8 to 12 min",
  },
  {
    slug: "push",
    name: "Push",
    category: "strength",
    oneLiner: "Push-ups count. Elevate them until they're clean, then lower the hands.",
    why: "Upper-body strength holds your posture late in a run and keeps you strong for everything else in life.",
    standard: "Straight line from head to heels, chest to the surface, elbows at about 45 degrees.",
    cues: ["Squeeze your glutes.", "Push the floor away.", "Full range beats more reps."],
    levels: [
      {
        name: "Start",
        dose: "Incline push-up on a counter or bench, 2 x 8 to 12.",
        moveUp: "12 clean reps at that height.",
      },
      {
        name: "Build",
        dose: "Lower incline or floor push-ups, 3 x 8 to 12.",
        moveUp: "3 sets of 12 clean on the floor.",
      },
      {
        name: "Own",
        dose: "Floor push-ups with a pause, or dumbbell press, 3 to 4 x 8 to 12.",
        moveUp: "Add a pause or weight before adding reps.",
      },
    ],
    mistakes: ["Sagging hips.", "Half reps.", "Flaring elbows straight out."],
    saturday: "Push-ups are part of the GRYT benchmark. Any height counts, just write it down.",
    equipment: "A floor or a counter.",
    minutes: "5 to 8 min",
  },
  {
    slug: "pull",
    name: "Pull",
    category: "strength",
    oneLiner: "Rows balance out all the sitting, driving, and phone time.",
    why: "Pulling strength opens up your shoulders and helps your arm swing stay relaxed.",
    standard: "Shoulders down and back, pull to your ribs, control the return.",
    cues: ["Elbows to your back pockets.", "Pause at the top.", "No shrugging."],
    levels: [
      {
        name: "Start",
        dose: "Band row or towel row in a doorway, 2 x 12.",
        moveUp: "You feel your upper back working, not your neck.",
      },
      {
        name: "Build",
        dose: "One-arm dumbbell row, 3 x 10 each side.",
        moveUp: "Clean pause at the top every rep.",
      },
      {
        name: "Own",
        dose: "Inverted row or assisted pull-up, 3 x 6 to 10.",
        moveUp: "Lower the bar or reduce assistance.",
      },
    ],
    mistakes: [
      "Yanking with momentum.",
      "Shrugging up to your ears.",
      "Skipping it because you can't see it.",
    ],
    saturday: "Rows pair well with push-ups. Alternate them and you're done in eight minutes.",
    equipment: "A band, a dumbbell, or a sturdy bar.",
    minutes: "5 to 8 min",
  },
  {
    slug: "carry",
    name: "Carry",
    category: "strength",
    oneLiner: "Pick up something heavy and walk tall. Every parent already trains this.",
    why: "Carries build grip, posture, and a trunk that doesn't fold late in a race.",
    standard: "Tall posture, ribs down, short steady steps, no leaning.",
    cues: [
      "Crush the handles.",
      "Walk like you're balancing a book.",
      "Breathe behind your brace.",
    ],
    levels: [
      {
        name: "Start",
        dose: "Farmer carry with grocery bags or light dumbbells, 3 x 30 seconds.",
        moveUp: "No leaning or shuffling.",
      },
      {
        name: "Build",
        dose: "Suitcase carry (one side), 3 x 30 seconds each side.",
        moveUp: "Shoulders stay level.",
      },
      {
        name: "Own",
        dose: "Heavier farmer or suitcase carries, 3 to 4 x 40 metres.",
        moveUp: "Add weight in small jumps.",
      },
    ],
    mistakes: [
      "Leaning to one side.",
      "Holding your breath.",
      "Going so heavy your posture breaks.",
    ],
    saturday: "Finish a strength day with carries. It's hard to get wrong.",
    equipment: "Two bags, jugs, or dumbbells.",
    minutes: "4 to 6 min",
  },
  {
    slug: "core",
    name: "Core that resists",
    category: "strength",
    oneLiner: "Not crunches. Training your middle to stay still while everything else moves.",
    why: "A trunk that resists twisting and arching keeps your stride efficient and your back happy.",
    standard: "Ribs down, low back steady, slow breathing.",
    cues: ["Exhale fully before each rep.", "Move slow.", "Quality over time."],
    levels: [
      {
        name: "Start",
        dose: "Dead bug 2 x 6 each side, side plank 2 x 20 seconds each side.",
        moveUp: "Low back stays down the whole time.",
      },
      {
        name: "Build",
        dose: "Dead bug with reach 3 x 8, side plank 3 x 30 to 45 seconds, bird dog 3 x 8.",
        moveUp: "Side plank is the same on both sides.",
      },
      {
        name: "Own",
        dose: "Band or cable anti-rotation press 3 x 10, side plank with leg lift 3 x 30 seconds.",
        moveUp: "Keep rotating variations.",
      },
    ],
    mistakes: ["Rushing.", "Holding your breath.", "Doing 200 crunches instead."],
    saturday: "The side plank is part of the GRYT benchmark. Test both sides.",
    equipment: "A floor. A band later.",
    minutes: "5 to 8 min",
  },

  // ── Durability ─────────────────────────────────────────
  {
    slug: "calves-feet",
    name: "Calves and feet",
    category: "durability",
    oneLiner: "The unglamorous work that keeps you running in month six.",
    why: "Your calves and Achilles absorb a huge load every stride. Strong lower legs are one of the simplest ways to stay consistent.",
    standard: "Full range, slow down, pause at the top. Both straight-knee and bent-knee versions.",
    cues: ["Big toe stays down.", "Three seconds on the way down.", "Pause at the top."],
    levels: [
      {
        name: "Start",
        dose: "Double-leg calf raises off a step, 2 x 15, plus 2 x 15 bent-knee.",
        moveUp: "Smooth reps without bouncing.",
      },
      {
        name: "Build",
        dose: "Single-leg calf raises, 3 x 12 each side, plus tibialis raises against a wall.",
        moveUp: "Both sides match.",
      },
      {
        name: "Own",
        dose: "Weighted single-leg calf raises, 3 x 8 to 12 each side, plus pogo hops 2 x 20.",
        moveUp: "Keep them in year-round.",
      },
    ],
    mistakes: ["Bouncing.", "Half range.", "Only doing them when something already hurts."],
    saturday:
      "Do a set at the lot while you wait. Nobody will look at you weird. We'll probably join.",
    equipment: "A step.",
    minutes: "5 min",
    related: ["winter-durability-plan", "increase-mileage"],
  },
  {
    slug: "warm-up",
    name: "The five-minute warm-up",
    category: "durability",
    oneLiner: "Same routine every time so your body knows what's coming.",
    why: "A short warm-up gets blood moving and joints ready, especially on cold early mornings.",
    standard: "Five minutes, top to bottom, finished before you start running.",
    cues: [
      "Leg swings front to back and side to side, 10 each.",
      "Walking lunges with a reach, 10.",
      "A-skips and butt kicks, 20 metres each.",
      "Easy jog the first few minutes.",
    ],
    levels: [
      {
        name: "Start",
        dose: "Brisk walk 3 minutes plus leg swings.",
        moveUp: "You do it without being reminded.",
      },
      {
        name: "Build",
        dose: "Full five-minute routine before every run.",
        moveUp: "It's automatic.",
      },
      {
        name: "Own",
        dose: "Full routine plus strides before hard days.",
        moveUp: "Teach it to someone new.",
      },
    ],
    mistakes: [
      "Static stretching cold.",
      "Skipping it when you're late.",
      "Starting the run too fast instead.",
    ],
    saturday: "Get to the lot a few minutes early and warm up with the crew.",
    equipment: "None.",
    minutes: "5 min",
    related: ["what-to-wear"],
  },

  // ── Real life ──────────────────────────────────────────
  {
    slug: "minimum-session",
    name: "The 20-minute minimum",
    category: "life",
    oneLiner: "For the days the kids, the job, or the weather win. Something beats nothing.",
    why: "Consistency is built on bad days, not good ones. A short session keeps the habit alive and keeps you from restarting from zero.",
    standard: "20 minutes, no equipment, done is the goal.",
    cues: [
      "Option A: 20-minute easy run/walk from your front door.",
      "Option B: 2 rounds of 10 squats, 8 push-ups, 10 glute bridges, 30-second side plank each side, 15 calf raises.",
      "Write it down. It counts.",
    ],
    levels: [
      {
        name: "Start",
        dose: "One minimum session a week on top of Saturday.",
        moveUp: "You stop skipping the whole week when one day falls apart.",
      },
      {
        name: "Build",
        dose: "Minimum sessions replace skipped workouts instead of guilt.",
        moveUp: "Weeks with zero sessions disappear.",
      },
      {
        name: "Own",
        dose: "You know your floor and you hit it even in the worst weeks.",
        moveUp: "Help someone in your crew set theirs.",
      },
    ],
    mistakes: [
      "Trying to make up missed workouts.",
      "All or nothing thinking.",
      "Not counting it.",
    ],
    saturday: "Saturday plus one minimum session is a real training week.",
    equipment: "None.",
    minutes: "20 min",
    related: ["consistency"],
  },
  {
    slug: "recovery-basics",
    name: "Recovery basics",
    category: "life",
    oneLiner: "Sleep, food, and easy weeks. The boring stuff that makes the hard stuff work.",
    why: "Training is the stress. Recovery is when you actually get better.",
    standard:
      "Eat enough, sleep as much as your life allows, and take an easier week every fourth week.",
    cues: [
      "Eat something with carbs and protein within a couple hours of hard sessions.",
      "Protect a consistent bedtime the night before Saturday.",
      "Soreness is normal. Sharp pain, limping, or pain that changes your stride means stop and get it looked at.",
    ],
    levels: [
      {
        name: "Start",
        dose: "Eat breakfast after Saturday. Get to bed on time Friday.",
        moveUp: "You notice how sleep changes your runs.",
      },
      {
        name: "Build",
        dose: "Week 4 of every block is lighter. You stick to it.",
        moveUp: "You come out of easy weeks feeling sharp.",
      },
      {
        name: "Own",
        dose: "You adjust training when sleep or stress tanks instead of forcing it.",
        moveUp: "You know your warning signs.",
      },
    ],
    mistakes: [
      "Skipping the easy week.",
      "Under-eating while training more.",
      "Pushing through pain.",
    ],
    saturday: "Coffee after the run counts as recovery. Stay for it.",
    equipment: "A bed. Food.",
    minutes: "All week",
    related: ["what-to-eat"],
  },
  {
    slug: "comeback",
    name: "Coming back",
    category: "life",
    oneLiner: "For former athletes and anyone returning after kids, injury, or a few lost years.",
    why: "Your mind remembers the old you. Your tendons don't. A smart comeback respects both and gets you back faster than rushing.",
    standard: "Start lower than your pride wants. Build for three weeks, back off one.",
    cues: [
      "Run/walk is a tool, not a downgrade.",
      "Compare yourself to last month, not to college.",
      "Strength twice a week from day one.",
    ],
    levels: [
      {
        name: "Start",
        dose: "Run/walk three times a week, including Saturday, plus one short strength session.",
        moveUp: "Four weeks without new aches.",
      },
      {
        name: "Build",
        dose: "Continuous easy running, two strength days, strides once a week.",
        moveUp: "You recover between sessions without forcing it.",
      },
      {
        name: "Own",
        dose: "Add one quality session a week. Pick a race or a benchmark goal.",
        moveUp: "You're not coming back anymore. You're training.",
      },
    ],
    mistakes: ["Training at your old pace.", "Skipping strength.", "Doing it alone."],
    saturday: "Every Saturday has people coming back from something. You won't be the only one.",
    equipment: "Shoes and patience.",
    minutes: "Ongoing",
    related: ["comeback-runner", "build-a-base"],
  },
];

export function skillBySlug(slug: string): Skill | undefined {
  return SKILLS.find((s) => s.slug === slug);
}

// ── Workflows ────────────────────────────────────────────

export type WorkflowTool = "goal-card" | "program-builder" | "benchmark" | "check-in";

export type WorkflowStep = {
  title: string;
  do: string;
  /** Definition of done. */
  done: string;
};

export type Workflow = {
  slug: string;
  name: string;
  oneLiner: string;
  /** What you walk away with. */
  output: string;
  time: string;
  when: string;
  steps: WorkflowStep[];
  tool?: WorkflowTool;
  skills: string[];
};

export const WORKFLOWS: Workflow[] = [
  {
    slug: "set-your-goal",
    name: "Set your goal",
    oneLiner: "One goal, one date, one reason. Written down.",
    output: "A goal card you can screenshot and share with your crew.",
    time: "10 minutes",
    when: "Before your first block, and every 12 weeks after.",
    tool: "goal-card",
    skills: ["comeback", "minimum-session"],
    steps: [
      {
        title: "Pick your lane",
        do: "Faster, stronger, further, or back. Pick the one that would make you proudest in 12 weeks.",
        done: "You picked one. Not two.",
      },
      {
        title: "Write the sentence",
        do: "By [date], I want to [specific thing], because [real reason].",
        done: "Someone else could read it and know if you did it.",
      },
      {
        title: "Pick a benchmark",
        do: "Choose the number you'll track: mile time, push-ups, side plank, wall sit, or a race result.",
        done: "You know what you'll test in week 1 and week 4.",
      },
      {
        title: "Set your floor",
        do: "Decide the minimum week you'll hit even when life gets loud. For most people: Saturday plus one 20-minute session.",
        done: "Your floor is small enough that you'd be embarrassed to miss it.",
      },
      {
        title: "Tell one person",
        do: "Share your goal card with one person in the crew, or bring it Saturday.",
        done: "Someone besides you knows.",
      },
    ],
  },
  {
    slug: "write-your-program",
    name: "Write your program",
    oneLiner: "A four-week block built around your real week and Saturday at 7.",
    output: "A printable four-week program with every session linked to the skill behind it.",
    time: "15 minutes",
    when: "Start of every four-week block.",
    tool: "program-builder",
    skills: ["easy-pace", "long-run", "hinge", "squat", "minimum-session"],
    steps: [
      {
        title: "Count your real week",
        do: "Not your ideal week. How many days can you actually train, and for how long?",
        done: "You picked a number you'd bet money on.",
      },
      {
        title: "Lock Saturday",
        do: "Saturday is your long run with the crew. Everything else gets built around it.",
        done: "Saturday is on the calendar.",
      },
      {
        title: "Place strength",
        do: "One or two short strength days, ideally early in the week, never the day before Saturday.",
        done: "Strength has a day and a time.",
      },
      {
        title: "Choose your level",
        do: "Start, Build, or Own for each skill. When in doubt, pick the lower one.",
        done: "Week 1 feels like you could do more.",
      },
      {
        title: "Build three, back off one",
        do: "Weeks 1 to 3 add a little. Week 4 is lighter and ends with a retest.",
        done: "Your week 4 looks easier than week 3.",
      },
      {
        title: "Print it or save it",
        do: "Put it where you'll see it. Fridge, phone lock screen, gym bag.",
        done: "You can see Monday's session without opening an app.",
      },
    ],
  },
  {
    slug: "benchmark-day",
    name: "Benchmark day",
    oneLiner: "Four simple tests. No equipment. Same tests every block.",
    output: "Your baseline and retest numbers, side by side.",
    time: "25 minutes",
    when: "Week 1 and week 4 of every block.",
    tool: "benchmark",
    skills: ["push", "core", "squat", "easy-pace"],
    steps: [
      {
        title: "Warm up",
        do: "The five-minute warm-up plus 5 minutes easy running or brisk walking.",
        done: "You're warm and a little loose.",
      },
      {
        title: "The mile",
        do: "One mile as fast as you can comfortably sustain. Running, run/walk, or brisk walk all count. Use a flat stretch of trail or a track.",
        done: "You have a time. Write it down.",
      },
      {
        title: "Push-ups",
        do: "As many clean push-ups in a row as you can, at the same height every test. Note the height.",
        done: "Same height as last time.",
      },
      {
        title: "Side plank",
        do: "Hold each side until form breaks, up to 2 minutes.",
        done: "Both sides recorded.",
      },
      {
        title: "Wall sit",
        do: "Thighs parallel to the floor, back flat on the wall, up to 3 minutes.",
        done: "Time recorded. Done for the day.",
      },
    ],
  },
  {
    slug: "weekly-check-in",
    name: "Sunday check-in",
    oneLiner: "Five minutes, four questions, one change for next week.",
    output: "A short note you can send to your crew.",
    time: "5 minutes",
    when: "Every Sunday.",
    tool: "check-in",
    skills: ["recovery-basics", "minimum-session"],
    steps: [
      {
        title: "Did I hit my floor?",
        do: "Yes or no. No story needed.",
        done: "Honest answer.",
      },
      {
        title: "What went well?",
        do: "One session or moment that felt good.",
        done: "One line.",
      },
      {
        title: "What hurt or got in the way?",
        do: "Soreness, schedule, sleep, motivation. Separate normal soreness from pain that changes how you move.",
        done: "You know if anything needs attention.",
      },
      {
        title: "What changes next week?",
        do: "One adjustment. Move a day, drop a set, add a stride, go to bed earlier.",
        done: "One change, not five.",
      },
    ],
  },
  {
    slug: "bad-week-reset",
    name: "Bad week reset",
    oneLiner: "Missed a week? Don't make it up. Pick it back up.",
    output: "A plan for this week that doesn't punish you for last week.",
    time: "2 minutes",
    when: "Any time life wins.",
    skills: ["minimum-session", "comeback"],
    steps: [
      {
        title: "Don't double up",
        do: "Skip the makeup workouts. They're how people get hurt.",
        done: "You let last week go.",
      },
      {
        title: "Repeat your last good week",
        do: "Go back to the last week you completed and run it again.",
        done: "You know which week you're on.",
      },
      {
        title: "Hit your floor first",
        do: "Do one 20-minute minimum session in the next two days.",
        done: "Momentum is back.",
      },
      {
        title: "Show up Saturday",
        do: "Even if the week was rough. Especially if the week was rough.",
        done: "RSVP is in.",
      },
    ],
  },
  {
    slug: "find-your-crew",
    name: "Train as a crew",
    oneLiner:
      "Four to six people, similar goals, one message a week. The part that makes everything else stick.",
    output: "A small crew who knows your goal and notices when you're missing.",
    time: "Ongoing",
    when: "After you've written your program.",
    skills: ["long-run", "comeback"],
    steps: [
      {
        title: "Find two or three people",
        do: "On Saturday, look for people chasing something similar: same lane, similar schedule. Ask if they want to check in weekly.",
        done: "You have names and a group text.",
      },
      {
        title: "Share goal cards",
        do: "Everyone posts their goal card and their floor.",
        done: "Everyone knows what everyone is chasing.",
      },
      {
        title: "One message a week",
        do: "Each person sends their Sunday check-in. That's the whole commitment.",
        done: "Short, honest, weekly.",
      },
      {
        title: "Retest together",
        do: "Pick one week 4 and do benchmark day together before or after a run.",
        done: "Numbers written down, wins celebrated.",
      },
      {
        title: "Notice who's missing",
        do: "If someone goes quiet, one person reaches out. Not to guilt them. Just to say you noticed.",
        done: "Nobody drifts without someone checking in.",
      },
    ],
  },
];

export function workflowBySlug(slug: string): Workflow | undefined {
  return WORKFLOWS.find((w) => w.slug === slug);
}

// ── Program builder ──────────────────────────────────────

export type Lane = "faster" | "stronger" | "further" | "back";
export type Level = 0 | 1 | 2; // Start, Build, Own
export type DaysPerWeek = 3 | 4 | 5;
export type SessionLength = 20 | 40 | 60;
export type Equipment = "none" | "dumbbells" | "gym";

export const LANES: Array<{ id: Lane; label: string; blurb: string }> = [
  { id: "faster", label: "Faster", blurb: "Run a quicker mile, 5K, or 10K." },
  { id: "stronger", label: "Stronger", blurb: "Get strong first, keep running easy." },
  { id: "further", label: "Further", blurb: "Build toward a longer run or a half." },
  { id: "back", label: "Back", blurb: "Return after kids, injury, or time off." },
];

export const LEVELS: Array<{ id: Level; label: string; blurb: string }> = [
  { id: 0, label: "Start", blurb: "New, or it's been a while." },
  { id: 1, label: "Build", blurb: "Running or lifting most weeks." },
  { id: 2, label: "Own", blurb: "Consistent for months." },
];

export type ProgramInput = {
  lane: Lane;
  level: Level;
  days: DaysPerWeek;
  minutes: SessionLength;
  equipment: Equipment;
};

export type Session = {
  title: string;
  detail: string[];
  skills: string[];
  saturday?: boolean;
};

export type ProgramDay = { day: string; session: Session | null };
export type ProgramWeek = { week: number; label: string; days: ProgramDay[] };
export type Program = { input: ProgramInput; title: string; summary: string; weeks: ProgramWeek[] };

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Slot = "easy" | "easyStrides" | "quality" | "strengthA" | "strengthB";

/** Weekday indices (Mon=0) used for non-Saturday sessions, by days per week. */
const LAYOUT: Record<DaysPerWeek, number[]> = {
  3: [1, 3],
  4: [0, 1, 3],
  5: [0, 1, 2, 3],
};

const SLOTS: Record<Lane, Record<DaysPerWeek, Slot[]>> = {
  faster: {
    3: ["quality", "strengthA"],
    4: ["strengthA", "quality", "easyStrides"],
    5: ["strengthA", "quality", "easy", "strengthB"],
  },
  stronger: {
    3: ["strengthA", "strengthB"],
    4: ["strengthA", "easyStrides", "strengthB"],
    5: ["strengthA", "easyStrides", "strengthB", "easy"],
  },
  further: {
    3: ["easyStrides", "strengthA"],
    4: ["strengthA", "easy", "quality"],
    5: ["strengthA", "easy", "quality", "easy"],
  },
  back: {
    3: ["easy", "strengthA"],
    4: ["strengthA", "easy", "easy"],
    5: ["strengthA", "easy", "strengthB", "easy"],
  },
};

const EASY_MIN: Record<Level, number[]> = {
  0: [20, 22, 25, 20],
  1: [30, 35, 40, 30],
  2: [40, 45, 50, 40],
};

function easyMinutes(level: Level, week: number, cap: SessionLength) {
  return Math.min(EASY_MIN[level][week - 1], cap === 60 ? 55 : cap === 40 ? 40 : 20);
}

const STRIDES: Record<Level, string> = {
  0: "4 x 15 sec strides, walk back",
  1: "6 x 20 sec strides, walk back",
  2: "8 x 20 sec strides, walk back",
};

function quality(lane: Lane, level: Level, week: number): Session {
  const warm = "10 min easy + the five-minute warm-up";
  const cool = "10 min easy cool-down";
  if (week === 4) {
    return {
      title: "Easy + strides (lighter week)",
      detail: [`${EASY_MIN[level][0]} min easy`, STRIDES[level]],
      skills: ["easy-pace", "strides"],
    };
  }
  if (lane === "faster" && week < 3) {
    const reps = [
      ["4 x 30 sec", "5 x 30 sec"],
      ["6 x 45 sec", "7 x 45 sec"],
      ["8 x 60 sec", "9 x 60 sec"],
    ][level][week - 1];
    return {
      title: "Hill repeats",
      detail: [warm, `${reps} uphill at 7/10 effort, walk or jog down`, cool],
      skills: ["hills", "warm-up"],
    };
  }
  const tempo = [
    ["3 x 4 min", "3 x 5 min", "4 x 5 min"],
    ["2 x 8 min", "2 x 10 min", "3 x 8 min"],
    ["20 min", "25 min", "2 x 15 min"],
  ][level][week - 1];
  return {
    title: "Tempo",
    detail: [warm, `${tempo} at comfortably hard effort, 2 to 3 min easy between`, cool],
    skills: ["tempo", "warm-up"],
  };
}

const STRENGTH_PICK: Record<Equipment, Record<string, string[]>> = {
  none: {
    hinge: ["Glute bridge", "Single-leg glute bridge", "Single-leg RDL (bodyweight, slow)"],
    squat: ["Chair squat", "Tempo bodyweight squat (3 sec down)", "Jump squat, soft landing"],
    "single-leg": ["Split squat", "Rear-foot elevated split squat", "Step-up to a high step"],
    push: ["Incline push-up", "Push-up", "Pause push-up"],
    pull: ["Towel row in a doorway", "Towel row, slow return", "Inverted row under a sturdy table"],
    carry: ["Farmer carry with grocery bags", "Suitcase carry, one bag", "Heavy bag carry"],
  },
  dumbbells: {
    hinge: ["Glute bridge", "Dumbbell Romanian deadlift", "Single-leg dumbbell RDL"],
    squat: ["Chair squat holding a dumbbell", "Goblet squat", "Heavy goblet squat"],
    "single-leg": [
      "Split squat",
      "Dumbbell split squat",
      "Rear-foot elevated split squat with dumbbells",
    ],
    push: ["Incline push-up", "Push-up", "Dumbbell floor press"],
    pull: ["Band row", "One-arm dumbbell row", "Heavy one-arm dumbbell row"],
    carry: ["Light farmer carry", "Suitcase carry", "Heavy farmer carry"],
  },
  gym: {
    hinge: ["Kettlebell deadlift", "Romanian deadlift", "Trap bar deadlift"],
    squat: ["Box squat", "Goblet squat", "Front squat"],
    "single-leg": ["Step-up", "Rear-foot elevated split squat", "Heavy step-up or split squat"],
    push: ["Incline push-up", "Dumbbell bench press", "Bench press or weighted push-up"],
    pull: ["Cable or band row", "Dumbbell row", "Assisted pull-up or inverted row"],
    carry: ["Farmer carry", "Suitcase carry", "Heavy farmer carry"],
  },
};

function sets(level: Level, week: number) {
  const base = level === 0 ? 2 : 3;
  if (week === 4) return Math.max(1, base - 1);
  if (level === 2 && week === 3) return 4;
  return base;
}

function strength(which: "A" | "B", input: ProgramInput, week: number): Session {
  const { level, equipment, minutes, lane } = input;
  if (lane === "back" && level === 0) {
    return {
      title: `Strength ${which}: the 20-minute minimum`,
      detail: [
        "2 rounds: 10 squats, 8 incline push-ups, 10 glute bridges, 30 sec side plank each side, 15 calf raises",
        week === 4
          ? "Lighter week: 1 round, then a 10 min walk"
          : "Rest about a minute between rounds",
      ],
      skills: ["minimum-session", "squat", "push", "core", "calves-feet"],
    };
  }
  const pick = STRENGTH_PICK[equipment];
  const s = sets(level, week);
  const reps = level === 2 ? "6 to 8" : "8 to 10";
  const moves =
    which === "A"
      ? [
          `${pick.hinge[level]}: ${s} x ${reps}`,
          `${pick.push[level]}: ${s} x 8 to 12`,
          `${pick.carry[level]}: ${s} x 30 sec`,
          `Dead bug and side plank: ${s} rounds`,
        ]
      : [
          `${pick.squat[level]}: ${s} x ${reps}`,
          `${pick["single-leg"][level]}: ${s} x 8 each leg`,
          `${pick.pull[level]}: ${s} x 10`,
          `Calf raises (straight and bent knee): ${s} x 12 to 15`,
        ];
  const detail = ["The five-minute warm-up", ...moves];
  if (minutes === 20) detail.push("Short on time: do it as a circuit, 2 rounds, then go.");
  if (week === 4) detail.push("Lighter week: same moves, one less set, leave reps in the tank.");
  return {
    title: `Strength ${which}`,
    detail,
    skills:
      which === "A"
        ? ["hinge", "push", "carry", "core"]
        : ["squat", "single-leg", "pull", "calves-feet"],
  };
}

const SAT_ROUTE: Record<Lane, Record<Level, string[]>> = {
  faster: {
    0: ["3 mile route", "3 mile route", "3 mile route", "3 mile route"],
    1: ["5 mile route", "5 mile route", "5 mile route", "3 mile route"],
    2: ["10K route", "10K route", "10K route", "5 mile route"],
  },
  stronger: {
    0: ["3 mile route", "3 mile route", "3 mile route", "3 mile route"],
    1: ["3 mile route", "5 mile route", "5 mile route", "3 mile route"],
    2: ["5 mile route", "5 mile route", "10K route", "5 mile route"],
  },
  further: {
    0: ["3 mile route", "3 mile route", "5 mile route, walk breaks welcome", "3 mile route"],
    1: ["5 mile route", "5 mile route", "10K route", "5 mile route"],
    2: ["10K route", "10K route + 1 mile easy", "10K route + 2 miles easy", "10K route"],
  },
  back: {
    0: [
      "3 mile route, run/walk",
      "3 mile route, run/walk",
      "3 mile route, run/walk",
      "3 mile route, run/walk",
    ],
    1: ["3 mile route", "3 mile route", "5 mile route", "3 mile route"],
    2: ["5 mile route", "5 mile route", "5 mile route", "3 mile route"],
  },
};

function saturday(input: ProgramInput, week: number): Session {
  return {
    title: "GRYT Saturday, 7 AM",
    detail: [
      `${SAT_ROUTE[input.lane][input.level][week - 1]} at easy, talking pace`,
      week === 4
        ? "Stay for coffee. You earned the lighter week."
        : "Stay for coffee after. It counts.",
    ],
    skills: ["long-run", "easy-pace"],
    saturday: true,
  };
}

function slotSession(slot: Slot, input: ProgramInput, week: number): Session {
  switch (slot) {
    case "easy":
      return {
        title: "Easy run",
        detail: [
          `${easyMinutes(input.level, week, input.minutes)} min at talk pace${input.level === 0 ? ", run/walk is fine" : ""}`,
        ],
        skills: ["easy-pace"],
      };
    case "easyStrides":
      return {
        title: "Easy run + strides",
        detail: [
          `${easyMinutes(input.level, week, input.minutes)} min at talk pace`,
          STRIDES[input.level],
        ],
        skills: ["easy-pace", "strides"],
      };
    case "quality":
      return quality(input.lane, input.level, week);
    case "strengthA":
      return strength("A", input, week);
    case "strengthB":
      return strength("B", input, week);
  }
}

export function buildProgram(input: ProgramInput): Program {
  const slots = SLOTS[input.lane][input.days];
  const idx = LAYOUT[input.days];
  const weeks: ProgramWeek[] = [1, 2, 3, 4].map((week) => {
    const days: ProgramDay[] = DAY_NAMES.map((day) => ({ day, session: null }));
    slots.forEach((slot, i) => {
      days[idx[i]].session = slotSession(slot, input, week);
    });
    days[5].session = saturday(input, week);
    // Benchmark: baseline before week 1, retest replaces the first session of week 4.
    const first = days.find((d) => d.session && !d.session.saturday);
    if (first?.session && (week === 1 || week === 4)) {
      if (week === 1) {
        first.session = {
          ...first.session,
          detail: [
            "First: take your baseline benchmark (25 min). Then do the session if you still have time.",
            ...first.session.detail,
          ],
          skills: ["push", "core", ...first.session.skills],
        };
      } else {
        first.session = {
          title: "Benchmark retest",
          detail: [
            "Warm up, then the mile, push-ups, side plank, and wall sit. Compare to week 1.",
          ],
          skills: ["push", "core", "squat", "easy-pace"],
        };
      }
    }
    return {
      week,
      label: week === 4 ? "Week 4: lighter + retest" : `Week ${week}: build`,
      days,
    };
  });
  const lane = LANES.find((l) => l.id === input.lane)!.label;
  const level = LEVELS.find((l) => l.id === input.level)!.label;
  return {
    input,
    title: `${lane} block · ${level} level · ${input.days} days a week`,
    summary:
      "Three weeks that build a little, one lighter week that ends with a retest. Saturday is your long run with the crew. If a week falls apart, repeat it instead of making it up.",
    weeks,
  };
}

export function programAsText(p: Program): string {
  const lines = [`GRYT · ${p.title}`, p.summary, ""];
  for (const w of p.weeks) {
    lines.push(w.label.toUpperCase());
    for (const d of w.days) {
      if (!d.session) {
        lines.push(`${d.day}: Rest or a walk`);
        continue;
      }
      lines.push(`${d.day}: ${d.session.title}`);
      for (const x of d.session.detail) lines.push(`  - ${x}`);
    }
    lines.push("");
  }
  lines.push(
    "Soreness is normal. Sharp pain or pain that changes how you move means stop. General guidance, not medical advice.",
  );
  lines.push("grytrunclub.com/work");
  return lines.join("\n");
}

// ── Local storage (this device only) ─────────────────────

export const WORK_STORAGE_KEY = "gryt-work-v1";

export type BenchmarkEntry = {
  date: string;
  mile: string;
  pushups: string;
  pushupHeight: string;
  plankLeft: string;
  plankRight: string;
  wallSit: string;
};

export type GoalCard = {
  lane: Lane;
  sentence: string;
  date: string;
  why: string;
  benchmark: string;
  floor: string;
};

export type CheckIn = {
  date: string;
  floor: "yes" | "no" | "";
  well: string;
  hurt: string;
  change: string;
};

export type WorkStore = {
  goal?: GoalCard;
  program?: ProgramInput;
  benchmarks?: BenchmarkEntry[];
  checkIns?: CheckIn[];
};

export function readWork(): WorkStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(WORK_STORAGE_KEY) ?? "{}") as WorkStore;
  } catch {
    return {};
  }
}

export function writeWork(patch: Partial<WorkStore>): WorkStore {
  const next = { ...readWork(), ...patch };
  try {
    window.localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: tools still work, they just won't remember.
  }
  return next;
}
