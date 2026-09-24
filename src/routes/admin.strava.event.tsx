import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getOccurrence, occurrenceStravaEvent } from "@/lib/run-schedule";

export const Route = createFileRoute("/admin/strava/event")({
  head: () => ({
    meta: [
      { title: "Strava event helper · GRYT Run Club" },
      { name: "description", content: "This Saturday's run details, ready to post to Strava." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Strava event helper · GRYT Run Club" },
      { property: "og:description", content: "This Saturday's run details, ready to post to Strava." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StravaEventHelper,
});

function Row({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        <button
          type="button"
          className="border border-foreground px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] hover:bg-primary hover:text-primary-foreground"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 whitespace-pre-line text-base">{value}</p>
    </div>
  );
}

function StravaEventHelper() {
  const occ = getOccurrence();
  const ev = occurrenceStravaEvent(occ);
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Organizer · Strava</p>
      <h1 className="mt-2 font-[var(--font-condensed)] text-5xl uppercase leading-none">Post this Saturday</h1>
      <p className="mt-4 text-muted-foreground">
        These details update themselves each week. Copy each one into Strava's new club event form.
      </p>
      <a
        href="https://www.strava.com/clubs/1708552/group_events/new"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-primary-foreground"
      >
        Open Strava event form
      </a>
      <div className="mt-8 grid gap-3">
        <Row label="Title" value={ev.title} />
        <Row label="Date" value={ev.date} />
        <Row label="Time" value={ev.time} />
        <Row label="Meetup address" value={ev.address} />
        <Row label="Description" value={ev.description} />
      </div>
    </main>
  );
}
