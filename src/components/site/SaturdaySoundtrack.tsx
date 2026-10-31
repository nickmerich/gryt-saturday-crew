import { useState } from "react";
import { spotifyEmbedUrl, spotifyPlaylistId, spotifyPlaylistUrl } from "@/lib/soundtrack";
import { track } from "@/lib/analytics";

type Props = {
  runNumber: number;
  playlist?: string;
  songs?: Array<{ song: string; from?: string }>;
};

/**
 * The week's playlist on a run report. The Spotify player only loads after a
 * tap, so no third-party script or cookie touches the page until someone
 * asks for it.
 */
export function SaturdaySoundtrack({ runNumber, playlist, songs = [] }: Props) {
  const [playerOn, setPlayerOn] = useState(false);
  const id = spotifyPlaylistId(playlist);
  if (!id && songs.length === 0) return null;

  return (
    <section aria-labelledby="soundtrack" className="mt-10 border border-paper/20 p-6 md:p-8">
      <h2 id="soundtrack" className="eyebrow text-blue mb-2">
        Saturday Soundtrack
      </h2>
      <p className="text-[20px] md:text-[24px] font-bold leading-tight">
        What got the crew out the door for Run #{runNumber}.
      </p>
      <p className="mt-2 text-paper/70 text-[15px]">
        Every song came from someone who RSVP'd. Add yours when you sign up for next Saturday.
      </p>

      {songs.length ? (
        <ol className="mt-5 space-y-2 list-decimal pl-6 text-[16px] text-paper/90">
          {songs.map((s) => (
            <li key={s.song}>
              {s.song}
              {s.from ? <span className="text-paper/55"> · from {s.from}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}

      {id ? (
        <div className="mt-6">
          {playerOn ? (
            <iframe
              title={`GRYT Run #${runNumber} Saturday Soundtrack on Spotify`}
              src={spotifyEmbedUrl(id)}
              width="100%"
              height="352"
              loading="lazy"
              allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="block w-full border-0"
              style={{ borderRadius: 12 }}
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setPlayerOn(true);
                  track("soundtrack_player_load", { run_number: runNumber });
                }}
                className="bg-blue text-ink px-5 py-3 text-[12px] font-bold tracking-[0.14em] uppercase hover:bg-paper transition-colors"
              >
                Play it here
              </button>
              <a
                href={spotifyPlaylistUrl(id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("soundtrack_open_spotify", { run_number: runNumber })}
                className="border border-paper/30 hover:border-blue hover:text-blue px-5 py-3 text-[12px] font-bold tracking-[0.14em] uppercase transition-colors"
              >
                Open in Spotify →
              </a>
            </div>
          )}
          {!playerOn ? (
            <p className="mt-2 text-[12px] text-paper/50">
              The player loads from Spotify when you tap play.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
