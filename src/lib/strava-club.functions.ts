import { createServerFn } from "@tanstack/react-start";
import { UNAVAILABLE_CLUB_STATS } from "./strava-club";

// Preserve a safe response for the existing public function. Do not expose
// athlete activity or manufacture weekly totals from an undated feed.
// A future integration needs approved scope, permissions and token lifecycle.
export const getClubStats = createServerFn({ method: "GET" }).handler(
  async () => UNAVAILABLE_CLUB_STATS,
);
