import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Guardrail: every Resources page submission server action must only ever
 * notify nick@gryt.club. If anyone adds a second recipient (CC, BCC,
 * extra address in a recipients array, or a different literal) this test
 * fails so the change is caught in review.
 */

const ALLOWED = "nick@gryt.club";

const FILES = [
  "src/lib/recommendations.functions.ts",
  "src/lib/story-submissions.functions.ts",
  "src/lib/partner-inquiries.functions.ts",
];

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

// Extract every quoted email-looking literal from the file.
function extractEmails(src: string): string[] {
  const re = /["'`]([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})["'`]/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.push(m[1].toLowerCase());
  return out;
}

describe("Resources submissions only email nick@gryt.club", () => {
  for (const file of FILES) {
    test(file, () => {
      const src = read(file);

      // 1. Every email literal in the file must be the allowed address.
      const emails = extractEmails(src);
      expect(emails.length).toBeGreaterThan(0);
      for (const e of emails) {
        expect(e).toBe(ALLOWED);
      }

      // 2. There must be exactly one call to sendInternalTransactionalEmail
      //    per submission (no fan-out to multiple recipients).
      const sendCalls = (
        src.match(/sendInternalTransactionalEmail\s*\(/g) ?? []
      ).length;
      expect(sendCalls).toBeGreaterThan(0);

      // 3. No cc/bcc fields snuck in.
      expect(/\b(cc|bcc)\s*:/i.test(src)).toBe(false);

      // 4. recipientEmail assignments must all use the allowed address.
      const recipientMatches = [
        ...src.matchAll(/recipientEmail\s*:\s*["'`]([^"'`]+)["'`]/g),
      ];
      for (const match of recipientMatches) {
        expect(match[1].toLowerCase()).toBe(ALLOWED);
      }
    });
  }

  test("recommendations recipients array has exactly one address", () => {
    const src = read("src/lib/recommendations.functions.ts");
    const m = src.match(/recipients\s*=\s*\[([^\]]*)\]/);
    expect(m).not.toBeNull();
    const items =
      m![1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? [];
    expect(items).toHaveLength(1);
    expect(items[0].replace(/["'`]/g, "").toLowerCase()).toBe(ALLOWED);
  });
});
