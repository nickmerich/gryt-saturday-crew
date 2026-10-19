import { createServerFn } from "@tanstack/react-start";

export const getClubStats = createServerFn({ method: "GET" }).handler(async () => {
  const { clubStatsService } = await import("./strava/service.server");
  return clubStatsService().get();
});
