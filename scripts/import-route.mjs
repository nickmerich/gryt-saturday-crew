#!/usr/bin/env node
// Import an organizer-approved Montour Trail track (GPX or GeoJSON) and write
// verified geometry + elevation into src/lib/montour-route.data.ts.
//
// Usage:
//   node scripts/import-route.mjs <file.gpx|file.geojson> [--source "Strava export"] [--verified 2026-09-22]
//
// If the track carries elevation, it is used as-is. Otherwise elevation is
// sampled once from the USGS 3DEP point service and baked into the file.
// Nothing is fetched at runtime.

import { readFileSync, writeFileSync } from "node:fs";

const [, , file, ...rest] = process.argv;
if (!file) {
  console.error("Usage: node scripts/import-route.mjs <file.gpx|file.geojson> [--source ...] [--verified YYYY-MM-DD]");
  process.exit(1);
}

function flag(name, fallback) {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] ? rest[i + 1] : fallback;
}

const SOURCE = flag("source", "Organizer-supplied GPS track");
const VERIFIED = flag("verified", new Date().toISOString().slice(0, 10));

const raw = readFileSync(file, "utf8");

/** @returns {Array<{lat:number, lon:number, ele:number|null}>} */
function parse(text) {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("{")) return parseGeoJson(JSON.parse(trimmed));
  return parseGpx(trimmed);
}

function parseGpx(xml) {
  const pts = [];
  const re = /<(?:trkpt|rtept)[^>]*\blat="([-\d.]+)"[^>]*\blon="([-\d.]+)"[^>]*>([\s\S]*?)<\/(?:trkpt|rtept)>|<(?:trkpt|rtept)[^>]*\blat="([-\d.]+)"[^>]*\blon="([-\d.]+)"[^>]*\/>/g;
  let m;
  while ((m = re.exec(xml))) {
    const lat = Number(m[1] ?? m[4]);
    const lon = Number(m[2] ?? m[5]);
    const body = m[3] ?? "";
    const ele = /<ele>([-\d.]+)<\/ele>/.exec(body);
    pts.push({ lat, lon, ele: ele ? Number(ele[1]) : null });
  }
  return pts;
}

function parseGeoJson(json) {
  const features = json.type === "FeatureCollection" ? json.features : [json];
  for (const f of features) {
    const g = f.geometry ?? f;
    if (g?.type === "LineString") return coords(g.coordinates);
    if (g?.type === "MultiLineString") return coords(g.coordinates.flat());
  }
  throw new Error("No LineString found in GeoJSON");
}

const coords = (arr) =>
  arr.map(([lon, lat, ele]) => ({ lat, lon, ele: typeof ele === "number" ? ele : null }));

const R_MI = 3958.8;
function haversineMi(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_MI * Math.asin(Math.sqrt(h));
}

let pts = parse(raw);
if (pts.length < 2) throw new Error("Track has fewer than two points");

// Drop consecutive duplicates.
pts = pts.filter((p, i) => i === 0 || haversineMi(pts[i - 1], p) > 0.0005);

// Cumulative distance, then resample to ~0.02 mi so the payload stays small
// while the drawn line still follows the real corridor.
function cumulative(list) {
  const out = [0];
  for (let i = 1; i < list.length; i++) out.push(out[i - 1] + haversineMi(list[i - 1], list[i]));
  return out;
}

let cum = cumulative(pts);
const STEP = 0.02;
const total = cum[cum.length - 1];
const sampled = [];
for (let m = 0; m < total; m += STEP) {
  let i = cum.findIndex((c) => c >= m);
  if (i <= 0) i = 1;
  const span = cum[i] - cum[i - 1];
  const t = span === 0 ? 0 : (m - cum[i - 1]) / span;
  const a = pts[i - 1];
  const b = pts[i];
  sampled.push({
    lat: a.lat + (b.lat - a.lat) * t,
    lon: a.lon + (b.lon - a.lon) * t,
    ele: a.ele != null && b.ele != null ? a.ele + (b.ele - a.ele) * t : null,
  });
}
sampled.push(pts[pts.length - 1]);

const hasElevation = sampled.every((p) => p.ele != null);
let elevationSource = `${SOURCE} (embedded elevation)`;

if (!hasElevation) {
  elevationSource = "USGS 3DEP point elevation service";
  console.log("No elevation in track. Querying USGS for every half mile...");
  const every = Math.max(1, Math.round(0.5 / STEP));
  for (let i = 0; i < sampled.length; i += every) {
    const p = sampled[i];
    const url = `https://epqs.nationalmap.gov/v1/json?x=${p.lon}&y=${p.lat}&units=Feet&wkid=4326&includeDate=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`USGS returned ${res.status}`);
    const json = await res.json();
    const ft = Number(json.value);
    if (!Number.isFinite(ft)) throw new Error(`USGS gave no elevation at ${p.lat},${p.lon}`);
    p.ele = ft / 3.28084; // store meters, convert on write
    process.stdout.write(".");
  }
  console.log("");
}

// Elevation series in feet, one sample per half mile out.
const elevation = [];
{
  const cumS = cumulative(sampled);
  for (let mi = 0; mi <= total; mi += 0.5) {
    let i = cumS.findIndex((c) => c >= mi);
    if (i < 0) i = cumS.length - 1;
    if (i === 0) i = 0;
    const p = sampled[i];
    if (p.ele == null) continue;
    elevation.push({ mi: Number(mi.toFixed(2)), ft: Math.round(p.ele * 3.28084) });
  }
}

const route = sampled.map((p) => [Number(p.lat.toFixed(6)), Number(p.lon.toFixed(6))]);

const out = `// GENERATED by scripts/import-route.mjs — do not edit by hand.
// Source: ${SOURCE}
// Verified: ${VERIFIED}
// Elevation: ${elevationSource}

export const ROUTE_SOURCE = ${JSON.stringify(SOURCE)};
export const ROUTE_VERIFIED_ON = ${JSON.stringify(VERIFIED)};
export const ELEVATION_SOURCE = ${JSON.stringify(elevationSource)};

/** Verified trail centerline, [lat, lon], resampled to ~0.02 mi. */
export const ROUTE: Array<[number, number]> = ${JSON.stringify(route)};

/** Measured elevation along the verified line, feet, per half mile out. */
export const ELEVATION: Array<{ mi: number; ft: number }> = ${JSON.stringify(elevation)};
`;

writeFileSync("src/lib/montour-route.data.ts", out);
console.log(
  `Wrote src/lib/montour-route.data.ts — ${route.length} points, ${total.toFixed(2)} mi, ${elevation.length} elevation samples.`,
);
