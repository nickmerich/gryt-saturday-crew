import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-run.jpg";
import circleImg from "@/assets/circle-up.jpg";
import foundersImg from "@/assets/founders.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GRYT Run Club · Saturdays 7 AM · McMurray, PA" },
      {
        name: "description",
        content:
          "The Saturday run club for people getting their edge back. Former athletes, busy parents, comeback runners. Free, all paces, Montour / Peters Trail.",
      },
      { property: "og:title", content: "GRYT Run Club · Saturdays 7 AM" },
      {
        property: "og:description",
        content: "Do hard things together. Saturday mornings on the Montour / Peters Trail.",
      },
    ],
  }),
  component: Landing,
});

const PRIMARY_CTA = "I'm coming this Saturday";
const SECONDARY_CTA = "Join the chat";

function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`wordmark text-2xl ${className}`}>gryt</span>;
}

function MissionStamp() {
  return (
    <div className="inline-flex flex-col items-start">
      <span className="display-condensed text-paper text-xs tracking-[0.18em]">DO HARD</span>
      <span className="display-condensed text-paper text-xs tracking-[0.18em]">THINGS</span>
      <div className="flex items-center gap-2 mt-1">
        <span className="display-condensed text-paper text-xs tracking-[0.18em]">TOGETHER</span>
        <span className="slash" />
      </div>
    </div>
  );
}

function Nav() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <Wordmark />
        <nav className="hidden md:flex items-center gap-8 eyebrow text-paper">
          <a href="#run" className="hover:text-blue transition-colors">The Run</a>
          <a href="#who" className="hover:text-blue transition-colors">Who It's For</a>
          <a href="#first" className="hover:text-blue transition-colors">First Time</a>
          <a href="#faq" className="hover:text-blue transition-colors">FAQ</a>
        </nav>
        <a href="#rsvp" className="hidden sm:inline-flex btn-primary !py-2 !px-4 !text-sm">RSVP</a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <img
        src={heroImg}
        alt="Group of runners on a tree-lined trail at dawn"
        width={1920}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink" />
      <div className="absolute top-1/3 -left-10 w-[60%] h-3 diag-stripes opacity-70 rotate-[-8deg]" />

      <Nav />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-40 pb-24 md:pt-48 md:pb-32">
        <div className="eyebrow eyebrow-blue mb-8">
          LIVE IN PITTSBURGH · SATURDAYS AT 7 AM · MCMURRAY, PA
        </div>

        <h1 className="display text-paper text-5xl sm:text-6xl md:text-8xl max-w-5xl">
          You used to have a team.
          <br />
          <span className="text-blue">Now you have Saturday.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg md:text-xl text-paper/80 leading-relaxed">
          GRYT is a Pittsburgh run club for former athletes, busy parents, comeback runners, and
          anyone trying to get their edge back. We meet every Saturday at 7 AM on the Montour /
          Peters Trail. Walk, jog, run, talk through mile two, and stay for coffee after.
        </p>

        <p className="mt-4 max-w-2xl text-base text-paper/60">
          No pace requirement. No awkward first day. No one gets dropped.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a href="#rsvp" className="btn-primary">{PRIMARY_CTA}</a>
          <a href="#community" className="btn-ghost">{SECONDARY_CTA}</a>
        </div>

        <p className="mt-6 eyebrow text-paper/70">
          First time? Arrive 10 minutes early. We'll be by the trailhead.
        </p>
      </div>

      <div className="relative z-10 border-t border-paper/15 bg-ink/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-2">
          <span className="eyebrow eyebrow-blue">REAL PEOPLE · REAL MILES · EVERY SATURDAY</span>
          <span className="hidden md:inline text-paper/30">·</span>
          {[
            "25+ regulars",
            "All paces welcome",
            "Free forever",
            "Coffee after",
            "No one gets dropped",
          ].map((item) => (
            <span key={item} className="eyebrow text-paper/80">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickDetails() {
  const rows: Array<[string, string]> = [
    ["When", "Saturday · 7:00 AM"],
    ["Where", "212 Valley Brook Road · McMurray, PA"],
    ["Route", "Montour / Peters Trail"],
    ["Distance", "About 4 miles · out and back"],
    ["Pace", "Walk, jog, run · all welcome"],
    ["Cost", "$0 · always"],
    ["After", "Coffee nearby"],
  ];

  return (
    <section id="rsvp" className="relative concrete grain py-24 md:py-32">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <div className="eyebrow eyebrow-blue mb-5">SATURDAY · 7 AM</div>
            <h2 className="display text-paper text-4xl md:text-6xl">
              Saturday is <span className="text-blue">already planned.</span>
            </h2>
            <p className="mt-6 text-paper/75 text-lg leading-relaxed">
              You do not need a training plan, a perfect week, or a fast pace. You just need shoes
              and the decision to show up.
            </p>
            <a href="#community" className="mt-8 btn-primary">{PRIMARY_CTA}</a>
          </div>

          <div className="md:col-span-7">
            <div className="border-2 border-paper/20 bg-ink/40">
              {rows.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex items-baseline gap-6 px-6 py-5 ${
                    i !== rows.length - 1 ? "border-b border-paper/10" : ""
                  }`}
                >
                  <span className="eyebrow text-blue w-24 shrink-0">{k}</span>
                  <span className="font-[var(--font-display)] text-paper text-lg md:text-xl">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CorePromise() {
  return (
    <section className="bg-ink py-24 md:py-36 border-t border-paper/10">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div className="eyebrow eyebrow-blue mb-6">THE CORE PROMISE</div>
        <h2 className="display text-paper text-4xl md:text-7xl">
          At some point, fitness got <span className="text-blue">lonely.</span>
        </h2>
        <p className="mt-10 text-paper/80 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
          You started squeezing workouts between work, kids, errands, and everything else on the
          calendar. GRYT gives you one standing appointment that does not move. Same time. Same
          trail. Same kind of people. The ones who still want to push, even if life looks different
          now.
        </p>
        <p className="mt-8 display-condensed text-blue text-3xl md:text-5xl">
          You do not have to be fast.
          <br />
          You just have to be willing.
        </p>
      </div>
    </section>
  );
}

function WhoItsFor() {
  const cards = [
    {
      tag: "FORMER ATHLETE",
      title: "You miss being around people who get it.",
      body: "The quiet competitiveness. The jokes before the work. The part where nobody needs a speech because everyone already knows why they came. GRYT brings that back without making it complicated.",
    },
    {
      tag: "PARENT",
      title: "You need something that is yours.",
      body: "Early enough that the day still works for everyone else. Saturday at 7 AM gives you the workout, the headspace, and the reset before most people are fully awake. Home before the day gets away from you.",
    },
    {
      tag: "COMEBACK",
      title: "You're getting consistent again.",
      body: "Maybe you used to run. Maybe you're starting over. One Saturday is a run. Twelve Saturdays is a rhythm. Fifty Saturdays changes how you see yourself.",
    },
    {
      tag: "COMMUNITY",
      title: "You want a real crew.",
      body: "Not another group chat you ignore. Not a networking event disguised as fitness. People who learn your name, notice when you miss, and make the miles go faster.",
    },
  ];

  return (
    <section id="who" className="bg-ink py-24 md:py-32 border-t border-paper/10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl mb-16">
          <div className="eyebrow eyebrow-blue mb-5">WHO IT'S FOR</div>
          <h2 className="display text-paper text-4xl md:text-6xl">
            If this sounds like you, <span className="text-blue">you belong here.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-paper/10 border-2 border-paper/15">
          {cards.map((c) => (
            <article key={c.tag} className="bg-vintage p-8 md:p-10 relative grain overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <span className="slash" />
                <span className="eyebrow text-blue">{c.tag}</span>
              </div>
              <h3 className="display text-paper text-2xl md:text-3xl">{c.title}</h3>
              <p className="mt-4 text-paper/70 leading-relaxed">{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FirstTimer() {
  const steps = [
    {
      n: "01",
      h: "Park at the trailhead.",
      b: "Pull into 212 Valley Brook Road in McMurray. Parking is free and easy. Look for the group near the trail sign. If you're new, come 10 minutes early. Someone will say hey.",
    },
    {
      n: "02",
      h: "We circle up at 7.",
      b: "Quick names, quick route, quick check for new people. Nothing formal. Just enough so you know who you're running with. Then we move.",
    },
    {
      n: "03",
      h: "You find your pace.",
      b: "Walkers, joggers, and runners naturally split into small groups. You can push, cruise, or take it easy. Nobody gets dropped. Nobody cares what your watch says.",
    },
    {
      n: "04",
      h: "We finish together.",
      b: "The route is an out-and-back, so everyone ends up back at the same place. Stay for coffee if you can. That's where strangers become regulars.",
    },
  ];

  return (
    <section id="first" className="relative bg-ink py-24 md:py-32 border-t border-paper/10">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="eyebrow eyebrow-blue mb-5">FIRST SATURDAY</div>
          <h2 className="display text-paper text-4xl md:text-5xl">
            Your first Saturday is <span className="text-blue">simple.</span>
          </h2>
          <p className="mt-6 text-paper/70 leading-relaxed">
            No insider rules. No awkward guessing. Here's exactly what happens.
          </p>
          <img
            src={circleImg}
            alt="Runners circled up at a foggy trailhead"
            width={1280}
            height={1280}
            loading="lazy"
            className="mt-10 w-full aspect-square object-cover grayscale border-2 border-paper/15"
          />
        </div>

        <ol className="lg:col-span-8 space-y-px bg-paper/10 border-2 border-paper/15">
          {steps.map((s) => (
            <li key={s.n} className="bg-vintage p-8 md:p-10 flex gap-6 md:gap-10">
              <div className="display-condensed text-blue text-5xl md:text-6xl leading-none">
                {s.n}
              </div>
              <div>
                <h3 className="display text-paper text-2xl md:text-3xl">{s.h}</h3>
                <p className="mt-3 text-paper/70 leading-relaxed">{s.b}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-12">
        <a href="#rsvp" className="btn-primary">{PRIMARY_CTA}</a>
      </div>
    </section>
  );
}

function TheRun() {
  return (
    <section id="run" className="relative concrete grain py-24 md:py-32 border-t border-paper/10">
      <div className="relative mx-auto max-w-7xl px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <div className="eyebrow eyebrow-blue mb-5">THE RUN</div>
          <h2 className="display text-paper text-4xl md:text-7xl">
            The route is easy.
            <br />
            <span className="text-blue">Showing up</span> is the hard part.
          </h2>
          <p className="mt-8 text-paper/80 text-lg leading-relaxed">
            We run the Montour / Peters Trail because it's flat, wide, simple, and friendly for
            every pace. The usual route is about four miles out and back, but you can turn around
            whenever you need.
          </p>
          <p className="mt-4 text-paper/70 leading-relaxed">
            Bring a friend, a stroller, a dog, or just yourself. Most people come alone the first
            time.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border-2 border-blue/40 p-8 bg-ink/60">
            <div className="eyebrow text-blue mb-4">TRAIL CARD</div>
            <div className="display-condensed text-paper text-3xl md:text-4xl">
              MONTOUR / PETERS
              <br />
              <span className="text-blue">TRAIL</span>
            </div>
            <div className="mt-6 space-y-3 text-paper/80">
              <div className="flex justify-between border-b border-paper/10 pb-2">
                <span className="eyebrow">Surface</span>
                <span>Paved · flat</span>
              </div>
              <div className="flex justify-between border-b border-paper/10 pb-2">
                <span className="eyebrow">Distance</span>
                <span>~4 mi out & back</span>
              </div>
              <div className="flex justify-between border-b border-paper/10 pb-2">
                <span className="eyebrow">Start</span>
                <span>212 Valley Brook Rd</span>
              </div>
              <div className="flex justify-between">
                <span className="eyebrow">Vibes</span>
                <span>Quiet · piney · early</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Founders() {
  return (
    <section className="bg-ink py-24 md:py-32 border-t border-paper/10">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5">
          <img
            src={foundersImg}
            alt="Laura and Nick Merich running and laughing"
            width={1280}
            height={1600}
            loading="lazy"
            className="w-full aspect-[4/5] object-cover grayscale border-2 border-paper/15"
          />
        </div>
        <div className="md:col-span-7">
          <div className="eyebrow eyebrow-blue mb-5">FOUNDERS</div>
          <h2 className="display text-paper text-4xl md:text-6xl">
            Started by <span className="text-blue">Laura & Nick Merich.</span>
          </h2>
          <p className="mt-8 text-paper/80 text-lg leading-relaxed">
            GRYT started because we needed it too. Between work, family, training, and everything
            that fills a week, we wanted one non-negotiable place to keep showing up. Not a race
            team. Not a social club with running attached. A real Saturday morning ritual for people
            who still want to do hard things together.
          </p>
          <p className="mt-4 text-paper/70 leading-relaxed">
            Laura and Nick have finished 27 marathons combined, but GRYT isn't about medals. It's
            about consistency, community, and becoming the kind of person who keeps promises to
            themselves.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-paper/10 border-2 border-paper/15">
            {[
              ["27", "Marathons finished combined"],
              ["2024", "Running weekly since"],
              ["25+", "Regulars and growing"],
              ["ALL", "Paces, every Saturday"],
            ].map(([n, l]) => (
              <div key={l} className="bg-vintage p-5">
                <div className="display-condensed text-blue text-4xl">{n}</div>
                <div className="eyebrow text-paper/70 mt-2 leading-snug">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section
      id="community"
      className="relative py-24 md:py-32 border-t border-paper/10 overflow-hidden bg-blue text-ink"
    >
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-20deg, #000 0 14px, transparent 14px 36px)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="eyebrow text-ink/70 mb-5">THE COMMUNITY</div>
        <h2 className="display text-ink text-4xl md:text-7xl max-w-4xl">
          This is not about one run.
        </h2>
        <p className="mt-8 text-ink/80 text-lg md:text-xl leading-relaxed max-w-3xl">
          The run is the entry point. The community is the reason people come back. We use Strava
          for weekly events and Heylo for the group chat. You don't need either app to show up the
          first time — but once you come once, you'll probably want to join both.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-ink text-paper px-7 py-4 hover:bg-vintage transition-colors"
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Join the group chat →
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 border-2 border-ink text-ink px-7 py-4 hover:bg-ink hover:text-paper transition-colors"
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            View this week's run
          </a>
        </div>
      </div>
    </section>
  );
}

function Beliefs() {
  const beliefs = [
    "Hard things are easier together.",
    "You do not need to be fast to be serious.",
    "Parents are still athletes.",
    "Former athletes are not finished.",
    "Consistency beats intensity.",
    "The best conversations happen around mile two.",
    "Coffee after counts.",
    "If you keep showing up, you become someone different.",
  ];

  return (
    <section className="bg-ink py-24 md:py-32 border-t border-paper/10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="eyebrow eyebrow-blue mb-5">WHAT WE BELIEVE</div>
        <h2 className="display text-paper text-4xl md:text-6xl mb-14">
          Eight things, repeated <span className="text-blue">every Saturday.</span>
        </h2>
        <ul className="grid md:grid-cols-2 gap-px bg-paper/10 border-2 border-paper/15">
          {beliefs.map((b, i) => (
            <li key={b} className="bg-vintage p-6 md:p-8 flex items-start gap-5">
              <span className="display-condensed text-blue text-2xl shrink-0 w-10">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="display text-paper text-xl md:text-2xl">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Do I need to be fast?",
      a: "No. We have walkers, joggers, comeback runners, and people training for races. If you can move for 30 minutes, you can come.",
    },
    {
      q: "Can I come alone?",
      a: "Yes. Most people come alone the first time. Arrive 10 minutes early and introduce yourself. You'll know people before the run is over.",
    },
    {
      q: "What if I cannot run four miles?",
      a: "No problem. The route is out and back, so you can turn around whenever you want. Walk, jog, run, or mix all three.",
    },
    {
      q: "Do I need Strava?",
      a: "No. Strava is helpful for RSVPs and weekly event details, but you can show up without it.",
    },
    {
      q: "What is Heylo for?",
      a: "Heylo is the group chat. That's where we post updates, answer questions, and keep the community moving between runs.",
    },
    {
      q: "What happens if it rains?",
      a: "We still run in normal rain, cold, and imperfect weather. If conditions are unsafe, like ice or lightning, we update the group chat.",
    },
    { q: "Can I bring a friend?", a: "Yes. Bring someone who needs this." },
    { q: "Can I bring a stroller or dog?", a: "Yes. The trail is flat, wide, and friendly for both." },
    { q: "Is this free?", a: "Yes. GRYT is free." },
    {
      q: "Where do you get coffee?",
      a: "We usually grab coffee nearby after the run. Stay for 10 minutes or stay for an hour. Either way, you're invited.",
    },
  ];

  return (
    <section id="faq" className="bg-ink py-24 md:py-32 border-t border-paper/10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="eyebrow eyebrow-blue mb-5">FAQ</div>
        <h2 className="display text-paper text-4xl md:text-6xl mb-12">
          Questions before <span className="text-blue">you show up.</span>
        </h2>

        <div className="border-t-2 border-paper/15">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b-2 border-paper/15 py-6">
              <summary className="flex justify-between items-start gap-6 cursor-pointer list-none">
                <span className="display text-paper text-lg md:text-2xl">{f.q}</span>
                <span className="display-condensed text-blue text-2xl shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-paper/70 text-base md:text-lg leading-relaxed max-w-3xl">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative concrete grain py-32 md:py-44 border-t border-paper/10">
      <div className="absolute top-10 right-0 w-[70%] h-4 diag-stripes opacity-60 rotate-[-6deg]" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="eyebrow eyebrow-blue mb-6">YOUR MOVE</div>
        <h2 className="display text-paper text-5xl md:text-8xl">
          Stop waiting <br /> to feel <span className="text-blue">ready.</span>
        </h2>
        <p className="mt-10 text-paper/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          You don't need to be in better shape first. You don't need to know someone. You don't need
          the perfect Saturday. You just need to show up once.
        </p>

        <div className="mt-12 display-condensed text-paper text-4xl md:text-6xl">
          SATURDAY · 7 AM · <span className="text-blue">MCMURRAY</span>
        </div>
        <p className="mt-4 text-paper/60">We'll be by the trailhead.</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#" className="btn-primary">{PRIMARY_CTA}</a>
          <a href="#" className="btn-ghost">{SECONDARY_CTA}</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-vintage border-t border-paper/10 py-16">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Wordmark className="!text-4xl" />
          <p className="mt-6 text-paper/70 leading-relaxed max-w-sm">
            GRYT Run Club
            <br />
            Pittsburgh, PA
            <br />
            Saturdays · 7 AM · Montour / Peters Trail
          </p>
        </div>

        <div className="md:col-span-4">
          <MissionStamp />
        </div>

        <div className="md:col-span-3">
          <div className="eyebrow text-blue mb-4">FIND US</div>
          <ul className="space-y-2 text-paper/80">
            <li><a href="#" className="hover:text-blue transition-colors">Strava</a></li>
            <li><a href="#" className="hover:text-blue transition-colors">Heylo</a></li>
            <li><a href="#" className="hover:text-blue transition-colors">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 mt-14 pt-6 border-t border-paper/10 flex flex-wrap justify-between gap-4 eyebrow text-paper/40">
        <span>© 2026 gryt. All rights reserved.</span>
        <span>Built by Laura & Nick Merich</span>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <main className="bg-ink text-paper">
      <Hero />
      <QuickDetails />
      <CorePromise />
      <WhoItsFor />
      <FirstTimer />
      <TheRun />
      <Founders />
      <Community />
      <Beliefs />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
