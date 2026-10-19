import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/admin/allowlist";
import type { ClubStats } from "@/lib/strava-club";

export const Route = createFileRoute("/admin/strava/connect")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin · Connect Strava · gryt" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StravaConnectPage,
});
type Config = {
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  clientId: string | null;
  oauthState: string | null;
  stats: ClubStats;
};
async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Sign in to continue.");
  return { Authorization: `Bearer ${data.session.access_token}` };
}
function StravaConnectPage() {
  const queryClient = useQueryClient();
  const connectedStats = useRef<ClubStats | null>(null);
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [inputEmail, setInputEmail] = useState("");
  const [config, setConfig] = useState<Config | null>(null);
  const [message, setMessage] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [approval, setApproval] = useState<{ code: string; state: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const exchange = useRef<Promise<{ stats: ClubStats }> | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    setRedirectUri(`${url.origin}${url.pathname}`);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (code && state) setApproval({ code, state });
    if (url.searchParams.has("error"))
      setMessage("Strava approval was cancelled. You can try again.");
    if (url.search) window.history.replaceState({}, "", url.pathname);
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setEmail(session?.user.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  const allowed = isAdminEmail(email);
  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/strava-connect", { headers: await authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not check the connection.");
      if (!cancelled) setConfig({ ...data, stats: connectedStats.current ?? data.stats });
    })().catch(() => {
      if (!cancelled) setMessage("Could not check the connection. Reload to retry.");
    });
    return () => {
      cancelled = true;
    };
  }, [allowed]);
  useEffect(() => {
    if (!allowed || !approval) return;
    let cancelled = false;
    setBusy(true);
    // Reuse the same exchange across StrictMode effect replays.
    exchange.current ??= (async () => {
      const res = await fetch("/api/admin/strava-connect", {
        method: "POST",
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
        body: JSON.stringify(approval),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Could not verify the connection.");
      return result;
    })();
    exchange.current
      .then((result) => {
        if (!cancelled) {
          connectedStats.current = result.stats;
          queryClient.setQueryData(["strava-club-stats", "verified-v2"], result.stats);
          setConfig((old) => (old ? { ...old, stats: result.stats } : old));
          setMessage(
            `Connected and saved securely. Verified ${result.stats.members} Strava members.`,
          );
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setMessage(error.message);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allowed, approval, queryClient]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: inputEmail.trim().toLowerCase(),
        options: { emailRedirectTo: redirectUri },
      });
      setMessage(error ? error.message : "Check your inbox for the admin sign-in link.");
    } finally {
      setBusy(false);
    }
  }
  const configured =
    config?.clientIdConfigured && config.clientSecretConfigured && config.oauthState;
  const authorizeUrl =
    configured && redirectUri
      ? `https://www.strava.com/oauth/authorize?${new URLSearchParams({
          client_id: config!.clientId!,
          response_type: "code",
          redirect_uri: redirectUri,
          approval_prompt: "force",
          scope: "read",
          state: config!.oauthState!,
        })}`
      : null;

  return (
    <main className="min-h-screen bg-ink text-paper px-5 sm:px-12 py-12">
      <div className="max-w-[760px] mx-auto">
        <p className="eyebrow eyebrow-blue">Admin</p>
        <h1 className="display-condensed text-4xl mt-2">CONNECT STRAVA</h1>
        {email === undefined ? (
          <p className="mt-4">Loading…</p>
        ) : !email ? (
          <form onSubmit={signIn} className="mt-6 space-y-3">
            <label htmlFor="strava-email" className="block">
              Admin email
            </label>
            <input
              id="strava-email"
              type="email"
              required
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="w-full bg-vintage border border-white/20 px-3 py-3 text-paper"
            />
            <button disabled={busy} className="btn-primary">
              Send magic link
            </button>
          </form>
        ) : !allowed ? (
          <p className="mt-4">This account is not on the GRYT admin list.</p>
        ) : (
          <div className="mt-6 space-y-5 text-sm leading-relaxed">
            <p>
              Approve access to the GRYT club. Tokens are encrypted and saved on the server; you
              never need to copy a key or paste it into chat.
            </p>
            {config ? (
              <p>
                Connection:{" "}
                {config.stats.status === "live"
                  ? `verified (${config.stats.members} members)`
                  : config.stats.status === "stale"
                    ? "last verified count available; refresh needs attention"
                    : "not verified"}
                .
              </p>
            ) : (
              <p>Checking configuration…</p>
            )}
            {config && !configured ? (
              <p>
                Configure STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in the hosting provider's secure
                secrets settings. Apply the connection-storage migration before authorizing.
              </p>
            ) : null}
            <p>
              In your Strava API settings, use this site's hostname as the callback domain. Callback
              URL: <code className="break-all">{redirectUri}</code>
            </p>
            {authorizeUrl && !busy ? (
              <a className="btn-primary" href={authorizeUrl}>
                Authorize with Strava
              </a>
            ) : null}
            <p>
              All three membership counters use the same verified count. Reads are cached for 15
              minutes; an open page checks again every 15 minutes. This is not a background
              scheduled job.
            </p>
            <p>
              Attendance is still calculated from owned check-ins, not Strava membership. Static
              mileage and copied leaderboards are not displayed as current data.
            </p>
          </div>
        )}
        {message ? (
          <p className="mt-6 border border-blue/50 p-4" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
