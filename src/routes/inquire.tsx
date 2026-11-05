import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { EVENT_ID, RESIDENCY_ID, budgets, categories, interests, support, kinds, type InquiryKind } from '@/lib/inquiries/schema'

export const Route = createFileRoute('/inquire')({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ type: kinds.includes(s.type as InquiryKind) ? s.type as InquiryKind : 'attendee' as InquiryKind }),
  head: () => ({ meta: [{ title: 'Run Takoma With Love 2 · Inquiries · GRYT' }, { name: 'description', content: 'Explore the proposed Run Takoma With Love 2 field day, local vendor opportunities and GRYT brand residencies.' }] }),
  component: InquiryPage,
})
const control = 'mt-2 w-full border border-current/25 bg-transparent p-3 rounded-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue'
const copy = {
  attendee: ['Stay in the loop.', 'Get event-planning updates', 'This is an interest request, not registration, a ticket, a waiver or a reserved place.'],
  vendor: ['Bring something local.', 'Send vendor inquiry', 'This is an application for review, not an approved booth. Fees, requirements and availability are not confirmed.'],
  brand: ['Build a residency.', 'Send brand inquiry', 'This starts a conversation. No package, exclusivity, activation rights or partnership is confirmed.'],
}
function InquiryPage() {
  const { type } = Route.useSearch()
  return <main className="min-h-screen bg-paper text-ink dark:bg-background dark:text-foreground">
    <header className="max-w-5xl mx-auto px-6 py-6 flex justify-between gap-4 border-b border-current/20"><a href="/" className="font-bold">GRYT / COMMUNITY EXPERIENCES</a><a href="/admin/inquiries" className="underline text-sm">Operator queue</a></header>
    <section className="max-w-5xl mx-auto p-6 md:p-12">
      <p className="eyebrow">RUN TAKOMA WITH LOVE 2 · PLANNING</p>
      <h1 className="display-condensed text-4xl md:text-6xl mt-3">A RUN. A FIELD DAY. A REASON TO SHOW UP.</h1>
      <p className="max-w-2xl mt-5 text-lg">A proposed 5K run / walk, field-day games, local vendors and a running-shoe drive. Built with Heno’s community in the DC / Takoma area.</p>
      <div className="my-6 p-4 border border-current/25 text-sm leading-relaxed">Proposed November 2026 event and November–January campaign. Date, venue, park and field permits, games, pricing, age policies, nonprofit recipient and shoe collection rules are not yet confirmed. The before-winter shoe distribution deadline is still being worked out. <strong>Weekly GRYT Saturday runs stay free, always.</strong></div>
      <nav className="flex flex-wrap gap-3 mb-8" aria-label="Inquiry type">{kinds.map(k => <a key={k} href={`/inquire?type=${k}`} aria-current={type === k ? 'page' : undefined} className={`px-5 py-3 border border-current/25 capitalize ${type === k ? 'bg-blue text-ink font-bold' : ''}`}>{k === 'attendee' ? 'Attend / get updates' : k === 'vendor' ? 'Local vendors' : 'Brand residencies'}</a>)}</nav>
      <InquiryForm key={type} kind={type} />
    </section>
  </main>
}
function InquiryForm({ kind }: { kind: InquiryKind }) {
  const [key, setKey] = useState(() => crypto.randomUUID())
  const [review, setReview] = useState<Record<string, unknown> | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const enabled = useQuery({
    queryKey: ['inquiry-intake-status'],
    queryFn: async () => {
      const r = await fetch('/api/public/inquiries')
      if (!r.ok) throw new Error('Intake unavailable')
      return r.json() as Promise<{ enabled: boolean }>
    },
    retry: false,
  })
  function prepare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setReview({ ...Object.fromEntries(data), kind, event_id: EVENT_ID, ...(kind === 'brand' ? { residency_id: RESIDENCY_ID } : {}),
      interests: data.getAll('interests'), contributions: data.getAll('contributions'),
      acknowledge: data.get('acknowledge') === 'on', marketing: data.get('marketing') === 'on' })
    setKey(crypto.randomUUID())
    setError('')
  }
  async function save() {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/public/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...review, idempotency_key: key }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Your inquiry was not saved.')
      setSaved(data.id)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save. Please retry.') }
    finally { setBusy(false) }
  }
  if (saved) return <section role="status" className="max-w-2xl border border-current/25 p-6"><h2 className="text-xl font-bold">Inquiry received.</h2><p className="mt-3">{copy[kind][2]} No confirmation email has been sent.</p><p className="mt-3 break-all text-sm">Reference: {saved}</p><a href={`/inquire?type=${kind}`} className="inline-block mt-5 underline">Start another inquiry</a></section>
  return <section className="max-w-2xl">
    <h2 className="text-xl font-bold">{copy[kind][0]}</h2>
    {kind === 'brand' && <p className="mt-3">GRYT residencies combine repeat community experiences, local operators and useful brand participation. The founding Takoma campaign has a $10,000 cash partnership goal, not secured revenue. Cash, product and services are discussed separately.</p>}
    <p className="mt-3 text-sm">{copy[kind][2]}</p>
    {!enabled.data?.enabled && <p role="status" className="mt-5 p-4 bg-blue/20">{enabled.isPending ? 'Checking inquiry availability…' : 'Online inquiries are not open yet. You can explore the options, but nothing will be saved until intake is activated.'}</p>}
    {review && <div className="mt-6 space-y-4">
      <h3 className="font-bold">Review your inquiry</h3>
      <dl className="space-y-3">{Object.entries(review).filter(([k, v]) => !['kind','event_id','residency_id','website_check','acknowledge'].includes(k) && String(v).length > 0).map(([k, v]) => <div key={k}><dt className="text-sm opacity-70 capitalize">{k.replaceAll('_', ' ')}</dt><dd className="break-words">{k === 'marketing' ? v ? 'General marketing opted in' : 'Not opted in to general marketing' : Array.isArray(v) ? v.join(', ') : String(v)}</dd></div>)}</dl>
      <p role="alert" className="text-red-600 dark:text-red-300">{error}</p>
      <div className="flex gap-3"><button disabled={busy} onClick={() => setReview(null)} className="border border-current/25 p-3">Edit details</button><button disabled={busy || !enabled.data?.enabled} onClick={save} className="bg-blue text-ink font-bold p-3 disabled:opacity-40">{busy ? 'Saving…' : error ? 'Retry save' : copy[kind][1]}</button></div>
    </div>}
    <form hidden={!!review} onSubmit={prepare} className="mt-6 space-y-5">
      <label className="block">Your name<input name="name" autoComplete="name" required maxLength={120} className={control}/></label>
      <label className="block">Email<input name="email" type="email" autoComplete="email" required maxLength={254} className={control}/></label>
      {kind !== 'attendee' && <label className="block">{kind === 'vendor' ? 'Business name' : 'Brand / organization'}<input name="organization" autoComplete="organization" required maxLength={160} className={control}/></label>}
      {kind === 'attendee' && <fieldset><legend className="font-bold mb-3">What are you interested in? (Optional)</legend>{interests.map(v => <label key={v} className="flex gap-3 py-2"><input type="checkbox" name="interests" value={v}/>{v}</label>)}</fieldset>}
      {kind === 'vendor' && <>
        <label className="block">Vendor category<select required name="category" className={control} defaultValue=""><option value="" disabled>Choose a category</option>{categories.map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="block">Website / social URL (Optional)<input name="website" type="url" maxLength={500} placeholder="https://" className={control}/></label>
        <label className="block">What would you bring?<textarea required name="contribution" maxLength={1500} className={control}/></label>
        <label className="block">Space, power or setup needs (Optional)<textarea name="setup" maxLength={1000} className={control}/></label>
      </>}
      {kind === 'brand' && <>
        <label className="block">Priority city / market (Optional)<input name="city" maxLength={160} className={control}/></label>
        <fieldset><legend className="font-bold mb-3">Potential support (Optional)</legend>{support.map(v => <label key={v} className="flex gap-3 py-2"><input type="checkbox" name="contributions" value={v}/>{v}</label>)}</fieldset>
        <label className="block">Cash budget range (Optional)<select name="budget" className={control} defaultValue=""><option value="">Prefer to discuss</option>{budgets.map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="block">What would a useful partnership accomplish?<textarea required name="objective" maxLength={1500} className={control}/></label>
      </>}
      <div hidden aria-hidden="true"><label>Leave this field blank<input name="website_check" tabIndex={-1} autoComplete="off"/></label></div>
      <label className="flex items-start gap-3"><input type="checkbox" name="acknowledge" required className="mt-1"/><span>I understand this is an inquiry, not a reservation or agreement. GRYT may contact me about this request.</span></label>
      <label className="flex items-start gap-3"><input type="checkbox" name="marketing" className="mt-1"/><span>Also send me general GRYT news and marketing. (Optional)</span></label>
      <p className="text-sm opacity-70">Please do not include medical details or information about children. An adult should make inquiries for family participation. <a href="/privacy" className="underline">Privacy policy</a>.</p>
      <button disabled={!enabled.data?.enabled} className="bg-blue text-ink font-bold px-6 py-3 disabled:opacity-40">Review details</button>
    </form>
  </section>
}
