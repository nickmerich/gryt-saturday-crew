import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { CapDrop } from "@/components/shop/CapDrop";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Cap · GRYT Run Club" },
      {
        name: "description",
        content:
          "The GRYT Founding Member Cap. In review while the cap, price and stock are confirmed. The Saturday run stays free.",
      },
      { property: "og:title", content: "Cap · GRYT Run Club" },
      {
        property: "og:description",
        content:
          "The GRYT Founding Member Cap. In review. The Saturday run stays free.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <div className="bg-ink text-paper min-h-screen">
      <SiteNav />
      <main className="px-5 sm:px-8 md:px-12 py-14 md:py-20 max-w-[1180px] mx-auto">
        <p className="eyebrow text-blue mb-3">GRYT · SHOP</p>
        <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,76px)] leading-[0.92] mb-4">
          Wear the work.
        </h1>
        <p className="text-paper/70 max-w-[520px] mb-10">
          The run is free and always will be. This is just kit.
        </p>
        <CapDrop />
      </main>
      <SiteFooter />
    </div>
  );
}
