import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { guardToolAccess } from "../public-allowlist";
import { nextRunNumber, nextSaturdayISODate, nextSaturdayLabel } from "@/lib/run-schedule";
import { currentRun } from "@/lib/run-occurrence";

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
        time: currentRun().timeLabel,
        location: currentRun().route,
        meetingPoint: currentRun().location,
        pace: "Easy, conversational. All paces welcome.",
        notes: `No membership required. RSVP and sign the required waiver. Status: ${currentRun().status}. ${currentRun().notice}`,
        nextRunNumber: nextRunNumber(),
        nextRunDate: nextSaturdayISODate(),
        nextRunLabel: nextSaturdayLabel(),
      },
    ];
    const payload = guardToolAccess(TOOL_NAME, ctx.isAuthenticated(), { runs });
    return {
      content: [{ type: "text", text: JSON.stringify(payload.runs ?? [], null, 2) }],
      structuredContent: payload,
    };
  },
});
