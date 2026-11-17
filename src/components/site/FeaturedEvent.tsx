import poster from '@/assets/events/dec-5-poster.jpg.asset.json'

// Highlighted event. Hidden automatically after the event day (America/New_York).
const EVENT_END = Date.parse('2026-12-05T23:59:59-05:00')

export function FeaturedEvent() {
  if (Date.now() > EVENT_END) return null
  return <section aria-label="Next highlighted event" className="border-y border-foreground/10 px-5 py-12 sm:px-8 md:px-12 md:py-16">
    <div className="mx-auto grid max-w-[1180px] items-center gap-8 md:grid-cols-[0.85fr_1fr] md:gap-16">
      <img src={poster.url} alt="Common people. Uncommon GRYT. Saturday, December 5, 7:00 AM, 212 Valley Brook Road." width={1080} height={1350} className="w-full h-auto border border-foreground/15" loading="lazy" decoding="async" />
      <div>
        <p className="eyebrow text-foreground">Sat Dec 5 · 7:00 AM · McMurray</p>
        <h2 className="mt-4 font-condensed text-5xl uppercase leading-[0.9] sm:text-7xl">Come with me<br />on the 5th.</h2>
        <p className="mt-6 max-w-sm text-lg leading-relaxed text-foreground/80">Last time, 50 people showed up and nobody left new. Same trail. Bring one person.</p>
        <a href="https://www.facebook.com/events/1489325686455640/" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex h-14 items-center bg-blue px-8 font-condensed text-xl uppercase text-ink transition-colors hover:bg-foreground hover:text-background">I'm coming →</a>
      </div>
    </div>
  </section>
}
