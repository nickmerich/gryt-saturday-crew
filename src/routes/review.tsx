import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'
import { SiteNav, SiteFooter } from '@/components/site/Chrome'
import { submitReview } from '@/lib/reviews.functions'

const TITLE = 'Leave a review | GRYT Run Club'
const DESC = 'Ran with GRYT on a Saturday? Tell us how it went. Reviews are read by the organizers before anything is shown on the site.'

export const Route = createFileRoute('/review')({
  head: () => ({
    meta: [
      { title: TITLE }, { name: 'description', content: DESC },
      { property: 'og:title', content: TITLE }, { property: 'og:description', content: DESC },
      { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: 'https://grytrunclub.com/review' }],
  }),
  component: ReviewPage,
})

function ReviewPage() {
  const send = useServerFn(submitReview)
  const [ready, setReady] = useState(false)
  const [rating, setRating] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const doneRef = useRef<HTMLDivElement>(null)
  useEffect(() => setReady(true), [])
  useEffect(() => { if (done) doneRef.current?.focus() }, [done])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    const f = new FormData(e.currentTarget)
    setError('')
    if (!rating) { setError('Pick a rating.'); return }
    setBusy(true)
    try {
      await send({ data: {
        first_name: String(f.get('first_name') ?? ''), email: String(f.get('email') ?? ''),
        rating, body: String(f.get('body') ?? ''), consent: f.get('consent') === 'on',
        website_check: String(f.get('website_check') ?? ''),
      } })
      setDone(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg.startsWith('[') ? 'Check the form and try again.' : msg || 'Not saved. Please try again.')
    } finally { setBusy(false) }
  }

  const field = 'mt-2 w-full min-h-12 border border-foreground/25 bg-transparent px-4 py-3 text-base text-foreground outline-none focus:border-blue'
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <section className="px-6 py-14 sm:px-12 md:py-20 lg:px-24">
        <div className="mx-auto max-w-[640px]">
          <p className="eyebrow text-foreground">Saturday · Montour Trail</p>
          <h1 className="display-condensed mt-3 text-[clamp(40px,10vw,76px)] leading-[0.92]">HOW WAS YOUR RUN?</h1>
          <p className="mt-4 text-base leading-relaxed text-foreground/75">Tell us how it went. We read every one. Nothing shows on the site until an organizer approves it, and only your first name is shown.</p>

          {done ? (
            <div ref={doneRef} tabIndex={-1} role="status" className="mt-10 border border-blue p-6 outline-none">
              <p className="display-condensed text-3xl">THANKS. GOT IT.</p>
              <p className="mt-3 text-foreground/75">See you Saturday at 7 AM.</p>
              <Link to="/" hash="rsvp" className="mt-6 inline-flex min-h-12 items-center bg-blue px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-ink">RSVP Saturday</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} method="post" className="mt-10" noValidate>
              <fieldset disabled={!ready || busy} className="space-y-6">
                <div role="radiogroup" aria-label="Rating">
                  <span className="eyebrow text-foreground/70">Rating</span>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} out of 5`} onClick={() => setRating(n)}
                        className={`h-12 w-12 border text-xl focus-visible:outline-2 focus-visible:outline-blue ${n <= rating ? 'border-blue text-foreground' : 'border-foreground/25 text-foreground/35'}`}>★</button>
                    ))}
                  </div>
                </div>
                <label className="block"><span className="eyebrow text-foreground/70">First name</span><input name="first_name" required maxLength={40} autoComplete="given-name" className={field} /></label>
                <label className="block"><span className="eyebrow text-foreground/70">Email (optional, never shown)</span><input name="email" type="email" maxLength={255} autoComplete="email" className={field} /></label>
                <label className="block"><span className="eyebrow text-foreground/70">Your review</span><textarea name="body" required minLength={10} maxLength={600} rows={5} className={field} /></label>
                <input name="website_check" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <label className="flex min-h-11 items-start gap-3 text-sm text-foreground/80"><input name="consent" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--blue)]" />OK to show my first name and review on the site.</label>
                {error && <p role="alert" className="text-sm text-foreground">{error}</p>}
                <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center bg-blue px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-ink hover:bg-foreground hover:text-background sm:w-auto">{busy ? 'Sending...' : 'Send review'}</button>
              </fieldset>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
