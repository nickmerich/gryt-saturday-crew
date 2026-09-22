import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { runOnDate } from "../src/lib/run-occurrence";
import type { CheckinBoard } from "../src/lib/attendance/checkin";

test.beforeEach(async ({ baseURL }) => {
  expect(["localhost", "127.0.0.1"]).toContain(new URL(baseURL!).hostname);
});
async function fixture(page: import("@playwright/test").Page) {
  const html = await readFile(new URL("./fixtures/organizer.html", import.meta.url), "utf8");
  await page.route("**/e2e/fixtures/organizer.html", (route) =>
    route.fulfill({ contentType: "text/html", body: html }),
  );
  const board: CheckinBoard = {
    event: runOnDate("2026-09-19"),
    revision: 0,
    closed: false,
    snapshotChanged: false,
    writable: true,
    people: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Alex Fixture",
        contactHint: "a***@example.com",
        source: "rsvp",
        present: false,
        recordedAt: null,
        invitationChanged: false,
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Jordan Fixture",
        contactHint: "Phone ending 0100",
        source: "rsvp",
        present: false,
        recordedAt: null,
        invitationChanged: true,
      },
    ],
    audit: [],
    auditHasMore: false,
  };
  const commands: any[] = [];
  let failure: 0 | 409 | 503 = 0;
  await page.route("**/__organizer_fixture?*", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: board });
    const input = route.request().postDataJSON();
    commands.push(input);
    if (failure)
      return route.fulfill({
        status: failure,
        json: {
          error:
            failure === 409
              ? "Another organizer changed this run. Refresh before making a new change."
              : "Save could not be confirmed.",
        },
      });
    board.revision++;
    if (input.action === "walkin")
      board.people.push({
        id: input.participantId,
        name: input.name,
        contactHint: "No contact collected",
        source: "walkin",
        present: true,
        recordedAt: new Date().toISOString(),
        invitationChanged: false,
      });
    if (input.action === "mark") {
      const p = board.people.find((p) => p.id === input.participantId)!;
      p.present = input.present;
      p.recordedAt = new Date().toISOString();
    }
    if (input.action === "close") board.closed = true;
    if (input.action === "reopen") board.closed = false;
    board.audit.unshift({
      id: board.revision,
      action: input.action,
      participantId: input.participantId ?? null,
      present: input.present ?? null,
      reason: input.reason ?? null,
      actor: "organizer@example.com",
      at: new Date().toISOString(),
    });
    return route.fulfill({ json: { success: true, revision: board.revision } });
  });
  await page.goto("/e2e/fixtures/organizer.html", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("button", { name: "Check in Alex Fixture", exact: true }),
  ).toBeEnabled();
  return {
    board,
    commands,
    fail: (code: 0 | 409 | 503) => {
      failure = code;
    },
  };
}
test("organizer can check in, find runners, correct with a reason and add a walk-in", async ({
  page,
}) => {
  const f = await fixture(page);
  await page.getByRole("button", { name: "Check in Alex Fixture", exact: true }).click();
  await expect(page.getByRole("button", { name: "Correct Alex Fixture" })).toBeEnabled();
  await page.getByRole("button", { name: "Correct Alex Fixture" }).click();
  await page.getByLabel("Reason", { exact: true }).fill("Wrong runner selected");
  await page.getByRole("button", { name: "Save correction" }).click();
  await expect(
    page.getByRole("button", { name: "Check in Alex Fixture", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Find a runner").fill("Jordan");
  await expect(page.getByRole("heading", { name: "Alex Fixture" })).toHaveCount(0);
  await page.getByLabel("Find a runner").fill("");
  await page.getByRole("button", { name: "Add a walk-in", exact: true }).click();
  await page.getByLabel("Runner name").fill("Taylor Walk-in");
  await page.getByRole("button", { name: "Add and check in" }).click();
  await expect(page.getByRole("heading", { name: "Taylor Walk-in" })).toBeVisible();
  await page.getByRole("combobox", { name: "Show", exact: true }).selectOption("unrecorded");
  await expect(page.getByRole("heading", { name: "Taylor Walk-in" })).toHaveCount(0);
  expect(f.commands.map((c) => c.action)).toEqual(["mark", "mark", "walkin"]);
  await page.getByText("Recent changes", { exact: false }).click();
  await expect(page.getByText("Reason: Wrong runner selected")).toBeVisible();
});
test("uncertain save retries with identical payload; conflict never claims success", async ({
  page,
}) => {
  const f = await fixture(page);
  f.fail(503);
  await page.getByRole("button", { name: "Check in Alex Fixture", exact: true }).click();
  await expect(page.getByRole("button", { name: "Retry same change" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Check in Jordan Fixture", exact: true }),
  ).toBeDisabled();
  f.fail(0);
  await page.getByRole("button", { name: "Retry same change" }).click();
  await expect(page.getByRole("button", { name: "Correct Alex Fixture" })).toBeEnabled();
  expect(f.commands[0]).toEqual(f.commands[1]);
  f.fail(409);
  await page.getByRole("button", { name: "Check in Jordan Fixture", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Another organizer changed");
  await expect(
    page.getByRole("button", { name: "Check in Jordan Fixture", exact: true }),
  ).toBeEnabled();
  await expect(page.getByText("Change saved.", { exact: false })).toHaveCount(0);
});
test("mobile closure and reopening retain unrecorded runners and require review", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  const f = await fixture(page);
  await page.getByRole("button", { name: "Close attendance", exact: true }).click();
  await page.getByLabel("Reason", { exact: true }).fill("Headcount reconciled");
  await page.getByLabel("I reviewed this run and the attendance totals.").check();
  await page.getByRole("button", { name: "Save closure" }).click();
  await expect(page.getByRole("button", { name: "Reopen for corrections" })).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Check in Alex Fixture", exact: true }),
  ).toBeDisabled();
  expect(f.board.people.every((p) => !p.present)).toBe(true);
  await page.getByRole("button", { name: "Reopen for corrections" }).click();
  await page.getByLabel("Reason", { exact: true }).fill("Late arrival correction");
  await page.getByLabel("I reviewed this run and the attendance totals.").check();
  await page.getByRole("button", { name: "Save reopening" }).click();
  await expect(
    page.getByRole("button", { name: "Check in Alex Fixture", exact: true }),
  ).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("actual admin page exposes no roster to a signed-out visitor", async ({ page }) => {
  await page.goto("/admin/check-in", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Organizer sign-in required" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Attendance list" })).toHaveCount(0);
  const response = await page.request.get("/api/admin/checkins?date=2026-09-19");
  expect(response.status()).toBe(403);
  expect(response.headers()["cache-control"]).toBe("no-store");
});

test("read-only and failed-load states do not leave active check-in controls", async ({ page }) => {
  const f = await fixture(page);
  f.board.writable = false;
  await page.getByRole("button", { name: "Refresh roster" }).click();
  await expect(
    page.getByRole("button", { name: "Check in Alex Fixture", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("Read-only.", { exact: false })).toBeVisible();
  await page.unroute("**/__organizer_fixture?*");
  await page.route("**/__organizer_fixture?*", (route) =>
    route.fulfill({ status: 503, json: { error: "Attendance storage unavailable." } }),
  );
  await page.getByRole("button", { name: "Refresh roster" }).click();
  await expect(page.getByRole("alert")).toContainText("Attendance storage unavailable");
  await expect(page.getByRole("list", { name: "Attendance list" })).toHaveCount(0);
});
