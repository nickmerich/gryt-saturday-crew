import { expect, test } from "bun:test";
import { buildInviteCode, inviteSlug, inviteUrl, normalizeInviteCode } from "../src/lib/invite";
import { inviteCodeFor } from "../src/lib/invite.server";
import { whosGoingSentence } from "../src/lib/going.functions";

test("invite codes are stable per person and never expose the contact", () => {
  const a = inviteCodeFor("Nick Merich", "Nick@Example.com ");
  const b = inviteCodeFor("nick", "nick@example.com");
  expect(a).toBe(b);
  expect(a.startsWith("nick-")).toBe(true);
  expect(a).not.toContain("@");
  expect(a).not.toContain("example");
  expect(normalizeInviteCode(a)).toBe(a);
});

test("phone contacts normalise to the same code regardless of formatting", () => {
  expect(inviteCodeFor("Laura", "(412) 555-0100")).toBe(inviteCodeFor("Laura", "4125550100"));
});

test("slugs strip accents and punctuation, and fall back for empty names", () => {
  expect(inviteSlug("Zoë O'Brien")).toBe("zoe");
  expect(inviteSlug("   ")).toBe("runner");
  expect(buildInviteCode("Zoë", "abcdef0123")).toBe("zoe-abcde");
});

test("only well-formed codes are accepted from the URL", () => {
  expect(normalizeInviteCode("Nick-7F3A1")).toBe("nick-7f3a1");
  expect(normalizeInviteCode("nick 7f3a1")).toBeNull();
  expect(normalizeInviteCode("<script>")).toBeNull();
  expect(normalizeInviteCode("-bad")).toBeNull();
  expect(normalizeInviteCode(null)).toBeNull();
});

test("invite URLs carry the code or fall back to the generic friend link", () => {
  expect(inviteUrl("nick-7f3a1")).toBe("https://grytrunclub.com/?ref=nick-7f3a1");
  expect(inviteUrl(null)).toBe("https://grytrunclub.com/?utm_source=friend");
});

test("who's going sentence hides singletons and names only opted-in people", () => {
  expect(whosGoingSentence({ eventId: "x", people: 1, heads: 1, names: ["Sam"] })).toBeNull();
  expect(whosGoingSentence({ eventId: "x", people: 3, heads: 4, names: [] })).toBe("4 in so far.");
  expect(whosGoingSentence({ eventId: "x", people: 3, heads: 4, names: ["Laura"] })).toBe(
    "4 in so far, including Laura.",
  );
  expect(
    whosGoingSentence({ eventId: "x", people: 9, heads: 14, names: ["Laura", "Devin", "Sam"] }),
  ).toBe("14 in so far, including Laura, Devin and Sam.");
  expect(
    whosGoingSentence({ eventId: "x", people: 9, heads: 14, names: ["A", "B", "C", "D", "E", "F", "G", "H"] }),
  ).toBe("14 in so far, including A, B, C, D, E and F and 2 more.");
});
