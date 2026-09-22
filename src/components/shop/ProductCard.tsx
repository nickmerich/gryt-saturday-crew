import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const p = product.node;
  const variant = p.variants.edges.find((v) => v.node.availableForSale)?.node
    ?? p.variants.edges[0]?.node;
  const image = p.images.edges[0]?.node;

  const handleAddToCart = async () => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(`${p.title} added to cart`, { position: "top-center" });
  };

  return (
    <div className="border border-paper/15 bg-ink text-paper flex flex-col">
      <Link
        to="/product/$handle"
        params={{ handle: p.handle }}
        className="block aspect-square bg-paper/5 overflow-hidden"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? p.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-paper/30 eyebrow">
            No image
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <Link to="/product/$handle" params={{ handle: p.handle }}>
          <h3 className="display-condensed uppercase text-2xl leading-[0.95] hover:text-blue transition-colors">
            {p.title}
          </h3>
        </Link>
        <p className="text-sm text-paper/60 line-clamp-3 flex-1">{p.description}</p>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-lg font-semibold">
            {formatPrice(
              p.priceRange.minVariantPrice.amount,
              p.priceRange.minVariantPrice.currencyCode,
            )}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isLoading || !variant || !variant.availableForSale}
            className="bg-blue text-ink px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] hover:bg-paper transition-colors disabled:opacity-40"
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
    </div>
  );
}
