import { useCallback, useEffect, useRef, useState } from "react";
import { currentRun } from "@/lib/run-occurrence";
import {
  checkinCounts,
  type CheckinBoard,
  type CheckinCommand,
  type CheckinPerson,
} from "@/lib/attendance/checkin";
import "@/styles/organizer-attendance.css";

export type AttendanceTransport = (date: string, command?: CheckinCommand) => Promise<Response>;
const time = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export function OrganizerAttendance({
  transport,
  initialDate = currentRun().localDate,
}: {
  transport: AttendanceTransport;
  initialDate?: string;
}) {
  const [date, setDate] = useState(initialDate);
  const [board, setBoard] = useState<CheckinBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [checked, setChecked] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [pending, setPending] = useState<CheckinCommand | null>(null);
  const [dialog, setDialog] = useState<{
    action: "mark" | "close" | "reopen";
    person?: CheckinPerson;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [walkin, setWalkin] = useState(false);
  const [name, setName] = useState("");
  const [duplicateReviewed, setDuplicateReviewed] = useState(false);
  const requestSequence = useRef(0);
  const mutationLock = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(
    async (day: string) => {
      const sequence = ++requestSequence.current;
      setLoading(true);
      try {
        const response = await transport(day);
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "The roster could not be loaded.");
        if (mounted.current && sequence === requestSequence.current) {
          setBoard(body);
          setChecked(new Date().toISOString());
        }
      } catch (err) {
        if (mounted.current && sequence === requestSequence.current) {
          setBoard(null);
          setError(err instanceof Error ? err.message : "The roster could not be loaded.");
        }
      } finally {
        if (mounted.current && sequence === requestSequence.current) setLoading(false);
      }
    },
    [transport],
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    setBoard(null);
    setError("");
    setNotice("");
    setDialog(null);
    setWalkin(false);
    setQuery("");
    setFilter("all");
    setName("");
    setPending(null);
    void load(date);
  }, [date, load]);

  async function save(command: CheckinCommand) {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    setPending(command);
    let saved = false;
    try {
      const response = await transport(command.date, command);
      const body = await response.json();
      if (!mounted.current) return;
      if (!response.ok) {
        if (response.status < 500) {
          setPending(null);
          if (response.status === 403) setBoard(null);
          else await load(command.date);
        }
        throw new Error(body.error || "Save could not be confirmed.");
      }
      if (body.success !== true)
        throw new Error(
          "Save could not be confirmed. Retry the same change or refresh to reconcile it.",
        );
      saved = true;
      setPending(null);
      setDialog(null);
      setWalkin(false);
      setName("");
      setReason("");
      setReviewed(false);
      setDuplicateReviewed(false);
      setNotice("Change saved. The roster below reflects the latest recorded attendance.");
      await load(command.date);
    } catch (err) {
      if (mounted.current)
        setError(
          err instanceof Error
            ? err.message
            : "Save could not be confirmed. Retry the same change.",
        );
    } finally {
      mutationLock.current = false;
      if (mounted.current) {
        setBusy(false);
        if (saved) setPending(null);
      }
    }
  }
  function command(fields: Partial<CheckinCommand> & Pick<CheckinCommand, "action">) {
    if (!board) return;
    void save({
      date,
      requestId: crypto.randomUUID(),
      expectedRevision: board.revision,
      ...fields,
    });
  }
  const locked = busy || loading || !!pending;
  const editable = !!board && board.writable && !board.closed && !board.snapshotChanged && !locked;
  const counts = checkinCounts(board?.people ?? []);
  const people = (board?.people ?? []).filter(
    (p) =>
      `${p.name} ${p.contactHint}`.toLowerCase().includes(query.trim().toLowerCase()) &&
      (filter === "all" ||
        (filter === "present"
          ? p.present
          : filter === "walkin"
            ? p.source === "walkin"
            : !p.present)),
  );
  function review(action: "mark" | "close" | "reopen", person?: CheckinPerson) {
    setReason("");
    setReviewed(false);
    setDialog({ action, person });
    setWalkin(false);
  }

  return (
    <main className="gryt-organizer">
      <a className="gryt-skip-link" href="#checkin-roster">
        Skip to attendance list
      </a>
      <header className="organizer-header">
        <div>
          <p className="organizer-kicker">GRYT / Organizer desk</p>
          <h1>Saturday attendance</h1>
          <p>Welcome the person. Record the visit. Keep RSVPs separate.</p>
        </div>
        <a href="/admin/roster">RSVP and waiver roster</a>
      </header>
      <section className="organizer-controls" aria-label="Choose a run">
        <label>
          Saturday date
          <input
            type="date"
            value={date}
            min="2026-01-01"
            disabled={locked}
            onChange={(e) => {
              if (e.target.value) setDate(e.target.value);
            }}
          />
        </label>
        <button
          disabled={busy || loading}
          onClick={() => {
            setError("");
            setNotice("");
            void load(date);
          }}
        >
          Refresh roster
        </button>
        <p className="organizer-muted">
          {checked
            ? `Last loaded ${time(checked)} Eastern. Refresh for new arrivals.`
            : "Private organizer access only."}
        </p>
      </section>
      {error && (
        <div className="organizer-alert" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <p className="organizer-notice" role="status">
          {notice}
        </p>
      )}
      {pending && !busy && (
        <div className="organizer-alert">
          <p>
            The previous change may have saved. No success is assumed. Retry uses the same request
            ID.
          </p>
          <div className="organizer-actions">
            <button onClick={() => void save(pending)}>Retry same change</button>
            <button
              onClick={() => {
                setPending(null);
                setError("");
                setNotice(
                  "Retry discarded. Review the refreshed roster before making another change.",
                );
                void load(date);
              }}
            >
              Discard retry and refresh
            </button>
          </div>
        </div>
      )}
      {loading && (
        <p role="status" className="organizer-empty">
          Loading the private run roster...
        </p>
      )}
      {board && (
        <>
          <section className="organizer-event" aria-label="Selected run">
            <div>
              <p className="organizer-kicker">
                {board.closed ? "Attendance closed" : "Attendance open"} · Revision {board.revision}
              </p>
              <h2>{board.event.label}</h2>
              <p>
                {board.event.location} · {board.event.route}
              </p>
              <p className="organizer-muted">
                Confirm these details before recording attendance. This is the reviewed schedule,
                not proof a historical run happened.
              </p>
            </div>
            <button
              disabled={
                locked ||
                board.snapshotChanged ||
                !board.writable ||
                (!board.closed && Date.parse(board.event.endsAt) > Date.now())
              }
              onClick={() => review(board.closed ? "reopen" : "close")}
            >
              {board.closed ? "Reopen for corrections" : "Close attendance"}
            </button>
          </section>
          {board.snapshotChanged && (
            <p role="alert" className="organizer-alert">
              Run details changed after this ledger started. Writes are locked until an organizer
              reconciles the stored event snapshot.
            </p>
          )}
          {!board.writable && (
            <p className="organizer-alert">
              Read-only. Check-in opens one hour before a confirmed run. Cancelled and unconfirmed
              runs cannot be checked in.
            </p>
          )}
          {board.closed && (
            <p className="organizer-notice">
              This ledger is closed. Reopen it with a reason to correct attendance. Closing never
              marks unrecorded runners as absent.
            </p>
          )}
          <dl className="organizer-counts">
            {[
              ["Checked in", counts.present],
              ["RSVPs", counts.rsvps],
              ["Walk-ins present", counts.walkins],
              ["Not recorded", counts.unrecorded],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {dialog && (
            <section className="organizer-panel" aria-labelledby="review-title">
              <h2 id="review-title">
                {dialog.action === "mark"
                  ? `Correct ${dialog.person?.name}'s check-in`
                  : dialog.action === "close"
                    ? "Review before closing"
                    : "Reopen this attendance ledger"}
              </h2>
              <p>
                {dialog.action === "mark"
                  ? "This changes the runner to Not recorded. The previous check-in stays in the audit trail."
                  : `${counts.present} checked in. ${counts.unrecorded} not recorded. No one will be marked absent or messaged.`}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  command({
                    action: dialog.action,
                    participantId: dialog.person?.id,
                    present: dialog.action === "mark" ? false : undefined,
                    reason,
                    reviewed,
                  });
                }}
              >
                <label>
                  Reason
                  <input
                    autoFocus
                    required
                    minLength={3}
                    maxLength={240}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief operational reason. No sensitive details."
                    disabled={locked}
                  />
                </label>
                {dialog.action !== "mark" && (
                  <label className="organizer-checkbox">
                    <input
                      type="checkbox"
                      required
                      checked={reviewed}
                      onChange={(e) => setReviewed(e.target.checked)}
                      disabled={locked}
                    />
                    I reviewed this run and the attendance totals.
                  </label>
                )}
                <div className="organizer-actions">
                  <button className="organizer-primary" disabled={locked}>
                    Save{" "}
                    {dialog.action === "mark"
                      ? "correction"
                      : dialog.action === "close"
                        ? "closure"
                        : "reopening"}
                  </button>
                  <button type="button" disabled={locked} onClick={() => setDialog(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}
          <section id="checkin-roster" tabIndex={-1}>
            <div className="organizer-list-tools">
              <label>
                Find a runner
                <input
                  type="search"
                  placeholder="Name or masked contact"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label>
                Show
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">Everyone</option>
                  <option value="unrecorded">Not recorded</option>
                  <option value="present">Checked in</option>
                  <option value="walkin">Walk-ins</option>
                </select>
              </label>
              <button
                disabled={!editable}
                onClick={() => {
                  setWalkin(!walkin);
                  setDialog(null);
                  setDuplicateReviewed(false);
                }}
              >
                Add a walk-in
              </button>
            </div>
            {walkin && (
              <form
                className="organizer-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  command({
                    action: "walkin",
                    name,
                    participantId: crypto.randomUUID(),
                    duplicateReviewed,
                  });
                }}
              >
                <h2>Someone joined without an RSVP</h2>
                <p>
                  Search first to avoid counting someone twice. Only add a person you have seen at
                  this run. No contact details or marketing permission are collected here.
                </p>
                <label>
                  Runner name
                  <input
                    autoFocus
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setDuplicateReviewed(false);
                    }}
                    disabled={locked}
                  />
                </label>
                <label className="organizer-checkbox">
                  <input
                    type="checkbox"
                    checked={duplicateReviewed}
                    onChange={(e) => setDuplicateReviewed(e.target.checked)}
                    disabled={locked}
                  />
                  I confirmed this is a different person if the name is already listed.
                </label>
                <div className="organizer-actions">
                  <button className="organizer-primary" disabled={!editable}>
                    Add and check in
                  </button>
                  <button type="button" onClick={() => setWalkin(false)} disabled={locked}>
                    Cancel walk-in
                  </button>
                </div>
              </form>
            )}
            <p className="organizer-muted">
              Check-in records presence only, not waiver clearance.{" "}
              <a href="/admin/roster">Review waivers separately.</a> Same-name runners are never
              merged automatically.
            </p>
            <ul className="organizer-people" aria-label="Attendance list">
              {people.map((person) => (
                <li key={person.id} data-testid={`person-${person.id}`}>
                  <div>
                    <h3>{person.name}</h3>
                    <p>
                      {person.source === "rsvp" ? "RSVP" : "Walk-in"} · {person.contactHint}
                    </p>
                    {person.invitationChanged && (
                      <p className="organizer-warning">
                        RSVP uses earlier run details. Confirm the person and run before checking
                        in.
                      </p>
                    )}
                  </div>
                  <div className="organizer-person-action">
                    <span className={person.present ? "organizer-present" : "organizer-muted"}>
                      {person.present ? "Checked in" : "Not recorded"}
                    </span>
                    {person.recordedAt && (
                      <span className="organizer-muted">{time(person.recordedAt)} ET</span>
                    )}
                    <button
                      className={person.present ? "" : "organizer-primary"}
                      disabled={!editable}
                      aria-label={`${person.present ? "Correct" : "Check in"} ${person.name}`}
                      onClick={() =>
                        person.present
                          ? review("mark", person)
                          : command({ action: "mark", participantId: person.id, present: true })
                      }
                    >
                      {person.present ? "Correct check-in" : "Check in"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {!people.length && (
              <div className="organizer-empty">
                <h2>
                  {board.people.length
                    ? "No matching runners"
                    : "No runners recorded for this date yet"}
                </h2>
                <p>
                  {board.people.length
                    ? "Try another name or choose Everyone."
                    : "New RSVPs appear after a refresh. Add a walk-in only when you can confirm they attended."}
                </p>
              </div>
            )}
          </section>
          <details className="organizer-audit">
            <summary>
              Recent changes · {board.audit.length}
              {board.auditHasMore ? "+" : ""}
            </summary>
            <p>
              Private audit trail. All times Eastern. Records are not deleted when a check-in is
              corrected.
            </p>
            {!board.audit.length && <p>No attendance changes have been recorded.</p>}
            <ol>
              {board.audit.map((item) => (
                <li key={item.id}>
                  <strong>
                    {item.action === "mark"
                      ? item.present
                        ? "Checked in"
                        : "Corrected to not recorded"
                      : item.action === "walkin"
                        ? "Walk-in checked in"
                        : item.action === "close"
                          ? "Attendance closed"
                          : "Attendance reopened"}
                  </strong>
                  {item.participantId && (
                    <span>
                      {" "}
                      ·{" "}
                      {board.people.find((p) => p.id === item.participantId)?.name ??
                        "Runner record"}
                    </span>
                  )}
                  <p>
                    {time(item.at)} · {item.actor}
                  </p>
                  {item.reason && <p>Reason: {item.reason}</p>}
                </li>
              ))}
            </ol>
            {board.auditHasMore && (
              <p>
                Showing the latest 50 changes. Older audit records remain in the private database.
              </p>
            )}
          </details>
        </>
      )}
      <footer className="organizer-footer">
        Private attendance ledger. No automatic messages, Notion updates, waivers or public
        statistics are triggered here.
      </footer>
    </main>
  );
}
