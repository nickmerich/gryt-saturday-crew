// Browser-only. Never import this module from an SSR path — load it lazily.
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CUMULATIVE_MI,
  ROUTE,
  TRAILHEAD,
  pointAtMile,
  type RouteOption,
} from "@/lib/montour-route";

function pin(label: string, kind: "park" | "turn", flip = false) {
  const bg = kind === "park" ? "#89CFF0" : "#000000";
  const fg = kind === "park" ? "#000000" : "#89CFF0";
  const border = kind === "park" ? "#000000" : "#89CFF0";
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(${flip ? "-100%" : "0"},-50%);${flip ? "" : ""}font-family:Oswald,system-ui,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:11px;line-height:1;padding:6px 8px;background:${bg};color:${fg};border:2px solid ${border};white-space:nowrap;">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MontourMapCanvas({ option }: { option: RouteOption }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: "gryt-tiles",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const end = pointAtMile(option.outMi);
    const coords: Array<[number, number]> = [
      ...ROUTE.filter((_, i) => CUMULATIVE_MI[i] < option.outMi),
      end,
    ];

    L.polyline(coords, { color: "#89CFF0", weight: 5, opacity: 0.95 }).addTo(layer);
    L.circleMarker(TRAILHEAD, {
      radius: 7,
      color: "#000000",
      weight: 3,
      fillColor: "#89CFF0",
      fillOpacity: 1,
    }).addTo(layer);
    L.marker(TRAILHEAD, { icon: pin("Parking · Valley Brook", "park", true) }).addTo(layer);
    L.marker(end, { icon: pin(`${option.label} turnaround`, "turn") }).addTo(layer);
    L.circleMarker(end, {
      radius: 6,
      color: "#89CFF0",
      weight: 3,
      fillColor: "#000000",
      fillOpacity: 1,
    }).addTo(layer);

    map.fitBounds(L.latLngBounds(coords), { padding: [48, 48] });
  }, [option]);

  return <div ref={ref} className="h-[280px] sm:h-[420px] w-full bg-ink" />;
}
