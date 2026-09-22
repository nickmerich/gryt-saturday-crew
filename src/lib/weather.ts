import type { RunOccurrence } from "./run-occurrence";

export type ForecastReason =
  "configuration" | "location_changed" | "event_status" | "out_of_range" | "stale" | "network";
export type SaturdayForecast = {
  eventId: string;
  eventVersion: number;
  available: boolean;
  reason: ForecastReason | null;
  updatedAt: string | null;
  tempF: number | null;
  rainChance: number | null;
  windMph: number | null;
  windDirection: string | null;
  shortForecast: string | null;
};
export type HourlyPeriod = {
  startTime: string;
  endTime: string;
  temperature?: number | null;
  temperatureUnit?: string;
  windSpeed?: string | null;
  windDirection?: string;
  shortForecast?: string;
  probabilityOfPrecipitation?: { value: number | null };
};

export function unavailableForecast(
  event: RunOccurrence,
  reason: ForecastReason,
): SaturdayForecast {
  return {
    eventId: event.id,
    eventVersion: event.version,
    available: false,
    reason,
    updatedAt: null,
    tempF: null,
    rainChance: null,
    windMph: null,
    windDirection: null,
    shortForecast: null,
  };
}

export function windMph(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^(\d+(?:\.\d+)?)(?:\s+to\s+(\d+(?:\.\d+)?))?\s+(mph|km\/h)$/i.exec(value.trim());
  if (!match) return null;
  const high = Math.max(Number(match[1]), Number(match[2] ?? match[1]));
  return Math.round(high * (match[3].toLowerCase() === "km/h" ? 0.621371 : 1));
}

/** Match the event instant, not a hardcoded hour or host-local calendar date. */
export function forecastForEvent(
  event: RunOccurrence,
  periods: HourlyPeriod[],
  updatedAt: string | undefined,
  now = new Date(),
): SaturdayForecast {
  if (
    event.status === "cancelled" ||
    event.status === "unconfirmed" ||
    event.status === "completed"
  )
    return unavailableForecast(event, "event_status");
  const updated = Date.parse(updatedAt ?? "");
  if (
    !Number.isFinite(updated) ||
    now.getTime() - updated > 90 * 60_000 ||
    updated > now.getTime() + 5 * 60_000
  )
    return unavailableForecast(event, "stale");
  const instant = Date.parse(event.startsAt);
  const hit = periods.find(
    (p) => Date.parse(p.startTime) <= instant && instant < Date.parse(p.endTime),
  );
  if (!hit) return unavailableForecast(event, "out_of_range");
  const numericTemp = typeof hit.temperature === "number" && Number.isFinite(hit.temperature);
  const tempF = !numericTemp
    ? null
    : hit.temperatureUnit === "F"
      ? Math.round(hit.temperature!)
      : hit.temperatureUnit === "C"
        ? Math.round((hit.temperature! * 9) / 5 + 32)
        : null;
  const rain = hit.probabilityOfPrecipitation?.value;
  return {
    eventId: event.id,
    eventVersion: event.version,
    available: true,
    reason: null,
    updatedAt: new Date(updated).toISOString(),
    tempF,
    rainChance:
      typeof rain === "number" && Number.isFinite(rain) && rain >= 0 && rain <= 100 ? rain : null,
    windMph: windMph(hit.windSpeed),
    windDirection: hit.windDirection?.slice(0, 20) ?? null,
    shortForecast: hit.shortForecast?.slice(0, 160) ?? null,
  };
}
