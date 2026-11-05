import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listAllReviews, moderateReview } from '@/lib/reviews.functions'

export const Route = createFileRoute('/admin/reviews')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Runner reviews | GRYT Run Club' }, { name: 'description', content: 'Private review moderation.' }, { property: 'og:title', content: 'Runner reviews | GRYT Run Club' }, { property: 'og:description', content: 'Private GRYT organizer page.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AdminReviews,
})

function AdminReviews() {
  const list = useServerFn(listAllReviews)
  const moderate = useServerFn(moderateReview)
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin-reviews'], queryFn: () => list(), retry: false })
  async function act(id: string, action: 'approve' | 'hide' | 'delete') {
    if (action === 'delete' && !confirm('Delete this review?')) return
    await moderate({ data: { id, action } })
    qc.invalidateQueries({ queryKey: ['admin-reviews'] })
    qc.invalidateQueries({ queryKey: ['approved-reviews'] })
  }
  const btn = 'min-h-11 px-4 border text-[11px] uppercase tracking-[0.14em]'
  return <main className="min-h-screen bg-background px-6 py-10 text-foreground sm:px-12">
    <div className="mx-auto max-w-[900px]">
      <Link to="/admin/roster" className="text-sm text-foreground underline">Back to admin</Link>
      <h1 className="mt-6 font-condensed text-4xl uppercase">Runner reviews</h1>
      {q.isLoading && <p className="mt-6 text-foreground/75">Loading...</p>}
      {q.error && <p className="mt-6 text-foreground">{q.error instanceof Error ? q.error.message : 'Sign in first.'} <Link to="/auth" search={{ next: '/admin/reviews' }} className="underline">Sign in</Link></p>}
      {q.data && q.data.length === 0 && <p className="mt-6 text-foreground/75">No reviews yet.</p>}
      <ul className="mt-6 space-y-4">
        {q.data?.map(r => <li key={r.id} className="border border-foreground/15 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-bold">{r.first_name} <span className="text-foreground">{'★'.repeat(r.rating)}</span></span>
            <span className="eyebrow text-foreground/70">{r.status} · {new Date(r.created_at).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}</span>
          </div>
          {r.email && <p className="mt-1 break-all text-xs text-foreground/70">{r.email}</p>}
          <p className="mt-3 text-foreground/85">{r.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {r.status !== 'approved' && <button onClick={() => act(r.id, 'approve')} className={`${btn} border-blue text-foreground`}>Approve</button>}
            {r.status !== 'hidden' && <button onClick={() => act(r.id, 'hide')} className={`${btn} border-foreground/30`}>Hide</button>}
            <button onClick={() => act(r.id, 'delete')} className={`${btn} border-foreground/30 text-foreground/75`}>Delete</button>
          </div>
        </li>)}
      </ul>
    </div>
  </main>
}
