// The Saturday Soundtrack: one optional song per RSVP, collected into a
// weekly playlist named after the run ("GRYT Run #27") and embedded in that
// run's report. Pure helpers only, so the rules are testable without a DB.

export const SONG_MAX = 200;

/** How many later Saturdays count as "came back" for the return comparison. */
export const RETURN_WINDOW_RUNS = 4;

/** Trim and collapse whitespace. Empty input means no song. */
export function normalizeSong(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.replace(/\s+/g, " ").trim();
  if (!v) return null;
  return v.slice(0, SONG_MAX);
}

/** The playlist name for a run. Keep it identical every week. */
export function playlistName(runNumber: number): string {
  return `GRYT Run #${runNumber}`;
}

/**
 * Accepts an open.spotify.com playlist link (with or without /intl-xx/ or a
 * ?si= tracking param), an embed link, or a spotify:playlist: URI. Returns the
 * playlist id, or null for anything else so a typo never renders a broken
 * iframe on a public page.
 */
export function spotifyPlaylistId(input: string | null | undefined): string | null {
  if (!input) return null;
  const v = input.trim();
  const uri = /^spotify:playlist:([A-Za-z0-9]{10,40})$/.exec(v);
  if (uri) return uri[1]!;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== "open.spotify.com") return null;
  const m = /^\/(?:intl-[a-z-]+\/)?(?:embed\/)?playlist\/([A-Za-z0-9]{10,40})\/?$/.exec(url.pathname);
  return m ? m[1]! : null;
}

export function spotifyEmbedSrc(playlistId: string): string {
  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
}

export function spotifyOpenUrl(playlistId: string): string {
  return `https://open.spotify.com/playlist/${playlistId}`;
}

/** First word of what they typed in "First name". Never a last name. */
export function creditName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first.slice(0, 30);
}

export type SoundtrackRsvp = {
  personKey: string;
  eventDate: string; // YYYY-MM-DD
  song: string | null;
};

export type SoundtrackCheckin = { personKey: string; eventDate: string };

export type SoundtrackRunStat = {
  eventDate: string;
  rsvps: number;
  withSong: number;
  /** withSong / rsvps, 0..1. null when nobody RSVP'd. */
  share: number | null;
};

export type ReturnGroup = {
  /** Runners who RSVP'd, showed up, and whose return window has fully passed. */
  runners: number;
  /** Of those, how many checked in again within RETURN_WINDOW_RUNS Saturdays. */
  cameBack: number;
  rate: number | null;
};

export type SoundtrackSummary = {
  runs: SoundtrackRunStat[];
  totals: { rsvps: number; withSong: number; share: number | null };
  returnWithSong: ReturnGroup;
  returnWithoutSong: ReturnGroup;
};

const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

/**
 * Song share per run, and whether song-adders come back more often.
 *
 * Return rule: a person counts once per run where they RSVP'd AND checked
 * in. They "came back" if they checked in at any of the next
 * RETURN_WINDOW_RUNS finished Saturdays. Runs whose window has not fully
 * passed are left out, so a recent run never looks like a no-show.
 *
 * @param finishedRuns finished Saturday dates, most recent first.
 */
export function summarizeSoundtrack(
  rsvps: SoundtrackRsvp[],
  checkins: SoundtrackCheckin[],
  finishedRuns: string[],
): SoundtrackSummary {
  // One RSVP per person per run. If any of their RSVPs had a song, it counts.
  const byRun = new Map<string, Map<string, boolean>>();
  for (const r of rsvps) {
    const people = byRun.get(r.eventDate) ?? new Map<string, boolean>();
    people.set(r.personKey, (people.get(r.personKey) ?? false) || Boolean(r.song));
    byRun.set(r.eventDate, people);
  }

  const runs: SoundtrackRunStat[] = [...byRun.entries()]
    .map(([eventDate, people]) => {
      const withSong = [...people.values()].filter(Boolean).length;
      return { eventDate, rsvps: people.size, withSong, share: ratio(withSong, people.size) };
    })
    .sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));

  const totalRsvps = runs.reduce((s, r) => s + r.rsvps, 0);
  const totalSongs = runs.reduce((s, r) => s + r.withSong, 0);

  const present = new Set(checkins.map((c) => `${c.personKey}|${c.eventDate}`));
  const chronological = [...finishedRuns].sort();
  const indexOf = new Map(chronological.map((d, i) => [d, i]));

  const groups = { song: { runners: 0, cameBack: 0 }, none: { runners: 0, cameBack: 0 } };
  for (const [eventDate, people] of byRun) {
    const i = indexOf.get(eventDate);
    if (i === undefined) continue; // not a finished run
    if (i + RETURN_WINDOW_RUNS > chronological.length - 1) continue; // window still open
    const window = chronological.slice(i + 1, i + 1 + RETURN_WINDOW_RUNS);
    for (const [personKey, hadSong] of people) {
      if (!present.has(`${personKey}|${eventDate}`)) continue;
      const g = hadSong ? groups.song : groups.none;
      g.runners += 1;
      if (window.some((d) => present.has(`${personKey}|${d}`))) g.cameBack += 1;
    }
  }

  return {
    runs,
    totals: { rsvps: totalRsvps, withSong: totalSongs, share: ratio(totalSongs, totalRsvps) },
    returnWithSong: { ...groups.song, rate: ratio(groups.song.cameBack, groups.song.runners) },
    returnWithoutSong: { ...groups.none, rate: ratio(groups.none.cameBack, groups.none.runners) },
  };
}

export type SongEntry = { name: string; song: string; creditOk: boolean };

/** Plain list for building the playlist: one song per line. */
export function songListText(entries: SongEntry[]): string {
  return entries.map((e) => e.song).join("\n");
}

/**
 * The block to paste into src/content/run-reports.ts. Only opted-in first
 * names appear; everyone else's song is listed without a name.
 */
export function reportSnippet(runNumber: number, playlistUrl: string, entries: SongEntry[]): string {
  const credits = entries.map((e) =>
    e.creditOk
      ? `      { song: ${JSON.stringify(e.song)}, name: ${JSON.stringify(creditName(e.name))} },`
      : `      { song: ${JSON.stringify(e.song)} },`,
  );
  return [
    `  ${runNumber}: {`,
    `    soundtrack: {`,
    `      spotifyUrl: ${JSON.stringify(playlistUrl || "PASTE_SPOTIFY_PLAYLIST_LINK")},`,
    `      credits: [`,
    ...credits.map((c) => `  ${c}`),
    `      ],`,
    `    },`,
    `  },`,
  ].join("\n");
}
