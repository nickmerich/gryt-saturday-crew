import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "submit_recommendation",
  title: "Submit a local recommendation",
  description:
    "Submit a Pittsburgh-area local recommendation (coffee shop, trail, gear store, etc.) to the GRYT Run Club community board.",
  inputSchema: {
    name: z.string().min(1).describe("Name of the place or business being recommended."),
    category: z
      .string()
      .min(1)
      .describe("Category, e.g. 'coffee', 'trail', 'gear', 'food', 'recovery'."),
    description: z
      .string()
      .min(1)
      .describe("One or two sentences on why you recommend it."),
    submittedBy: z.string().min(1).describe("Name of the person submitting the recommendation."),
    url: z.string().url().optional().describe("Optional website or map URL."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input) => {
    const { submitRecommendation } = await import("@/lib/recommendations.functions");
    try {
      await submitRecommendation({
        data: {
          name: input.name,
          category: input.category,
          description: input.description,
          submittedBy: input.submittedBy,
          url: input.url,
        },
      });
      return {
        content: [
          { type: "text", text: `Recommendation for "${input.name}" submitted. Thanks!` },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Failed to submit recommendation: ${message}` }],
        isError: true,
      };
    }
  },
});
