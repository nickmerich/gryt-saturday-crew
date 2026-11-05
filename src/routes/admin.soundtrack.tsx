import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getSoundtrackAdmin } from '@/lib/soundtrack.functions'
import { playlistName, reportSnippet, songListText, spotifyPlaylistId, RETURN_WINDOW_RUNS } from '@/lib/soundtrack'

export const Route = createFileRoute('/admin/soundtrack')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Saturday Soundtrack | GRYT Run Club' },
      { name: 'description', content: 'Private organizer page for the weekly RSVP playlist.' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: SoundtrackAdminPage,
})

const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' })
const fmtDate = (d: string) => dayFmt.format(new Date(`${d}T12:00:00Z`))
const pct = (v: number | null) => (v == null ? '-' : `${Math.round(v * 100)}%`)

function CopyButton({ label, text }: { label: string; text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        } catch {
          window.prompt('Copy this:', text)
        }
      }}
      className="border border-foreground/30 hover:border-blue hover:text-foreground/70 px-4 py-2 text-[12px] font-bold tracking-[0.14em] uppercase"
    >
      {done ? 'Copied' : label}
    </button>
  )
}

function SoundtrackAdminPage() {
  const load = useServerFn(getSoundtrackAdmin)
  const q = useQuery({ queryKey: ['soundtrack-admin'], queryFn: () => load(), retry: false })
  const [picked, setPicked] = useState<string | null>(null)
  const [playlistUrl, setPlaylistUrl] = useState('')

  const data = q.data
  const runDate = picked ?? data?.upcomingDate ?? null
  const run = useMemo(() => data?.runs.find((r) => r.eventDate === runDate), [data, runDate])
  const stat = data?.summary.runs.find((r) => r.eventDate === runDate)
  const linkOk = !playlistUrl || Boolean(spotifyPlaylistId(playlistUrl))

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-10 sm:px-12">
      <div className="mx-auto max-w-[900px]">
        <Link to="/admin/roster" className="text-sm text-foreground underline">Back to admin</Link>
        <h1 className="mt-6 font-condensed text-4xl uppercase">Saturday Soundtrack</h1>
        <p className="mt-2 text-foreground/70 max-w-[640px]">
          Songs from the RSVP form, one per runner. Build the playlist on Spotify, name it after the run, make it public,
          then paste the link below to get the run report block.
        </p>

        {q.isLoading && <p className="mt-6 text-foreground/75">Loading...</p>}
        {q.error && (
          <p className="mt-6 text-foreground">
            {q.error instanceof Error ? q.error.message : 'Sign in with your admin email first.'}{' '}
            <Link to="/auth" search={{ next: '/admin/soundtrack' }} className="underline">Sign in</Link>
          </p>
        )}

        {data && (
          <>
            <section className="mt-8 grid gap-px bg-foreground/20 border border-foreground/20 sm:grid-cols-3">
              <div className="bg-background p-5">
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-foreground/80">RSVPs with a song</p>
                <p className="mt-2 text-3xl font-bold">{pct(data.summary.totals.share)}</p>
                <p className="text-sm text-foreground/75">{data.summary.totals.withSong} of {data.summary.totals.rsvps} RSVPs</p>
              </div>
              <div className="bg-background p-5">
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-foreground/80">Came back, added a song</p>
                <p className="mt-2 text-3xl font-bold">{pct(data.summary.returnWithSong.rate)}</p>
                <p className="text-sm text-foreground/75">{data.summary.returnWithSong.cameBack} of {data.summary.returnWithSong.runners} runners</p>
              </div>
              <div className="bg-background p-5">
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-foreground/80">Came back, no song</p>
                <p className="mt-2 text-3xl font-bold">{pct(data.summary.returnWithoutSong.rate)}</p>
                <p className="text-sm text-foreground/75">{data.summary.returnWithoutSong.cameBack} of {data.summary.returnWithoutSong.runners} runners</p>
              </div>
            </section>
            <p className="mt-2 text-xs text-foreground/70 max-w-[640px]">
              Came back means they RSVP'd, checked in, and checked in again within the next {RETURN_WINDOW_RUNS} Saturdays.
              Only runs whose {RETURN_WINDOW_RUNS}-week window has passed count, so the first comparison shows up about a month in.
              With small groups, read it as a hint, not proof.
            </p>

            <label htmlFor="st-run" className="mt-10 block text-[11px] font-bold tracking-[0.14em] uppercase text-foreground/75 mb-1.5">Run</label>
            <select
              id="st-run"
              value={runDate ?? ''}
              onChange={(e) => setPicked(e.target.value)}
              className="w-full max-w-[420px] text-base text-ink bg-paper px-3.5 py-3"
            >
              {data.runs.map((r) => (
                <option key={r.eventDate} value={r.eventDate}>
                  {playlistName(r.runNumber)} · {fmtDate(r.eventDate)}{r.eventDate === data.upcomingDate ? ' (collecting now)' : ''} · {r.songs.length} songs
                </option>
              ))}
            </select>

            {run && (
              <section className="mt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-condensed text-2xl uppercase">{playlistName(run.runNumber)}</h2>
                  <p className="text-sm text-foreground/75">
                    {stat ? `${stat.withSong} of ${stat.rsvps} RSVPs added a song (${pct(stat.share)})` : 'No RSVPs yet'}
                  </p>
                </div>
                {run.songs.length ? (
                  <ul className="mt-4 divide-y divide-foreground/15 border-y border-foreground/15">
                    {run.songs.map((s, i) => (
                      <li key={`${s.song}-${i}`} className="flex justify-between gap-4 py-3 text-sm">
                        <span>{s.song}</span>
                        <span className="shrink-0 text-foreground/75">
                          {s.name}{s.creditOk ? ' · credit ok' : ' · do not credit'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-foreground/75">No songs yet for this run.</p>
                )}
                <p className="mt-2 text-xs text-foreground/70">
                  First names here are for the run leads in the lot. Only "credit ok" names go in the public report.
                </p>

                {run.songs.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <CopyButton label="Copy song list" text={songListText(run.songs)} />
                    <div>
                      <label htmlFor="st-link" className="block text-[11px] font-bold tracking-[0.14em] uppercase text-foreground/75 mb-1.5">
                        Spotify playlist link
                      </label>
                      <input
                        id="st-link"
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        placeholder="https://open.spotify.com/playlist/..."
                        className="w-full text-base text-ink bg-paper px-3.5 py-3"
                      />
                      {!linkOk && <p className="mt-1 text-sm text-foreground">That isn't a Spotify playlist link.</p>}
                    </div>
                    <pre className="overflow-x-auto border border-foreground/20 bg-background/30 p-4 text-xs leading-[1.6]">
                      {reportSnippet(run.runNumber, linkOk ? playlistUrl : '', run.songs)}
                    </pre>
                    <CopyButton label="Copy for run report" text={reportSnippet(run.runNumber, linkOk ? playlistUrl : '', run.songs)} />
                    <p className="text-xs text-foreground/70">Paste into RUN_REPORT_NOTES in src/content/run-reports.ts.</p>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
