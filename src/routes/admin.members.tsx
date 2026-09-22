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

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={async () => {
          const { lovable } = await import('@/integrations/lovable/index')
          const result = await lovable.auth.signInWithOAuth('google', {
            redirect_uri: window.location.origin,
          })
          if (result.error) {
            setStatus('error')
            setMsg(result.error.message ?? 'Google sign-in failed')
          }
        }}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
      <button
        type="button"
        onClick={async () => {
          const { lovable } = await import('@/integrations/lovable/index')
          const result = await lovable.auth.signInWithOAuth('apple', {
            redirect_uri: window.location.origin,
          })
          if (result.error) {
            setStatus('error')
            setMsg(result.error.message ?? 'Apple sign-in failed')
          }
        }}
        className="mt-2 w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        Continue with Apple
      </button>
    </div>


  )
}

function SyncStatusPill({ status }: { status: MemberSyncStatus | undefined }) {
  if (!status) return <span className="text-xs text-muted-foreground">N/A</span>
  const flags = []
  if (status.duplicate_flag) flags.push('DUP')
  if (status.review_needed) flags.push('REVIEW')
  return (
    <div className="text-xs space-y-0.5">
      <div className="text-muted-foreground">
        {status.last_strava_sync_at ? `Synced ${status.last_strava_sync_at}` : 'Never synced'}
      </div>
      <div className="text-muted-foreground">Source: {status.sync_source ?? 'N/A'}</div>
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
        <div>{m.email ?? <span className="italic">N/A</span>}</div>
        <div>{m.instagram_handle ? `@${m.instagram_handle}` : <span className="italic">N/A</span>}</div>
      </td>
      <td className="py-3 px-3 align-top text-xs">
        <div>{m.member_status ?? 'N/A'}</div>
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
          <div className="mt-3 flex flex-wrap gap-4">
            <a href="/admin/inquiries" className="text-sm text-blue underline">Open operator inquiry queue</a>
            <a href="/admin/roster" className="text-sm text-blue underline">Open runner roster (RSVPs + waivers)</a>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {data?.length ?? 'N/A'} members · {flagged} missing contact info
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
