import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ProductCard } from "@/components/shop/ProductCard";
import { Toaster } from "@/components/ui/sonner";
import { useCartSync } from "@/hooks/useCartSync";
import { fetchProducts } from "@/lib/shopify";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop · GRYT Run Club" },
      {
        name: "description",
        content:
          "GRYT Run Club gear. Caps and kit for the Saturday crew on the Montour / Peters Trail.",
      },
      { property: "og:title", content: "Shop · GRYT Run Club" },
      {
        property: "og:description",
        content: "GRYT Run Club gear for the Saturday crew.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  useCartSync();
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchProducts(50),
  });

  return (
    <div className="bg-ink text-paper min-h-screen">
      <SiteNav />
      <Toaster position="top-center" />
      <main className="px-5 sm:px-8 md:px-12 py-14 md:py-20 max-w-[1180px] mx-auto">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-10">
          <div>
            <p className="eyebrow text-blue mb-3">GRYT · SHOP</p>
            <h1 className="display-condensed uppercase text-[clamp(40px,7vw,84px)] leading-[0.92]">
              Wear the work.
            </h1>
            <p className="text-paper/70 mt-4 max-w-[520px]">
              Gear for the Saturday crew. Runs stay free. This is just kit.
            </p>
          </div>
          <CartDrawer />
        </div>

        {isLoading && <p className="text-paper/60">Loading products...</p>}
        {error && (
          <p className="text-paper/60">
            Products could not be loaded right now. Try again shortly.
          </p>
        )}
        {!isLoading && !error && (products?.length ?? 0) === 0 && (
          <p className="text-paper/60">No products found.</p>
        )}
        {!!products?.length && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
