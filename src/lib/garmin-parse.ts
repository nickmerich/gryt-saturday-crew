// Client-side parser for Garmin exports: .gpx, .tcx, .fit
// Returns a shape compatible with our recap form auto-fill.

export type ParsedActivity = {
  source: "gpx" | "tcx" | "fit";
  name: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  startDateLocal: string; // ISO
};

const R_EARTH = 6371000;
function haversine(a: [number, number], b: [number, number]) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(s));
}

function parseGPX(text: string): ParsedActivity {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("GPX file is malformed.");
  const nameEl = doc.querySelector("trk > name, metadata > name");
  const pts = Array.from(doc.querySelectorAll("trkpt"));
  if (pts.length < 2) throw new Error("GPX has no track points.");
  let dist = 0;
  let prev: [number, number] | null = null;
  let firstTime: string | null = null;
  let lastTime: string | null = null;
  for (const p of pts) {
    const lat = parseFloat(p.getAttribute("lat") || "");
    const lon = parseFloat(p.getAttribute("lon") || "");
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      if (prev) dist += haversine(prev, [lat, lon]);
      prev = [lat, lon];
    }
    const t = p.querySelector("time")?.textContent;
    if (t) {
      if (!firstTime) firstTime = t;
      lastTime = t;
    }
  }
  const start = firstTime ? new Date(firstTime) : new Date();
  const end = lastTime ? new Date(lastTime) : start;
  const secs = Math.max(0, (end.getTime() - start.getTime()) / 1000);
  return {
    source: "gpx",
    name: nameEl?.textContent?.trim() || "Garmin Run",
    distanceMeters: dist,
    movingTimeSeconds: secs,
    startDateLocal: start.toISOString(),
  };
}

function parseTCX(text: string): ParsedActivity {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("TCX file is malformed.");
  const laps = Array.from(doc.getElementsByTagName("Lap"));
  let dist = 0;
  let time = 0;
  for (const lap of laps) {
    const d = parseFloat(lap.getElementsByTagName("DistanceMeters")[0]?.textContent || "0");
    const t = parseFloat(lap.getElementsByTagName("TotalTimeSeconds")[0]?.textContent || "0");
    if (Number.isFinite(d)) dist += d;
    if (Number.isFinite(t)) time += t;
  }
  const startAttr =
    doc.getElementsByTagName("Activity")[0]?.getElementsByTagName("Id")[0]?.textContent ||
    laps[0]?.getAttribute("StartTime") ||
    new Date().toISOString();
  const sport = doc.getElementsByTagName("Activity")[0]?.getAttribute("Sport") || "Run";
  return {
    source: "tcx",
    name: `Garmin ${sport}`,
    distanceMeters: dist,
    movingTimeSeconds: time,
    startDateLocal: new Date(startAttr).toISOString(),
  };
}

async function parseFIT(buffer: ArrayBuffer): Promise<ParsedActivity> {
  const mod = await import("fit-file-parser");
  const FitParser = (mod as any).default ?? (mod as any).FitParser ?? mod;
  const parser = new FitParser({
    force: true,
    speedUnit: "m/s",
    lengthUnit: "m",
    temperatureUnit: "celsius",
    elapsedRecordField: true,
    mode: "list",
  });
  return await new Promise((resolve, reject) => {
    parser.parse(buffer, (err: string | null, data: any) => {
      if (err) return reject(new Error(`FIT parse failed: ${err}`));
      const session = data?.sessions?.[0] ?? data?.activity?.sessions?.[0];
      const dist =
        session?.total_distance ?? data?.records?.reduce((s: number, r: any) => Math.max(s, r.distance || 0), 0) ?? 0;
      const time =
        session?.total_timer_time ??
        session?.total_elapsed_time ??
        (data?.records && data.records.length > 1
          ? (new Date(data.records.at(-1).timestamp).getTime() - new Date(data.records[0].timestamp).getTime()) / 1000
          : 0);
      const start = session?.start_time ?? data?.records?.[0]?.timestamp ?? new Date();
      const sport = session?.sport ? String(session.sport) : "run";
      resolve({
        source: "fit",
        name: `Garmin ${sport.charAt(0).toUpperCase() + sport.slice(1)}`,
        distanceMeters: dist,
        movingTimeSeconds: time,
        startDateLocal: new Date(start).toISOString(),
      });
    });
  });
}

export async function parseGarminFile(file: File): Promise<ParsedActivity> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".gpx")) return parseGPX(await file.text());
  if (name.endsWith(".tcx")) return parseTCX(await file.text());
  if (name.endsWith(".fit")) return parseFIT(await file.arrayBuffer());
  throw new Error("Unsupported file. Use .gpx, .tcx, or .fit from Garmin Connect.");
}
