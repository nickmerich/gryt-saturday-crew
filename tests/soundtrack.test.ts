import { describe, expect, test } from "bun:test";
import {
  creditName,
  normalizeSong,
  playlistName,
  reportSnippet,
  spotifyPlaylistId,
  summarizeSoundtrack,
} from "../src/lib/soundtrack";

describe("song input", () => {
  test("blank means no song", () => {
    expect(normalizeSong("   ")).toBeNull();
    expect(normalizeSong(undefined)).toBeNull();
  });
  test("collapses whitespace and caps length", () => {
    expect(normalizeSong("  Dreams   -  Fleetwood Mac ")).toBe("Dreams - Fleetwood Mac");
    expect(normalizeSong("x".repeat(500))!.length).toBe(200);
  });
  test("credit uses first word only", () => {
    expect(creditName("Laura Merich")).toBe("Laura");
  });
  test("playlist name matches the run", () => {
    expect(playlistName(27)).toBe("GRYT Run #27");
  });
});

describe("spotify links", () => {
  const id = "37i9dQZF1DXcBWIGoYBM5M";
  test("accepts share, intl, embed and uri forms", () => {
    expect(spotifyPlaylistId(`https://open.spotify.com/playlist/${id}?si=abc`)).toBe(id);
    expect(spotifyPlaylistId(`https://open.spotify.com/intl-de/playlist/${id}`)).toBe(id);
    expect(spotifyPlaylistId(`https://open.spotify.com/embed/playlist/${id}`)).toBe(id);
    expect(spotifyPlaylistId(`spotify:playlist:${id}`)).toBe(id);
  });
  test("rejects anything else", () => {
    expect(spotifyPlaylistId(`https://open.spotify.com/album/${id}`)).toBeNull();
    expect(spotifyPlaylistId(`https://evil.example/playlist/${id}`)).toBeNull();
    expect(spotifyPlaylistId(`http://open.spotify.com/playlist/${id}`)).toBeNull();
    expect(spotifyPlaylistId("not a link")).toBeNull();
  });
});

describe("soundtrack summary", () => {
  // Most recent first, like finishedRunDates.
  const RUNS = ["2026-10-31", "2026-10-24", "2026-10-17", "2026-10-10", "2026-10-03", "2026-09-26"];

  test("share counts each person once per run", () => {
    const s = summarizeSoundtrack(
      [
        { personKey: "a", eventDate: "2026-10-31", song: "Dreams" },
        { personKey: "a", eventDate: "2026-10-31", song: null },
        { personKey: "b", eventDate: "2026-10-31", song: null },
      ],
      [],
      RUNS,
    );
    expect(s.runs[0]).toEqual({ eventDate: "2026-10-31", rsvps: 2, withSong: 1, share: 0.5 });
    expect(s.totals.share).toBe(0.5);
  });

  test("return rate only uses runs whose 4-week window has passed", () => {
    const s = summarizeSoundtrack(
      [
        { personKey: "a", eventDate: "2026-09-26", song: "Dreams" },
        { personKey: "b", eventDate: "2026-09-26", song: null },
        { personKey: "c", eventDate: "2026-09-26", song: null }, // RSVP'd, never showed
        { personKey: "d", eventDate: "2026-10-24", song: "Song" }, // window still open
      ],
      [
        { personKey: "a", eventDate: "2026-09-26" },
        { personKey: "a", eventDate: "2026-10-17" },
        { personKey: "b", eventDate: "2026-09-26" },
        { personKey: "b", eventDate: "2026-10-31" }, // 5th Saturday later: outside window
        { personKey: "d", eventDate: "2026-10-24" },
      ],
      RUNS,
    );
    expect(s.returnWithSong).toEqual({ runners: 1, cameBack: 1, rate: 1 });
    expect(s.returnWithoutSong).toEqual({ runners: 1, cameBack: 0, rate: 0 });
  });

  test("no data reports null rates, not zero", () => {
    const s = summarizeSoundtrack([], [], RUNS);
    expect(s.totals.share).toBeNull();
    expect(s.returnWithSong.rate).toBeNull();
  });
});

describe("report snippet", () => {
  test("names only appear with opt-in", () => {
    const out = reportSnippet(27, "https://open.spotify.com/playlist/x", [
      { name: "Laura Merich", song: "Dreams - Fleetwood Mac", creditOk: true },
      { name: "Sam Smith", song: "Lose Yourself - Eminem", creditOk: false },
    ]);
    expect(out).toContain('name: "Laura"');
    expect(out).not.toContain("Merich");
    expect(out).not.toContain("Sam");
    expect(out).toContain('"Lose Yourself - Eminem"');
  });
});
