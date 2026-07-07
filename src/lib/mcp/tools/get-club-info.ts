import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { guardToolAccess } from "../public-allowlist";

const TOOL_NAME = "get_club_info";

export default defineTool({
  name: TOOL_NAME,
  title: "Get club info",
  description:
    "Return general information about GRYT Run Club: mission, location, links, and how to join.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_args: unknown, ctx: ToolContext) => {
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
    const payload = guardToolAccess(TOOL_NAME, ctx.isAuthenticated(), info);
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
