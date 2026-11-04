import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";

type StatusResponse = {
  ok: true;
  found: boolean;
  status: "active" | "pending" | "inactive" | "unknown" | "none";
  verified: boolean;
  createdAt: string | null;
};

export const Route = createFileRoute("/email-status")({
  head: () => ({
    meta: [
      { title: "Check your email status | GRYT Run Club" },
      {
        name: "description",
        content:
          "Confirm your subscription to the GRYT Saturday Brief and see when the next Friday drop is landing in your inbox.",
      },
      { property: "og:title", content: "Check your email status | GRYT Run Club" },
      {
        property: "og:description",
        content:
          "Confirm your subscription to the GRYT Saturday Brief and see when the next Friday drop is landing in your inbox.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grytrunclub.com/email-status" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/email-status" }],
  }),
  component: EmailStatusPage,
});

function nextFridayDrop(now: Date): Date {
  // Friday 8:00 AM America/New_York. Compute in ET, then convert to UTC-equivalent Date.
  const etFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = etFormatter.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const dow = weekdayMap[get("weekday")] ?? 0;
  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);

  // days until next Friday 8am ET
  let daysUntil = (5 - dow + 7) % 7;
  if (daysUntil === 0 && (hour > 8 || (hour === 8 && minute > 0))) {
    daysUntil = 7;
  }
  // approximate: build a Date by adding days to current midnight ET, then set 8am ET.
  // We approximate ET offset from the current now via the same formatter.
  const targetY = parseInt(get("year"), 10);
  const targetM = parseInt(get("month"), 10);
  const targetD = parseInt(get("day"), 10);
  // Construct UTC baseline for that ET date at 08:00 ET → assume ET offset from now.
  const nowET = new Date(
    Date.UTC(targetY, targetM - 1, targetD, hour, minute),
  );
  const offsetMs = nowET.getTime() - now.getTime();
  const target = new Date(
    Date.UTC(targetY, targetM - 1, targetD + daysUntil, 8, 0) - offsetMs,
  );
  return target;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "landing now";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

function EmailStatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResponse | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const nextDrop = useMemo(() => nextFridayDrop(now), [now]);
  const dropCountdown = formatCountdown(nextDrop.getTime() - now.getTime());
  const dropLabel = nextDrop.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/newsletter/status?email=${encodeURIComponent(email.trim())}`,
        { headers: { "Content-Type": "application/json" } },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Could not check status");
      } else {
        setResult(json as StatusResponse);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "email_status_page" }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Could not resend confirmation");
      } else {
        setResult({
          ok: true,
          found: true,
          status: "pending",
          verified: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteNav />
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
          <div
            className="eyebrow text-ink/60 mb-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            SATURDAY BRIEF
          </div>
          <h1
            className="text-5xl sm:text-6xl uppercase leading-[0.92] tracking-tight"
            style={{ fontFamily: "var(--font-display-condensed)" }}
          >
            Check your
            <br />
            email status.
          </h1>
          <p
            className="mt-6 text-lg text-ink/80"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Not sure if your subscription went through? Enter your email — we'll
            tell you if you're verified and when the next Friday drop lands.
          </p>

          <div
            className="mt-8 border border-ink/15 bg-background/[0.02] p-5 sm:p-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <div className="eyebrow text-ink/60 mb-2">NEXT FRIDAY DROP</div>
            <div
              className="text-2xl sm:text-3xl uppercase leading-tight"
              style={{ fontFamily: "var(--font-display-condensed)" }}
            >
              {dropLabel}
            </div>
            <div className="mt-1 text-ink/70 text-sm">
              Lands in about <span className="font-mono">{dropCountdown}</span>.
            </div>
          </div>

          <form onSubmit={check} className="mt-8 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-ink/25 bg-white px-4 py-3 text-base focus:outline-none focus:border-ink"
              style={{ fontFamily: "var(--font-body)" }}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="bg-blue text-ink uppercase tracking-wide px-6 py-3 disabled:opacity-50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {loading ? "Checking…" : "Check status"}
            </button>
          </form>

          <div className="mt-6" aria-live="polite">
            {error && (
              <div className="border border-red-500/40 bg-red-50 text-red-800 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {result && !error && (
              <div className="border border-ink/15 p-5 sm:p-6 bg-white">
                {result.status === "active" && (
                  <>
                    <div className="eyebrow text-emerald-700 mb-2">VERIFIED</div>
                    <h2
                      className="text-3xl uppercase leading-tight"
                      style={{ fontFamily: "var(--font-display-condensed)" }}
                    >
                      You're on the list.
                    </h2>
                    <p className="mt-3 text-ink/80" style={{ fontFamily: "var(--font-body)" }}>
                      Your address is confirmed. The next Saturday Brief drops{" "}
                      <strong>{dropLabel}</strong> ({dropCountdown} from now).
                    </p>
                  </>
                )}

                {result.status === "pending" && (
                  <>
                    <div className="eyebrow text-amber-700 mb-2">PENDING CONFIRMATION</div>
                    <h2
                      className="text-3xl uppercase leading-tight"
                      style={{ fontFamily: "var(--font-display-condensed)" }}
                    >
                      Check your inbox.
                    </h2>
                    <p className="mt-3 text-ink/80" style={{ fontFamily: "var(--font-body)" }}>
                      We sent a confirmation link. Click it and you'll get the
                      next drop on <strong>{dropLabel}</strong>. Didn't get it?
                      Check spam, then resend below.
                    </p>
                    <button
                      onClick={resend}
                      disabled={loading}
                      className="mt-4 border border-ink px-4 py-2 uppercase tracking-wide text-sm disabled:opacity-50"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Resend confirmation
                    </button>
                  </>
                )}

                {result.status === "inactive" && (
                  <>
                    <div className="eyebrow text-ink/60 mb-2">UNSUBSCRIBED</div>
                    <h2
                      className="text-3xl uppercase leading-tight"
                      style={{ fontFamily: "var(--font-display-condensed)" }}
                    >
                      You're not receiving drops.
                    </h2>
                    <p className="mt-3 text-ink/80" style={{ fontFamily: "var(--font-body)" }}>
                      This address unsubscribed. Want back in? Resubscribe below
                      and we'll send a fresh confirmation link.
                    </p>
                    <button
                      onClick={resend}
                      disabled={loading}
                      className="mt-4 border border-ink px-4 py-2 uppercase tracking-wide text-sm disabled:opacity-50"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Resubscribe
                    </button>
                  </>
                )}

                {(result.status === "none" || result.status === "unknown") && (
                  <>
                    <div className="eyebrow text-ink/60 mb-2">NOT SUBSCRIBED</div>
                    <h2
                      className="text-3xl uppercase leading-tight"
                      style={{ fontFamily: "var(--font-display-condensed)" }}
                    >
                      We don't have that email.
                    </h2>
                    <p className="mt-3 text-ink/80" style={{ fontFamily: "var(--font-body)" }}>
                      No subscription found. Tap below and we'll send you a
                      confirmation link so you can join the Friday drop.
                    </p>
                    <button
                      onClick={resend}
                      disabled={loading}
                      className="mt-4 bg-blue text-ink px-4 py-2 uppercase tracking-wide text-sm disabled:opacity-50"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Subscribe
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
