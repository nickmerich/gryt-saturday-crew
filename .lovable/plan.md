# Montour Trail route: use the official Strava route

The Strava route you sent (route 3538247257394386560) becomes the route map on the homepage. It replaces the hand-drawn trail line and the invented elevation numbers, so everything shown comes straight from your route.

## What changes

- **Map:** Strava's own route widget takes the place of the hand-drawn map. It shows your real line, distance and elevation gain, and stays current if you edit the route in Strava.
- **Elevation chart and distance picker (3 MI / 5 MI / 10K):** removed. Their numbers were made up, and Strava's widget already shows the real distance and climb.
- **Turnaround markers:** removed for now. They were placed along the drawn line and can't be put on Strava's map.
- **"Open in Strava" link** under the map, so people can save the route to their phone.
- **Meeting point card stays:** 212 Valley Brook Rd, Peterswood Park lot, meet by the trail map board, with the Directions button.
- If the widget fails to load, a plain "View the route on Strava" link and the meeting point text still show.

## What doesn't change

Layout, colors, fonts, the rest of the homepage. Preview only, nothing published.

## Later, optional

If you want the elevation chart and turnaround markers back with real data, export the route as a GPX from Strava (route page, three dots, Export GPX) and send it. The import tool I already built turns it into verified map data.

## Technical notes

- New `StravaRouteEmbed.tsx`: renders the `strava-embed-placeholder` div (type route, id 3538247257394386560, style standard, map hash, token) and loads `https://strava-embeds.com/embed.js` once on the client in `useEffect` (not during server render), with a noscript/fallback link.
- `MontourRouteMap.tsx`: swap the lazy Leaflet canvas and recharts profile for the embed; keep the parking card. Leave `montour-route.ts`, `MontourMapCanvas.tsx` and `scripts/import-route.mjs` in place but unused, for a future GPX import.
- Verify with typecheck and a Playwright check at 390px and 1280px that the widget renders.
