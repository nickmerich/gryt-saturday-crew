import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { listMembersForAdmin, getMemberSyncStatus } from '@/lib/notion/members.functions'
import type { CanonicalMember, MemberSyncStatus } from '@/lib/notion/members.server'

export const Route = createFileRoute('/admin/members')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Admin · Members · gryt' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: AdminMembersPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-ink text-paper p-12">
      <h1 className="display-condensed text-3xl">Admin error</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-paper">Not found.</div>,
})

function SignInForm({ onSent }: { onSent: () => void }) {
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
    onSent()
  }

  return (
    <div className="max-w-md">
      <p className="eyebrow eyebrow-blue">Admin sign-in</p>
      <h2 className="display-condensed text-3xl mt-2">Magic link required</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with an admin-allowlisted email (Nick or Laura). We'll send a one-time link.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
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

function SyncStatusPill({ status }: { status: MemberSyncStatus | undefined }) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>
  const flags = []
  if (status.duplicate_flag) flags.push('DUP')
  if (status.review_needed) flags.push('REVIEW')
  return (
    <div className="text-xs space-y-0.5">
      <div className="text-muted-foreground">
        {status.last_strava_sync_at ? `Synced ${status.last_strava_sync_at}` : 'Never synced'}
      </div>
      <div className="text-muted-foreground">Source: {status.sync_source ?? '—'}</div>
      {flags.length > 0 && (
        <div className="text-yellow-300 font-medium">{flags.join(' · ')}</div>
      )}
    </div>
  )
}

function MemberRow({ m }: { m: CanonicalMember }) {
  const fetchSync = useServerFn(getMemberSyncStatus)
  const { data: sync } = useQuery({
    queryKey: ['admin', 'member-sync', m.id],
    queryFn: () => fetchSync({ data: { memberId: m.id } }),
    staleTime: 60_000,
  })

  const issues: string[] = []
  if (!m.email && !m.instagram_handle) issues.push('No contact')
  if (!m.strava_athlete_id) issues.push('No Strava')
  if (sync?.duplicate_flag) issues.push('Duplicate')
  if (sync?.review_needed) issues.push('Review')

  return (
    <tr className={`border-b border-white/5 ${issues.length > 0 ? 'bg-yellow-500/5' : ''}`}>
      <td className="py-3 px-3 align-top">
        <div className="font-medium">{m.full_name || '(no name)'}</div>
        <div className="text-[11px] font-mono text-muted-foreground">{m.canonical_member_key}</div>
      </td>
      <td className="py-3 px-3 align-top text-xs text-muted-foreground">
        <div>{m.email ?? <span className="italic">—</span>}</div>
        <div>{m.instagram_handle ? `@${m.instagram_handle}` : <span className="italic">—</span>}</div>
      </td>
      <td className="py-3 px-3 align-top text-xs">
        <div>{m.member_status ?? '—'}</div>
        <div className="text-muted-foreground">{m.membership_source ?? 'source unknown'}</div>
      </td>
      <td className="py-3 px-3 align-top">
        <SyncStatusPill status={sync} />
      </td>
      <td className="py-3 px-3 align-top">
        {issues.length === 0 ? (
          <span className="text-xs text-green-400">OK</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {issues.map((i) => (
              <span key={i} className="text-[10px] uppercase tracking-wider bg-yellow-500/20 text-yellow-200 px-1.5 py-0.5">
                {i}
              </span>
            ))}
          </div>
        )}
      </td>
    </tr>
  )
}

function AdminMembersPage() {
  const fetchMembers = useServerFn(listMembersForAdmin)
  const [authChecked, setAuthChecked] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSignedIn(Boolean(data.session))
      setAuthChecked(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(Boolean(session))
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'members', 'list'],
    queryFn: () => fetchMembers(),
    enabled: signedIn,
    retry: false,
  })

  const forbidden = error instanceof Error && /Forbidden/i.test(error.message)
  const unauthorized = error instanceof Error && /Unauthorized/i.test(error.message)

  if (!authChecked) {
    return <div className="min-h-screen bg-ink text-muted-foreground p-12">Checking session…</div>
  }

  if (!signedIn || unauthorized) {
    return (
      <main className="min-h-screen bg-ink text-paper p-12">
        <SignInForm onSent={() => refetch()} />
      </main>
    )
  }

  if (forbidden) {
    return (
      <main className="min-h-screen bg-ink text-paper p-12">
        <p className="eyebrow eyebrow-blue">Access denied</p>
        <h1 className="display-condensed text-3xl mt-2">Not on the admin allowlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You're signed in, but this account isn't authorized for admin tools.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 border border-white/20 px-4 py-2 text-sm uppercase tracking-wider hover:bg-white/5"
        >
          Sign out
        </button>
      </main>
    )
  }

  const flagged = (data ?? []).filter((m) => !m.email && !m.instagram_handle).length

  return (
    <main className="min-h-screen bg-ink text-paper">
      <div className="border-b border-white/10 px-6 sm:px-12 py-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow eyebrow-blue">Admin · sync status</p>
          <h1 className="display-condensed text-4xl mt-2">Member Review</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data?.length ?? '—'} members · {flagged} missing contact info
          </p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-paper"
        >
          Sign out
        </button>
      </div>

      {isLoading && <div className="p-12 text-muted-foreground">Loading from Notion…</div>}
      {error && !forbidden && !unauthorized && (
        <div className="p-12 text-red-400">{(error as Error).message}</div>
      )}

      {data && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/10">
                <th className="py-3 px-3">Member</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Sync</th>
                <th className="py-3 px-3">Flags</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => <MemberRow key={m.id} m={m} />)}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
