# Montour Trail route map — real geometry, real elevation

The route section already exists on the homepage: distance picker (3 MI / 5 MI / 10K), map, elevation chart, parking card with a Directions button. The problem is the data behind it. The trail line is hand-drawn and approximate, and the elevation numbers were invented. This replaces both with verified data and keeps the look and layout exactly as it is.

## What I need from you first

Export the actual route as a **GPX or GeoJSON file** and attach it here — from Strava, Garmin, or the Montour Trail Council map. One track starting at the Valley Brook Road lot and heading out past the 10K turnaround (at least 3.2 miles out) is enough; I derive the shorter distances from it.

Nothing below gets built until that file arrives. I will not substitute a guessed line for it.

## What changes once the file is in

**The trail line.** The drawn approximation is replaced by your track, simplified only enough to keep the page light. The map then follows the real corridor instead of a sketch.

**Turnaround markers.** Recomputed by measuring along the real track, so the 1.5, 2.5 and 3.1 mile markers land where a runner actually turns around. Each marker keeps its current label style.

**Elevation.** Real elevation sampled along the verified line. If your export already carries elevation, I use it directly. If it does not, I pull it once from the USGS public elevation service, bake the result into the project, and note the source. Either way the chart shows an honest profile with a source line and a verification date underneath, and the climb figure next to the distance picker becomes a measured number.

**Meeting point and parking.** Confirmed unchanged: 212 Valley Brook Rd, free gravel lot, about 20 cars, meet by the trail map board. Single pin, since parking and the meeting point are the same spot. Directions button unchanged.

**Honesty.** The "approximate profile" caveat is replaced with the real source and date. Nothing claims guaranteed parking, safety, or surface condition.

## What does not change

Layout, colors, type, the distance picker, the parking card, and the Directions link all stay as they are. The map stays lazy-loaded so the page still works if the map fails — the distance, turnaround and parking text remain readable on their own.

## Technical notes

- Parse the upload once at build-authoring time and write the result into `src/lib/montour-route.ts` as a plain coordinate array plus an elevation series. No runtime fetching, no new map SDK, no new dependency — the existing Leaflet canvas and recharts profile read the new arrays unchanged.
- Keep `pointAtMile`, `profileFor`, `gainFor`, `TURNAROUNDS` and `ROUTE_OPTIONS` as the public surface so `MontourRouteMap.tsx` and `MontourMapCanvas.tsx` need only cosmetic edits (source/date caption).
- Add unit tests: total track length matches the source within tolerance, each turnaround resolves to a point on the line at the expected mileage, elevation series is monotonic in distance and has no null samples.
- Record provenance constants (`ROUTE_SOURCE`, `ROUTE_VERIFIED_ON`, `ELEVATION_SOURCE`) and render them in the caption.
- Preview only. No publish.
