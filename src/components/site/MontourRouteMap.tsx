import { useEffect } from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { MEET_ADDRESS, MEET_MAPS_URL, PARKING_NOTE } from "@/lib/montour-route";

const ROUTE_ID = "3538247257394386560";
const ROUTE_URL = `https://www.strava.com/routes/${ROUTE_ID}`;
const EMBED_SRC = "https://strava-embeds.com/embed.js";

function StravaRouteEmbed() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SRC}"]`);
    if (existing) existing.remove();
    const s = document.createElement("script");
    s.src = EMBED_SRC;
    s.async = true;
    document.body.appendChild(s);
    // The Strava script injects an untitled iframe. Give it an accessible name.
    const obs = new MutationObserver(() => {
      document
        .querySelectorAll<HTMLIFrameElement>('iframe[src*="strava-embeds.com"]:not([title])')
        .forEach((f) => f.setAttribute("title", "Strava map of the GRYT Saturday route on the Montour Trail"));
    });
    obs.observe(document.body, { childList: true, subtree: true });
    const stop = window.setTimeout(() => obs.disconnect(), 15000);
    return () => {
      obs.disconnect();
      window.clearTimeout(stop);
    };
  }, []);

  return (
    <div className="bg-background min-h-[280px] sm:min-h-[420px]">
      <div
        className="strava-embed-placeholder"
        data-embed-type="route"
        data-embed-id={ROUTE_ID}
        data-style="standard"
        data-map-hash="13.39/40.29528/-80.11719"
        data-from-embed="true"
        data-token="KqsHqv9lf1PXte_Xq0rmVnpr6imwl-c2DhrTlBG9Ras"
      />
    </div>
  );
}

export function MontourRouteMap() {
  return (
    <section
      id="route"
      className="relative overflow-hidden bg-background text-foreground border-t-2 border-blue py-14 md:py-20 px-6 sm:px-12 lg:px-24"
    >
      <div className="relative max-w-[1180px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-3">The route</div>
        <h2 className="display-condensed text-[clamp(30px,7vw,64px)] leading-[0.94]">
          MONTOUR TRAIL · OUT AND BACK
        </h2>
        <p className="mt-3 max-w-[56ch] text-[14px] sm:text-[15px] leading-[1.65] text-foreground/70">
          The Saturday route, straight from Strava. Run out, turn around, finish together.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <div className="border-2 border-blue bg-background">
              <div className="flex items-center justify-between gap-3 bg-blue text-ink px-4 py-2.5">
                <span className="display-condensed text-[18px] sm:text-[22px] leading-none">
                  SATURDAY ROUTE
                </span>
                <span className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-bold">
                  4.2 MI · 81 FT
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-background">
                <StravaRouteEmbed />
              </div>
            </div>
            <a
              href={ROUTE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase font-bold text-foreground hover:text-foreground/70 transition-colors"
            >
              <ExternalLink size={14} strokeWidth={2.25} />
              Open the route in Strava
            </a>
          </div>

          <div className="border-2 border-blue bg-blue text-ink p-4 sm:p-5 self-start">
            <div className="flex items-center gap-2">
              <MapPin size={16} strokeWidth={2.25} />
              <span className="text-[10px] tracking-[0.22em] uppercase font-bold">Parking</span>
            </div>
            <div className="display-condensed mt-2 text-[20px] sm:text-[24px] leading-[1.05]">
              {MEET_ADDRESS}
            </div>
            <p className="mt-2 text-[13px] leading-[1.55] text-ink/75">{PARKING_NOTE}</p>
            <a
              href={MEET_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 border-2 border-ink px-4 py-2 text-[12px] tracking-[0.18em] uppercase font-bold hover:bg-background hover:text-foreground/70 transition-colors"
            >
              <Navigation size={14} strokeWidth={2.5} />
              Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
