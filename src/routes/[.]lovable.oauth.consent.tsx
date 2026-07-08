import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

// Beta `supabase.auth.oauth` namespace — narrow typed shim so TS is happy
// even when the SDK's ambient types lag behind the runtime API.
type OAuthClient = { name?: string; client_name?: string } | null
type OAuthDetails = {
  client?: OAuthClient
  redirect_url?: string
  redirect_to?: string
  scope?: string
  scopes?: string[]
} | null

type OAuthApi = {
  getAuthorizationDetails(id: string): Promise<{ data: OAuthDetails; error: { message: string } | null }>
  approveAuthorization(id: string): Promise<{ data: OAuthDetails; error: { message: string } | null }>
  denyAuthorization(id: string): Promise<{ data: OAuthDetails; error: { message: string } | null }>
}

const authOAuth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth

export const Route = createFileRoute('/.lovable/oauth/consent')({
  // The Supabase session lives in localStorage, so this route is browser-only.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === 'string' ? s.authorization_id : '',
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error('Missing authorization_id')
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      const next = `${location.pathname}${location.searchStr}`
      throw redirect({ to: '/auth', search: { next } })
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get('authorization_id')!
    const { data, error } = await authOAuth().getAuthorizationDetails(authorizationId)
    if (error) throw new Error(error.message)
    const immediate = data?.redirect_url ?? data?.redirect_to
    if (immediate && !data?.client) {
      window.location.replace(immediate)
      throw new Error('Redirecting…')
    }
    return data
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-ink text-paper p-12">
      <h1 className="display-condensed text-3xl">Authorization error</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
})

function Consent() {
  const details = Route.useLoaderData()
  const { authorization_id } = Route.useSearch()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clientName = details?.client?.name ?? details?.client?.client_name ?? 'an app'
  const scopes = details?.scopes ?? (details?.scope ? details.scope.split(/\s+/) : [])

  async function decide(approve: boolean) {
    setBusy(true)
    setError(null)
    const api = authOAuth()
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id)
    if (error) {
      setBusy(false)
      setError(error.message)
      return
    }
    const target = data?.redirect_url ?? data?.redirect_to
    if (!target) {
      setBusy(false)
      setError('No redirect returned by the authorization server.')
      return
    }
    window.location.href = target
  }

  return (
    <main className="min-h-screen bg-ink text-paper flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="eyebrow eyebrow-blue">Authorize</p>
        <h1 className="display-condensed text-3xl mt-2">
          CONNECT {String(clientName).toUpperCase()} TO GRYT
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {clientName} will be able to call GRYT Run Club's enabled tools while you're signed in.
        </p>

        {scopes.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {scopes.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-[11px] text-muted-foreground">
          This does not bypass GRYT's permissions or backend policies.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 bg-blue text-ink px-4 py-2.5 text-sm font-medium uppercase tracking-wider disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Approve'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 border border-white/20 text-paper px-4 py-2.5 text-sm font-medium uppercase tracking-wider disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  )
}
