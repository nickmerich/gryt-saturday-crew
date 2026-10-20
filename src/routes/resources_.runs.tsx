import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import {
  exchangeStravaCode,
  getStravaActivities,
  getStravaActivityDetail,
  getStravaConfig,
  type StravaActivity,
} from "@/lib/strava.functions";
import { formatDuration, formatPace, pad2 } from "@/lib/recap-render";

export const Route = createFileRoute("/resources_/runs")({
  head: () => ({
    meta: [
      { title: "My runs · pace, elevation, splits · gryt run club" },
      {
        name: "description",
        content:
          "Connect Strava and see your recent runs with pace, elevation gain, and mile-by-mile splits, plus GRYT guides to run them better.",
      },
      { property: "og:title", content: "My runs · pace, elevation, splits · gryt run club" },
      {
        property: "og:description",
        content:
          "Your Strava runs, broken down by pace, elevation, and mile splits. Free from gryt run club.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grytrunclub.com/resources/runs" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grytrunclub.com/resources/runs" }],
  }),
  component: RunsPage,
});

type Detail = Awaited<ReturnType<typeof getStravaActivityDetail>>;

const MI = 1609.344;
const FT = 3.28084;

function miles(m: number) {
  return m / MI;
}
function paceOf(distanceMeters: number, seconds: number) {
  const mi = miles(distanceMeters);
  return mi > 0 ? formatPace(seconds / mi) : "—";
}
function shortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
}

const GUIDES = [
  {
    to: "/resources/what-to-eat-before-a-run",
    kicker: "FUEL",
    title: "What to eat before a run",
    blurb: "Timing, portions, and foods that actually sit right.",
  },
  {
    to: "/resources/running-with-a-group",
    kicker: "PACE",
    title: "Running with a group",
    blurb: "Why crew miles make you faster and less likely to quit.",
  },
  {
    to: "/resources/eqt-pittsburgh-10-miler-2026",
    kicker: "HILLS",
    title: "EQT Pittsburgh 10 Miler",
    blurb: "Course details and training for real elevation.",
  },
  {
    to: "/resources/more-than-miles",
    kicker: "CREW",
    title: "More than miles",
    blurb: "Five things you wouldn't guess from the parking lot.",
  },
] as const;

function RunsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [athlete, setAthlete] = useState<{ firstName: string | null; username: string | null } | null>(
    null,
  );
  const [activities, setActivities] = useState<StravaActivity[] | null>(null);
  const [state, setState] = useState<"idle" | "connecting" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, Detail>>({});
  const [detailLoading, setDetailLoading] = useState<number | null>(null);

  const exchangeCode = useServerFn(exchangeStravaCode);
  const fetchActivities = useServerFn(getStravaActivities);
  const fetchConfig = useServerFn(getStravaConfig);
  const fetchDetail = useServerFn(getStravaActivityDetail);

  const loadActivities = useCallback(
    async (accessToken: string) => {
      setState("loading");
      try {
        const { activities: list } = await fetchActivities({ data: { accessToken } });
        setActivities(list);
        setState("ready");
        if (list.length === 0) toast.message("No recent runs found on Strava.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Couldn't load your runs.";
        setError(msg);
        setState("error");
      }
    },
    [fetchActivities],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    const scope = url.searchParams.get("scope");
    if (err) {
      url.searchParams.delete("error");
      url.searchParams.delete("state");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      setError(
        err === "access_denied"
          ? "Authorization was cancelled. Tap Connect Strava to try again."
          : `Strava returned an error: ${err}.`,
      );
      setState("error");
      return;
    }
    if (!code) return;
    url.searchParams.delete("code");
    url.searchParams.delete("scope");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    if (scope && !/activity:read/.test(scope)) {
      setError("Activity access wasn't granted. Keep 'View your activities' checked on Strava.");
      setState("error");
      return;
    }
    setState("connecting");
    (async () => {
      try {
        const result = await exchangeCode({ data: { code } });
        setToken(result.accessToken);
        setAthlete(result.athlete);
        await loadActivities(result.accessToken);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Couldn't connect to Strava.";
        setError(msg);
        setState("error");
      }
    })();
  }, [exchangeCode, loadActivities]);

  async function connect() {
    setError(null);
    try {
      const { clientId } = await fetchConfig();
      const host = window.location.hostname;
      const allowed = host === "grytrunclub.com" || host === "www.grytrunclub.com";
      const origin = allowed ? window.location.origin : "https://grytrunclub.com";
      const authUrl = new URL("https://www.strava.com/oauth/authorize");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", `${origin}/resources/runs`);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("approval_prompt", "auto");
      authUrl.searchParams.set("scope", "read,activity:read");
      window.location.href = authUrl.toString();
    } catch {
      setError("Strava isn't connected yet on this site.");
      setState("error");
    }
  }

  async function toggle(a: StravaActivity) {
    if (openId === a.id) {
      setOpenId(null);
      return;
    }
    setOpenId(a.id);
    if (details[a.id] || !token) return;
    setDetailLoading(a.id);
    try {
      const d = await fetchDetail({ data: { accessToken: token, activityId: a.id } });
      setDetails((prev) => ({ ...prev, [a.id]: d }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't load splits.");
    } finally {
      setDetailLoading(null);
    }
  }

  const connected = state === "ready" || state === "loading";

  const totals = activities?.reduce(
    (acc, a) => ({
      distance: acc.distance + a.distance,
      time: acc.time + a.moving_time,
      elev: acc.elev + (a.total_elevation_gain ?? 0),
    }),
    { distance: 0, time: 0, elev: 0 },
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#89CFF0]">
          GRYT · YOUR RUNS
        </p>
        <h1 className="mt-3 font-[Oswald,'Arial_Narrow',sans-serif] text-[clamp(2.2rem,7vw,4rem)] font-bold uppercase leading-[0.95]">
          Every mile, broken down.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
          Connect Strava to see your recent runs with pace, elevation gain, and mile-by-mile splits —
          then turn any of them into a shareable recap graphic.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {!connected ? (
            <button
              type="button"
              onClick={connect}
              disabled={state === "connecting"}
              className="h-12 bg-[#89CFF0] px-6 text-[12px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-white disabled:opacity-60"
            >
              {state === "connecting" ? "Connecting…" : "Connect Strava"}
            </button>
          ) : (
            <span className="inline-flex h-12 items-center border border-[#89CFF0]/50 px-5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#89CFF0]">
              Connected{athlete?.firstName ? ` · ${athlete.firstName}` : ""}
            </span>
          )}
          <Link
            to="/resources/recap"
            className="inline-flex h-12 items-center border border-white/25 px-5 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-[#89CFF0] hover:text-[#89CFF0]"
          >
            Make a recap graphic
          </Link>
        </div>

        {error && (
          <p className="mt-5 border-l-2 border-[#89CFF0] bg-white/5 p-4 text-sm text-white/80">
            {error}
          </p>
        )}

        {state === "loading" && <p className="mt-8 text-sm text-white/60">Loading your runs…</p>}

        {totals && activities && activities.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
            {[
              { label: "Runs", value: String(activities.length) },
              { label: "Miles", value: miles(totals.distance).toFixed(1) },
              { label: "Elev ft", value: Math.round(totals.elev * FT).toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="bg-black px-4 py-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#89CFF0]">
                  {s.label}
                </p>
                <p className="mt-2 font-[Oswald,'Arial_Narrow',sans-serif] text-3xl font-bold">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {activities && activities.length > 0 && (
          <ul className="mt-8 space-y-3">
            {activities.map((a) => {
              const open = openId === a.id;
              const d = details[a.id];
              return (
                <li key={a.id} className="border border-white/12 bg-white/[0.03]">
                  <button
                    type="button"
                    onClick={() => toggle(a)}
                    aria-expanded={open}
                    className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
                        {shortDate(a.start_date_local)}
                        {a.location_city ? ` · ${a.location_city}` : ""}
                      </p>
                      <p className="mt-1 truncate font-[Oswald,'Arial_Narrow',sans-serif] text-xl font-bold uppercase">
                        {a.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-5 font-mono text-sm">
                      <Stat label="MI" value={miles(a.distance).toFixed(2)} />
                      <Stat label="TIME" value={formatDuration(a.moving_time)} />
                      <Stat label="PACE" value={paceOf(a.distance, a.moving_time)} />
                      <Stat
                        label="ELEV"
                        value={
                          a.total_elevation_gain != null
                            ? `${Math.round(a.total_elevation_gain * FT)}′`
                            : "—"
                        }
                      />
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-white/10 px-4 pb-5 pt-4">
                      {detailLoading === a.id && (
                        <p className="text-sm text-white/60">Loading splits…</p>
                      )}
                      {d && d.splits.length === 0 && (
                        <p className="text-sm text-white/60">No mile splits recorded for this run.</p>
                      )}
                      {d && d.splits.length > 0 && (
                        <SplitTable splits={d.splits} />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <section className="mt-16 border-t border-white/12 pt-10">
          <h2 className="font-[Oswald,'Arial_Narrow',sans-serif] text-2xl font-bold uppercase">
            Run them better
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {GUIDES.map((g) => (
              <Link
                key={g.to}
                to={g.to}
                className="group block border border-white/12 bg-white/[0.03] p-5 transition-colors hover:border-[#89CFF0]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#89CFF0]">
                  {g.kicker}
                </p>
                <p className="mt-2 font-[Oswald,'Arial_Narrow',sans-serif] text-lg font-bold uppercase group-hover:text-[#89CFF0]">
                  {g.title}
                </p>
                <p className="mt-1 text-sm text-white/65">{g.blurb}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">{label}</span>
      <span className="mt-0.5 text-white">{value}</span>
    </span>
  );
}

function SplitTable({ splits }: { splits: Detail["splits"] }) {
  const paces = splits.map((s) => (s.distance > 0 ? s.movingTime / miles(s.distance) : 0));
  const fastest = Math.min(...paces.filter((p) => p > 0));
  const slowest = Math.max(...paces);
  return (
    <table className="w-full font-mono text-sm">
      <thead>
        <tr className="text-[9px] uppercase tracking-[0.2em] text-white/45">
          <th className="py-1 text-left font-bold">MI</th>
          <th className="py-1 text-left font-bold">Pace</th>
          <th className="py-1 text-left font-bold">Elev</th>
          <th className="py-1 text-right font-bold">Effort</th>
        </tr>
      </thead>
      <tbody>
        {splits.map((s, i) => {
          const pace = paces[i];
          const span = Math.max(1, slowest - fastest);
          const pct = pace > 0 ? Math.round(((slowest - pace) / span) * 100) : 0;
          const elev = s.elevationDifference != null ? Math.round(s.elevationDifference * FT) : null;
          return (
            <tr key={s.split} className="border-t border-white/8">
              <td className="py-2 text-white/70">{pad2(s.split)}</td>
              <td className="py-2 text-white">{pace > 0 ? formatPace(pace) : "—"}</td>
              <td className="py-2 text-white/70">
                {elev == null ? "—" : `${elev > 0 ? "+" : ""}${elev}′`}
              </td>
              <td className="py-2">
                <span className="ml-auto block h-2 w-full max-w-[160px] bg-white/10">
                  <span
                    className="block h-full bg-[#89CFF0]"
                    style={{ width: `${Math.max(6, pct)}%` }}
                  />
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
