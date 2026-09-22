import { createServerFn } from "@tanstack/react-start";
import { nyNow, upcomingRunSaturday } from "./run-schedule";

// Montour Trail — Valley Brook Road trailhead, McMurray PA.
export const MEET_LAT = 40.2664;
export const MEET_LON = -80.144;

const UA = "gryt-run-club (https://grytrunclub.com)";

export type SaturdayForecast = {
  /** YYYY-MM-DD of the Saturday run */
  date: string;
  /** "Sat, Sep 26" */
  dateLabel: string;
  tempF: number | null;
  feelsLikeF: number | null;
  rainChance: number | null;
  windMph: number | null;
  windDirection: string | null;
  shortForecast: string | null;
  /** false when the forecast window doesn't reach that Saturday yet */
  available: boolean;
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toF(value: number | null, unit: string | undefined): number | null {
  if (value == null) return null;
  if (unit && unit.endsWith("degC")) return Math.round((value * 9) / 5 + 32);
  return Math.round(value);
}

function toMph(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Math.round(value * 0.621371);
  const m = /([\d.]+)/.exec(value);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return /km\/h/i.test(value) ? Math.round(n * 0.621371) : Math.round(n);
}

export const getSaturdayForecast = createServerFn({ method: "GET" }).handler(
  async (): Promise<SaturdayForecast> => {
    const sat = upcomingRunSaturday(nyNow());
    const date = ymd(sat);
    const dateLabel = sat.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const empty: SaturdayForecast = {
      date,
      dateLabel,
      tempF: null,
      feelsLikeF: null,
      rainChance: null,
      windMph: null,
      windDirection: null,
      shortForecast: null,
      available: false,
    };

    try {
      const pointsRes = await fetch(
        `https://api.weather.gov/points/${MEET_LAT},${MEET_LON}`,
        { headers: { "User-Agent": UA, Accept: "application/geo+json" } },
      );
      if (!pointsRes.ok) {
        console.error(`NWS points failed [${pointsRes.status}]: ${await pointsRes.text()}`);
        return empty;
      }
      const points = (await pointsRes.json()) as {
        properties?: { forecastHourly?: string };
      };
      const hourlyUrl = points.properties?.forecastHourly;
      if (!hourlyUrl) return empty;

      const hourlyRes = await fetch(hourlyUrl, {
        headers: { "User-Agent": UA, Accept: "application/geo+json" },
      });
      if (!hourlyRes.ok) {
        console.error(`NWS hourly failed [${hourlyRes.status}]: ${await hourlyRes.text()}`);
        return empty;
      }
      const hourly = (await hourlyRes.json()) as {
        properties?: {
          periods?: Array<{
            startTime: string;
            temperature: number;
            temperatureUnit?: string;
            windSpeed?: string;
            windDirection?: string;
            shortForecast?: string;
            probabilityOfPrecipitation?: { value: number | null };
            dewpoint?: { value: number | null; unitCode?: string };
            relativeHumidity?: { value: number | null };
          }>;
        };
      };
      const periods = hourly.properties?.periods ?? [];
      const hit = periods.find(
        (p) => p.startTime.slice(0, 10) === date && Number(p.startTime.slice(11, 13)) === 7,
      );
      if (!hit) return empty;

      const tempF =
        hit.temperatureUnit === "C"
          ? Math.round((hit.temperature * 9) / 5 + 32)
          : Math.round(hit.temperature);

      return {
        date,
        dateLabel,
        tempF,
        feelsLikeF: toF(hit.dewpoint?.value ?? null, hit.dewpoint?.unitCode),
        rainChance: hit.probabilityOfPrecipitation?.value ?? 0,
        windMph: toMph(hit.windSpeed ?? null),
        windDirection: hit.windDirection ?? null,
        shortForecast: hit.shortForecast ?? null,
        available: true,
      };
    } catch (err) {
      console.error("Saturday forecast failed", err);
      return empty;
    }
  },
);
