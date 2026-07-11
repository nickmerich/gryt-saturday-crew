import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import ogImage from "@/assets/og-conversations.jpg";

const SITE = "https://gryt-saturday-crew.lovable.app";
const URL = `${SITE}/resources/conversations`;
const TITLE = "Gryt Run Club Interviews & Conversations | gryt run club";
const DESCRIPTION =
  "Explore gryt run club interviews with our founders, members, and partners. Real stories from the people behind the miles — in their own words.";

export const Route = createFileRoute("/resources_/conversations")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:image", content: `${SITE}${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE}${ogImage}` },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Who is featured in gryt run club interviews?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Gryt run club interviews feature founders, members, and community partners sharing their running journeys and stories.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: ConversationsPage,
});


type Conversation = {
  slug: string;
  guest: string;
  role: string;
  tag: string;
  hook: string;
  qa: { q: string; a: string }[];
  comingSoon?: boolean;
};

const CONVERSATIONS: Conversation[] = [
  {
    slug: "nick-merich",
    guest: "Nick Merich",
    role: "Founder",
    tag: "Founder Q&A",
    hook: "On why Saturday morning became the most important appointment of the week.",
    qa: [
      {
        q: "Why Saturday at 8 AM?",
        a: "Because nothing else competes with it. Work doesn't. Brunch doesn't. Hangovers do, briefly, until the people you'd be hung over with start running too. The time only works if it's protected, and protecting it is the whole job of being a founder.",
      },
      {
        q: "What did you get wrong in the first six months?",
        a: "I worried about the wrong things. Logo, Instagram, branded socks. The thing that mattered was whether the same five people came back next week, and the answer to that was just: did we make them feel seen and did we run a route they could finish.",
      },
      {
        q: "What does GRYT look like in five years?",
        a: "Same trailhead, same time, more people. If we have to add a second start time because the first one got too big, that's success. If we franchise into other cities, only with founders who would run alone in the rain on week one.",
      },
    ],
  },
  {
    slug: "laura-merich",
    guest: "Laura Merich",
    role: "Co-Founder",
    tag: "Interview",
    hook: "On community, parenthood, and why consistency beats perfection.",
    qa: [
      {
        q: "How do you think about community vs. performance?",
        a: "Performance is downstream of community for almost everyone. The people who PR with us aren't the ones training the hardest in isolation — they're the ones who keep showing up because they don't want to let the crew down.",
      },
      {
        q: "How do you run a club with a kid at home?",
        a: "By being honest that some Saturdays I'm pushing a stroller and some Saturdays I'm not running at all. Modeling that the club is bigger than any one person's perfect attendance is part of the point.",
      },
      {
        q: "What's the one thing you'd tell a new runner joining us?",
        a: "We are not faster than you think we are. We are just more consistent than you think you can be. That gap closes in about three months.",
      },
    ],
  },
  {
    slug: "community-feature",
    guest: "Your story here",
    role: "Community Member",
    tag: "Community",
    hook: "Community members, partners, and coaches we've featured.",
    qa: [],
    comingSoon: true,
  },
];

function ConversationsPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <section className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[900px] mx-auto">
          <Link
            to="/resources"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All resources
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">INTERVIEWS & FEATURES</p>
          <h1 className="display-condensed uppercase text-[clamp(48px,9vw,128px)] leading-[0.9]">
            Gryt Run Club Interviews & Conversations
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl max-w-[640px] leading-[1.55]">
            Explore gryt run club interviews with founders, members, and
            partners — the people behind the miles sharing what it actually
            takes to keep showing up.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[900px] mx-auto flex flex-col gap-20">
          {CONVERSATIONS.map((c) => (
            <article
              key={c.slug}
              id={c.slug}
              className={`border-t border-paper/15 pt-12 ${
                c.comingSoon ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-3 flex-wrap mb-5">
                <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] bg-blue text-ink">
                  {c.tag}
                </span>
                <span className="eyebrow text-paper/55">{c.role}</span>
              </div>
              <h2 className="text-[28px] md:text-[40px] font-bold leading-[1.1] tracking-tight">
                {c.guest}
              </h2>
              <blockquote className="mt-6 text-paper/80 text-[17px] md:text-[19px] leading-[1.55] border-l-2 border-blue pl-5 italic">
                "{c.hook}"
              </blockquote>
              {c.qa.length > 0 && (
                <div className="mt-10 space-y-8">
                  {c.qa.map((item, i) => (
                    <div key={i}>
                      <p className="eyebrow text-blue mb-3">Q · {item.q}</p>
                      <p className="text-paper/85 text-[16px] md:text-[17px] leading-[1.7]">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {c.comingSoon && (
                <p className="mt-6 eyebrow text-paper/40">Coming Soon</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <CTA />
      <SiteFooter />
    </main>
  );
}

function CTA() {
  return (
    <section className="bg-black px-6 sm:px-12 lg:px-24 py-24 md:py-32 border-b border-paper/15">
      <div className="max-w-[900px] mx-auto text-center">
        <p className="eyebrow text-blue mb-5">WANT TO BE FEATURED?</p>
        <h2 className="display-condensed uppercase text-[clamp(36px,6vw,80px)] leading-[0.92]">
          Got a story worth telling?
        </h2>
        <p className="mt-6 text-paper/75 text-[16px] md:text-[17px] leading-[1.6] max-w-[560px] mx-auto">
          We feature runners, coaches, and partners doing real work in
          community-driven fitness.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/resources"
            hash="get-involved"
            className="btn-primary"
          >
            Pitch a Story →
          </Link>
          <Link
            to="/resources"
            className="inline-flex items-center px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] border border-paper/40 text-paper hover:border-blue hover:text-blue transition-colors"
          >
            Back to Resources
          </Link>
        </div>
      </div>
    </section>
  );
}
