import { partnerLogo } from '@/lib/partner-logos'
import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { SiteNav, SiteFooter } from '@/components/site/Chrome'
import { Button } from '@/components/ui/button'
import { getPartners, sendPartnerInquiry } from '@/lib/partners.functions'
import { orderPartners, partnerRel, partnerTypes, publicDescription, type PublicPartner } from '@/lib/partners'
import crew from '@/assets/photos/run-club-bridge.jpg.asset.json'

const partnersQuery = queryOptions({ queryKey: ['partners','all'], queryFn: () => getPartners({ data: {} }), staleTime: 60000 })
const title = 'Partners | GRYT Run Club'
const description = 'The brands, local businesses, and places that partner with GRYT Run Club to run creator-led physical events.'
export const Route = createFileRoute('/partners')({
  loader: ({ context }) => context.queryClient.ensureQueryData(partnersQuery),
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, { property: 'og:image', content: crew.url }, { name: 'twitter:image', content: crew.url }], links: [{ rel: 'canonical', href: 'https://grytrunclub.com/partners' }] }),
  component: PartnersPage,
})
const inputClass = 'mt-2 w-full min-w-0 border border-paper/25 bg-ink px-3 py-3 text-paper focus:outline-none focus:ring-2 focus:ring-blue'
function PartnerCard({ partner: p }: { partner: PublicPartner }) {
  const content = <>
    <div className="flex h-28 items-center justify-center border-b border-paper/10 px-4">
      {partnerLogo(p) ? <img src={partnerLogo(p)} alt={`${p.name} logo`} className="max-h-20 max-w-full bg-paper p-2" loading="lazy" /> : <span className="font-condensed text-2xl uppercase text-center break-words">{p.name}</span>}
    </div>
    <div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold break-words">{p.name}</h3>{p.website_url && <ArrowUpRight size={16} className="shrink-0 text-blue" aria-hidden />}</div>
      <p className="mt-1 text-sm text-paper/70">{p.role}</p>{p.city && <p className="mt-1 text-xs text-paper/50">{p.city}</p>}
      {publicDescription(p.description) && <p className="mt-3 text-sm leading-relaxed text-paper/65">{p.description}</p>}
      {p.is_affiliate && <span className="mt-3 inline-block border border-blue/40 px-2 py-1 text-xs text-blue">Affiliate</span>}
    </div>
  </>
  return p.website_url ? <a href={p.website_url} target="_blank" rel={partnerRel(p.is_affiliate)} className="min-w-0 border border-paper/15 bg-vintage transition-colors hover:border-blue focus-visible:outline focus-visible:outline-blue">{content}</a> : <article className="min-w-0 border border-paper/15 bg-vintage">{content}</article>
}
function PartnerForm() {
  const submit = useServerFn(sendPartnerInquiry)
  const [busy,setBusy] = useState(false)
  const [done,setDone] = useState(false)
  const [error,setError] = useState('')
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('')
    const fields = Object.fromEntries(new FormData(e.currentTarget))
    try { await submit({ data: fields }); setDone(true) }
    catch(e) { setError(e instanceof Error ? e.message : 'Your message was not saved.') }
    finally { setBusy(false) }
  }
  return done ? <div role="status" className="border-y border-blue/40 py-10"><Check className="text-blue mb-4" aria-hidden/><h3 className="text-xl font-semibold">Thanks. Nick will reply by email.</h3></div> : <form onSubmit={send} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <label className="text-sm">Company<input name="organization" required maxLength={200} autoComplete="organization" className={inputClass}/></label>
    <label className="text-sm">Your name<input name="name" required maxLength={120} autoComplete="name" className={inputClass}/></label>
    <label className="text-sm">Email<input name="email" type="email" required maxLength={255} autoComplete="email" className={inputClass}/></label>
    <label className="text-sm">Partner type<select name="involvement" required defaultValue="" className={inputClass}><option value="" disabled>Select a type</option>{partnerTypes.map(t => <option key={t}>{t}</option>)}</select></label>
    <label className="text-sm sm:col-span-2">City<input name="city" maxLength={160} autoComplete="address-level2" className={inputClass}/></label>
    <label className="text-sm sm:col-span-2">Message<textarea name="message" rows={4} maxLength={4000} className={inputClass}/></label>
    <div className="hidden" aria-hidden="true"><label>Leave empty<input name="website_check" tabIndex={-1} autoComplete="off"/></label></div>
    {error && <p role="alert" className="sm:col-span-2 text-blue">{error}</p>}
    <Button type="submit" disabled={busy} className="h-12 w-fit px-6 font-condensed text-base uppercase">{busy ? 'Saving...' : 'Send inquiry'}<ArrowUpRight aria-hidden/></Button>
  </form>
}
function PartnersPage() {
  const { data } = useSuspenseQuery(partnersQuery)
  return <main className="bg-ink text-paper"><SiteNav/>
    <header className="relative overflow-hidden border-b border-paper/15">
      <img src={crew.url} alt="GRYT runners on the trail bridge" className="absolute inset-0 h-full w-full object-cover"/>
      <div className="absolute inset-0 bg-ink/75"/>
      <div className="relative mx-auto max-w-[1180px] px-6 py-16 sm:px-12 md:py-24">
        <p className="eyebrow text-blue">GRYT Run Club</p><h1 className="mt-5 font-condensed text-5xl sm:text-7xl uppercase leading-none">Our partners</h1>
        <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-paper/85">GRYT runs with brands, local businesses, and places that show up for the crew. Here's who's helping us do hard things together.</p>
      </div>
    </header>
    <div className="mx-auto max-w-[1180px] px-6 sm:px-12">
      {(['national','local','public'] as const).map(category => {
        const rows = orderPartners(data.filter(p => p.category === category))
        return rows.length ? <section key={category} className="py-10 border-b border-paper/15"><h2 className="font-condensed text-3xl uppercase mb-6">{category === 'national' ? 'National brands' : category === 'local' ? 'Local partners' : 'Places we run'}</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">{rows.map(p => <PartnerCard key={p.name} partner={p}/>)}</div></section> : null
      })}
      <section className="py-8 border-b border-paper/15"><p className="font-condensed text-xl sm:text-2xl leading-relaxed">50+ events in two years. 104 members. 248 signups for our first artist-led 5K.</p><a href="https://grytrun.com" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex gap-2 items-center text-sm text-blue underline underline-offset-4">See the Run Takoma recap<ArrowUpRight size={16} aria-hidden/></a></section>
      <section id="become-a-partner" className="py-12 md:py-16 grid md:grid-cols-[0.8fr_1.2fr] gap-10 md:gap-16">
        <div><p className="eyebrow text-blue">Partner with GRYT</p><h2 className="mt-4 font-condensed text-4xl uppercase leading-tight">Want to partner with GRYT?</h2><p className="mt-5 text-paper/70 leading-relaxed">We work with brands and local businesses that want to meet real people in person. Hydration, fuel, gear, coffee, venues, and presenting partners for creator-led events from 50 to 1,000 people.</p></div>
        <div><PartnerForm/><p className="mt-6 text-sm text-paper/65">Or email <a href="mailto:nick@gryt.club" className="text-blue underline underline-offset-4">nick@gryt.club</a>.</p></div>
      </section>
      {data.some(p => p.is_affiliate) && <p className="pb-8 text-xs text-paper/60">Some links on this page are affiliate links. GRYT may earn a commission at no cost to you.</p>}
    </div><SiteFooter/>
  </main>
}