import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { isAdminEmail } from '@/lib/admin/allowlist'

export const Route = createFileRoute('/admin/strava/connect')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Admin · Connect Strava · gryt' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: StravaConnectPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background text-foreground p-12">
      <h1 className="display-condensed text-3xl">Strava connect error</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-12 text-foreground">Not found.</div>,
})

const SCOPE = 'read,activity:read'

type Config = {
  clientIdConfigured: boolean
  clientSecretConfigured: boolean
  refreshTokenConfigured: boolean
  clientId: string | null
  clubId: number
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Sign in to continue.')
  return { Authorization: `Bearer ${data.session.access_token}` }
}

function SignIn() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.href },
    })
    if (error) {
      setStatus('error')
      setMsg(error.message)
      return
    }
    setStatus('sent')
  }

  return (
    <div className="max-w-md px-6 sm:px-12 py-16">
      <p className="eyebrow eyebrow-blue">Admin sign-in</p>
      <h1 className="display-condensed text-3xl mt-2">Magic link required</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Connecting Strava is private. Sign in with an admin email and we'll send a one-time link.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label htmlFor="strava-email" className="sr-only">
          Admin email
        </label>
        <input
          id="strava-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@grytrunclub.com"
          className="w-full bg-background border border-foreground/10 px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-blue text-ink px-4 py-3 text-sm font-medium uppercase tracking-wider disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send magic link'}
        </button>
        {status === 'sent' && <p className="text-xs text-foreground">Check your inbox.</p>}
        {status === 'error' && <p className="text-xs text-red-400">{msg}</p>}
      </form>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="border border-foreground/15 bg-background p-4 sm:p-5">
      <div className="flex items-baseline gap-3">
        <span className="display-condensed text-foreground text-[22px] leading-none">{n}</span>
        <span className="display-condensed text-[19px] leading-none">{title}</span>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-foreground/75">{children}</div>
    </li>
  )
}

function StravaConnectPage() {
  const [email, setEmail] = useState<string | null | undefined>(undefined)
  const [config, setConfig] = useState<Config | null>(null)
  const [redirectUri, setRedirectUri] = useState('')
  const [code, setCode] = useState<string | null>(null)
  const [exchange, setExchange] = useState<
    | { state: 'idle' }
    | { state: 'working' }
    | { state: 'error'; message: string }
    | { state: 'done'; refreshToken: string; athleteName: string | null; clubName: string | null }
  >({ state: 'idle' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    setRedirectUri(`${url.origin}${url.pathname}`)
    setCode(url.searchParams.get('code'))
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setEmail(session?.user.email ?? null),
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  const allowed = isAdminEmail(email)

  useEffect(() => {
    if (!allowed) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/strava-connect', { headers: await authHeaders() })
        const body = await res.json()
        if (!cancelled && res.ok) setConfig(body)
      } catch {
        /* surfaced by the config-missing notice below */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [allowed])

  useEffect(() => {
    if (!allowed || !code || exchange.state !== 'idle') return
    let cancelled = false
    setExchange({ state: 'working' })
    ;(async () => {
      try {
        const res = await fetch('/api/admin/strava-connect', {
          method: 'POST',
          headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        const body = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setExchange({ state: 'error', message: body.error || 'That did not work.' })
          return
        }
        setExchange({
          state: 'done',
          refreshToken: body.refreshToken,
          athleteName: body.athleteName ?? null,
          clubName: body.clubName ?? null,
        })
        // Keep the one-time code out of the address bar and out of history.
        window.history.replaceState({}, '', window.location.pathname)
      } catch {
        if (!cancelled) setExchange({ state: 'error', message: 'Could not reach the server.' })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [allowed, code, exchange.state])

  if (email === undefined) {
    return <div className="min-h-screen bg-background text-foreground p-12 text-sm">Loading…</div>
  }
  if (!email) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SignIn />
      </div>
    )
  }
  if (!allowed) {
    return (
      <div className="min-h-screen bg-background text-foreground p-12">
        <h1 className="display-condensed text-3xl">Not an admin account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {email} is not on the GRYT admin list.
        </p>
      </div>
    )
  }

  const authorizeUrl =
    config?.clientId && redirectUri
      ? `https://www.strava.com/oauth/authorize?client_id=${encodeURIComponent(
          config.clientId,
        )}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri,
        )}&approval_prompt=auto&scope=${encodeURIComponent(SCOPE)}`
      : null

  return (
    <div className="min-h-screen bg-background text-foreground px-5 sm:px-12 py-12">
      <div className="max-w-[760px] mx-auto">
        <p className="eyebrow eyebrow-blue">Admin</p>
        <h1 className="display-condensed text-[clamp(30px,7vw,52px)] leading-[0.95] mt-2">
          CONNECT STRAVA
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70 max-w-[58ch]">
          One approval from a Strava account that has joined the GRYT club. After that the homepage
          shows the real member count and club mileage instead of the sample set.
        </p>

        {config?.refreshTokenConfigured && exchange.state !== 'done' ? (
          <p className="mt-6 border border-blue/60 px-4 py-3 text-[12px] tracking-[0.14em] uppercase text-foreground">
            Already connected · the homepage is reading live
          </p>
        ) : null}

        {config && (!config.clientIdConfigured || !config.clientSecretConfigured) ? (
          <p className="mt-6 border border-red-400/50 px-4 py-3 text-sm text-red-300">
            The Strava application ID and secret are not both saved yet. Tell Nick and they can be
            added before you try this.
          </p>
        ) : null}

        {exchange.state === 'done' ? (
          <div className="mt-8 border-2 border-blue bg-background p-5">
            <div className="display-condensed text-[22px]">Strava approved</div>
            <p className="mt-2 text-sm text-foreground/75">
              {exchange.athleteName ? `${exchange.athleteName}, ` : ''}
              {exchange.clubName ? `verified against ${exchange.clubName}.` : 'club access verified.'}{' '}
              Copy the key below and send it to Lovable in chat, saying it is the Strava club key.
              It gets stored securely and the homepage switches to live numbers. Do not post it
              anywhere else.
            </p>
            <textarea
              readOnly
              value={exchange.refreshToken}
              rows={2}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-4 w-full bg-background border border-blue/50 px-3 py-3 text-[13px] font-mono text-foreground break-all"
            />
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(exchange.refreshToken)
                setCopied(true)
              }}
              className="mt-3 bg-blue text-ink px-4 py-3 text-sm font-medium uppercase tracking-wider"
            >
              {copied ? 'Copied' : 'Copy the key'}
            </button>
            <p className="mt-3 text-[12px] text-foreground/70">
              This is shown once. If you lose it, run the approval again.
            </p>
          </div>
        ) : null}

        {exchange.state === 'working' ? (
          <p className="mt-8 text-sm text-foreground">Checking with Strava…</p>
        ) : null}

        {exchange.state === 'error' ? (
          <p className="mt-8 border border-red-400/50 px-4 py-3 text-sm text-red-300">
            {exchange.message}
          </p>
        ) : null}

        {exchange.state !== 'done' ? (
          <ol className="mt-8 space-y-3">
            <Step n={1} title="Check the callback address">
              In your Strava API application settings, the Authorization Callback Domain must cover
              this address:
              <code className="mt-2 block bg-background border border-foreground/15 px-3 py-2 text-[12px] font-mono break-all">
                {redirectUri || '…'}
              </code>
              Strava only wants the domain part, without https or the path.
            </Step>
            <Step n={2} title="Sign in to Strava as a club member">
              Use the account that has joined the GRYT club. A personal account that has not joined
              will be refused here, on purpose.
            </Step>
            <Step n={3} title="Approve">
              {authorizeUrl ? (
                <a
                  href={authorizeUrl}
                  className="inline-block mt-1 bg-blue text-ink px-5 py-3 text-sm font-medium uppercase tracking-wider"
                >
                  Authorize with Strava
                </a>
              ) : (
                <span className="text-foreground/70">Waiting on the Strava application ID…</span>
              )}
            </Step>
            <Step n={4} title="Send the key back">
              Strava returns you here and shows one long key. Copy it and paste it into the Lovable
              chat so it can be stored securely.
            </Step>
          </ol>
        ) : null}

        <p className="mt-10 text-[12px] leading-relaxed text-foreground/70 max-w-[62ch]">
          Attendance streaks are not part of Strava's club data and never will be. Those come from
          Saturday sign-ups and check-ins. Strava's club feed also carries no dates, so club miles
          are a running total rather than a weekly figure.
        </p>
      </div>
    </div>
  )
}
