import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { useCartSync } from "@/hooks/useCartSync";
import { useCartStore } from "@/stores/cartStore";
import { fetchProductByHandle, formatPrice } from "@/lib/shopify";

export const Route = createFileRoute("/product/$handle")({
  head: () => ({
    meta: [
      { title: "Product · GRYT Run Club Shop" },
      {
        name: "description",
        content: "GRYT Run Club gear for the Saturday crew on the Montour / Peters Trail.",
      },
      { property: "og:title", content: "Product · GRYT Run Club Shop" },
      {
        property: "og:description",
        content: "GRYT Run Club gear for the Saturday crew.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  useCartSync();
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const [variantId, setVariantId] = useState<string | null>(null);

  const { data: product, isPending, error } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  const p = product?.node;
  const variants = p?.variants.edges.map((v) => v.node) ?? [];
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const image = p?.images.edges[0]?.node;

  const handleAddToCart = async () => {
    if (!product || !variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(`${p?.title} added to cart`, { position: "top-center" });
  };

  return (
    <div className="bg-ink text-paper min-h-screen">
      <SiteNav />
      <Toaster position="top-center" />
      <main className="px-5 sm:px-8 md:px-12 py-12 md:py-16 max-w-[1180px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link to="/shop" className="eyebrow text-paper/70 hover:text-blue transition-colors">
            ← Back to shop
          </Link>
          <CartDrawer />
        </div>

        {isPending && <p className="text-paper/60">Loading...</p>}
        {error && <p className="text-paper/60">This product could not be loaded.</p>}
        {!isPending && !error && !p && (
          <p className="text-paper/60">Product not found.</p>
        )}

        {p && (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square bg-paper/5 overflow-hidden border border-paper/15">
              {image ? (
                <img
                  src={image.url}
                  alt={image.altText ?? p.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-paper/30 eyebrow">
                  No image
                </div>
              )}
            </div>
            <div>
              <h1 className="display-condensed uppercase text-[clamp(34px,5vw,64px)] leading-[0.92]">
                {p.title}
              </h1>
              <p className="text-2xl font-semibold mt-4">
                {variant
                  ? formatPrice(variant.price.amount, variant.price.currencyCode)
                  : formatPrice(
                      p.priceRange.minVariantPrice.amount,
                      p.priceRange.minVariantPrice.currencyCode,
                    )}
              </p>
              <p className="text-paper/70 mt-5 whitespace-pre-line">{p.description}</p>

              {variants.length > 1 && (
                <div className="mt-7">
                  <p className="eyebrow text-paper/55 mb-3">Options</p>
                  <div className="flex flex-wrap gap-2.5">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVariantId(v.id)}
                        disabled={!v.availableForSale}
                        className={`px-4 py-2.5 text-sm uppercase tracking-wide border transition-colors disabled:opacity-40 ${
                          variant?.id === v.id
                            ? "bg-blue text-ink border-blue"
                            : "border-paper/25 text-paper/90 hover:border-blue hover:text-blue"
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isLoading || !variant || !variant.availableForSale}
                className="mt-8 w-full sm:w-auto inline-flex items-center justify-center bg-blue text-ink px-7 py-4 text-xs font-bold uppercase tracking-[0.14em] hover:bg-paper transition-colors disabled:opacity-40"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : variant?.availableForSale ? (
                  "Add to cart"
                ) : (
                  "Sold out"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
