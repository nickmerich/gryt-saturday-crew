// Montour Trail out-and-back from the Valley Brook Road trailhead.
// Line is an approximation of the rail-trail corridor, good enough for a
// route preview. Distances below are measured along this polyline.

export const TRAILHEAD: [number, number] = [40.2664, -80.144];

/** Approximate trail corridor heading west/southwest from the lot. */
export const ROUTE: Array<[number, number]> = [
  [40.2664, -80.144],
  [40.2671, -80.1478],
  [40.2679, -80.1521],
  [40.2683, -80.1569],
  [40.2681, -80.1618],
  [40.2673, -80.1664],
  [40.2662, -80.1708],
  [40.2651, -80.1753],
  [40.2643, -80.1801],
  [40.2639, -80.1852],
  [40.2637, -80.1904],
  [40.2632, -80.1955],
  [40.2622, -80.2003],
  [40.2609, -80.2048],
  [40.2594, -80.2091],
  [40.2577, -80.2132],
  [40.2558, -80.2171],
  [40.2537, -80.2208],
  [40.2514, -80.2243],
  [40.249, -80.2277],
];

const R_MI = 3958.8;

function haversineMi(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R_MI * Math.asin(Math.sqrt(h));
}

/** Cumulative miles at each ROUTE vertex. */
export const CUMULATIVE_MI: number[] = ROUTE.reduce<number[]>((acc, pt, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + haversineMi(ROUTE[i - 1], pt));
  return acc;
}, []);

export const ROUTE_LENGTH_MI = CUMULATIVE_MI[CUMULATIVE_MI.length - 1];

/** Interpolated lat/lon at a given distance out from the lot. */
export function pointAtMile(mile: number): [number, number] {
  if (mile <= 0) return ROUTE[0];
  if (mile >= ROUTE_LENGTH_MI) return ROUTE[ROUTE.length - 1];
  for (let i = 1; i < ROUTE.length; i++) {
    if (CUMULATIVE_MI[i] >= mile) {
      const span = CUMULATIVE_MI[i] - CUMULATIVE_MI[i - 1];
      const t = span === 0 ? 0 : (mile - CUMULATIVE_MI[i - 1]) / span;
      const a = ROUTE[i - 1];
      const b = ROUTE[i];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
  }
  return ROUTE[ROUTE.length - 1];
}

export type Turnaround = {
  label: string;
  note: string;
  /** distance out from the lot, in miles (round trip is double) */
  outMi: number;
};

/** Turnarounds are half the advertised distance — it's an out-and-back. */
export const TURNAROUNDS: Turnaround[] = [
  { label: "3 MI", note: "Turn at 1.5 out", outMi: 1.5 },
  { label: "5 MI", note: "Turn at 2.5 out", outMi: 2.5 },
  { label: "10K", note: "Turn at 3.1 out", outMi: 3.107 },
];

/** Approximate elevation profile, one sample per half mile out. Feet. */
export const ELEVATION: Array<{ mi: number; ft: number }> = [
  { mi: 0, ft: 1046 },
  { mi: 0.5, ft: 1052 },
  { mi: 1, ft: 1058 },
  { mi: 1.5, ft: 1063 },
  { mi: 2, ft: 1071 },
  { mi: 2.5, ft: 1078 },
  { mi: 3, ft: 1084 },
  { mi: 3.5, ft: 1091 },
];

/** Interpolated elevation (ft) at a distance out from the lot. */
export function elevationAt(mi: number): number {
  if (mi <= ELEVATION[0].mi) return ELEVATION[0].ft;
  const last = ELEVATION[ELEVATION.length - 1];
  if (mi >= last.mi) return last.ft;
  for (let i = 1; i < ELEVATION.length; i++) {
    if (ELEVATION[i].mi >= mi) {
      const a = ELEVATION[i - 1];
      const b = ELEVATION[i];
      const t = (mi - a.mi) / (b.mi - a.mi);
      return Math.round(a.ft + (b.ft - a.ft) * t);
    }
  }
  return last.ft;
}

export type RouteOption = {
  id: "3mi" | "5mi" | "10k";
  label: string;
  totalMi: number;
  outMi: number;
  blurb: string;
};

export const ROUTE_OPTIONS: RouteOption[] = [
  { id: "3mi", label: "3 MI", totalMi: 3, outMi: 1.5, blurb: "Short and honest. Everybody finishes." },
  { id: "5mi", label: "5 MI", totalMi: 5, outMi: 2.5, blurb: "The usual Saturday distance." },
  { id: "10k", label: "10K", totalMi: 6.2, outMi: 3.107, blurb: "6.2. Push day." },
];

/** Out-and-back elevation series for one route option. */
export function profileFor(option: RouteOption): Array<{ mi: number; ft: number }> {
  const step = 0.25;
  const out: Array<{ mi: number; ft: number }> = [];
  for (let m = 0; m < option.outMi; m += step) {
    out.push({ mi: Number(m.toFixed(2)), ft: elevationAt(m) });
  }
  out.push({ mi: Number(option.outMi.toFixed(2)), ft: elevationAt(option.outMi) });
  for (let m = option.outMi - step; m > 0; m -= step) {
    out.push({
      mi: Number((option.outMi * 2 - m).toFixed(2)),
      ft: elevationAt(m),
    });
  }
  out.push({ mi: Number((option.outMi * 2).toFixed(2)), ft: elevationAt(0) });
  return out;
}

/** Total climb (ft) for the out-and-back. */
export function gainFor(option: RouteOption): number {
  const series = profileFor(option);
  let gain = 0;
  for (let i = 1; i < series.length; i++) {
    const d = series[i].ft - series[i - 1].ft;
    if (d > 0) gain += d;
  }
  return Math.round(gain);
}

export const MEET_ADDRESS = "212 Valley Brook Rd, McMurray, PA 15317";
export const MEET_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=212+Valley+Brook+Rd,+McMurray,+PA+15317";
export const PARKING_NOTE =
  "Free gravel lot at the trailhead. Room for about 20 cars. Meet by the trail map board.";
