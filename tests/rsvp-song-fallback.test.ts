import { beforeEach, describe, expect, mock, test } from "bun:test";
import { getOccurrence } from "../src/lib/run-schedule";

// Fake Supabase: records every insert and can pretend the song columns are missing.
const inserts: Record<string, unknown>[] = [];
let songColumnsExist = true;

mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            inserts.push(row);
            if (!songColumnsExist && ("song" in row || "song_credit" in row)) {
              return {
                data: null,
                error: {
                  code: "PGRST204",
                  message: "Could not find the 'song' column of 'rsvps' in the schema cache",
                },
              };
            }
            return { data: { id: "rsvp-1" }, error: null };
          },
        }),
      }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  }),
}));
const emails: Array<{ templateName: string; templateData: Record<string, unknown> }> = [];
mock.module("@/lib/email/send-internal.server", () => ({
  sendInternalTransactionalEmail: async (args: {
    templateName: string;
    templateData: Record<string, unknown>;
  }) => {
    emails.push(args);
  },
}));
mock.module("@/lib/notion/sync.server", () => ({
  syncRsvpToNotion: async () => ({ memberPageId: null, attendancePageId: null }),
}));
mock.module("@/lib/signup-session.server", () => ({
  readSignupToken: () => null,
  recordSignupSession: async () => null,
  signupCookie: () => "",
}));

process.env.SUPABASE_SERVICE_ROLE_KEY = "test";
(import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL =
  "https://example.supabase.co";

const { Route } = await import("../src/routes/api/public/rsvp");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const POST = (Route as any).options.server.handlers.POST as (a: {
  request: Request;
}) => Promise<Response>;

function rsvp(extra: Record<string, unknown> = {}) {
  const occ = getOccurrence();
  return POST({
    request: new Request("https://grytrunclub.com/api/public/rsvp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Jamie",
        contact: "5555551234",
        eventId: occ.id,
        eventVersion: occ.version,
        ...extra,
      }),
    }),
  });
}

describe("RSVP with Saturday Soundtrack", () => {
  beforeEach(() => {
    inserts.length = 0;
    emails.length = 0;
    songColumnsExist = true;
  });

  test("no song: the row is identical to before the feature", async () => {
    const res = await rsvp();
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(1);
    expect("song" in inserts[0]).toBe(false);
    expect("song_credit" in inserts[0]).toBe(false);
  });

  test("song is cleaned and stored with the credit choice", async () => {
    const res = await rsvp({ song: "  Dreams  -  Fleetwood Mac ", songCredit: true });
    expect(res.status).toBe(200);
    expect(inserts[0].song).toBe("Dreams - Fleetwood Mac");
    expect(inserts[0].song_credit).toBe(true);
  });

  test("credit without a song is never stored", async () => {
    await rsvp({ song: "   ", songCredit: true });
    expect("song_credit" in inserts[0]).toBe(false);
  });

  test("before the migration, the RSVP still saves and the owner email keeps the song", async () => {
    songColumnsExist = false;
    const res = await rsvp({ song: "Lose Yourself", songCredit: false });
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(2);
    expect("song" in inserts[1]).toBe(false);
    const notify = emails.find((e) => e.templateName === "rsvp-notification");
    expect(notify?.templateData.song).toBe("Lose Yourself");
    expect(notify?.templateData.songSaved).toBe(false);
  });
});
