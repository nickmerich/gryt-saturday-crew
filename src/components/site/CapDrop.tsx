import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCapListing } from "@/lib/shopify-cap.functions";
import type { CapState } from "@/lib/shopify-cap";

const labels: Record<CapState["status"], string> = {
  review: "Shop listing in review",
  available: "Available through GRYT Shop",
  sold_out: "Currently unavailable to buy",
  unavailable: "Shop details unavailable",
};

export function CapDrop() {
  const getListing = useServerFn(getCapListing);
  const { data, isPending } = useQuery({
    queryKey: ["gryt-cap-listing"],
    queryFn: () => getListing(),
    staleTime: 60_000,
    retry: false,
  });
  const status = data?.status ?? "unavailable";
  return (
    <section id="merch" aria-labelledby="cap-heading" className="mb-24 md:mb-32 scroll-mt-24">
      <div className="border-b border-paper/30 pb-5 mb-8">
        <p className="text-blue text-xs uppercase tracking-[0.18em] mb-3">GRYT / The cap</p>
        <h2
          id="cap-heading"
          className="text-3xl md:text-5xl uppercase leading-none"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Something to wear along the way.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <figure className="m-0">
          <img
            src="/images/gryt-cap-detail.webp"
            alt="Close-up reference photo of a dark GRYT cap with an embroidered crest and blue brim trim"
            width={1000}
            height={1077}
            loading="lazy"
            className="w-full h-auto border border-paper/25"
          />
          <figcaption className="text-xs text-paper/70 mt-3">
            Cap photo reference. Final shop details are being reviewed.
          </figcaption>
        </figure>
        <div>
          <p className="text-blue text-xs uppercase tracking-[0.18em] mb-4" role="status">
            {isPending ? "Checking shop details" : labels[status]}
          </p>
          <h3
            className="text-2xl md:text-3xl leading-tight mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data?.title ?? "The Founding Member Cap"}
          </h3>
          <p className="text-base text-paper/80 max-w-md leading-relaxed">
            A little GRYT for the miles ahead. You do not need the gear to be part of the crew.
          </p>
          {status === "available" && data?.productUrl ? (
            <>
              <a
                href={data.productUrl}
                className="inline-flex mt-7 border border-blue text-blue px-6 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
              >
                View in GRYT Shop
              </a>
              <p className="text-sm text-paper/70 mt-3">
                Current price, options and checkout are in Shopify.
              </p>
            </>
          ) : (
            <p className="mt-7 border-l-2 border-blue pl-4 text-sm text-paper/80 leading-relaxed">
              {status === "review"
                ? "The cap listing is not open for orders. We will share the shop details when they are ready."
                : isPending
                  ? "Checking the cap listing. No purchase is being made."
                  : "Ordering is not available here right now. There is no waitlist signup or payment on this page."}
            </p>
          )}
          <Link
            to="/"
            hash="join"
            className="inline-block mt-7 text-sm text-blue underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Come run with us
          </Link>
        </div>
      </div>
    </section>
  );
}
