import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCapState } from "@/lib/shopify-cap.functions";
import { CAP_BINDING } from "@/lib/shopify-cap";

const REVIEW_TITLE = "The Founding Member Cap";
const REVIEW_COPY = [
  "A little GRYT for the miles ahead.",
  "A dark cap with an embroidered GRYT crest and blue trim along the brim. Something to take along for the run, the walk home and the rest of your day.",
  "You do not need the gear to be part of the crew.",
];


export function CapDrop() {
  const read = useServerFn(getCapState);
  const { data } = useQuery({
    queryKey: ["gryt-cap-state", CAP_BINDING.releaseApproved],
    queryFn: () => read(),
    enabled: CAP_BINDING.releaseApproved,
    staleTime: 5 * 60 * 1000,
  });

  const available = data?.state === "available";

  return (
    <section className="border border-paper/15 bg-ink text-paper">
      <div className="grid md:grid-cols-2">
        <div className="aspect-square bg-paper/5 overflow-hidden border-b md:border-b-0 md:border-r border-paper/15 flex items-center justify-center">
          {data?.state === "available" && data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="GRYT cap with embroidered crest and blue brim trim"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="eyebrow text-paper/35 px-6 text-center">
              Cap photo pending review
            </span>
          )}
        </div>
        <div className="p-6 sm:p-10 flex flex-col justify-center gap-5">
          <p className="eyebrow text-blue">GRYT · CAP</p>
          <h2 className="display-condensed uppercase text-[clamp(30px,4.4vw,56px)] leading-[0.94]">
            {available && data.state === "available" ? data.title : REVIEW_TITLE}
          </h2>
          {REVIEW_COPY.map((line) => (
            <p key={line} className="text-paper/70 leading-[1.65]">
              {line}
            </p>
          ))}

          {available && data.state === "available" ? (
            <a
              href={data.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start bg-blue text-ink px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] hover:bg-paper transition-colors"
            >
              View on Shopify
            </a>
          ) : (
            <p className="border border-paper/20 px-4 py-3 text-sm text-paper/60">
              Not for sale yet. This page is in review while the cap, price and
              stock are confirmed.
            </p>
          )}

          <a
            href="/#join"
            className="eyebrow text-paper/70 hover:text-blue transition-colors self-start"
          >
            RSVP for Saturday
          </a>
        </div>
      </div>
    </section>
  );
}
