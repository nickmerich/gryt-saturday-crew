import { describe, expect, it } from "vitest";
import { isAdminEmail } from "../src/lib/admin/allowlist";

describe("Organizer payment access", () => {
  it("grants the owner's requested verified email eligibility", () => {
    expect(isAdminEmail("merichnick@gmail.com")).toBe(true);
    expect(isAdminEmail("not-merichnick@gmail.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
  });
});
