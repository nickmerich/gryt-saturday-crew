import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { isAdminEmail } from '@/lib/admin/allowlist'
import { stages, isOverdue, type InquiryRecord, type InquiryKind } from '@/lib/inquiries/schema'

export const Route = createFileRoute('/admin/inquiries')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Operator Queue · GRYT' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: OperatorQueue,
})
const input = 'mt-1 w-full bg-transparent border border-current/25 p-3 rounded-sm'
const button = 'border border-current/25 px-4 py-3 disabled:opacity-40'
const easternTime = (value: string) => new Date(value).toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET'
async function api(path = '', init?: RequestInit) {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Sign in to continue.')
  const response = await fetch('/api/admin/inquiries' + path, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` } })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Request failed.')
  return body
}
function OperatorQueue() {
  const [access, setAccess] = useState<'loading' | 'out' | 'denied' | 'admin'>('loading')
  const [light, setLight] = useState(false)
  const [kind, setKind] = useState('all')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [owner, setOwner] = useState('')
  const [due, setDue] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<InquiryRecord | null>(null)
  const [saveError, setSaveError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const query = useQuery<{ records: InquiryRecord[]; total: number; page: number }>({
    queryKey: ['operator-inquiries', page], queryFn: () => api(`?page=${page}`), enabled: access === 'admin', retry: false,
  })
  useEffect(() => {
    let alive = true
    const update = (email?: string) => { if (alive) setAccess(!email ? 'out' : isAdminEmail(email) ? 'admin' : 'denied') }
    supabase.auth.getUser().then(({ data }) => update(data.user?.email)).catch(() => update())
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      update(session?.user.email)
      setSelected(null); dialog.current?.close()
    })
    return () => { alive = false; data.subscription.unsubscribe() }
  }, [])
  useEffect(() => { if (selected && !dialog.current?.open) dialog.current?.showModal() }, [selected])
  const records = query.data?.records || []
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const visible = records.filter(r =>
    (kind === 'all' || r.kind === kind) && (!status || r.stage === status) &&
    (!owner || (owner === '__none' ? !r.owner : r.owner === owner)) &&
    (!search || [r.payload.name, r.payload.organization, r.payload.email, r.next_action].join(' ').toLowerCase().includes(search.toLowerCase())) &&
    (!due || (due === 'overdue' ? isOverdue(r, today) : due === 'today' ? r.stage !== 'Closed' && r.due === today : !r.due))
  ).sort((a, b) => sort === 'due' ? (a.due || '9999').localeCompare(b.due || '9999') : sort === 'oldest' ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at))
  function clear() { setKind('all'); setSearch(''); setStatus(''); setOwner(''); setDue(''); setSort('newest') }
  function open(record: InquiryRecord) { setSelected(record); setSaveError(''); setMessage('') }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    const fields = Object.fromEntries(new FormData(e.currentTarget))
    setSaving(true); setSaveError(''); setMessage('')
    try {
      const updated = await api('', { method: 'PATCH', body: JSON.stringify({ ...fields, id: selected.id, version: selected.version }) })
      setSelected(updated); setMessage('Saved. No message sent.'); await query.refetch()
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'Not saved.') }
    finally { setSaving(false) }
  }
  function exportView() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exported_at: new Date().toISOString(), page: page + 1, records: visible }, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = `gryt-inquiries-page-${page + 1}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <main className={`min-h-screen p-5 md:p-10 ${light ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}>
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-wrap justify-between gap-4 border-b border-current/20 pb-6"><a href="/" className="font-bold">GRYT / FIELD DESK</a><nav className="flex flex-wrap gap-5 text-sm"><a href="/admin/members">Members</a><a href="/inquire">Inquiry pages</a><button onClick={() => setLight(!light)}>{light ? 'Dark mode' : 'Light mode'}</button></nav></header>
      <p className="eyebrow mt-8">ATTENDEES / VENDORS / BRANDS</p><h1 className="text-xl font-bold mt-2">Operator queue</h1>
      <p className="mt-2 mb-6 opacity-75">Every request gets a next step. Interest is not attendance. Budget is not revenue.</p>
      {access !== 'admin' ? <section className="border border-current/25 p-6"><h2 className="font-bold">{access === 'loading' ? 'Checking access…' : access === 'denied' ? 'Admin access required' : 'Sign in to manage inquiries'}</h2><p className="my-3">Only existing GRYT admin-allowlisted accounts can access contact details and updates.</p>{access === 'out' && <a href="/auth?next=%2Fadmin%2Finquiries" className="underline">Continue to sign in</a>}</section> : <>
        <div className="flex flex-wrap gap-3 mb-6"><button className={button} disabled={query.isFetching} onClick={() => query.refetch()}>{query.isFetching ? 'Refreshing…' : 'Refresh'}</button><button className={button} disabled={!visible.length} onClick={exportView}>Export visible records</button></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">{[
          ['Total inquiries', query.data?.total || 0], ['New on this page', records.filter(r => r.stage === 'New').length],
          ['Unassigned on this page', records.filter(r => !r.owner && r.stage !== 'Closed').length], ['Overdue on this page', records.filter(r => isOverdue(r, today)).length],
        ].map(([label, value]) => <section key={label} className="border border-current/25 p-4"><p className="text-sm opacity-70">{label}</p><strong className="block text-3xl mt-2">{value}</strong></section>)}</div>
        <nav aria-label="Inquiry type" className="flex flex-wrap gap-2 mb-5">{['all','attendee','vendor','brand'].map(k => <button key={k} className={`${button} capitalize ${kind === k ? 'bg-blue text-ink font-bold' : ''}`} aria-pressed={kind === k} onClick={() => { setKind(k); setStatus('') }}>{k === 'all' ? 'All inquiries' : k + 's'}</button>)}</nav>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
          <label>Search<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, brand or email" className={input}/></label>
          <label>Status<select value={status} onChange={e => setStatus(e.target.value)} className={input}><option value="">All statuses</option>{[...new Set(kind === 'all' ? Object.values(stages).flat() : stages[kind as InquiryKind])].map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Owner<select value={owner} onChange={e => setOwner(e.target.value)} className={input}><option value="">All owners</option><option value="__none">Unassigned</option>{[...new Set(records.map(r => r.owner).filter(Boolean))].map(o => <option key={o}>{o}</option>)}</select></label>
          <label>Follow-up<select value={due} onChange={e => setDue(e.target.value)} className={input}><option value="">Any date</option><option value="overdue">Overdue</option><option value="today">Due today</option><option value="none">No date</option></select></label>
          <label>Sort<select value={sort} onChange={e => setSort(e.target.value)} className={input}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="due">Follow-up date</option></select></label>
          <button onClick={clear} className={button}>Clear filters</button>
        </div>
        <p className="text-sm opacity-70 mb-4">Page {page + 1} · {visible.length} shown from {records.length} loaded. Filters, summary counts and exports apply to this page of up to 100 records. Dates use Eastern time.</p>
        {query.isPending && <p role="status">Loading inquiries…</p>}
        {query.error && <p role="alert" className="border border-red-400 p-4">{query.error.message}</p>}
        {!query.isPending && !query.error && !visible.length && <section className="border border-current/25 p-6"><h2 className="font-bold">{records.length ? 'No matches on this page.' : 'No inquiries yet.'}</h2><p className="mt-2">No sample records are inserted in production. Check intake activation or clear your filters.</p></section>}
        <div className="grid gap-3">{visible.map(r => <article key={r.id} className="border border-current/25 p-4 grid md:grid-cols-[2fr_1fr_1fr_2fr_auto] gap-4 items-center">
          <div className="min-w-0"><strong>{r.payload.organization || r.payload.name}</strong><p className="text-sm break-all mt-1">{r.payload.organization && `${r.payload.name} · `}{r.payload.email}</p><small className="opacity-65 capitalize">{r.kind}</small></div>
          <div><small className="opacity-65 block">Status</small>{r.stage}</div><div><small className="opacity-65 block">Owner</small>{r.owner || 'Unassigned'}</div>
          <div><small className="opacity-65 block">Next action</small><p className="break-words">{r.next_action || 'Not set'}</p><small className={isOverdue(r, today) ? 'text-red-400' : 'opacity-65'}>{r.due || 'No follow-up date'}{isOverdue(r, today) ? ' · Overdue' : ''}</small></div>
          <button className={button} onClick={() => open(r)} aria-label={`Open ${r.payload.name}`}>Open</button>
        </article>)}</div>
        <div className="flex gap-3 mt-5"><button disabled={page === 0 || query.isFetching} onClick={() => setPage(page - 1)} className={button}>Previous page</button><button disabled={!query.data || (page + 1) * 100 >= query.data.total || query.isFetching} onClick={() => setPage(page + 1)} className={button}>Next page</button></div>
      </>}
      <dialog ref={dialog} onClose={() => setSelected(null)} className={`fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90dvh] overflow-y-auto p-6 border border-current/25 backdrop:bg-black/65 ${light ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}>
        {selected && <><header className="flex justify-between gap-4"><div><p className="text-sm capitalize">{selected.kind} inquiry</p><h2 className="text-xl font-bold">{selected.payload.organization || selected.payload.name}</h2></div><button className={button} onClick={() => dialog.current?.close()}>Close</button></header>
          <p className="my-4 text-xs break-all">{selected.id} · Version {selected.version}</p>
          <h3 className="font-bold">Original inquiry (read-only)</h3>
          <dl className="grid gap-3 my-4">{Object.entries(selected.payload).filter(([k, v]) => !['website_check'].includes(k) && String(v).length > 0).map(([k, v]) => <div key={k}><dt className="text-xs opacity-65 capitalize">{k.replaceAll('_',' ')}</dt><dd className="text-sm break-words">{k === 'marketing' ? v ? 'Opted in' : 'Not opted in' : Array.isArray(v) ? v.join(', ') : String(v)}</dd></div>)}</dl>
          <form key={`${selected.id}-${selected.version}`} onSubmit={save} className="space-y-4 border-t border-current/25 pt-4">
            <h3 className="font-bold">Triage and next action</h3>
            <label className="block">Status<select name="stage" defaultValue={selected.stage} className={input}>{stages[selected.kind].map(s => <option key={s}>{s}</option>)}</select></label>
            <label className="block">Owner<input name="owner" defaultValue={selected.owner} maxLength={80} className={input}/></label>
            <label className="block">Next action<input name="next_action" defaultValue={selected.next_action} maxLength={500} className={input}/></label>
            <label className="block">Follow-up date<input name="due" type="date" defaultValue={selected.due || ''} className={input}/></label>
            <label className="block">Add internal note<textarea name="note" maxLength={2000} className={input}/></label>
            {saveError && <div role="alert" className="text-red-400"><p>{saveError}</p><button type="button" className="underline mt-2" onClick={async () => { const result = await query.refetch(); const fresh = result.data?.records.find(r => r.id === selected.id); if (fresh) open(fresh) }}>Reload inquiry (discards unsaved edits)</button></div>}
            <button className="bg-blue text-ink p-3 font-bold disabled:opacity-40" disabled={saving}>{saving ? 'Saving…' : 'Save triage'}</button><p role="status">{message}</p>
          </form>
          <section className="mt-6"><h3 className="font-bold">Internal notes</h3>{!selected.notes.length && <p className="mt-2 opacity-65">No notes yet.</p>}{[...selected.notes].reverse().map((n, i) => <div key={i} className="border-b border-current/20 py-3"><small className="break-all opacity-65">{easternTime(n.at)} · {n.actor}</small><p className="whitespace-pre-wrap break-words mt-1">{n.text}</p></div>)}</section>
          <section className="mt-6"><h3 className="font-bold">Activity history</h3>{[...selected.history].reverse().map((h, i) => <div key={i} className="border-b border-current/20 py-3"><small className="break-all opacity-65">{easternTime(h.at)} · {h.actor}</small><p>{h.action}</p>{h.changes?.map(c => <p key={c.field} className="text-sm break-words">{c.field}: {c.from || 'blank'} → {c.to || 'blank'}</p>)}</div>)}</section>
          <p className="text-xs opacity-65 mt-6">Internal triage only. No email sent, vendor booth approved, event place reserved or brand partnership signed.</p>
        </>}
      </dialog>
    </div>
  </main>
}
