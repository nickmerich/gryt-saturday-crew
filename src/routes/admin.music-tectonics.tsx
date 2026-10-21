import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from '@tanstack/react-query'
import { listMtRsvps } from '@/lib/events/music-tectonics.functions'
import { csvCell } from '@/lib/partners'

export const Route = createFileRoute('/admin/music-tectonics')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Music Tectonics RSVPs | GRYT Run Club' }, { name: 'description', content: 'Private RSVP list for the Music Tectonics run.' }, { property: 'og:title', content: 'Music Tectonics RSVPs' }, { property: 'og:description', content: 'Private GRYT organizer page.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: Page,
})

const count = (rows: Record<string, unknown>[], k: string) => rows.reduce<Record<string, number>>((a, r) => ({ ...a, [String(r[k])]: (a[String(r[k])] || 0) + 1 }), {})

function Page() {
  const list = useServerFn(listMtRsvps)
  const q = useQuery({ queryKey: ['mt-rsvps'], queryFn: () => list(), retry: false })
  const rows = q.data || []
  function exportCsv() {
    const shared = rows.filter(r => r.share_consent)
    const head = 'full_name,email,company,role,group,badge,consent_at,consent_version'
    const csv = [head, ...shared.map(r => [r.full_name, r.email, r.company, r.role, r.group_choice, r.badge_status, r.share_consent_at, r.share_consent_version].map(v => csvCell(v ?? '')).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'music-tectonics-rsvps.csv'; a.click()
  }
  const g = count(rows, 'group_choice'), b = count(rows, 'badge_status')
  return <main className="min-h-screen bg-ink text-paper px-6 py-10 sm:px-12"><div className="mx-auto max-w-[900px]">
    <Link to="/admin/roster" className="text-sm text-blue underline">Back to admin</Link>
    <h1 className="mt-6 font-condensed text-4xl uppercase">Music Tectonics RSVPs</h1>
    {q.isLoading && <p className="mt-6 text-paper/60">Loading...</p>}
    {q.error && <p className="mt-6 text-blue">{q.error instanceof Error ? q.error.message : 'Sign in first.'} <Link to="/auth" search={{ next: '/admin/music-tectonics' }} className="underline">Sign in</Link></p>}
    {q.data && <>
      <p className="mt-4 text-paper/70">{rows.length} RSVPs</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="border border-paper/20 p-4"><h2 className="font-condensed uppercase">By group</h2><p>Run {g.run || 0} · Walk {g.walk || 0} · Not sure {g.unsure || 0}</p></div>
        <div className="border border-paper/20 p-4"><h2 className="font-condensed uppercase">By badge</h2><p>Have {b.have || 0} · Getting {b.getting || 0} · Guest {b.guest || 0}</p></div>
      </div>
      {rows.length > 0 && <button onClick={exportCsv} className="mt-4 text-sm text-blue underline">Download CSV (sharing consent only)</button>}
      <ul className="mt-6 divide-y divide-paper/15 border-y border-paper/15">
        {rows.map(r => <li key={r.email} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{r.full_name} <span className="text-paper/60 break-all">{r.email}</span></span><span className="text-paper/70">{r.group_choice} · {r.badge_status}</span></li>)}
      </ul>
    </>}
  </div></main>
}
