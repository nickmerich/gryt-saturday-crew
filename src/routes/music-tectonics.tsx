import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CONSENT_TEXT, MT_EVENT as E, ROLES, buildIcs } from '@/lib/events/music-tectonics'
import { submitMtRsvp } from '@/lib/events/music-tectonics.functions'

const TITLE = 'GRYT Morning Run + Walk | Music Tectonics 2026'
const DESC = 'Run or walk the Santa Monica beach path with GRYT on Day 3 of Music Tectonics. Every pace welcome.'
const OG = 'https://grytrunclub.com/og-resources.jpg'

export const Route = createFileRoute('/music-tectonics')({
  head: () => ({ meta: [
    { title: TITLE }, { name: 'description', content: DESC },
    { property: 'og:title', content: TITLE }, { property: 'og:description', content: DESC },
    { property: 'og:type', content: 'website' }, { property: 'og:image', content: OG },
    { name: 'twitter:card', content: 'summary_large_image' }, { name: 'twitter:image', content: OG },
  ] }),
  component: Page,
})

const btn = 'inline-flex min-h-11 items-center justify-center px-5 py-3 font-condensed uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `${btn} bg-blue text-ink hover:bg-paper`
const ghost = `${btn} border border-paper/40 text-paper hover:border-blue hover:text-blue`
const field = 'mt-2 w-full min-h-11 border border-paper/30 bg-ink p-3 text-paper focus-visible:outline-2 focus-visible:outline-blue'

function downloadIcs() {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([buildIcs()], { type: 'text/calendar' }))
  a.download = 'gryt-music-tectonics.ics'; a.click()
}

function Page() {
  const [done, setDone] = useState<null | { badge: string; updated: boolean; name: string }>(null)
  return <main className="min-h-screen bg-ink text-paper">
    {(E.STATUS === 'changed' || E.STATUS === 'cancelled') && <div role="alert" className="bg-blue px-6 py-3 text-center font-bold text-ink">{E.STATUS === 'cancelled' ? 'This run is cancelled.' : 'Details changed. Check the time and meetup spot below.'}</div>}
    <section className="mx-auto max-w-3xl px-5 pt-6 pb-10">
      <div className="flex items-center gap-3"><img src="/img/gryt-bear.webp" alt="GRYT crest" className="h-10 w-auto" /><span className="eyebrow text-xs uppercase tracking-[0.14em] text-blue">GRYT x Music Tectonics</span></div>
      <h1 className="mt-4 font-condensed text-5xl uppercase leading-[0.92] sm:text-7xl">Run or walk Day 3 with us.</h1>
      <p className="mt-3 text-paper/80">An easy oceanfront morning before the conference picks back up. Every pace welcome. Nobody gets left behind.</p>
      <dl className="mt-4 grid gap-1 border-l-2 border-blue pl-3 text-sm">
        <div><dt className="sr-only">Date</dt><dd className="font-bold">{E.DATE}</dd></div>
        <div><dt className="sr-only">Meet</dt><dd>Meet {E.MEET_TIME} · {E.MEET_SPOT}</dd></div>
      </dl>
      {E.STATUS === 'proposed' && <p className="mt-2 text-xs text-paper/60">Final time and meetup spot confirmed by October 26.</p>}
      <a href="#rsvp" className={`${primary} mt-5`}>RSVP</a>
    </section>

    <section className="mx-auto max-w-3xl px-5 py-8 border-t border-paper/15">
      <h2 className="font-condensed text-3xl uppercase">The morning, at a glance</h2>
      <Timeline />
      <p className="mt-4 text-sm text-paper/70">{E.ROUTE}</p>
      <a href={E.MAP_URL} target="_blank" rel="noreferrer" className={`${ghost} mt-4`}>Open in Maps</a>
    </section>

    <section className="mx-auto max-w-3xl px-5 py-8 border-t border-paper/15">
      <h2 className="font-condensed text-3xl uppercase">Pick your group</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="border border-paper/25 p-5"><h3 className="font-condensed text-2xl uppercase">Run, led by {E.RUN_LEAD.split(' ')[0]}</h3><p className="mt-2 text-paper/75">Easy conversational pace, out and back.</p></div>
        <div className="border border-paper/25 p-5"><h3 className="font-condensed text-2xl uppercase">Walk, led by {E.WALK_LEADS.join(' and ')}</h3><p className="mt-2 text-paper/75">Same route, same views, no running required.</p></div>
      </div>
      <p className="mt-3 text-sm text-paper/70">Same route, same finish. Pick whatever feels right that morning.</p>
    </section>

    <section id="rsvp" className="mx-auto max-w-3xl px-5 py-8 border-t border-paper/15 scroll-mt-4">
      {done ? <Success {...done} /> : <RsvpForm onDone={setDone} />}
    </section>

    {!done && <section className="mx-auto max-w-3xl px-5 py-8 border-t border-paper/15"><BadgeBlock /></section>}

    <section className="mx-auto max-w-3xl px-5 py-8 border-t border-paper/15">
      <h2 className="font-condensed text-3xl uppercase">What to expect</h2>
      <dl className="mt-4 space-y-4">
        {[
          ['Do I need to be a runner?', 'No. The walk group covers the same route.'],
          ['Where do I shower?', `At your hotel. We wrap at ${E.WRAP_TIME} so there's time before the 12:45 PM start at Annenberg.`],
          ['What should I bring?', "Running shoes, water, and whatever you're wearing to meet people."],
          ['Is it free?', 'Yes. The run and walk are free.'],
        ].map(([q, a]) => <div key={q}><dt className="font-bold">{q}</dt><dd className="text-paper/75">{a}</dd></div>)}
        <div><dt className="font-bold">What is GRYT?</dt><dd className="text-paper/75">A free community run crew from Pittsburgh built around one idea: do hard things together. <Link to="/" className="text-blue underline">Meet the crew</Link>.</dd></div>
      </dl>
    </section>
  </main>
}

function Timeline() {
  const items = [
    [E.MEET_TIME, 'Meet at the pier'],
    [E.START_TIME, 'Run and walk groups head out together'],
    [E.FINISH_TIME, 'Back at the pier, quick hang'],
    [E.WRAP_TIME, `Wrap. Two hours to shower at your hotel and get to the ${E.VENUE_DEADLINE}.`],
  ]
  return <ol className="mt-4 space-y-3 border-l border-blue pl-4">{items.map(([t, l]) => <li key={t}><span className="font-condensed text-blue">{t}</span> <span>{l}</span></li>)}</ol>
}

function BadgeBlock({ lead }: { lead?: boolean }) {
  const [copied, setCopied] = useState(false)
  return <div className={lead ? 'border-2 border-blue p-5' : ''}>
    <h2 className="font-condensed text-2xl uppercase">Need a badge? Use code {E.COUPON_CODE} for {E.COUPON_VALUE}.</h2>
    {E.PRICE_LINE && <p className="mt-2 text-paper/75">{E.PRICE_LINE}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      <a href={E.BADGE_URL} target="_blank" rel="noreferrer" className={ghost}>Get a badge</a>
      <button type="button" onClick={() => { navigator.clipboard?.writeText(E.COUPON_CODE); setCopied(true) }} className={`${btn} border border-dashed border-blue text-blue`} aria-label={`Copy code ${E.COUPON_CODE}`}>{E.COUPON_CODE} · {copied ? 'Copied' : 'Tap to copy'}</button>
      <span aria-live="polite" className="sr-only">{copied ? 'Code copied' : ''}</span>
    </div>
  </div>
}

function Success({ badge, updated, name }: { badge: string; updated: boolean; name: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  const needsBadge = badge === 'getting' || badge === 'guest'
  return <div role="status" aria-live="polite" aria-atomic="true">
    <h2 ref={ref} tabIndex={-1} className="font-condensed text-4xl uppercase focus:outline-2 focus:outline-blue">You're in{name ? `, ${name.split(' ')[0]}` : ''}.</h2>
    <p className="mt-2 text-paper/80">{updated ? 'We updated your RSVP.' : 'Your RSVP is saved.'} {needsBadge && `Come run with the people building the future of music, then grab your badge with code ${E.COUPON_CODE} for ${E.COUPON_VALUE}.`}</p>
    {needsBadge && <div className="mt-5"><BadgeBlock lead /></div>}
    <dl className="mt-6 space-y-1 text-sm">
      <div><dt className="inline font-bold">When: </dt><dd className="inline">{E.DATE}, meet {E.MEET_TIME}, wrap {E.WRAP_TIME} (Pacific)</dd></div>
      <div><dt className="inline font-bold">Where: </dt><dd className="inline">{E.MEET_SPOT}</dd></div>
      <div><dt className="inline font-bold">After: </dt><dd className="inline">{E.VENUE_DEADLINE}</dd></div>
    </dl>
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" onClick={downloadIcs} className={primary}>Add to calendar</button>
      <a href={E.MAP_URL} target="_blank" rel="noreferrer" className={ghost}>Open in Maps</a>
      <Link to="/waiver" className={ghost}>Sign the GRYT waiver</Link>
    </div>
  </div>
}

function RsvpForm({ onDone }: { onDone: (d: { badge: string; updated: boolean; name: string }) => void }) {
  const submit = useServerFn(submitMtRsvp)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true); setError('')
    try {
      const r = await submit({ data: {
        full_name: String(f.get('full_name') || ''), email: String(f.get('email') || ''),
        company: String(f.get('company') || ''), role: String(f.get('role') || '') as never,
        group_choice: f.get('group') as never, badge_status: f.get('badge') as never,
        share_consent: f.get('consent') === 'on' as never, marketing: f.get('marketing') === 'on',
        website_check: String(f.get('website_check') || '') as '',
      } })
      onDone({ badge: String(f.get('badge')), updated: r.updated, name: String(f.get('full_name')) })
    } catch { setError('Your RSVP was not saved. Check the fields and try again.') }
    finally { setBusy(false) }
  }
  return <form onSubmit={onSubmit} className="space-y-5" aria-busy={busy}>
    <h2 className="font-condensed text-3xl uppercase">RSVP</h2>
    <label className="block">Full name<input name="full_name" required maxLength={120} autoComplete="name" className={field} /></label>
    <label className="block">Email<input name="email" type="email" required maxLength={255} autoComplete="email" className={field} /></label>
    <label className="block">Company or project (optional)<input name="company" maxLength={160} autoComplete="organization" className={field} /></label>
    <label className="block">Role (optional)<select name="role" defaultValue="" className={field}><option value="">Choose one</option>{ROLES.map(r => <option key={r}>{r}</option>)}</select></label>
    <fieldset><legend className="font-bold">Run or walk</legend>
      {[['run', 'Run'], ['walk', 'Walk'], ['unsure', 'Not sure yet']].map(([v, l], i) => <label key={v} className="flex min-h-11 items-center gap-3"><input type="radio" name="group" value={v} required={i === 0} />{l}</label>)}
    </fieldset>
    <fieldset><legend className="font-bold">Conference badge</legend>
      {[['have', 'I have a badge'], ['getting', "I'm getting one"], ...(E.GUESTS_ALLOWED ? [['guest', 'Guest of GRYT, no badge yet']] : [])].map(([v, l], i) => <label key={v} className="flex min-h-11 items-center gap-3"><input type="radio" name="badge" value={v} required={i === 0} />{l}</label>)}
    </fieldset>
    <div hidden aria-hidden="true"><label>Leave blank<input name="website_check" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="flex items-start gap-3"><input type="checkbox" name="consent" required className="mt-1" /><span>{CONSENT_TEXT}</span></label>
    <label className="flex items-start gap-3"><input type="checkbox" name="marketing" className="mt-1" /><span>Send me future GRYT run invites.</span></label>
    <p className="text-sm text-paper/70">Everyone runs under the GRYT waiver. <Link to="/waiver" className="text-blue underline">Sign it here</Link> if you haven't this season.</p>
    {error && <p role="alert" className="font-bold text-blue">{error}</p>}
    <button disabled={busy || E.STATUS === 'cancelled'} className={`${primary} w-full sm:w-auto disabled:opacity-50`}>{busy ? 'Saving...' : 'RSVP'}</button>
  </form>
}
