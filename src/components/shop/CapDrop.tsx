import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { CAP_BINDING } from "@/lib/shopify-cap";
import { fetchCapVariant } from "@/lib/shopify-storefront";
import { useCartStore } from "@/stores/cartStore";
import capFront from "@/assets/cap/cap-front.jpg.asset.json";
import capSide from "@/assets/cap/cap-side.jpg.asset.json";
import capAngle from "@/assets/cap/cap-angle.jpg.asset.json";
import capTrail from "@/assets/cap/cap-trail.jpg.asset.json";

const CAP_PHOTOS = [
  {
    src: capFront.url,
    label: "front crest",
    alt: "Black GRYT cap, embroidered bear crest, blue brim trim",
  },
  {
    src: capAngle.url,
    label: "three-quarter view",
    alt: "GRYT cap from above showing crest and perforated panels",
  },
  {
    src: capSide.url,
    label: "side wordmark",
    alt: "Side of the GRYT cap with lowercase gryt print",
  },
  { src: capTrail.url, label: "on the trail", alt: "Runner wearing the GRYT cap by the trail" },
];

const REVIEW_TITLE = "The Founding Member Cap";
const REVIEW_COPY = [
  "A little GRYT for the miles ahead.",
  "A dark cap with an embroidered GRYT crest and blue trim along the brim. Something to take along for the run, the walk home and the rest of your day.",
  "You do not need the gear to be part of the crew.",
];

function money(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

export function CapDrop({ onAdded }: { onAdded?: () => void }) {
  const { data, isLoading: reading } = useQuery({
    queryKey: ["gryt-cap-variant", CAP_BINDING.releaseApproved],
    queryFn: fetchCapVariant,
    enabled: CAP_BINDING.releaseApproved,
    staleTime: 60 * 1000,
    retry: 1,
  });
  const addItem = useCartStore((s) => s.addItem);
  const adding = useCartStore((s) => s.isLoading);
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);

  const listed = Boolean(data);
  const buyable = Boolean(data?.availableForSale);
  const maxQty = Math.max(1, Math.min(5, data?.quantityAvailable ?? 5));

  async function add() {
    if (!data) return;
    const ok = await addItem({
      variantId: data.variantId,
      title: data.productTitle,
      variantTitle: data.title,
      imageUrl: data.imageUrl,
      price: data.price,
      quantity: qty,
    });
    if (ok) {
      toast.success("Added to cart", { position: "top-center" });
      onAdded?.();
    } else {
      toast.error(useCartStore.getState().error ?? "That did not add. Try again.", {
        position: "top-center",
      });
    }
  }

  return (
    <section className="border border-paper/15 bg-ink text-paper">
      <div className="grid md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r border-paper/15">
          <div className="aspect-[4/5] overflow-hidden bg-ink">
            <img
              src={CAP_PHOTOS[photo].src}
              alt={CAP_PHOTOS[photo].alt}
              className="w-full h-full object-cover"
              style={{ filter: "none" }}
            />
          </div>
          <div className="grid grid-cols-4 gap-px bg-paper/15 border-t border-paper/15">
            {CAP_PHOTOS.map((p, i) => (
              <button
                key={p.src}
                type="button"
                aria-label={`Show ${p.label}`}
                aria-pressed={i === photo}
                onClick={() => setPhoto(i)}
                className={`aspect-square overflow-hidden bg-ink ${i === photo ? "outline outline-2 -outline-offset-2 outline-blue" : "opacity-60 hover:opacity-100"}`}
              >
                <img
                  src={p.src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: "none" }}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 sm:p-10 flex flex-col justify-center gap-5">
          <p className="eyebrow text-blue">GRYT · CAP</p>
          <h2 className="display-condensed uppercase text-[clamp(30px,4.4vw,56px)] leading-[0.94]">
            {data?.productTitle ?? REVIEW_TITLE}
          </h2>
          {REVIEW_COPY.map((line) => (
            <p key={line} className="text-paper/70 leading-[1.65]">
              {line}
            </p>
          ))}

          <div className="space-y-3" aria-label="Stripe cap checkout">
            <a
              href="/shop/checkout"
              className="inline-flex min-h-12 items-center justify-center bg-blue text-ink px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] hover:bg-paper transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
            >
              Buy with Stripe
            </a>
            <p className="text-sm text-paper/70">
              Choose your quantity and free US shipping or Saturday pickup at checkout. This
              checkout is separate from your Shopify cart.
            </p>
          </div>

          {reading ? (
            <p className="text-sm text-paper/50">Checking Shopify availability…</p>
          ) : listed && data ? (
            <>
              <p className="display-condensed uppercase text-2xl tracking-[0.02em]">
                {money(data.price.amount, data.price.currencyCode)}
              </p>
              {data.quantityAvailable !== null && (
                <p className="font-mono text-base text-blue" aria-live="polite">
                  {data.quantityAvailable}/{CAP_BINDING.editionSize} hats left
                </p>
              )}
              {buyable ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center border border-paper/25">
                    <button
                      type="button"
                      aria-label="One fewer"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="h-12 w-12 grid place-items-center"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label="One more"
                      onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                      className="h-12 w-12 grid place-items-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={add}
                    disabled={adding}
                    className="bg-blue text-ink px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] hover:bg-paper transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to cart"}
                  </button>
                </div>
              ) : (
                <p className="border border-paper/20 px-4 py-3 text-sm text-paper/60">Sold out.</p>
              )}
            </>
          ) : (
            <div>
              <p className="border border-paper/20 px-4 py-3 text-sm text-paper/60">
                Shopify checkout is currently unavailable. You can buy the cap with Stripe above.
              </p>
            </div>
          )}

          <a
            href="/#join"
            className="eyebrow text-paper/70 hover:text-blue transition-colors self-start"
          >
            RSVP This Saturday →
          </a>
        </div>
      </div>
    </section>
  );
}
