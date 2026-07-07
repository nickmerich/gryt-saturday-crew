import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { guardToolAccess } from "../public-allowlist";

const TOOL_NAME = "get_run_schedule";

export default defineTool({
  name: TOOL_NAME,
  title: "Get run schedule",
  description:
    "Return GRYT Run Club's weekly meet-up schedule, including day, time, and meeting location.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_args: unknown, ctx: ToolContext) => {
    const runs = [
      {
        day: "Saturday",
        time: "7:00 AM",
        location: "Montour / Peters Trail, McMurray, PA",
        meetingPoint: "212 Valley Brook Road, McMurray, PA",
        pace: "Easy, conversational. All paces welcome.",
        notes: "Coffee after. No signup required — just show up.",
      },
      {
        day: "Tuesday",
        time: "9:00 PM",
        location: "Coordinated via Strava club",
        pace: "Shorter, faster post-work reset",
        notes: "Check the Strava group for weekly details.",
      },
    ];
    const payload = guardToolAccess(TOOL_NAME, ctx.isAuthenticated(), { runs });
    return {
      content: [{ type: "text", text: JSON.stringify(payload.runs ?? [], null, 2) }],
      structuredContent: payload,
    };
  },
});
