import poster from '@/assets/events/nov-7-poster.jpg.asset.json'

// Highlighted event. Hidden automatically after the event day (America/New_York).
const EVENT_END = Date.parse('2026-11-07T23:59:59-05:00')

export function FeaturedEvent() {
  if (Date.now() > EVENT_END) return null
  return <section aria-label="Next highlighted event" className="border-y border-paper/10 px-5 py-12 sm:px-8 md:px-12 md:py-16">
    <div className="mx-auto grid max-w-[1180px] items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-14">
      <img src={poster.url} alt="GRYT Run Club and UNCOMMON Training poster: Common people. Uncommon GRYT. Saturday, November 7, 2026, 7:00 AM at 212 Valley Brook Road" className="w-full border border-paper/15" loading="lazy" />
      <div>
        <p className="eyebrow text-blue">Highlighted run · Sat Nov 7</p>
        <h2 className="mt-4 font-condensed text-4xl uppercase leading-[0.95] sm:text-6xl">Common people.<br />Uncommon GRYT.</h2>
        <p className="mt-5 max-w-md text-paper/80 leading-relaxed">Saturday, November 7 at 7:00 AM. 212 Valley Brook Road, McMurray. A coach-led warm-up with UNCOMMON Training, then a flat 4-mile out-and-back. Turn around whenever you want. Free, like every Saturday.</p>
        <ul className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em]">
          {['Coach-led warm-up', '4 mi flat', 'Strength-program info', 'Free'].map(t => <li key={t} className="border border-paper/25 px-3 py-1.5 text-paper/80">{t}</li>)}
        </ul>
        <a href="#rsvp" className="mt-8 inline-flex h-12 items-center bg-blue px-6 font-condensed text-base uppercase text-ink transition-colors hover:bg-paper">RSVP for Nov 7 →</a>
      </div>
    </div>
  </section>
}
