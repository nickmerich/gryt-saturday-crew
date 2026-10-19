import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Plus, Save, Trash2, Upload, Download, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { managePartners } from '@/lib/partners.functions'
import { partnerSchema, partnerStatuses, csvCell, type Partner, type PartnerInquiry } from '@/lib/partners'

export const Route = createFileRoute('/admin/partners')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Partner desk | GRYT Run Club' }, { name: 'description', content: 'Private partner approvals and inquiry inbox for GRYT organizers.' }, { property: 'og:title', content: 'Partner desk | GRYT Run Club' }, { property: 'og:description', content: 'Private GRYT organizer desk.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: PartnerDesk,
})
const blank: Partner = { name: '', slug: '', category: 'local', role: '', description: '', city: '', website_url: '', logo: '', is_affiliate: false, approved_to_show: false, featured_on_home: false, sort_order: 0 }
const field = 'mt-2 w-full min-w-0 border border-paper/25 bg-ink px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue'

async function pngFile(file: File) {
  if (!['image/png','image/svg+xml'].includes(file.type) || file.size > 2097152) throw new Error('Choose an SVG or PNG under 2 MB.')
  // Rasterize SVG locally so uploaded markup never runs on the site.
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const width = image.naturalWidth || 1000, height = image.naturalHeight || 1000
    const ratio = Math.min(1,1600 / Math.max(width,height))
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1,Math.round(width * ratio)); canvas.height = Math.max(1,Math.round(height * ratio))
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Could not prepare this logo.')
    ctx.drawImage(image,0,0,canvas.width,canvas.height)
    return canvas.toDataURL('image/png').split(',')[1] || ''
  } finally { URL.revokeObjectURL(url) }
}
function PartnerDesk() {
  const manage = useServerFn(managePartners)
  const cache = useQueryClient()
  const query = useQuery({ queryKey: ['partner-desk'], queryFn: () => manage({ data: { action: 'list' } }), retry: false })
  const [selected,setSelected] = useState<Partner | null>(null)
  const [busy,setBusy] = useState(false)
  const [message,setMessage] = useState('')
  const [error,setError] = useState('')
  const [search,setSearch] = useState('')
  const [status,setStatus] = useState('')
  const partners = (query.data?.partners || []) as Partner[]
  const inquiries = (query.data?.inquiries || []) as PartnerInquiry[]
  const visible = inquiries.filter(r => (!status || r.status === status) && [r.name,r.organization,r.email].join(' ').toLowerCase().includes(search.toLowerCase()))
  async function act(data: Parameters<typeof manage>[0]['data']) {
    setBusy(true); setError(''); setMessage('')
    try { const result = await manage({ data }); await query.refetch(); await cache.invalidateQueries({ queryKey: ['partners'] }); setMessage('Saved. No message sent.'); return result }
    catch(e) { setError(e instanceof Error ? e.message : 'Not saved.'); return null }
    finally { setBusy(false) }
  }
  async function save(e: FormEvent) {
    e.preventDefault(); if (!selected) return
    const parsed = partnerSchema.safeParse(selected)
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || 'Check the fields.'); return }
    if (selected.approved_to_show && /[\[\]]/.test(selected.description) && !window.confirm('This description still has brackets. It will be hidden publicly. Confirm the partner has approved being named before saving.')) return
    if (await act({ action: 'save', partner: parsed.data })) setSelected(null)
  }
  function exportCsv() {
    const columns: (keyof PartnerInquiry)[] = ['created_at','organization','name','email','involvement','city','message','status']
    const csv = [columns.map(csvCell).join(','),...visible.map(r => columns.map(k => csvCell(r[k])).join(','))].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href=url; a.download='gryt-partner-inquiries.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return <main className="min-h-screen bg-ink text-paper px-5 py-8 sm:px-10"><div className="mx-auto max-w-6xl">
    <header className="flex flex-wrap justify-between items-center gap-4 border-b border-paper/20 pb-6"><Link to="/" className="inline-flex items-center gap-2 text-sm text-blue"><ArrowLeft size={16}/>GRYT Run Club</Link><Link to="/partners" className="text-sm underline">View partners page</Link></header>
    <p className="eyebrow text-blue mt-8">Organizer desk</p><h1 className="font-condensed text-4xl uppercase mt-3">Partners</h1>
    {query.isPending && <p role="status" className="mt-6">Checking access...</p>}
    {query.error && <div role="alert" className="mt-6 border border-paper/25 p-6"><p>Sign in with an existing GRYT admin account to manage partners.</p><Link to="/auth" search={{ next: '/admin/partners' }} className="text-blue underline inline-block mt-4">Continue to sign in</Link></div>}
    {query.data && <>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-8 mb-5"><p className="text-paper/65">{partners.filter(p => p.approved_to_show).length} approved / {partners.length} total</p><Button onClick={() => { setSelected({...blank}); setError('') }}><Plus/>Add partner</Button></div>
      <div className="divide-y divide-paper/15 border-y border-paper/15">{partners.map(p => <article key={p.id} className="py-5 grid md:grid-cols-[1fr_1fr_auto] items-center gap-4">
        <div><h2 className="font-semibold">{p.name}</h2><p className="text-sm text-paper/60 mt-1">{p.role} · {p.category}</p></div>
        <div className="space-y-3"><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={p.approved_to_show} disabled={busy} onChange={e => {
          const approved = e.target.checked
          if (approved && /[\[\]]/.test(p.description) && !window.confirm('This description contains brackets and will be hidden. Has the partner approved being named?')) return
          void act({ action: 'save', partner: {...p, approved_to_show: approved} })
        }} className="size-4 accent-primary"/>Approved to show</label><p className="text-xs text-paper/55">Only turn on after the partner says yes to being named.</p>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={p.featured_on_home} disabled={busy} onChange={e => void act({ action: 'save', partner: {...p, featured_on_home: e.target.checked} })} className="size-4 accent-primary"/>Featured on home</label></div>
        <Button variant="outline" onClick={() => { setSelected({...p}); setError(''); setMessage('') }}>Edit</Button>
      </article>)}</div>
      {selected && <section className="mt-10 border-t border-blue pt-6"><h2 className="font-condensed uppercase text-3xl">{selected.id ? `Edit ${selected.name}` : 'Add partner'}</h2>
        <form onSubmit={save} className="mt-6 grid sm:grid-cols-2 gap-5">
          {(['name','slug','role','city','website_url'] as const).map(k => <label key={k} className="text-sm capitalize">{k.replaceAll('_',' ')}<input required={['name','slug','role'].includes(k)} value={selected[k]} onChange={e => setSelected({...selected,[k]:e.target.value})} className={field}/></label>)}
          <label className="text-sm">Category<select className={field} value={selected.category} onChange={e => setSelected({...selected, category: e.target.value as Partner['category']})}>{['national','local','public'].map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="text-sm">Sort order<input type="number" min={0} max={10000} className={field} value={selected.sort_order} onChange={e => setSelected({...selected,sort_order:Number(e.target.value)})}/></label>
          <label className="text-sm sm:col-span-2">Description<textarea rows={3} maxLength={2000} className={field} value={selected.description} onChange={e => setSelected({...selected,description:e.target.value})}/></label>
          <label className="text-sm sm:col-span-2 flex items-center gap-3"><input type="checkbox" checked={selected.is_affiliate} onChange={e => setSelected({...selected,is_affiliate:e.target.checked})} className="size-4 accent-primary"/>Affiliate link</label>
          <div className="sm:col-span-2"><label className="flex items-center gap-2 text-sm"><Upload size={18}/>Logo (SVG or transparent PNG)<input type="file" accept="image/png,image/svg+xml" disabled={busy} className="min-w-0 w-full max-w-xs" onChange={async e => {
            const file = e.target.files?.[0]; if (!file) return
            try { const png = await pngFile(file); const result = await act({ action: 'upload', png }); if (result) setSelected({...selected,logo:result.logo}) }
            catch(e) { setError(e instanceof Error ? e.message : 'Could not upload logo.') }
          }}/></label><p className="text-xs text-paper/55 mt-2">{selected.logo ? 'Logo uploaded. Save the partner to attach it.' : 'No logo attached.'}</p>{selected.logo && <Button type="button" variant="link" onClick={() => setSelected({...selected,logo:''})}>Remove logo</Button>}</div>
          <div className="flex flex-wrap gap-3 sm:col-span-2"><Button disabled={busy} type="submit"><Save/>Save partner</Button><Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button>{selected.id && <Button type="button" variant="outline" disabled={busy} onClick={async () => { if (selected.id && window.confirm(`Delete ${selected.name}?`)) { if (await act({ action: 'delete', id:selected.id })) setSelected(null) } }}><Trash2/>Delete</Button>}</div>
        </form>
      </section>}
      <section className="border-t border-paper/20 mt-12 pt-8"><div className="flex flex-wrap justify-between gap-4"><h2 className="font-condensed text-3xl uppercase">Partner inquiries</h2><Button variant="outline" disabled={!visible.length} onClick={exportCsv}><Download/>Export CSV</Button></div>
        <div className="grid sm:grid-cols-2 gap-4 mt-6"><label className="text-sm">Search<input className={field} value={search} onChange={e => setSearch(e.target.value)}/></label><label className="text-sm">Status<select className={field} value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{partnerStatuses.map(s => <option key={s}>{s}</option>)}</select></label></div>
        {!visible.length && <p className="py-8 text-paper/65">No partner inquiries.</p>}
        {visible.map(r => <article key={r.id} className="py-6 border-b border-paper/15 grid md:grid-cols-[1fr_1fr_auto] gap-5"><div><h3 className="font-semibold">{r.organization || r.name}</h3><p className="text-sm mt-2">{r.name}</p><a href={`mailto:${r.email}`} className="text-sm text-blue break-all">{r.email}</a><p className="text-xs text-paper/50 mt-2">{new Date(r.created_at).toLocaleDateString()} · {r.city}</p></div><div><p className="text-sm text-paper/65">{r.involvement}</p><p className="text-sm whitespace-pre-wrap break-words mt-2">{r.message}</p></div><label className="text-sm">Status<select className={field} disabled={busy} value={r.status} onChange={e => void act({ action:'status',id:r.id,status:e.target.value as PartnerInquiry['status'] })}>{partnerStatuses.map(s => <option key={s}>{s}</option>)}</select></label></article>)}
        {inquiries.length === 1000 && <p className="mt-3 text-sm text-paper/65">Showing the latest 1,000 inquiries. CSV exports the filtered records shown.</p>}
      </section>
    </>}
    {error && <p role="alert" className="mt-5 text-blue">{error}</p>}{message && <p role="status" className="mt-5 text-blue">{message}</p>}
  </div></main>
}