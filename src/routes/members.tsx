import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { listMembers } from '@/lib/notion/members.functions'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/members')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/members' })
  },
  head: () => ({
    meta: [
      { title: 'Members · gryt run club' },
      { name: 'description', content: 'The people who show up. The canonical GRYT member directory.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: MembersPage,
  errorComponent: () => (
    <div className="min-h-screen bg-background text-foreground p-12">
      <h1 className="display-condensed text-3xl">Members didn't load</h1>
      <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again later.</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-foreground">Not found.</div>,
})

const STATUS_COLORS: Record<string, string> = {
  Prospect: 'bg-foreground/10 text-foreground',
  'First-Timer': 'bg-blue text-ink',
  Regular: 'bg-green-500/20 text-green-300',
  Bringer: 'bg-purple-500/20 text-purple-300',
  Anchor: 'bg-orange-500/20 text-orange-300',
  Drifter: 'bg-yellow-500/20 text-yellow-300',
  Paused: 'bg-amber-900/30 text-amber-200',
  Archived: 'bg-foreground/5 text-muted-foreground',
}

function StatusBadge({ status }: { status: string | null }) {
  const label = status ?? 'Unknown'
  const cls = STATUS_COLORS[label] ?? 'bg-foreground/10 text-foreground'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  )
}

function Avatar({ photo, name }: { photo: string | null; name: string }) {
  const initials = name.split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('') || '?'
  if (photo) {
    return <img src={photo} alt={name} className="w-10 h-10 object-cover bg-background" />
  }
  return (
    <div className="w-10 h-10 bg-background border border-foreground/10 flex items-center justify-center text-foreground text-xs font-medium">
      {initials}
    </div>
  )
}

function MembersPage() {
  const fetchMembers = useServerFn(listMembers)
  const { data, isLoading, error } = useQuery({
    queryKey: ['members', 'list'],
    queryFn: () => fetchMembers(),
  })

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<string>('All')

  const filtered = useMemo(() => {
    if (!data) return []
    const query = q.trim().toLowerCase()
    return data.filter((m) => {
      if (status !== 'All' && (m.member_status ?? 'Unknown') !== status) return false
      if (!query) return true
      return (
        m.full_name.toLowerCase().includes(query) ||
        (m.email ?? '').toLowerCase().includes(query) ||
        (m.instagram_handle ?? '').toLowerCase().includes(query) ||
        (m.strava_username ?? '').toLowerCase().includes(query)
      )
    })
  }, [data, q, status])

  const statuses = useMemo(() => {
    const s = new Set<string>()
    data?.forEach((m) => s.add(m.member_status ?? 'Unknown'))
    return ['All', ...Array.from(s)]
  }, [data])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-foreground/10 px-6 sm:px-12 py-8">
        <p className="eyebrow eyebrow-blue">Canonical roster</p>
        <h1 className="display-condensed text-4xl sm:text-5xl mt-2">GRYT Members</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Source of truth: Notion. {data?.length ?? '—'} people on the list.
        </p>
      </div>

      <div className="px-6 sm:px-12 py-6 flex flex-wrap items-center gap-3 border-b border-foreground/10">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, IG, Strava…"
          className="bg-background border border-foreground/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue min-w-[260px] flex-1"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-background border border-foreground/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue"
        >
          {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      {isLoading && <div className="px-6 sm:px-12 py-12 text-muted-foreground">Loading from Notion…</div>}
      {error && <div className="px-6 sm:px-12 py-12 text-red-400">Couldn't load members. Please try again later.</div>}

      {data && (
        <div className="divide-y divide-foreground/5">
          {filtered.map((m) => (
            <Link
              key={m.id}
              to="/members/$key"
              params={{ key: m.canonical_member_key }}
              className="flex items-center gap-4 px-6 sm:px-12 py-4 hover:bg-background transition-colors"
            >
              <Avatar photo={m.profile_photo} name={m.full_name || '?'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium truncate">{m.full_name || '(no name)'}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{m.canonical_member_key}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                  {m.email && <span>{m.email}</span>}
                  {m.instagram_handle && <span>@{m.instagram_handle}</span>}
                  {m.strava_username && <span>Strava: {m.strava_username}</span>}
                  {!m.email && !m.instagram_handle && !m.strava_username && <span>No contact info</span>}
                </div>
              </div>
              <div className="hidden sm:block text-right text-xs text-muted-foreground min-w-[120px]">
                {m.last_run_date ? <>Last run · {m.last_run_date}</> : <span className="opacity-60">No runs yet</span>}
              </div>
              <StatusBadge status={m.member_status} />
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 sm:px-12 py-12 text-muted-foreground text-sm">No members match.</div>
          )}
        </div>
      )}
    </main>
  )
}
