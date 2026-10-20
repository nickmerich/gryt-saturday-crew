import { partnerLogo } from '@/lib/partner-logos'
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getPartners } from '@/lib/partners.functions'
// "Trusted by" shows every approved partner, current and past. Unapproved partners never appear.
// Homepage must never fail because of partners: any error hides the strip.
export const homePartnersQuery = queryOptions({ queryKey: ['partners','home-strip'], queryFn: () => getPartners({ data: {} }).catch(() => []), staleTime: 60000 })
export function PartnersStrip() {
  const { data } = useSuspenseQuery(homePartnersQuery)
  if (!data.length) return null
  return <section aria-label="Trusted by" className="relative border-y border-paper/10 bg-vintage mt-6 md:mt-10 px-5 pt-12 pb-10 sm:px-8 md:px-12 md:pt-16 md:pb-12">
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="slash" aria-hidden="true" />
          <h2 className="display-condensed uppercase text-2xl md:text-3xl tracking-[0.04em] text-paper">Trusted by</h2>
        </div>
        <Link to="/partners" className="eyebrow text-paper/60 transition-colors hover:text-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue">See all partners →</Link>
      </div>
      <ul className="grid grid-cols-2 gap-px border border-paper/10 bg-paper/10 sm:grid-cols-3 lg:grid-cols-6">
        {data.map(p => <li key={p.name} className="flex h-24 items-center justify-center bg-vintage px-4 transition-colors hover:bg-ink">
          {partnerLogo(p)
            ? <img src={partnerLogo(p)} alt={`${p.name} logo`} className="max-h-12 w-auto max-w-[120px] [object-fit:contain] opacity-80 transition-opacity hover:opacity-100" />
            : <span className="font-condensed text-lg uppercase tracking-[0.04em] text-paper/80 text-center leading-tight">{p.name}</span>}
        </li>)}
      </ul>
    </div>
  </section>
}
