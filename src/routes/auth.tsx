import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/auth')({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === 'string' ? s.next : '',
  }),
  head: () => ({
    meta: [
      { title: 'Sign in · gryt' },
      { name: 'description', content: 'Sign in to GRYT Run Club.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: AuthPage,
})

// Only allow same-origin relative paths as post-auth destinations.
function safeNext(next: string): string {
  if (!next) return '/'
  if (!next.startsWith('/') || next.startsWith('//')) return '/'
  return next
}

function AuthPage() {
  const { next } = Route.useSearch()
  const target = safeNext(next)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  // If already signed in, jump straight to the intended destination.
  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      if (data.user) window.location.replace(target)
    })
    return () => {
      cancelled = true
    }
  }, [target])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setMsg('')
    const redirect = `${window.location.origin}${target}`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirect },
    })
    if (error) {
      setStatus('error')
      setMsg(error.message)
      return
    }
    setStatus('sent')
  }

  async function google() {
    const { lovable } = await import('@/integrations/lovable/index')
    // OAuth broker requires a public same-origin URL; land back on /auth,
    // which then forwards to `target` once the session is present.
    const cb = `${window.location.origin}/auth?next=${encodeURIComponent(target)}`
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: cb,
    })
    if (result.error) {
      setStatus('error')
      setMsg(result.error.message ?? 'Google sign-in failed')
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="eyebrow eyebrow-blue">Sign in</p>
        <h1 className="display-condensed text-4xl mt-2">GRYT MEMBER SIGN-IN</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to connect your account and access member-only tools.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-blue text-ink px-4 py-2 text-sm font-medium uppercase tracking-wider disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send magic link'}
          </button>
          {status === 'sent' && <p className="text-xs text-foreground">Check your inbox.</p>}
          {status === 'error' && <p className="text-xs text-red-400">{msg}</p>}
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-foreground/10" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-foreground/10" />
        </div>

        <button
          type="button"
          onClick={google}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-foreground/90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  )
}
