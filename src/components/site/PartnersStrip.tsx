import { partnerLogo } from '@/lib/partner-logos'
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getPartners } from '@/lib/partners.functions'

// Real, approved testimonial only. Leave null until a partner or runner supplies
// a quote and agrees to be named; the block stays hidden while null.
export const HOME_TESTIMONIAL: { quote: string; name: string; org?: string } | null = null

// "Trusted by" shows every approved partner, current and past. Unapproved partners never appear.
// Homepage must never fail because of partners: any error hides the strip.
export const homePartnersQuery = queryOptions({ queryKey: ['partners','home-strip'], queryFn: () => getPartners({ data: {} }).catch(() => []), staleTime: 60000 })

type P = Parameters<typeof partnerLogo>[0] & { name: string }
function Item({ p, dup }: { p: P; dup?: boolean }) {
  const logo = partnerLogo(p)
  return <li aria-hidden={dup || undefined} className={`${dup ? 'motion-reduce:hidden ' : ''}flex shrink-0 items-center gap-4 px-6 md:px-8`}>
    {/* Perplexity's file sits its mark ~3% above center; nudge it down to optically center. */}
    {logo && <span className="flex h-16 w-16 shrink-0 md:h-20 md:w-20 items-center justify-center bg-paper p-2"><img src={logo} alt="" width={80} height={80} loading="lazy" decoding="async" className={`max-h-full max-w-full object-contain grayscale contrast-125${p.name.trim().toLowerCase() === 'perplexity' ? ' translate-y-[2.7%]' : ''}`} /></span>}
    <span className="font-condensed text-2xl md:text-4xl uppercase tracking-[0.03em] text-foreground whitespace-nowrap">{p.name}</span>
  </li>
}

export function PartnersStrip() {
  const { data } = useSuspenseQuery(homePartnersQuery)
  if (!data.length) return null
  const t = HOME_TESTIMONIAL
  return <section aria-label="Trusted by" className="relative mt-6 md:mt-10 border-y border-foreground/10 bg-background pt-12 md:pt-16">
    {t && <figure className="mx-auto max-w-[900px] px-5 pb-10 md:pb-14 text-center">
      <blockquote className="display-condensed uppercase text-3xl md:text-5xl leading-[1] text-foreground">"{t.quote}"</blockquote>
      <figcaption className="eyebrow mt-5 text-foreground">{t.name}{t.org ? ` · ${t.org}` : ''}</figcaption>
    </figure>}
    <div className="mx-auto mb-6 flex max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 md:px-12">
      <div className="flex items-center gap-3"><span className="slash" aria-hidden="true" /><h2 className="display-condensed uppercase text-2xl md:text-3xl tracking-[0.04em] text-foreground whitespace-nowrap">Trusted by</h2></div>
      <Link to="/partners" className="eyebrow text-foreground/70 transition-colors hover:text-foreground/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue">See all partners →</Link>
    </div>
    <div className="overflow-hidden border-t border-foreground/10 py-6 md:py-8 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
      <ul className="marquee-track hover:[animation-play-state:paused] motion-reduce:!w-auto motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-6 motion-reduce:[animation:none]">
        {data.map(p => <Item key={p.name} p={p as P} />)}
        {/* Second run makes the loop seamless; hidden from screen readers. */}
        {data.map(p => <Item key={`dup-${p.name}`} p={p as P} dup />)}
      </ul>
    </div>
  </section>
}
