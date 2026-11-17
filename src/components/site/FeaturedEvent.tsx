import poster from '@/assets/events/dec-5-poster.jpg.asset.json'

// Highlighted event. Hidden automatically after the event day (America/New_York).
const EVENT_END = Date.parse('2026-12-05T23:59:59-05:00')

export function FeaturedEvent() {
  if (Date.now() > EVENT_END) return null
  return <section aria-label="Next highlighted event" className="border-y border-foreground/10 px-5 py-12 sm:px-8 md:px-12 md:py-16">
    <div className="mx-auto grid max-w-[1180px] items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-14">
      <img src={poster.url} alt="GRYT Club, UNCOMMON and Hirt Locker Monthly Meetup Run #2 poster: Common people. Uncommon GRYT. Saturday, December 5, 2026, 7:00 AM at 212 Valley Brook Road" width={1080} height={1350} className="w-full h-auto border border-foreground/15" loading="lazy" decoding="async" />
      <div>
        <p className="eyebrow text-foreground">Monthly Meetup · Run #2 · Sat Dec 5</p>
        <h2 className="mt-4 font-condensed text-4xl uppercase leading-[0.95] sm:text-6xl">50+ people. 7 AM.<br />So we're making it monthly.</h2>
        <div className="mt-5 max-w-md space-y-4 text-foreground/80 leading-relaxed">
          <p>A Saturday in November, 50+ people showed up to run with GRYT and UNCOMMON on the Montour Trail. UNCOMMON got everyone warmed up. We ran together. Hirt Locker led a Bible study after. Cat &amp; Cloud had the coffee and Laura baked for everyone. By the end, nobody was new anymore.</p>
          <p>Starting Saturday, December 5, GRYT, UNCOMMON and Hirt Locker are hosting the Monthly Meetup, and we're carrying it into 2027 with our friend Kyle Bush (@_butch.82).</p>
          <p>Our Saturday run stays the same every week. The meetup is the bigger morning where you bring someone who has never run with a club. "Come with me on the 5th" is an easy ask.</p>
          <p className="font-medium text-foreground">Saturday, December 5 · 7:00 AM<br />212 Valley Brook Road, McMurray</p>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em]">
          {['All paces', 'Walkers welcome', 'Post-run Bible study', 'Bring a friend', 'Free'].map(t => <li key={t} className="border border-foreground/25 px-3 py-1.5 text-foreground/80">{t}</li>)}
        </ul>
        <a href="https://www.facebook.com/events/1489325686455640/" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex h-12 items-center bg-blue px-6 font-condensed text-base uppercase text-ink transition-colors hover:bg-foreground hover:text-background">RSVP for Dec 5 →</a>
      </div>
    </div>
  </section>
}
