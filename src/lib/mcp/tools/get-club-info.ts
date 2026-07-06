import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_club_info",
  title: "Get club info",
  description:
    "Return general information about GRYT Run Club: mission, location, links, and how to join.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "GRYT Run Club",
      mission: "Do hard things together.",
      description:
        "A Pittsburgh run club for former athletes, busy parents, and comeback runners. No pace requirement, no fee, no signup — just show up.",
      location: "McMurray, PA (South Hills of Pittsburgh)",
      website: "https://grytrunclub.com",
      strava: "https://www.strava.com/clubs/1708552",
      instagram: "https://www.instagram.com/grytrunclub/",
      howToJoin:
        "Show up Saturday 7 AM at 212 Valley Brook Road, McMurray, PA. Arrive 10 minutes early and introduce yourself.",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
