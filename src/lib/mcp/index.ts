import { defineMcp } from "@lovable.dev/mcp-js";
import getRunSchedule from "./tools/get-run-schedule";
import getClubInfo from "./tools/get-club-info";

export default defineMcp({
  name: "gryt-run-club-mcp",
  title: "GRYT Run Club",
  version: "0.1.0",
  instructions:
    "Tools for GRYT Run Club — a Pittsburgh Saturday-morning run club. Use `get_run_schedule` for the weekly meet-up times and location, and `get_club_info` for mission, links, and how to join.",
  tools: [getRunSchedule, getClubInfo],
});
