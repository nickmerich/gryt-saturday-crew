import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/checkin')({
  head: () => ({
    meta: [
      { title: 'Check in at the run · GRYT Run Club' },
      {
        name: 'description',
        content:
          'Scan-to-check-in for the GRYT Run Club Saturday run at Peterswood Park. Type your name to mark yourself here.',
      },
      { name: 'robots', content: 'noindex,nofollow' },
      { property: 'og:title', content: 'Check in at the run · GRYT Run Club' },
      {
        property: 'og:description',
        content: 'Mark yourself here at the Saturday GRYT run.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: SelfCheckin,
  errorComponent: () => (
    <Shell>
      <p className="text-sm text-muted-foreground">
        Something went wrong. Scan the code again.
      </p>
    </Shell>
  ),
  notFoundComponent: () => (
    <Shell>
      <p className="text-sm text-muted-foreground">Page not found.</p>
    </Shell>
  ),
})

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-ink text-paper px-6 py-14">
      <div className="mx-auto w-full max-w-sm">
        <p className="eyebrow eyebrow-blue">GRYT Run Club</p>
        <h1 className="display-condensed text-4xl mt-2 leading-none">CHECK IN</h1>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}

function SelfCheckin() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const [code, setCode] = useState<string | null>(null)
  const [ticket, setTicket] = useState<string | null>(null)

  // Swap the scanned code for a longer-lived ticket straight away, and keep
  // whatever the runner typed so a rescan never means retyping.
  useEffect(() => {
    const scanned = new URLSearchParams(window.location.search).get('c') ?? ''
    setCode(scanned)
    try {
      const saved = JSON.parse(localStorage.getItem('gryt-checkin-form') ?? '{}')
      if (typeof saved.name === 'string') setName(saved.name)
      if (typeof saved.contact === 'string') setContact(saved.contact)
    } catch {}
    if (!scanned) return
    fetch('/api/public/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: true, code: scanned }),
    })
      .then((r) => r.json())
      .then((b) => {
        if (typeof b.ticket === 'string') setTicket(b.ticket)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('gryt-checkin-form', JSON.stringify({ name, contact }))
    } catch {}
  }, [name, contact])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setState('sending')
    setMessage('')
    try {
      const response = await fetch('/api/public/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ticket, name, contact }),
      })
      const body = await response.json()
      if (!response.ok) {
        setState('error')
        setMessage(body.error || 'That did not save. Try again.')
        return
      }
      setState('done')
    } catch {
      setState('error')
      setMessage('No connection. Try again in a moment.')
    }
  }

  if (state === 'done') {
    return (
      <Shell>
        <div className="border border-blue/60 bg-blue/10 px-4 py-6">
          <p className="display-condensed text-3xl text-blue leading-none">YOU'RE IN</p>
          <p className="mt-3 text-sm text-paper">
            Thanks {name.split(' ')[0]}. You're counted for this morning. Go find the crew by the
            trail map board.
          </p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <p className="text-sm text-muted-foreground">
        Two quick things and you're counted for this morning.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="checkin-name" className="block text-xs uppercase tracking-[0.14em] mb-1">
            Your name
          </label>
          <input
            id="checkin-name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-vintage border border-white/15 px-3 py-4 text-base text-paper focus:outline-none focus:border-blue"
          />
        </div>
        <div>
          <label
            htmlFor="checkin-contact"
            className="block text-xs uppercase tracking-[0.14em] mb-1"
          >
            Email or phone
          </label>
          <input
            id="checkin-contact"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="you@email.com"
            className="w-full bg-vintage border border-white/15 px-3 py-4 text-base text-paper placeholder:text-muted-foreground focus:outline-none focus:border-blue"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Used to match you to your sign-up and waiver. Never shown publicly.
          </p>
        </div>
        <button
          type="submit"
          disabled={state === 'sending'}
          className="w-full bg-blue text-ink px-4 py-4 text-sm font-medium uppercase tracking-wider disabled:opacity-50"
        >
          {state === 'sending' ? 'Checking in…' : "I'm here"}
        </button>
        {state === 'error' && <p className="text-xs text-red-400">{message}</p>}
        {code === '' && (
          <p className="text-xs text-amber-200">
            Scan the code on the organiser's phone to open this page.
          </p>
        )}
      </form>
    </Shell>
  )
}
