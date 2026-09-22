import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSaturdayForecast } from "@/lib/weather.functions";
import { useRun } from "@/lib/run-context";
import type { ForecastReason } from "@/lib/weather";

const MESSAGES: Record<ForecastReason, string> = {
  configuration:
    "The forecast point has not been verified yet. Check the current run details and organizer updates before travelling.",
  location_changed:
    "The meeting point changed. Weather is unavailable until the new forecast location is verified.",
  event_status:
    "Check the run status before travelling. A forecast is not confirmation that a run is going ahead.",
  out_of_range: "The hourly forecast does not reach this run yet. Check again closer to the day.",
  stale:
    "The provider's forecast is missing a recent update. We are not showing old conditions as current.",
  network: "Weather is temporarily unavailable. Your RSVP and run details still work.",
};
export function SaturdayWeather() {
  const run = useRun();
  const fetchForecast = useServerFn(getSaturdayForecast);
  const { data, isPending, isFetching, refetch } = useQuery({
    queryKey: ["saturday-forecast", run.id, run.version],
    queryFn: () => fetchForecast(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    retry: false,
  });
  const current = data?.eventId === run.id && data.eventVersion === run.version ? data : null;
  return (
    <section id="weather" className="gryt-utility-section" aria-labelledby="weather-title">
      <div className="gryt-utility-inner">
        <p className="eyebrow eyebrow-blue">Plan your morning</p>
        <h2 id="weather-title" className="gryt-utility-title">
          Weather for {run.timeLabel}
        </h2>
        <p className="gryt-utility-intro">
          {run.localDate} · {run.location}
        </p>
        <div className="gryt-utility-panel" role="status" aria-live="polite">
          {isPending ? (
            <p>Checking the forecast for this run...</p>
          ) : !current?.available ? (
            <p>{MESSAGES[current?.reason ?? "network"]}</p>
          ) : (
            <>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <dt>Temperature</dt>
                  <dd className="gryt-weather-value">
                    {current.tempF === null ? "Not available" : `${current.tempF}°F`}
                  </dd>
                </div>
                <div>
                  <dt>Rain chance</dt>
                  <dd className="gryt-weather-value">
                    {current.rainChance === null ? "Not available" : `${current.rainChance}%`}
                  </dd>
                </div>
                <div>
                  <dt>Wind</dt>
                  <dd className="gryt-weather-value">
                    {current.windMph === null ? "Not available" : `Up to ${current.windMph} mph`}
                  </dd>
                </div>
              </dl>
              {current.shortForecast && <p className="mt-4">{current.shortForecast}</p>}
              <p className="mt-3 text-sm text-paper/70">
                NWS update:{" "}
                {new Intl.DateTimeFormat("en-US", {
                  timeZone: run.timezone,
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(current.updatedAt!))}{" "}
                Eastern.
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-5 mt-5">
          <button className="btn-ghost" disabled={isFetching} onClick={() => void refetch()}>
            {isFetching ? "Checking..." : "Check again"}
          </button>
          <a href="#join" className="underline underline-offset-4">
            View current run details
          </a>
        </div>
        <p className="mt-4 text-sm text-paper/70">
          Forecasts come from the National Weather Service when available. Conditions can change.
          Run status is an organizer decision, not a weather prediction.
        </p>
      </div>
    </section>
  );
}
