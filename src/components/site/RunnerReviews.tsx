import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { listApprovedReviews } from '@/lib/reviews.functions'

export function RunnerReviews() {
  const q = useQuery({ queryKey: ['approved-reviews'], queryFn: () => listApprovedReviews(), staleTime: 5 * 60_000 })
  const reviews = q.data ?? []
  if (reviews.length === 0) return null
  return (
    <section aria-labelledby="runner-reviews-title" className="bg-ink text-paper border-t border-paper/10 px-6 py-12 sm:px-12 md:py-16 lg:px-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow text-blue">From Saturday</p>
            <h2 id="runner-reviews-title" className="display-condensed mt-2 text-[clamp(32px,7vw,56px)] leading-[0.95]">WHAT RUNNERS SAY</h2>
          </div>
          <Link to="/review" className="inline-flex min-h-11 items-center text-sm text-blue underline underline-offset-4 hover:text-paper">Leave a review</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map(r => (
            <figure key={r.id} className="flex flex-col gap-4 border border-paper/15 bg-paper/[0.03] p-6">
              <span aria-label={`${r.rating} out of 5`} className="tracking-[0.14em] text-blue">{'★'.repeat(r.rating)}<span className="text-paper/25">{'★'.repeat(5 - r.rating)}</span></span>
              <blockquote className="text-[15px] leading-[1.65] text-paper/85">"{r.body}"</blockquote>
              <figcaption className="mt-auto border-t border-paper/10 pt-3 eyebrow text-paper/60">{r.first_name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
