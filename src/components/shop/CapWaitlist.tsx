import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { joinCapWaitlist } from "@/lib/cap-waitlist.functions";

export function CapWaitlist() {
  const join = useServerFn(joinCapWaitlist);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy"); setError("");
    try {
      await join({ data: Object.fromEntries(new FormData(e.currentTarget)) });
      setState("done");
    } catch {
      setError("Check your email and try again.");
      setState("idle");
    }
  }
  if (state === "done") return <p role="status" className="mt-4 text-sm text-foreground">You're on the list. We'll email you when the cap goes on sale.</p>;
  return (
    <form onSubmit={submit} className="mt-4">
      <label htmlFor="cap-email" className="eyebrow text-foreground/75">Get notified when it drops</label>
      <div className="mt-2 flex flex-col sm:flex-row gap-2">
        <input id="cap-email" name="email" type="email" required maxLength={255} autoComplete="email" placeholder="you@email.com" className="min-w-0 flex-1 border border-foreground/25 bg-background px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue" />
        <div className="hidden" aria-hidden="true"><input name="website_check" tabIndex={-1} autoComplete="off" /></div>
        <button type="submit" disabled={state === "busy"} className="border border-blue bg-blue px-5 py-3 font-condensed uppercase text-ink hover:bg-foreground hover:text-background hover:border-foreground disabled:opacity-60">{state === "busy" ? "Saving..." : "Notify me"}</button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-foreground">{error}</p>}
    </form>
  );
}
