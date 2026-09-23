import { describe, expect, test } from "bun:test";
import { CODE_WINDOW_MS, currentCode, verifyCode } from "../src/lib/checkin/rotating-code";

const SECRET = "test-secret-value";
const NOW = 1_800_000_000_000;

describe("rotating check-in code", () => {
  test("the code is eight readable characters", async () => {
    const { code } = await currentCode(SECRET, NOW);
    expect(code).toMatch(/^[A-Z2-9]{8}$/);
  });

  test("the same window gives the same code", async () => {
    const a = await currentCode(SECRET, NOW);
    const b = await currentCode(SECRET, NOW + 1000);
    expect(a.code).toBe(b.code);
  });

  test("a later window gives a different code", async () => {
    const a = await currentCode(SECRET, NOW);
    const b = await currentCode(SECRET, NOW + CODE_WINDOW_MS);
    expect(a.code).not.toBe(b.code);
  });

  test("a fresh code verifies", async () => {
    const { code } = await currentCode(SECRET, NOW);
    expect(await verifyCode(SECRET, code, NOW)).toBe(true);
  });

  test("a code from a minute ago still verifies", async () => {
    const { code } = await currentCode(SECRET, NOW);
    expect(await verifyCode(SECRET, code, NOW + 2 * CODE_WINDOW_MS)).toBe(true);
  });

  test("a code from five minutes ago is rejected", async () => {
    const { code } = await currentCode(SECRET, NOW);
    expect(await verifyCode(SECRET, code, NOW + 10 * CODE_WINDOW_MS)).toBe(false);
  });

  test("another secret does not produce a valid code", async () => {
    const { code } = await currentCode("someone-elses-secret", NOW);
    expect(await verifyCode(SECRET, code, NOW)).toBe(false);
  });

  test("junk input is rejected without throwing", async () => {
    expect(await verifyCode(SECRET, "", NOW)).toBe(false);
    expect(await verifyCode(SECRET, "not-a-code", NOW)).toBe(false);
  });
});
