import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { useState } from "react";
import { CapDrop } from "@/components/shop/CapDrop";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useCartSync } from "@/hooks/useCartSync";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Cap · GRYT Run Club" },
      {
        name: "description",
        content:
          "Shop the GRYT Founding Member Cap with secure Stripe checkout, free US shipping or Saturday pickup. The Saturday run stays free.",
      },
      { property: "og:title", content: "Cap · GRYT Run Club" },
      {
        property: "og:description",
        content:
          "The GRYT Founding Member Cap. Secure Stripe checkout with free US shipping or Saturday pickup. The Saturday run stays free.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  useCartSync();
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteNav />
      <main className="px-5 sm:px-8 md:px-12 py-14 md:py-20 max-w-[1180px] mx-auto">
        <div className="flex items-start justify-between gap-4 mb-3">
          <p className="eyebrow text-foreground">GRYT · SHOP</p>
          <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
        </div>
        <h1 className="display-condensed uppercase text-[clamp(38px,6.4vw,76px)] leading-[0.92] mb-4">
          Wear the work.
        </h1>
        <p className="text-foreground/70 max-w-[520px] mb-10">
          The run is free and always will be. This is just kit.
        </p>
        <CapDrop onAdded={() => setCartOpen(true)} />
      </main>
      <SiteFooter />
      <Toaster position="top-center" />
    </div>
  );
}
