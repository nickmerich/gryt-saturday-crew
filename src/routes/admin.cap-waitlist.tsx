import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery } from '@tanstack/react-query'
import { listCapWaitlist } from '@/lib/cap-waitlist.functions'
import { csvCell } from '@/lib/partners'

export const Route = createFileRoute('/admin/cap-waitlist')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Cap waitlist | GRYT Run Club' }, { name: 'description', content: 'Private list of people waiting for the Founding Member Cap.' }, { property: 'og:title', content: 'Cap waitlist | GRYT Run Club' }, { property: 'og:description', content: 'Private GRYT organizer page.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: CapWaitlistPage,
})

function CapWaitlistPage() {
  const list = useServerFn(listCapWaitlist)
  const q = useQuery({ queryKey: ['cap-waitlist'], queryFn: () => list(), retry: false })
  const rows = q.data || []
  function exportCsv() {
    const csv = ['email,signed_up', ...rows.map(r => [r.email, r.created_at].map(csvCell).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'cap-waitlist.csv'; a.click()
  }
  return <main className="min-h-screen bg-background text-foreground px-6 py-10 sm:px-12">
    <div className="mx-auto max-w-[900px]">
      <Link to="/admin/roster" className="text-sm text-foreground underline">Back to admin</Link>
      <h1 className="mt-6 font-condensed text-4xl uppercase">Cap waitlist</h1>
      {q.isLoading && <p className="mt-6 text-foreground/75">Loading...</p>}
      {q.error && <p className="mt-6 text-foreground">{q.error instanceof Error ? q.error.message : 'Sign in with your admin email first.'} <Link to="/auth" search={{ next: '/admin/cap-waitlist' }} className="underline">Sign in</Link></p>}
      {q.data && <>
        <div className="mt-4 flex items-center gap-6"><p className="text-foreground/70">{rows.length} signed up</p>{rows.length > 0 && <button onClick={exportCsv} className="text-sm text-foreground underline">Download CSV</button>}</div>
        <ul className="mt-6 divide-y divide-foreground/15 border-y border-foreground/15">
          {rows.map(r => <li key={r.email} className="flex justify-between gap-4 py-3 text-sm"><span className="break-all">{r.email}</span><span className="shrink-0 text-foreground/70">{new Date(r.created_at).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</span></li>)}
        </ul>
      </>}
    </div>
  </main>
}
