import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getClubStats } from "@/lib/strava-club.functions";
import { ageClubStats, STRAVA_CACHE_MS, UNAVAILABLE_CLUB_STATS } from "@/lib/strava-club";

/** Shared query key deduplicates all three homepage readers. */
export function useStravaClubStats() {
  const getStats = useServerFn(getClubStats);
  const query = useQuery({
    queryKey: ["strava-club-stats", "verified-v2"],
    queryFn: () => getStats(),
    staleTime: STRAVA_CACHE_MS,
    refetchInterval: STRAVA_CACHE_MS,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const data = query.data ?? UNAVAILABLE_CLUB_STATS;
  return {
    ...query,
    data: ageClubStats(query.isError ? { ...data, status: "stale" } : data, now),
  };
}
