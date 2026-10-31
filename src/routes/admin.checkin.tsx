import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { isAdminEmail } from '@/lib/admin/allowlist'
import type { CheckinResponse } from '@/lib/checkin/types'
import { CheckinQr } from '@/components/site/CheckinQr'

export const Route = createFileRoute('/admin/checkin')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Admin · Saturday check-in · gryt' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: CheckinPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-ink text-paper p-12">
      <h1 className="display-condensed text-3xl">Check-in error</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-paper">Not found.</div>,
})

const dayFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  weekday: 'long',
  month: 'short',
  day: 'numeric',
})

const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: 'numeric',
  minute: '2-digit',
})

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Sign in to continue.')
  return { Authorization: `Bearer ${data.session.access_token}` }
}

async function fetchCheckin(): Promise<CheckinResponse> {
  const response = await fetch('/api/admin/checkin', { headers: await authHeaders() })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Request failed.')
  return body
}

async function postCheckin(payload: Record<string, unknown>) {
  const response = await fetch('/api/admin/checkin', {
    method: 'POST',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'That change did not save.')
  return body
}

function SignIn() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.href },
    })
    if (error) {
      setStatus('error')
      setMsg(error.message)
      return
    }
    setStatus('sent')
  }

  return (
    <div className="max-w-md px-6 sm:px-12 py-16">
      <p className="eyebrow eyebrow-blue">Admin sign-in</p>
      <h1 className="display-condensed text-3xl mt-2">Magic link required</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saturday check-in is private. Sign in with an admin email and we'll send a one-time link.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label htmlFor="checkin-email" className="sr-only">
          Admin email
        </label>
        <input
          id="checkin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@grytrunclub.com"
          className="w-full bg-vintage border border-white/10 px-3 py-3 text-base text-paper placeholder:text-muted-foreground focus:outline-none focus:border-blue"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-blue text-ink px-4 py-3 text-sm font-medium uppercase tracking-wider disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send magic link'}
        </button>
        {status === 'sent' && <p className="text-xs text-blue">Check your inbox.</p>}
        {status === 'error' && <p className="text-xs text-red-400">{msg}</p>}
      </form>
    </div>
  )
}

function Count({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="border border-white/15 bg-vintage px-3 py-3 text-center">
      <div className="display-condensed text-[34px] leading-none text-blue">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    </div>
  )
}

function CheckinPage() {
  const [access, setAccess] = useState<'loading' | 'out' | 'denied' | 'admin'>('loading')
  const [q, setQ] = useState('')
  const [onlyMissing, setOnlyMissing] = useState(false)
  const [walkInName, setWalkInName] = useState('')
  const [walkInContact, setWalkInContact] = useState('')
  const queryClient = useQueryClient()

  useEffect(() => {
    let alive = true
    const update = (email?: string | null) => {
      if (alive) setAccess(!email ? 'out' : isAdminEmail(email) ? 'admin' : 'denied')
    }
    supabase.auth
      .getUser()
      .then(({ data }) => update(data.user?.email))
      .catch(() => update())
    const { data } = supabase.auth.onAuthStateChange((_event, session) => update(session?.user.email))
    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [])

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['admin', 'checkin'],
    queryFn: fetchCheckin,
    enabled: access === 'admin',
    retry: false,
    refetchInterval: 30_000,
  })

  const mutation = useMutation({
    mutationFn: postCheckin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'checkin'] }),
  })

  const filtered = useMemo(() => {
    const rows = data?.people ?? []
    const query = q.trim().toLowerCase()
    return rows.filter((row) => {
      if (onlyMissing && row.checkedIn) return false
      if (!query) return true
      return row.name.toLowerCase().includes(query) || row.contact.toLowerCase().includes(query)
    })
  }, [data, q, onlyMissing])

  if (access === 'loading') {
    return (
      <main className="min-h-screen bg-ink text-paper px-6 py-16 text-sm text-muted-foreground">
        Checking access…
      </main>
    )
  }
  if (access === 'out') {
    return (
      <main className="min-h-screen bg-ink text-paper">
        <SignIn />
      </main>
    )
  }
  if (access === 'denied') {
    return (
      <main className="min-h-screen bg-ink text-paper px-6 py-16">
        <h1 className="display-condensed text-3xl">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That account is not on the GRYT admin list.
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-6 border border-white/20 px-4 py-2 text-sm uppercase tracking-wider"
        >
          Sign out
        </button>
      </main>
    )
  }

  const event = data?.event

  return (
    <main className="min-h-screen bg-ink text-paper pb-24">
      <div className="border-b border-white/10 px-5 sm:px-12 py-6">
        <p className="eyebrow eyebrow-blue">Private · admin only</p>
        <h1 className="display-condensed text-3xl sm:text-4xl mt-2">Saturday check-in</h1>
        {event && (
          <p className="mt-2 text-sm text-muted-foreground">
            Run #{event.runNumber} · {dayFmt.format(new Date(`${event.localDate}T12:00:00Z`))} ·{' '}
            {timeFmt.format(new Date(event.startUtc))}
            {event.status !== 'scheduled' ? ` · ${event.status}` : ''}
          </p>
        )}
        <Link to="/admin/roster" className="mt-3 inline-block text-xs uppercase tracking-wider text-blue">
          Full roster
        </Link>
      </div>

      <CheckinQr />

      {data && (
        <div className="px-5 sm:px-12 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-white/10">
          <Count value={data.totals.present} label="Here now" />
          <Count value={data.totals.notYetIn} label="Not in yet" />
          <Count value={data.totals.walkIns} label="Walk-ins" />
          <Count value={data.totals.missingWaiver} label="No waiver" />
        </div>
      )}

      <div className="px-5 sm:px-12 py-4 flex flex-wrap items-center gap-3 border-b border-white/10">
        <label htmlFor="checkin-search" className="sr-only">
          Search runners
        </label>
        <input
          id="checkin-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or contact…"
          className="bg-vintage border border-white/10 px-3 py-3 text-base text-paper placeholder:text-muted-foreground focus:outline-none focus:border-blue min-w-[200px] flex-1"
        />
        <button
          type="button"
          onClick={() => setOnlyMissing((v) => !v)}
          className={`px-3 py-3 text-xs uppercase tracking-wider border ${
            onlyMissing ? 'bg-blue text-ink border-blue' : 'border-white/20 text-paper'
          }`}
        >
          Not in yet
        </button>
        {isFetching && <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Syncing…</span>}
      </div>

      {isLoading && <div className="px-5 sm:px-12 py-10 text-sm text-muted-foreground">Loading the list…</div>}
      {error && (
        <div className="px-5 sm:px-12 py-10 text-sm text-red-400">
          {error instanceof Error ? error.message : "Couldn't load the check-in list."}
        </div>
      )}
      {mutation.isError && (
        <div className="px-5 sm:px-12 py-3 text-sm text-red-400">
          {(mutation.error as Error).message} Nothing was saved — tap again.
        </div>
      )}

      {data && (
        <div className="divide-y divide-white/5">
          {filtered.map((row) => (
            <div key={row.key} className="px-5 sm:px-12 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{row.name}</span>
                  {row.firstTimer && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-blue text-ink">
                      First run
                    </span>
                  )}
                  {row.source === 'walk-in' && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-white/10">
                      Walk-in
                    </span>
                  )}
                  {row.source === 'self' && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-white/10">
                      Scanned in
                    </span>
                  )}
                  {row.streakCurrent > 1 && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider border border-blue/50 text-blue">
                      {row.streakCurrent} in a row
                    </span>
                  )}
                  {!row.waiverSignedOn && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-200">
                      No waiver
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 break-all">
                  {row.contact || 'No contact given'}
                  {row.partySize > 1 ? ` · bringing ${row.partySize}` : ''}
                </div>
              </div>
              {row.checkedIn ? (
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ action: 'undo', personKey: row.key })}
                  className="shrink-0 border border-green-400/50 bg-green-500/15 text-green-300 px-3 py-3 text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  Here · undo
                </button>
              ) : (
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      action: 'check-in',
                      personKey: row.key,
                      name: row.name,
                      contact: row.contact,
                    })
                  }
                  className="shrink-0 bg-blue text-ink px-4 py-3 text-xs font-medium uppercase tracking-wider disabled:opacity-50"
                >
                  Check in
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 sm:px-12 py-10 text-sm text-muted-foreground">Nobody matches.</div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!walkInName.trim()) return
          mutation.mutate(
            { action: 'walk-in', name: walkInName, contact: walkInContact },
            {
              onSuccess: () => {
                setWalkInName('')
                setWalkInContact('')
              },
            },
          )
        }}
        className="mt-8 border-t border-white/10 px-5 sm:px-12 py-6"
      >
        <p className="eyebrow eyebrow-blue">Someone showed up unannounced</p>
        <h2 className="display-condensed text-2xl mt-1">Add a walk-in</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <label htmlFor="walkin-name" className="sr-only">
            Walk-in name
          </label>
          <input
            id="walkin-name"
            value={walkInName}
            onChange={(e) => setWalkInName(e.target.value)}
            placeholder="Name"
            className="bg-vintage border border-white/10 px-3 py-3 text-base text-paper placeholder:text-muted-foreground focus:outline-none focus:border-blue min-w-[160px] flex-1"
          />
          <label htmlFor="walkin-contact" className="sr-only">
            Walk-in email or phone
          </label>
          <input
            id="walkin-contact"
            value={walkInContact}
            onChange={(e) => setWalkInContact(e.target.value)}
            placeholder="Email or phone (optional)"
            className="bg-vintage border border-white/10 px-3 py-3 text-base text-paper placeholder:text-muted-foreground focus:outline-none focus:border-blue min-w-[160px] flex-1"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !walkInName.trim()}
            className="bg-blue text-ink px-5 py-3 text-xs font-medium uppercase tracking-wider disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Walk-ins count as here. They still need to sign the waiver before they run.
        </p>
      </form>

      <SoundtrackPanel />
    </main>
  )
}

type SoundtrackResponse = {
  runNumber: number
  localDate: string
  available: boolean
  songs: Array<{ song: string; creditedTo: string | null }>
}

async function fetchSoundtrack(): Promise<SoundtrackResponse> {
  const response = await fetch('/api/admin/soundtrack', { headers: await authHeaders() })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Request failed.')
  return body
}

/** This week's RSVP songs, ready to paste into the Spotify search bar. */
function SoundtrackPanel() {
  const [copied, setCopied] = useState(false)
  const { data, error, isLoading } = useQuery({
    queryKey: ['admin', 'soundtrack'],
    queryFn: fetchSoundtrack,
    retry: false,
    refetchInterval: 60_000,
  })
  const songs = data?.songs ?? []

  async function copyAll() {
    const text = songs.map((s) => (s.creditedTo ? `${s.song} (${s.creditedTo})` : s.song)).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section aria-labelledby="soundtrack-h" className="border-t border-white/10 px-5 sm:px-12 py-6">
      <p className="eyebrow eyebrow-blue">From this week's RSVPs</p>
      <h2 id="soundtrack-h" className="display-condensed text-2xl mt-1">
        Saturday Soundtrack{data ? ` · Run #${data.runNumber}` : ''}
      </h2>
      {isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading songs…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-300">{error instanceof Error ? error.message : 'Could not load songs.'}</p>
      ) : data && !data.available ? (
        <p className="mt-3 text-sm text-muted-foreground">
          The song columns aren't in the database yet. Apply migration 0014_rsvp_song, then songs will show here.
        </p>
      ) : songs.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No songs yet this week.</p>
      ) : (
        <>
          <ol className="mt-3 space-y-1.5 list-decimal pl-5 text-sm">
            {songs.map((s) => (
              <li key={s.song}>
                {s.song}
                {s.creditedTo ? <span className="text-muted-foreground"> · {s.creditedTo}</span> : null}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={copyAll}
            className="mt-4 border border-white/20 px-4 py-2 text-xs uppercase tracking-wider hover:border-blue"
          >
            {copied ? 'Copied' : 'Copy list'}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Names show only for runners who ticked the credit box. Add the playlist link and these songs to
            src/content/run-reports.ts after the run.
          </p>
        </>
      )}
    </section>
  )
}
