import { describe, expect, test } from "bun:test";
import {
  SONG_MAX,
  buildSoundtrack,
  firstNameOnly,
  isMissingSongColumnError,
  normalizeSong,
  spotifyEmbedUrl,
  spotifyPlaylistId,
} from "../src/lib/soundtrack";

describe("normalizeSong", () => {
  test("blank, tiny, and non-string input is dropped", () => {
    expect(normalizeSong("")).toBeNull();
    expect(normalizeSong("   ")).toBeNull();
    expect(normalizeSong("a")).toBeNull();
    expect(normalizeSong(undefined)).toBeNull();
    expect(normalizeSong(42)).toBeNull();
  });
  test("whitespace and control characters collapse", () => {
    expect(normalizeSong("  Dreams \n\t Fleetwood\u200b Mac ")).toBe("Dreams Fleetwood Mac");
  });
  test("long input is capped", () => {
    expect(normalizeSong("x".repeat(500))!.length).toBe(SONG_MAX);
  });
});

describe("spotifyPlaylistId", () => {
  const id = "37i9dQZF1DXdxcBWuJkbcy";
  test("accepts urls, embed urls, uris, and bare ids", () => {
    expect(spotifyPlaylistId(`https://open.spotify.com/playlist/${id}?si=abc`)).toBe(id);
    expect(spotifyPlaylistId(`https://open.spotify.com/intl-en/playlist/${id}`)).toBe(id);
    expect(spotifyPlaylistId(`https://open.spotify.com/embed/playlist/${id}`)).toBe(id);
    expect(spotifyPlaylistId(`spotify:playlist:${id}`)).toBe(id);
    expect(spotifyPlaylistId(id)).toBe(id);
  });
  test("rejects anything that isn't a Spotify playlist", () => {
    expect(spotifyPlaylistId("https://evil.example/playlist/" + id)).toBeNull();
    expect(spotifyPlaylistId(`https://open.spotify.com/album/${id}`)).toBeNull();
    expect(spotifyPlaylistId("javascript:alert(1)")).toBeNull();
    expect(spotifyPlaylistId(null)).toBeNull();
  });
  test("embed url points at Spotify only", () => {
    expect(spotifyEmbedUrl(id).startsWith("https://open.spotify.com/embed/playlist/")).toBe(true);
  });
});

describe("buildSoundtrack", () => {
  test("credits only opted-in first names, merges duplicates, keeps order", () => {
    const list = buildSoundtrack([
      {
        song: "Dreams - Fleetwood Mac",
        songCredit: false,
        name: "Jamie Doe",
        createdAt: "2026-11-05T10:00:00Z",
      },
      {
        song: "Lose Yourself",
        songCredit: true,
        name: "Sam Smith",
        createdAt: "2026-11-04T10:00:00Z",
      },
      {
        song: "dreams - fleetwood mac",
        songCredit: true,
        name: "Alex Lee",
        createdAt: "2026-11-06T10:00:00Z",
      },
      { song: "", songCredit: true, name: "Blank", createdAt: "2026-11-06T11:00:00Z" },
      { song: null, songCredit: null, name: "Nobody", createdAt: "2026-11-06T12:00:00Z" },
    ]);
    expect(list).toEqual([
      { song: "Lose Yourself", creditedTo: "Sam" },
      { song: "Dreams - Fleetwood Mac", creditedTo: "Alex" },
    ]);
  });
  test("never returns a last name", () => {
    expect(firstNameOnly("  Laura   Merich ")).toBe("Laura");
    expect(firstNameOnly("")).toBeNull();
  });
});

describe("isMissingSongColumnError", () => {
  test("detects a pre-migration insert failure", () => {
    expect(
      isMissingSongColumnError({
        code: "PGRST204",
        message: "Could not find the 'song' column of 'rsvps' in the schema cache",
      }),
    ).toBe(true);
    expect(
      isMissingSongColumnError({
        code: "42703",
        message: 'column "song_credit" of relation "rsvps" does not exist',
      }),
    ).toBe(true);
  });
  test("ignores unrelated errors", () => {
    expect(isMissingSongColumnError({ code: "23505", message: "duplicate key" })).toBe(false);
    expect(isMissingSongColumnError(null)).toBe(false);
  });
});
