import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { isAdminEmail } from '@/lib/admin/allowlist'
import type { RosterResponse } from '@/lib/roster/types'

export const Route = createFileRoute('/admin/roster')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Admin · Roster · gryt' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: AdminRosterPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-ink text-paper p-12">
      <h1 className="display-condensed text-3xl">Roster error</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-paper">Not found.</div>,
})

const dateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

function formatStamp(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : dateFmt.format(parsed)
}

function formatDay(value: string) {
  const parsed = new Date(`${value}T12:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? value : dateFmt.format(parsed)
}

async function fetchRoster(): Promise<RosterResponse> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Sign in to continue.')
  const response = await fetch('/api/admin/roster', {
    headers: { Authorization: `Bearer ${data.session.access_token}` },
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Request failed.')
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
        The roster is private. Sign in with an admin email and we'll send a one-time link.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label htmlFor="admin-email" className="sr-only">
          Admin email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@grytrunclub.com"
          className="w-full bg-vintage border border-white/10 px-3 py-2 text-sm text-paper placeholder:text-muted-foreground focus:outline-none focus:border-blue"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-blue text-ink px-4 py-2 text-sm font-medium uppercase tracking-wider disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send magic link'}
        </button>
        {status === 'sent' && <p className="text-xs text-blue">Check your inbox.</p>}
        {status === 'error' && <p className="text-xs text-red-400">{msg}</p>}
      </form>
    </div>
  )
}

function AdminRosterPage() {
  const [access, setAccess] = useState<'loading' | 'out' | 'denied' | 'admin'>('loading')
  const [q, setQ] = useState('')
  const [waiverFilter, setWaiverFilter] = useState<'all' | 'signed' | 'missing'>('all')

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'roster'],
    queryFn: fetchRoster,
    enabled: access === 'admin',
    retry: false,
  })

  const filtered = useMemo(() => {
    const rows = data?.roster ?? []
    const query = q.trim().toLowerCase()
    return rows.filter((row) => {
      if (waiverFilter === 'signed' && !row.waiver) return false
      if (waiverFilter === 'missing' && row.waiver) return false
      if (!query) return true
      return row.name.toLowerCase().includes(query) || row.contact.toLowerCase().includes(query)
    })
  }, [data, q, waiverFilter])

  if (access === 'loading') {
    return <main className="min-h-screen bg-ink text-paper px-6 sm:px-12 py-16 text-sm text-muted-foreground">Checking access…</main>
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
      <main className="min-h-screen bg-ink text-paper px-6 sm:px-12 py-16">
        <h1 className="display-condensed text-3xl">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That account is not on the GRYT admin list. Sign in with an admin email.
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

  return (
    <main className="min-h-screen bg-ink text-paper">
      <div className="border-b border-white/10 px-6 sm:px-12 py-8">
        <p className="eyebrow eyebrow-blue">Private · admin only</p>
        <h1 className="display-condensed text-4xl sm:text-5xl mt-2">Runner Roster</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Everyone who has RSVP'd, when they signed up, and whether the 2026 waiver is on file. This page is never public
          and is excluded from search engines.
        </p>
        {data && (
          <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
            {data.totals.people} runners · {data.totals.rsvps} RSVPs · {data.totals.withWaiver} waivers on file
          </p>
        )}
      </div>

      <div className="px-6 sm:px-12 py-6 flex flex-wrap items-center gap-3 border-b border-white/10">
        <label htmlFor="roster-search" className="sr-only">
          Search runners
        </label>
        <input
          id="roster-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or contact…"
          className="bg-vintage border border-white/10 px-3 py-2 text-sm text-paper placeholder:text-muted-foreground focus:outline-none focus:border-blue min-w-[240px] flex-1"
        />
        <label htmlFor="roster-waiver" className="sr-only">
          Filter by waiver status
        </label>
        <select
          id="roster-waiver"
          value={waiverFilter}
          onChange={(e) => setWaiverFilter(e.target.value as typeof waiverFilter)}
          className="bg-vintage border border-white/10 px-3 py-2 text-sm text-paper focus:outline-none focus:border-blue"
        >
          <option value="all">All runners</option>
          <option value="signed">Waiver signed</option>
          <option value="missing">Waiver missing</option>
        </select>
      </div>

      {isLoading && <div className="px-6 sm:px-12 py-12 text-muted-foreground text-sm">Loading roster…</div>}
      {error && (
        <div className="px-6 sm:px-12 py-12 text-red-400 text-sm">
          {error instanceof Error ? error.message : "Couldn't load the roster."}
        </div>
      )}

      {data && (
        <div className="divide-y divide-white/5">
          {filtered.map((row) => (
            <div key={row.key} className="px-6 sm:px-12 py-4 flex flex-wrap items-start gap-x-6 gap-y-2">
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium">{row.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 break-all">{row.contact || 'No contact given'}</div>
              </div>
              <div className="text-xs text-muted-foreground min-w-[170px]">
                <div>First RSVP · {formatStamp(row.firstRsvp)}</div>
                <div>
                  Latest RSVP · {formatStamp(row.lastRsvp)}
                  {row.rsvpCount > 1 && <span className="ml-1 opacity-70">({row.rsvpCount} total)</span>}
                </div>
              </div>
              <div className="min-w-[150px]">
                {row.waiver ? (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-green-500/20 text-green-300">
                    Waiver · {formatDay(row.waiver.signedOn)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-amber-500/20 text-amber-200">
                    No waiver on file
                  </span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 sm:px-12 py-12 text-muted-foreground text-sm">No runners match.</div>
          )}
        </div>
      )}
    </main>
  )
}
