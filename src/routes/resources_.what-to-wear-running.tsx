import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSaturdayForecast } from "@/lib/weather.functions";
import { GuideShell, GH2, GH3, guideLink, type Source } from "@/components/site/GuideShell";

const SITE = "https://grytrunclub.com";
const URL = `${SITE}/resources/what-to-wear-running`;
const TITLE = "What to Wear Running in Pittsburgh, by Temperature · gryt";
const DESCRIPTION =
  "A free what-to-wear running tool for Pittsburgh and the South Hills. Enter temperature, wind, rain, and darkness to get a head-to-toe layering list, or load this Saturday's 7 AM forecast.";
const UPDATED = "2026-10-20";

type Sky = "dry" | "rain" | "snow";
type Effort = "easy" | "hard";

const SOURCES: Source[] = [
  {
    label: "Cleveland Clinic: Running in Cold Weather",
    href: "https://health.clevelandclinic.org/everything-you-need-to-know-about-running-in-cold-weather",
    note: "dress for 15 to 20 degrees warmer than the temperature",
  },
  {
    label: "REI Expert Advice: Cold Weather Running Tips",
    href: "https://www.rei.com/learn/expert-advice/winter-running-tips.html",
    note: "layering, shedding hats and gloves, traction on snow and ice",
  },
  {
    label: "National Weather Service: Understanding Wind Chill",
    href: "https://www.weather.gov/safety/cold-wind-chill-chart",
    note: "wind chill formula and frostbite timing",
  },
  {
    label: "CDC: Heat and Athletes",
    href: "https://www.cdc.gov/heat-health/risk-factors/heat-and-athletes.html",
    note: "timing, hydration, when to stop",
  },
  {
    label: "AirNow: Air Quality Index Basics",
    href: "https://www.airnow.gov/aqi/aqi-basics",
  },
  {
    label: "NOAA NCEI: Pittsburgh Intl Airport monthly normals, 1991 to 2020",
    href: "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USW00094823&format=pdf",
    note: "average morning lows used in the presets",
  },
];

/** NOAA 1991 to 2020 normal daily minimums, Pittsburgh Intl (rounded). */
const PRESETS: Array<{ label: string; temp: number; wind: number; sky: Sky; dark: boolean }> = [
  { label: "January morning", temp: 21, wind: 8, sky: "dry", dark: true },
  { label: "April morning", temp: 41, wind: 6, sky: "rain", dark: false },
  { label: "July morning", temp: 63, wind: 3, sky: "dry", dark: false },
  { label: "October morning", temp: 44, wind: 5, sky: "dry", dark: false },
];

const FAQS = [
  {
    q: "How warm should I dress for a run?",
    a: "Dress for about 15 to 20 degrees warmer than the actual temperature. You should feel a little cold standing in the lot. Ten minutes in, you will be glad you did.",
  },
  {
    q: "Does GRYT run in rain, snow, or cold?",
    a: "Yes. We still run in normal rain, cold, and imperfect weather. We only call it for lightning or ice that makes the trail dangerous, and we post that call the morning of.",
  },
  {
    q: "What is the one thing people forget in winter?",
    a: "A dry layer for after. The post-run coffee hang is part of Saturday, and a sweaty shirt gets cold fast. Leave a dry top and a warm hat in the car.",
  },
];

export const Route = createFileRoute("/resources_/what-to-wear-running")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "gryt run club" },
      { property: "og:image", content: `${SITE}/og-resources.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "GRYT What to Wear Running Tool",
          url: URL,
          applicationCategory: "HealthApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "gryt run club", url: SITE },
          dateModified: UPDATED,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: WhatToWearPage,
});

/** NWS wind chill (°F, mph). Valid at or below 50°F with wind above 3 mph. */
function windChill(t: number, v: number): number {
  if (t > 50 || v <= 3) return t;
  const p = Math.pow(v, 0.16);
  return Math.round(35.74 + 0.6215 * t - 35.75 * p + 0.4275 * t * p);
}

type Kit = { head: string; top: string; bottom: string; hands: string; feet: string };

function kitFor(dressFor: number): Kit {
  if (dressFor >= 75)
    return {
      head: "Cap or visor and sunglasses",
      top: "Singlet or your lightest tee",
      bottom: "Shorts",
      hands: "Nothing",
      feet: "Thin, sweat-wicking socks",
    };
  if (dressFor >= 65)
    return {
      head: "Cap if it's sunny",
      top: "Short-sleeve tech tee",
      bottom: "Shorts",
      hands: "Nothing",
      feet: "Thin socks",
    };
  if (dressFor >= 55)
    return {
      head: "Nothing, or a light cap",
      top: "Short sleeve, or a thin long sleeve you can push up",
      bottom: "Shorts",
      hands: "Nothing, or throwaway gloves for the first mile",
      feet: "Regular running socks",
    };
  if (dressFor >= 45)
    return {
      head: "Light headband over the ears",
      top: "Long-sleeve tech shirt",
      bottom: "Shorts or light tights",
      hands: "Light gloves you can tuck in a pocket",
      feet: "Regular running socks",
    };
  if (dressFor >= 35)
    return {
      head: "Headband or light beanie",
      top: "Long-sleeve base layer plus a light wind jacket or vest",
      bottom: "Tights or running pants",
      hands: "Light to midweight gloves",
      feet: "Midweight socks, wool blend if wet",
    };
  if (dressFor >= 25)
    return {
      head: "Warm beanie and a neck gaiter",
      top: "Base layer, an insulating mid layer, and a wind-blocking jacket",
      bottom: "Thermal tights, or tights under wind pants",
      hands: "Warm gloves or mittens",
      feet: "Wool socks",
    };
  return {
    head: "Beanie plus a gaiter or balaclava that covers your face",
    top: "Base layer, warm mid layer, and a windproof shell",
    bottom: "Lined thermal tights, or two layers",
    hands: "Mittens, with liner gloves if you run cold",
    feet: "Wool socks, and shoes with less mesh if you have them",
  };
}

function readInitial() {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  return { saturday: p.get("saturday") === "1" };
}

function WhatToWearPage() {
  const [temp, setTemp] = useState(44);
  const [wind, setWind] = useState(5);
  const [sky, setSky] = useState<Sky>("dry");
  const [dark, setDark] = useState(false);
  const [effort, setEffort] = useState<Effort>("easy");
  const [forecastNote, setForecastNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchForecast = useServerFn(getSaturdayForecast);

  async function loadSaturday() {
    setLoading(true);
    setForecastNote(null);
    try {
      const f = await fetchForecast();
      if (!f.available || f.tempF == null) {
        setForecastNote("The forecast doesn't reach this Saturday yet. Check back midweek.");
      } else {
        setTemp(Math.max(-10, Math.min(100, f.tempF)));
        setWind(Math.max(0, Math.min(30, f.windMph ?? 0)));
        const short = (f.shortForecast ?? "").toLowerCase();
        setSky(/snow|sleet|ice|freezing/.test(short) ? "snow" : (f.rainChance ?? 0) >= 40 || /rain|shower|drizzle/.test(short) ? "rain" : "dry");
        setDark(false);
        setEffort("easy");
        setForecastNote(
          `Loaded ${f.dateLabel} at 7 AM from the National Weather Service: ${f.tempF}°F${f.shortForecast ? `, ${f.shortForecast.toLowerCase()}` : ""}${f.rainChance != null ? `, ${f.rainChance}% rain chance` : ""}.`,
        );
      }
    } catch {
      setForecastNote("Couldn't reach the forecast right now. Set the conditions by hand.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (readInitial()?.saturday) void loadSaturday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feels = windChill(temp, wind);
  const dressFor = feels + (effort === "hard" ? 20 : 15);
  const kit = useMemo(() => kitFor(dressFor), [dressFor]);

  const extras: string[] = [];
  const cautions: string[] = [];
  if (sky === "rain") {
    extras.push("A brimmed cap keeps rain off your face better than a hood.");
    extras.push("Skip cotton. Wet cotton stays wet and gets cold.");
    if (temp < 50) extras.push("A light water-resistant shell, since cold plus wet chills faster than cold alone.");
    extras.push("Anti-chafe on any spot that rubs. Rain makes it worse.");
  }
  if (sky === "snow") {
    extras.push("Trail shoes or slip-on traction for snow and ice.");
    extras.push("Shorten your stride and slow down on anything shiny.");
  }
  if (dark) {
    extras.push("Headlamp with a red rear mode, plus a reflective vest on your torso.");
  }
  if (temp >= 35 && temp < 60) extras.push("Wear the layer you'll shed on top so it's easy to tie around your waist.");
  extras.push(temp < 50 ? "A dry top and warm hat in the car for the post-run coffee hang." : "Water in the car for after.");

  if (temp <= 32 && sky !== "dry") cautions.push("Freezing and wet means ice is likely, especially on bridges and shaded trail. GRYT only calls a run for ice that makes the trail dangerous, and we post that call the morning of.");
  if (temp < 32 && feels <= -18) cautions.push("At this wind chill the National Weather Service says exposed skin can freeze in about 30 minutes. Cover your face and ears, or move the run indoors.");
  else if (temp < 32 && feels <= 0) cautions.push("Very cold. Cover every bit of skin you can, and choose a short loop near your car.");
  if (temp >= 80) cautions.push("Heat day. The CDC says to drink more water than usual and not wait until you're thirsty, and to stop and get somewhere cool if you feel faint or weak. Saturday's 7 AM start helps.");
  if (temp >= 70 && temp < 80) cautions.push("Warm and likely humid. Slow the pace and bring water.");

  return (
    <GuideShell
      eyebrow="TOOL · SAFETY & WEATHER"
      title="What to Wear Running in Pittsburgh"
      dek="Set the conditions or load this Saturday's 7 AM forecast. Get a head-to-toe list that works for South Hills mornings, from humid July to icy January."
      url={URL}
      updated={UPDATED}
      sources={SOURCES}
      related={["night-running", "pace-calculator", "saturday-what-to-expect"]}
    >
      <section aria-label="What to wear tool" className="border border-paper/20 bg-vintage p-5 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <p className="eyebrow text-blue">Conditions</p>
          <button type="button" onClick={loadSaturday} disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? "Loading forecast…" : "Use this Saturday's 7 AM forecast"}
          </button>
        </div>
        {forecastNote ? (
          <p className="mt-3 text-[14px] text-paper/80" role="status">
            {forecastNote}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2" aria-label="Typical Pittsburgh mornings">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setTemp(p.temp);
                setWind(p.wind);
                setSky(p.sky);
                setDark(p.dark);
                setForecastNote(null);
              }}
              className="px-3 py-1.5 text-[12.5px] border border-paper/30 text-paper/80 hover:border-blue hover:text-paper transition-colors"
            >
              {p.label} · {p.temp}°
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-7 md:grid-cols-2">
          <Slider label="Temperature" unit="°F" min={-10} max={100} value={temp} onChange={setTemp} />
          <Slider label="Wind" unit="mph" min={0} max={30} value={wind} onChange={setWind} />
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-3">
          <Toggle
            label="Sky"
            value={sky}
            options={[
              ["dry", "Dry"],
              ["rain", "Rain"],
              ["snow", "Snow / ice"],
            ]}
            onChange={(v) => setSky(v as Sky)}
          />
          <Toggle
            label="Light"
            value={dark ? "dark" : "day"}
            options={[
              ["day", "Daylight"],
              ["dark", "Dark"],
            ]}
            onChange={(v) => setDark(v === "dark")}
          />
          <Toggle
            label="Run"
            value={effort}
            options={[
              ["easy", "Easy / long"],
              ["hard", "Workout / race"],
            ]}
            onChange={(v) => setEffort(v as Effort)}
          />
        </div>

        <div className="mt-8 border-t border-paper/20 pt-6" aria-live="polite">
          <p className="text-[13px] text-paper/70">
            {feels !== temp ? (
              <>
                Feels like <strong className="text-paper">{feels}°F</strong> with the wind.{" "}
              </>
            ) : null}
            Dress like it's <strong className="text-paper">{dressFor}°F</strong>.
          </p>
          <dl className="mt-5 grid gap-px bg-paper/15 border border-paper/15 sm:grid-cols-2">
            <KitRow k="Head" v={kit.head} />
            <KitRow k="Top" v={kit.top} />
            <KitRow k="Bottom" v={kit.bottom} />
            <KitRow k="Hands" v={kit.hands} />
            <KitRow k="Feet" v={kit.feet} />
            <KitRow k="Pocket" v="Phone, ID, and a key. A gel if you're out longer than an hour." />
          </dl>
          {extras.length ? (
            <ul className="mt-5 space-y-1.5 text-[15px] text-paper/85 list-disc pl-5">
              {extras.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ) : null}
          {cautions.map((c) => (
            <p key={c} className="mt-4 border-l-4 border-blue bg-ink p-4 text-[15px] text-paper">
              {c}
            </p>
          ))}
        </div>
      </section>

      <GH2 id="rule">The 15 to 20 degree rule</GH2>
      <p>
        Your body heats up fast once you start moving. That is why the{" "}
        <a
          className={guideLink}
          href="https://health.clevelandclinic.org/everything-you-need-to-know-about-running-in-cold-weather"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cleveland Clinic
        </a>{" "}
        suggests dressing for conditions 15 to 20 degrees warmer than the actual temperature. The tool
        adds 15 for easy runs and 20 for workouts and races, after it accounts for wind using the{" "}
        <a
          className={guideLink}
          href="https://www.weather.gov/safety/cold-wind-chill-chart"
          target="_blank"
          rel="noopener noreferrer"
        >
          National Weather Service wind chill formula
        </a>
        . If you feel slightly cold in the Peterswood Park lot at 6:55, you got it right.
      </p>

      <GH2 id="pittsburgh">What makes Pittsburgh different</GH2>
      <GH3>Big morning-to-afternoon swings</GH3>
      <p>
        A 7 AM start is usually the coldest part of the day. In October, Pittsburgh's normal morning
        low is about 44°F while afternoons reach the low 60s, according to NOAA's 1991 to 2020
        normals. Dress for the start, and plan the layer you will shed.
      </p>
      <GH3>Wet leaves, then ice</GH3>
      <p>
        From late September through November, wet leaves on trails slide underfoot. By December,
        shaded sections can ice overnight. Our{" "}
        <Link className={guideLink} to="/resources/running-at-night-safety-pittsburgh">
          night running guide
        </Link>{" "}
        covers both in detail.
      </p>
      <GH3>The trail drains fast</GH3>
      <p>
        The Saturday route is mostly crushed limestone under a tree canopy, so rain rarely turns it to
        mud. A normal rainy Saturday is a regular Saturday. Bring a cap and a dry shirt for after.
      </p>
      <GH3>Smoke and summer haze</GH3>
      <p>
        On hot, still days, check the{" "}
        <a className={guideLink} href="https://www.airnow.gov/aqi/aqi-basics" target="_blank" rel="noopener noreferrer">
          Air Quality Index on AirNow
        </a>{" "}
        before you go. If the number is high, run easier and shorter, or move the session inside.
      </p>

      <GH2 id="faqs">Frequently asked questions</GH2>
      <div className="space-y-6">
        {FAQS.map((f) => (
          <div key={f.q}>
            <p className="font-bold text-paper">{f.q}</p>
            <p className="mt-1.5">{f.a}</p>
          </div>
        ))}
      </div>
    </GuideShell>
  );
}

function Slider({
  label,
  unit,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  const id = `slider-${label.toLowerCase()}`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[11px] tracking-[0.2em] uppercase text-paper/60 font-mono">
          {label}
        </label>
        <span className="text-[30px] font-bold tabular-nums leading-none">
          {value}
          <span className="text-[15px] text-paper/60 ml-1">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--blue)] h-8"
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.2em] uppercase text-paper/60 font-mono mb-2">{label}</p>
      <div className="flex flex-wrap border border-paper/30 w-fit" role="radiogroup" aria-label={label}>
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={`px-3.5 py-2.5 text-[13.5px] ${value === v ? "bg-blue text-ink font-bold" : "text-paper/80 hover:text-paper"}`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function KitRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-ink p-4">
      <dt className="text-[11px] tracking-[0.2em] uppercase text-blue font-mono">{k}</dt>
      <dd className="mt-1 text-[15.5px] text-paper leading-[1.45]">{v}</dd>
    </div>
  );
}
