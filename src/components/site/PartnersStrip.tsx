import { partnerLogo } from '@/lib/partner-logos'
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getPartners } from '@/lib/partners.functions'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'

// Real, approved testimonial only. Leave null until a partner or runner supplies
// a quote and agrees to be named; the block stays hidden while null.
export const HOME_TESTIMONIAL: { quote: string; name: string; org?: string } | null = null

// "Trusted by" shows every approved partner, current and past. Unapproved partners never appear.
// Homepage must never fail because of partners: any error hides the strip.
export const homePartnersQuery = queryOptions({ queryKey: ['partners','home-strip'], queryFn: () => getPartners({ data: {} }).catch(() => []), staleTime: 60000 })

type P = Parameters<typeof partnerLogo>[0] & { name: string }
function Item({ p, dup }: { p: P; dup?: boolean }) {
  const logo = partnerLogo(p)
  const [failed, setFailed] = useState(false)
  return <li aria-hidden={dup || undefined} className={`${dup ? 'motion-reduce:hidden ' : ''}flex w-60 shrink-0 flex-col items-center gap-4 border-r border-ink/15 px-6 md:w-72 md:px-8`}>
    <span className="flex h-28 w-full items-center justify-center bg-paper px-5 py-4 md:h-32">
      {logo && !failed ? <img src={logo} alt="" width={200} height={96} loading="eager" decoding="async" onError={() => setFailed(true)} className={`max-h-full max-w-full object-scale-down${p.name.trim().toLowerCase() === 'perplexity' ? ' translate-y-[2.7%]' : ''}`} /> : <span className="text-center font-condensed text-3xl font-semibold uppercase leading-tight text-ink">{p.name}</span>}
    </span>
    <span className="flex min-h-10 items-center justify-center text-center font-body text-sm font-semibold uppercase leading-snug tracking-normal text-ink">{p.name}</span>
  </li>
}

export function PartnersStrip() {
  const { data } = useSuspenseQuery(homePartnersQuery)
  if (!data.length) return null
  const t = HOME_TESTIMONIAL
  return <section aria-label="Trusted by" className="relative mt-6 border-y border-border bg-background md:mt-10">
    {t && <figure className="mx-auto max-w-[900px] px-5 pb-10 md:pb-14 text-center">
      <blockquote className="display-condensed uppercase text-3xl md:text-5xl leading-[1] text-foreground">"{t.quote}"</blockquote>
      <figcaption className="eyebrow mt-5 text-foreground">{t.name}{t.org ? ` · ${t.org}` : ''}</figcaption>
    </figure>}
    <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-7 sm:px-8 md:px-12 md:py-9">
      <span className="h-7 w-1 shrink-0 bg-blue md:h-9" aria-hidden="true" />
      <h2 className="font-condensed text-3xl font-semibold uppercase leading-none tracking-normal text-foreground md:text-4xl">Trusted by</h2>
    </div>
    <div className="overflow-hidden bg-blue py-7 [background-image:none]! md:py-9">
      <ul className="marquee-track [animation-duration:60s] hover:[animation-play-state:paused] motion-reduce:w-auto! motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-6 motion-reduce:[animation:none]">
        {data.map(p => <Item key={p.name} p={p as P} />)}
        {/* Second run makes the loop seamless; hidden from screen readers. */}
        {data.map(p => <Item key={`dup-${p.name}`} p={p as P} dup />)}
      </ul>
    </div>
    <div className="mx-auto flex max-w-[1180px] justify-end px-5 py-3 sm:px-8 md:px-12 md:py-4">
      <Link to="/partners" className="group inline-flex min-h-11 items-center gap-2 font-body text-sm font-semibold text-foreground underline decoration-blue decoration-2 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-4">See all partners <ArrowUpRight aria-hidden="true" size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" /></Link>
    </div>
  </section>
}
