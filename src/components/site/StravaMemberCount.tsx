import { useStravaClubStats } from "@/hooks/useStravaClubStats";
import { memberCountLabel } from "@/lib/strava-club";

export function StravaMemberCount({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { data, isPending } = useStravaClubStats();
  const status = isPending
    ? "Checking Strava"
    : data.status === "live"
      ? "Verified on Strava"
      : data.status === "stale"
        ? "Last verified count"
        : "Count unavailable";
  const verified = data.fetchedAt
    ? new Date(data.fetchedAt).toLocaleString("en-US", { timeZone: "America/New_York" })
    : null;
  return (
    <span
      data-strava-member-count
      data-state={data.status}
      title={verified ? `Verified ${verified} ET` : status}
    >
      <span>{memberCountLabel(data)}</span>
      <span
        className={`block mt-1 text-[11px] leading-normal font-normal tracking-normal normal-case ${tone === "light" ? "text-ink/80" : "text-paper/80"}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {status}
      </span>
    </span>
  );
}
