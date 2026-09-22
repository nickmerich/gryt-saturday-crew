import { Suspense, lazy, useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MapPin, Navigation } from "lucide-react";
import {
  MEET_ADDRESS,
  MEET_MAPS_URL,
  PARKING_NOTE,
  ROUTE_OPTIONS,
  gainFor,
  profileFor,
  type RouteOption,
} from "@/lib/montour-route";

const MapCanvas = lazy(() => import("./MontourMapCanvas"));

function MapShell() {
  return <div className="h-[280px] sm:h-[420px] w-full bg-ink/60 animate-pulse" />;
}

export function MontourRouteMap() {
  const [mounted, setMounted] = useState(false);
  const [option, setOption] = useState<RouteOption>(ROUTE_OPTIONS[1]);
  useEffect(() => setMounted(true), []);

  const series = profileFor(option);
  const gain = gainFor(option);
  const low = Math.min(...series.map((p) => p.ft));
  const high = Math.max(...series.map((p) => p.ft));

  return (
    <section
      id="route"
      className="relative overflow-hidden bg-ink text-paper border-t-2 border-blue py-14 sm:py-20 px-5 sm:px-12 lg:px-24"
    >
      <div className="relative max-w-[1180px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-3">The route</div>
        <h2 className="display-condensed text-[clamp(30px,7vw,64px)] leading-[0.94]">
          MONTOUR TRAIL · OUT AND BACK
        </h2>
        <p className="mt-3 max-w-[56ch] text-[14px] sm:text-[15px] leading-[1.65] text-paper/70">
          Flat crushed limestone. Pick your distance, run out to the marker, turn around. Nobody
          gets left behind.
        </p>

        <div className="mt-6 flex gap-2 sm:gap-3" role="group" aria-label="Pick a distance">
          {ROUTE_OPTIONS.map((o) => {
            const active = o.id === option.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setOption(o)}
                aria-pressed={active}
                className={`display-condensed flex-1 sm:flex-none px-4 sm:px-7 py-3 text-[16px] sm:text-[18px] border-2 transition-colors ${
                  active
                    ? "bg-blue text-ink border-blue"
                    : "bg-transparent text-paper border-paper/30 hover:border-blue hover:text-blue"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] text-paper/60">
          {option.blurb} Turn at {option.outMi.toFixed(1)} mi out · {gain} ft of climb.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="border-2 border-blue">
            {mounted ? (
              <Suspense fallback={<MapShell />}>
                <MapCanvas option={option} />
              </Suspense>
            ) : (
              <MapShell />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="border border-paper/20 bg-vintage p-4 sm:p-5">
              <div className="text-[10px] tracking-[0.22em] uppercase text-blue">
                Elevation · {option.totalMi} mi round trip
              </div>
              <div className="mt-3 h-[130px] sm:h-[150px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="grytElev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#89CFF0" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#89CFF0" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="mi"
                      tick={{ fill: "#a8a39d", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
                      tickFormatter={(v: number) => `${v}`}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[low - 8, high + 8]}
                      tick={{ fill: "#a8a39d", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={38}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#000",
                        border: "2px solid #89CFF0",
                        borderRadius: 0,
                        fontSize: 12,
                      }}
                      labelFormatter={(v) => `Mile ${v}`}
                      formatter={(v: number) => [`${v} ft`, "Elevation"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="ft"
                      stroke="#89CFF0"
                      strokeWidth={2}
                      fill="url(#grytElev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-[11px] text-paper/50">
                Approximate profile. Rail-trail grade, never steeper than about 2%.
              </div>
            </div>

            <div className="border-2 border-blue bg-blue text-ink p-4 sm:p-5">
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
                className="mt-4 inline-flex items-center gap-2 border-2 border-ink px-4 py-2 text-[12px] tracking-[0.18em] uppercase font-bold hover:bg-ink hover:text-blue transition-colors"
              >
                <Navigation size={14} strokeWidth={2.5} />
                Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
