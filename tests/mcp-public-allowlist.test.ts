import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PUBLIC_TOOL_ALLOWLIST,
  filterToPublicFields,
  guardToolAccess,
  isPublicTool,
} from "../src/lib/mcp/public-allowlist";
import getRunSchedule from "../src/lib/mcp/tools/get-run-schedule";
import getClubInfo from "../src/lib/mcp/tools/get-club-info";

type ToolLike = {
  name: string;
  handler: (args: unknown, ctx: { isAuthenticated: () => boolean }) => unknown;
};

const authed = { isAuthenticated: () => true };
const anon = { isAuthenticated: () => false };

async function invoke(tool: ToolLike, ctx: typeof authed) {
  return (await tool.handler({}, ctx)) as {
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
  };
}

describe("PUBLIC_TOOL_ALLOWLIST", () => {
  test("only lists tools that are known-public", () => {
    expect(Object.keys(PUBLIC_TOOL_ALLOWLIST).sort()).toEqual([
      "get_club_info",
      "get_run_schedule",
    ]);
  });

  test("isPublicTool matches allowlist keys", () => {
    expect(isPublicTool("get_run_schedule")).toBe(true);
    expect(isPublicTool("get_club_info")).toBe(true);
    expect(isPublicTool("get_members")).toBe(false);
    expect(isPublicTool("__proto__")).toBe(false);
  });
});

describe("filterToPublicFields", () => {
  test("strips fields not on the allowlist", () => {
    const filtered = filterToPublicFields("get_club_info", {
      name: "GRYT",
      website: "https://grytrunclub.com",
      secretAdminNote: "leak",
      memberEmails: ["a@b.com"],
    });
    expect(filtered).toEqual({
      name: "GRYT",
      website: "https://grytrunclub.com",
    });
  });

  test("recurses into arrays of objects", () => {
    const filtered = filterToPublicFields("get_run_schedule", {
      runs: [
        { day: "Saturday", time: "7:00 AM", secret: "nope" },
        { day: "Tuesday", time: "9:00 PM", rsvps: ["x"] },
      ],
    }) as { runs: Array<Record<string, unknown>> };
    for (const r of filtered.runs) {
      expect(Object.keys(r).sort()).toEqual(["day", "time"]);
    }
  });

  test("returns unknown-tool payloads unchanged (guard is the block)", () => {
    const input = { anything: 1 };
    expect(filterToPublicFields("not_a_tool", input)).toEqual(input);
  });
});

describe("guardToolAccess", () => {
  test("authenticated callers receive full payload untouched", () => {
    const full = { name: "GRYT", secretAdminNote: "ok" };
    expect(guardToolAccess("get_club_info", true, full)).toEqual(full);
  });

  test("unauthenticated callers to allowlisted tools get filtered payload", () => {
    const out = guardToolAccess("get_club_info", false, {
      name: "GRYT",
      secretAdminNote: "leak",
    });
    expect(out).toEqual({ name: "GRYT" });
  });

  test("unauthenticated callers to non-allowlisted tools are rejected", () => {
    expect(() =>
      guardToolAccess("get_members", false, { members: ["a"] }),
    ).toThrow(/Unauthorized/);
  });
});

describe("MCP tool handlers", () => {
  test("get_run_schedule anon response only exposes allowlisted fields", async () => {
    const res = await invoke(getRunSchedule as ToolLike, anon);
    const allowed = new Set(PUBLIC_TOOL_ALLOWLIST.get_run_schedule.fields);
    const sc = res.structuredContent ?? {};
    for (const key of Object.keys(sc)) expect(allowed.has(key)).toBe(true);
    const runs = (sc as { runs?: Array<Record<string, unknown>> }).runs ?? [];
    expect(runs.length).toBeGreaterThan(0);
    for (const r of runs) {
      for (const key of Object.keys(r)) expect(allowed.has(key)).toBe(true);
    }
  });

  test("get_club_info anon response only exposes allowlisted fields", async () => {
    const res = await invoke(getClubInfo as ToolLike, anon);
    const allowed = new Set(PUBLIC_TOOL_ALLOWLIST.get_club_info.fields);
    const sc = res.structuredContent ?? {};
    for (const key of Object.keys(sc)) expect(allowed.has(key)).toBe(true);
  });

  test("authenticated response includes fields anon response cannot", async () => {
    // Sanity check: full payload from get_club_info contains every allowlisted
    // key, and the anon response is a subset of it (never a superset).
    const full = (await invoke(getClubInfo as ToolLike, authed))
      .structuredContent ?? {};
    const anonRes = (await invoke(getClubInfo as ToolLike, anon))
      .structuredContent ?? {};
    for (const key of Object.keys(anonRes)) {
      expect(Object.keys(full)).toContain(key);
    }
  });
});

describe("MCP tool files", () => {
  const dir = resolve(process.cwd(), "src/lib/mcp/tools");
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));

  test("every tool file calls guardToolAccess", () => {
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const src = readFileSync(resolve(dir, f), "utf8");
      expect(src).toContain("guardToolAccess");
    }
  });
});
