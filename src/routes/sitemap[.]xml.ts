import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SKILLS, WORKFLOWS } from "@/lib/the-work";

const BASE_URL = "https://grytrunclub.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/calendar", changefreq: "weekly", priority: "0.9" },
          { path: "/resources", changefreq: "monthly", priority: "0.8" },
          { path: "/races", changefreq: "monthly", priority: "0.8" },
          { path: "/faq", changefreq: "monthly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/press", changefreq: "monthly", priority: "0.6" },
          { path: "/partners", changefreq: "monthly", priority: "0.6" },
          { path: "/music-tectonics", changefreq: "weekly", priority: "0.6" },
          { path: "/plan", changefreq: "monthly", priority: "0.6" },
          { path: "/work", changefreq: "monthly", priority: "0.7" },
          ...WORKFLOWS.map((w) => ({
            path: `/work/workflows/${w.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
          ...SKILLS.map((s) => ({
            path: `/work/skills/${s.slug}`,
            changefreq: "monthly" as const,
            priority: "0.5",
          })),
          { path: "/resources/playbooks", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/conversations", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/more-than-miles", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/running-with-a-group", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/eqt-pittsburgh-10-miler-2026", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/what-to-eat-before-a-run", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/should-you-join-a-running-club", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/build-a-running-base", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/increase-running-mileage-without-injury", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/running-at-night-safety-pittsburgh", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/cross-training-for-runners", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/graphics", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/manifesto", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/recap", changefreq: "monthly", priority: "0.7" },
          { path: "/resources/pace-calculator", changefreq: "monthly", priority: "0.8" },
          { path: "/runs", changefreq: "weekly", priority: "0.8" },
          { path: "/milestones", changefreq: "weekly", priority: "0.7" },
          { path: "/resources/what-to-wear-running", changefreq: "weekly", priority: "0.8" },
          { path: "/resources/runs", changefreq: "monthly", priority: "0.6" },
          { path: "/resources/playbooks/best-free-run-clubs-south-hills-2026", changefreq: "monthly", priority: "0.6" },
          { path: "/resources/playbooks/best-free-running-clubs-pittsburgh-2026", changefreq: "monthly", priority: "0.6" },
          { path: "/resources/playbooks/fleet-feet-pittsburgh-vs-independent-run-clubs", changefreq: "monthly", priority: "0.6" },
          { path: "/resources/playbooks/gryt-vs-yinz-run-club", changefreq: "monthly", priority: "0.6" },
          { path: "/resources/playbooks/saturday-runs-what-to-expect", changefreq: "monthly", priority: "0.6" },
          { path: "/resources/playbooks/winter-durability-plan", changefreq: "monthly", priority: "0.7" },
          // /register is retired (paid run entry removed) and is noindex — not listed here.
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
