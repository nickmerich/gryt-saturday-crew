import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

export const PlanInput = z.object({
  goal: z.string().min(3).max(400),
  raceDate: z.string().max(40),
  experience: z.enum(["new", "returning", "regular", "competitive"]),
  daysPerWeek: z.number().int().min(1).max(7),
  currentMileage: z.string().max(60),
  constraints: z.string().max(500),
});

export type PlanInputType = z.infer<typeof PlanInput>;

const PlanDay = z.object({
  day: z.string(),
  focus: z.string(),
  detail: z.string(),
});

const PlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  weeklyMileage: z.string(),
  week: z.array(PlanDay),
  progression: z.array(z.string()),
  watchOuts: z.array(z.string()),
});

export type RunPlan = z.infer<typeof PlanSchema>;

const SYSTEM = [
  "You are a coach for GRYT Run Club — a free Saturday 7:00 AM run club at 212 Valley Brook Road, McMurray, PA (Montour/Peters Creek Trail, flat crushed limestone, all paces, nobody gets dropped).",
  "Write a one-week repeatable training plan the runner can start this week.",
  "Always place the long or social run on Saturday morning with GRYT.",
  "Voice: short, declarative, physical, coach-like. No emoji. No hedging. No medical claims.",
  "Respect the runner's available days exactly: the `week` array must contain all 7 days (Monday..Sunday), with rest or easy walking on days they are not running.",
].join(" ");

export const createRunPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");


    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: {
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });

    const prompt = [
      `Goal: ${data.goal}`,
      `Target date or timeline: ${data.raceDate || "not specified"}`,
      `Experience level: ${data.experience}`,
      `Days per week available to train: ${data.daysPerWeek}`,
      `Current weekly volume: ${data.currentMileage || "not specified"}`,
      `Constraints, injuries, schedule notes: ${data.constraints || "none"}`,
      "",
      "Return a plan with: a short title, a two-sentence summary, a target weekly mileage range, all seven days, 3-5 progression steps for the next month, and 2-4 watch-outs.",
    ].join("\n");

    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        system: SYSTEM,
        prompt,
        output: Output.object({ schema: PlanSchema }),
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });

      const out = await result.output;
      // Round-trip through JSON so the value crossing the RPC boundary is a
      // plain, fully-serializable object.
      return JSON.parse(JSON.stringify(out)) as RunPlan;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The coach couldn't finish that plan. Try again.");
      }
      throw new Error("The coach couldn't finish that plan. Try again.");
    }

  });
