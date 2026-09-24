import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CloudRain, Wind, Thermometer, AlertTriangle } from "lucide-react";
import { getSaturdayForecast } from "@/lib/weather.functions";

function Stat({
  icon,
  label,
  value,
  sub,
  hot,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  hot?: boolean;
}) {
  return (
    <div
      className={`border p-3 sm:p-5 min-w-0 ${hot ? "border-blue bg-blue/10" : "border-paper/20 bg-ink/50"}`}
    >
      <div className="flex items-center gap-2 text-blue [&>svg]:hidden sm:[&>svg]:block">
        {icon}
        <span className="text-[9px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.2em] uppercase leading-tight">{label}</span>
      </div>
      <div className="display-condensed mt-2 text-[clamp(28px,8vw,48px)] leading-[0.95]">
        {value}
      </div>
      {sub ? <div className="mt-1 text-[12px] text-paper/60">{sub}</div> : null}
    </div>
  );
}

export function SaturdayWeather() {
  const fetchForecast = useServerFn(getSaturdayForecast);
  const { data, isPending, isError } = useQuery({
    queryKey: ["saturday-forecast"],
    queryFn: () => fetchForecast(),
    staleTime: 15 * 60 * 1000,
  });

  const rain = data?.rainChance ?? null;
  const wind = data?.windMph ?? null;
  const temp = data?.tempF ?? null;

  const alerts: string[] = [];
  if (rain != null && rain >= 40) alerts.push("Rain likely. Hat and a dry shirt in the car.");
  if (wind != null && wind >= 15) alerts.push("Wind on the trail. Head out into it, ride it home.");
  if (temp != null && temp <= 32) alerts.push("Freezing at the lot. Gloves. Layers you can shed.");
  if (temp != null && temp >= 80) alerts.push("Hot start. Bring water, run the shade.");

  return (
    <section
      id="weather"
      className="relative overflow-hidden concrete grain border-t-2 border-blue text-paper py-14 md:py-20 px-6 sm:px-12 lg:px-24"
    >
      <div className="relative max-w-[1180px] mx-auto">
        <div className="eyebrow eyebrow-blue mb-3">Saturday conditions</div>
        <h2 className="display-condensed text-[clamp(30px,7vw,64px)] leading-[0.94]">
          SATURDAY 7:00 AM
        </h2>
        <p className="mt-3 text-[14px] sm:text-[15px] text-paper/70">
          Valley Brook Road lot{data?.dateLabel ? ` · ${data.dateLabel}` : ""}. Forecast pulled
          from the National Weather Service.
        </p>

        {isPending ? (
          <div className="mt-8 h-[120px] border border-paper/15 bg-ink/40 animate-pulse" />
        ) : isError || !data?.available ? (
          <div className="mt-8 border border-paper/20 bg-ink/50 p-5 text-[14px] text-paper/70">
            Forecast isn't out for that Saturday yet. Check back midweek — the run goes either
            way.
          </div>
        ) : (
          <>
            {alerts.length > 0 ? (
              <div className="mt-8 border-2 border-blue bg-blue text-ink p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} strokeWidth={2.25} />
                  <span className="display-condensed text-[18px] sm:text-[22px]">
                    Dress for it
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-[13px] sm:text-[14px] font-medium">
                  {alerts.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
              <Stat
                icon={<Thermometer size={16} strokeWidth={2} />}
                label="Temp at 7 AM"
                value={temp != null ? `${temp}°` : "—"}
                sub={data.shortForecast ?? undefined}
              />
              <Stat
                icon={<CloudRain size={16} strokeWidth={2} />}
                label="Rain chance"
                value={rain != null ? `${rain}%` : "—"}
                hot={rain != null && rain >= 40}
                sub={rain != null && rain >= 40 ? "Wet start" : "Dry start"}
              />
              <Stat
                icon={<Wind size={16} strokeWidth={2} />}
                label="Wind"
                value={wind != null ? `${wind}` : "—"}
                hot={wind != null && wind >= 15}
                sub={
                  wind != null
                    ? `mph${data.windDirection ? ` · ${data.windDirection}` : ""}`
                    : undefined
                }
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
