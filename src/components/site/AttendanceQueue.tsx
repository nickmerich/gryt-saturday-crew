import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Job = {
  id: string;
  kind: string;
  status: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
};
async function queueRequest(body?: unknown) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Admin sign-in required.");
  const response = await fetch("/api/admin/attendance", {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Queue unavailable");
  return payload;
}
export function AttendanceQueue() {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const { data, error } = useQuery<{ jobs: Job[]; hasMorePossible: boolean }>({
    queryKey: ["admin", "attendance-jobs"],
    queryFn: () => queueRequest(),
    retry: false,
  });
  async function act(body: unknown) {
    setBusy(true);
    setMessage("");
    try {
      const result = await queueRequest(body);
      setMessage(
        result.processed !== undefined
          ? `${result.processed} queued jobs processed. Check the remaining states below.`
          : "Retry queued.",
      );
      await client.invalidateQueries({ queryKey: ["admin", "attendance-jobs"] });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="px-6 sm:px-12 py-6 border-b border-white/10"
      aria-labelledby="attendance-queue-title"
    >
      <h2 id="attendance-queue-title" className="text-lg font-semibold">
        RSVP delivery and sync
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        RSVPs are not check-ins. This queue tracks email and Notion projection only, not actual
        attendance. Processing jobs may send real confirmations when configured. Uncertain writes
        require destination review, not blind retry.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-400 mt-3">
          {error.message}
        </p>
      )}
      {data && (
        <>
          <button
            type="button"
            disabled={busy}
            className="mt-4 border border-blue text-blue px-4 py-2 disabled:opacity-50"
            onClick={() => {
              if (
                window.confirm(
                  "Process up to five queued jobs? This can send confirmation emails and sync RSVP records to Notion.",
                )
              )
                void act({ action: "process" });
            }}
          >
            {busy ? "Processing…" : "Process up to five jobs"}
          </button>
          <p className="text-sm mt-3">
            {data.jobs.length === 0
              ? "No pending jobs in this view."
              : `${data.jobs.length} open jobs${data.hasMorePossible ? " shown; more may exist" : ""}.`}
          </p>
          <ul className="mt-3 space-y-3">
            {data.jobs.map((job) => (
              <li key={job.id} className="border border-white/15 p-3 text-sm">
                <p>
                  {job.kind} · {job.status} · {job.attempts} attempts
                </p>
                <p className="break-words text-muted-foreground">
                  {job.last_error || "Waiting for processing."}
                </p>
                {job.status === "failed" && (
                  <button
                    type="button"
                    disabled={busy}
                    className="mt-2 underline"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Have you verified the provider/destination and fixed the failure? Queue this failed job again?",
                        )
                      )
                        void act({ action: "retry", id: job.id, reviewed: true });
                    }}
                  >
                    Queue reviewed retry
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {message && (
        <p role="status" className="text-sm mt-3">
          {message}
        </p>
      )}
    </section>
  );
}
