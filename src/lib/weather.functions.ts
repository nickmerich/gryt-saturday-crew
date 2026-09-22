import { createServerFn } from "@tanstack/react-start";
import { currentRun } from "./run-occurrence";
import {
  forecastForEvent,
  unavailableForecast,
  type HourlyPeriod,
  type SaturdayForecast,
} from "./weather";

// Configure only after the organizer verifies the forecast point and its address.
// Nothing is guessed from the unverified route polyline.
let cache: { key: string; expires: number; value: SaturdayForecast } | null = null;
let flight: { key: string; promise: Promise<SaturdayForecast> } | null = null;
const headers = {
  "User-Agent": "gryt-run-club (https://grytrunclub.com)",
  Accept: "application/geo+json",
};

export const getSaturdayForecast = createServerFn({ method: "GET" }).handler(
  async (): Promise<SaturdayForecast> => {
    const event = currentRun();
    if (
      event.status === "cancelled" ||
      event.status === "unconfirmed" ||
      event.status === "completed"
    )
      return unavailableForecast(event, "event_status");
    const latText = process.env.GRYT_FORECAST_LAT;
    const lonText = process.env.GRYT_FORECAST_LON;
    const location = process.env.GRYT_FORECAST_LOCATION;
    const lat = Number(latText),
      lon = Number(lonText);
    if (
      !latText ||
      !lonText ||
      !location ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    )
      return unavailableForecast(event, "configuration");
    if (location !== event.location) return unavailableForecast(event, "location_changed");
    const key = JSON.stringify([event.id, event.version, event.startsAt, lat, lon, location]);
    if (cache?.key === key && cache.expires > Date.now()) return cache.value;
    if (flight?.key === key) return flight.promise;
    const promise = (async () => {
      try {
        const points = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
          headers,
          signal: AbortSignal.timeout(8000),
          redirect: "error",
        });
        if (!points.ok) throw new Error("Points unavailable");
        const point = (await points.json()) as { properties?: { forecastHourly?: string } };
        const hourly = new URL(point.properties?.forecastHourly ?? "");
        if (
          hourly.protocol !== "https:" ||
          hourly.hostname !== "api.weather.gov" ||
          hourly.username ||
          hourly.password
        )
          throw new Error("Unexpected hourly destination");
        const response = await fetch(hourly, {
          headers,
          signal: AbortSignal.timeout(8000),
          redirect: "error",
        });
        if (!response.ok) throw new Error("Forecast unavailable");
        const payload = (await response.json()) as {
          properties?: { updateTime?: string; generatedAt?: string; periods?: HourlyPeriod[] };
        };
        const properties = payload.properties;
        return forecastForEvent(
          event,
          Array.isArray(properties?.periods) ? properties.periods : [],
          properties?.updateTime ?? properties?.generatedAt,
        );
      } catch {
        return unavailableForecast(event, "network");
      }
    })();
    flight = { key, promise };
    const value = await promise;
    cache = {
      key,
      value,
      expires: value.available
        ? Math.min(Date.now() + 15 * 60_000, Date.parse(value.updatedAt!) + 90 * 60_000)
        : Date.now() + 60_000,
    };
    if (flight?.key === key) flight = null;
    return value;
  },
);
