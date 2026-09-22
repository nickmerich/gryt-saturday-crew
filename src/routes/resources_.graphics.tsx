import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter, MonogramG } from "@/components/site/Chrome";
import ogImage from "@/assets/og-graphics.jpg";
import { SITE_ORIGIN } from "@/lib/site";

const SITE = SITE_ORIGIN;
const URL = `${SITE}/resources/graphics`;
const TITLE = "Graphics · gryt run club";
const DESCRIPTION =
  "Free downloadable graphics from gryt run club — logos, printable posters, pace cards, and social kits. Free to use, free to share.";

export const Route = createFileRoute("/resources_/graphics")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
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
  }),
  component: GraphicsPage,
});


type Graphic = {
  slug: string;
  name: string;
  format: string;
  description: string;
  details: string[];
  fileSize?: string;
  comingSoon?: boolean;
};

const GRAPHICS: Graphic[] = [
  {
    slug: "logo-pack",
    name: "GRYT Run Club Logo Pack",
    format: "PNG + SVG",
    fileSize: "2.4 MB",
    description: "Official logo files for partners, press, and media kits.",
    details: [
      "Layered wordmark — white fill with baby-blue offset outline (signature)",
      "Flat wordmark — black, white, and baby-blue variants",
      "G monogram — for avatars, favicons, and small-format lockups",
      "Vector SVG + high-res PNG for every variant",
    ],
  },
  {
    slug: "saturday-poster",
    name: "Saturday Morning Poster",
    format: "PDF · 8.5×11",
    fileSize: "1.8 MB",
    description: "Printable poster for bulletin boards, coffee shops, and gyms.",
    details: [
      "Print-ready CMYK, 300 DPI, with 0.125\" bleed",
      "Editable date and time block — drop in your local meetup info",
      "Two color treatments: signature black/blue and inverted white/blue",
    ],
  },
  {
    slug: "pace-card",
    name: "Race Day Pace Card",
    format: "PDF · 4×6",
    fileSize: "640 KB",
    description:
      "Nick's pacing reference for marathon and half-marathon runners.",
    details: [
      "Mile splits for every goal time from 1:30 to 5:00 half / 3:00 to 6:00 full",
      "Designed to fold into a race-bib pocket or armband sleeve",
      "Pace-band tear-off on the back for quick reference",
    ],
  },
  {
    slug: "social-kit",
    name: "Social Media Kit",
    format: "ZIP",
    description:
      "Instagram story templates, highlight covers, and profile graphics.",
    details: [
      "15 story templates — event announcements, finisher posts, weather updates",
      "10 highlight cover icons in the signature baby-blue palette",
      "Profile picture and banner templates for IG, X, and Strava",
    ],
    comingSoon: true,
  },
];

function GraphicsPage() {
  return (
    <main className="bg-ink text-paper">
      <SiteNav />
      <section className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[1100px] mx-auto">
          <Link
            to="/resources"
            className="eyebrow text-blue hover:text-paper transition-colors"
          >
            ← All resources
          </Link>
          <p className="eyebrow text-blue mt-8 mb-5">FREE TO USE & SHARE</p>
          <h1 className="display-condensed uppercase text-[clamp(48px,9vw,128px)] leading-[0.9]">
            Graphics
          </h1>
          <p className="mt-7 text-paper/75 text-lg md:text-xl max-w-[640px] leading-[1.55]">
            Brand assets, printable posters, and pace cards. All free.
            Attribution appreciated, not required.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-12 lg:px-24 py-20 md:py-28 border-b border-paper/15">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-10">
          {GRAPHICS.map((g) => (
            <article
              key={g.slug}
              id={g.slug}
              className={`grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-10 border border-paper/15 bg-black/40 p-6 md:p-8 hover:border-blue transition-colors ${
                g.comingSoon ? "opacity-60" : ""
              }`}
            >
              <div className="relative aspect-[4/3] md:aspect-auto bg-black flex items-center justify-center overflow-hidden border border-paper/15">
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, var(--blue) 0 2px, transparent 2px 12px)",
                  }}
                  aria-hidden
                />
                <MonogramG className="h-24 w-24 relative" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] border border-paper/40 text-paper/80">
                    {g.format}
                  </span>
                  {g.fileSize && (
                    <span className="eyebrow text-paper/55">{g.fileSize}</span>
                  )}
                  {g.comingSoon && (
                    <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] border border-paper/25 text-paper/55">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h2 className="text-[24px] md:text-[28px] font-bold leading-[1.15] tracking-tight">
                  {g.name}
                </h2>
                <p className="text-paper/70 text-[15px] md:text-[16px] leading-[1.6]">
                  {g.description}
                </p>
                <ul className="mt-1 space-y-2">
                  {g.details.map((d, i) => (
                    <li
                      key={i}
                      className="text-paper/75 text-[14px] md:text-[15px] leading-[1.55] pl-5 relative"
                    >
                      <span
                        className="absolute left-0 top-[0.55em] w-2 h-px bg-blue"
                        aria-hidden
                      />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="pt-3 mt-auto">
                  {g.comingSoon ? (
                    <span className="inline-flex items-center px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] border border-paper/25 text-paper/55">
                      Notify Me
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] border border-paper/25 text-paper/55">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
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
        <p className="eyebrow text-blue mb-5">USING OUR GRAPHICS?</p>
        <h2 className="display-condensed uppercase text-[clamp(36px,6vw,80px)] leading-[0.92]">
          Tag us. We'll repost.
        </h2>
        <p className="mt-6 text-paper/75 text-[16px] md:text-[17px] leading-[1.6] max-w-[560px] mx-auto">
          Print the poster, share the kit, hand out pace cards on race morning.
          Just tag @grytrunclub so we can see it out in the wild.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link to="/resources" hash="get-involved" className="btn-primary">
            Need a Custom Asset? →
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
