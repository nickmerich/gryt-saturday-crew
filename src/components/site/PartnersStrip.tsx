import { useSuspenseQuery, queryOptions } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getPartners } from '@/lib/partners.functions'
export const homePartnersQuery = queryOptions({ queryKey: ['partners','home'], queryFn: () => getPartners({ data: { home: true } }), staleTime: 60000 })
export function PartnersStrip() {
  const { data } = useSuspenseQuery(homePartnersQuery)
  if (!data.length) return null
  return <section aria-label="Partners" className="border-y border-paper/15 bg-vintage px-6 py-7 sm:px-12">
    <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-8 gap-y-5">
      <p className="eyebrow text-paper/55">Partners</p>
      {data.map(p => <span key={p.name} className="font-condensed text-xl uppercase">{p.logo ? <img src={p.logo} alt={`${p.name} logo`} className="h-12 w-28" /> : p.name}</span>)}
      <Link to="/partners" className="text-sm text-blue underline underline-offset-4 focus-visible:outline focus-visible:outline-blue">See all partners</Link>
    </div>
  </section>
}