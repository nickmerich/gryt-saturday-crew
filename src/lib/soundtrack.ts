// The Saturday Soundtrack.
//
// Each RSVP can carry one optional song ("what gets you out the door?").
// Organizers collect that week's songs into a playlist and attach it to the
// run report. Pure helpers only, shared by the RSVP form, the RSVP API, the
// admin song list, and the run report page.
//
// Privacy rules:
//  1. The song is optional. Leaving it blank changes nothing about the RSVP.
//  2. A first name is only ever shown next to a song when the runner ticked
//     the credit box. Otherwise the song is anonymous everywhere.
//  3. Contact details are never part of anything this module returns.

export const SONG_MAX = 120;

/**
 * Clean a free-text song entry. Returns null when there is nothing worth
 * keeping, so blank or junk input never reaches the database.
 */
export function normalizeSong(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    // drop control characters and zero-width marks
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f\u200b-\u200d\u2060\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 2) return null;
  return cleaned.slice(0, SONG_MAX).trim();
}

/**
 * Accepts a Spotify playlist URL, a spotify:playlist: URI, or a bare id and
 * returns the playlist id. Anything else returns null.
 */
export function spotifyPlaylistId(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  const fromUrl = s.match(
    /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:embed\/)?playlist\/([A-Za-z0-9]{22})(?:[/?#].*)?$/,
  );
  if (fromUrl) return fromUrl[1];
  const fromUri = s.match(/^spotify:playlist:([A-Za-z0-9]{22})$/);
  if (fromUri) return fromUri[1];
  if (/^[A-Za-z0-9]{22}$/.test(s)) return s;
  return null;
}

export function spotifyPlaylistUrl(id: string): string {
  return `https://open.spotify.com/playlist/${id}`;
}

export function spotifyEmbedUrl(id: string): string {
  return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
}

export type SongRow = {
  song: string | null;
  songCredit: boolean | null;
  name: string | null;
  createdAt: string;
};

export type SoundtrackEntry = {
  song: string;
  /** First name, only when the runner opted in. */
  creditedTo: string | null;
};

/** First word of a name, capped, so a full name never leaks into a credit. */
export function firstNameOnly(name: string | null | undefined): string | null {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  if (!first) return null;
  return first.slice(0, 30);
}

/**
 * Turn raw RSVP rows into the week's song list: oldest first, duplicates
 * (same song, case-insensitive) merged, credits kept only when opted in.
 */
export function buildSoundtrack(rows: SongRow[]): SoundtrackEntry[] {
  const sorted = [...rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const out: SoundtrackEntry[] = [];
  const seen = new Map<string, SoundtrackEntry>();
  for (const r of sorted) {
    const song = normalizeSong(r.song);
    if (!song) continue;
    const credit = r.songCredit ? firstNameOnly(r.name) : null;
    const key = song.toLowerCase();
    const existing = seen.get(key);
    if (existing) {
      if (!existing.creditedTo && credit) existing.creditedTo = credit;
      continue;
    }
    const entry = { song, creditedTo: credit };
    seen.set(key, entry);
    out.push(entry);
  }
  return out;
}

/**
 * True when a Supabase/PostgREST insert failed only because the song columns
 * don't exist yet (code deployed before the migration ran).
 */
export function isMissingSongColumnError(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  const mentionsSong = msg.includes("song");
  return (
    mentionsSong && (error.code === "PGRST204" || error.code === "42703" || msg.includes("column"))
  );
}
