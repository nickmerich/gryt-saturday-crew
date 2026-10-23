import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { signWaiver } from "@/lib/waiver.functions";
import grytBearAsset from "@/assets/gryt-bear.png.asset.json";

export const Route = createFileRoute("/waiver")({
  head: () => ({
    meta: [
      { title: "2026 Waiver · gryt run club" },
      {
        name: "description",
        content:
          "Sign the gryt run club release of liability for the 2026 season. One signature covers you all year.",
      },
      { property: "og:title", content: "2026 Waiver · gryt run club" },
      {
        property: "og:description",
        content: "Read it, sign it once, you're good through Dec 31, 2026.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WaiverPage,
});

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);
const PREFILL_KEY = "gryt_waiver_prefill";
const RSVP_PREFILL_KEY = "gryt_rsvp_prefill";
const SIGNED_KEY = "gryt_waiver_2026";
const STEPS = ["You", "Emergency contact", "Read & sign"] as const;

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  signature_text: string;
  guardian_name: string;
  guardian_relationship: string;
  agree_release: boolean;
  agree_fitness: boolean;
  agree_adult: boolean;
};

const EMPTY: FormState = {
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  signature_text: "",
  guardian_name: "",
  guardian_relationship: "",
  agree_release: false,
  agree_fitness: false,
  agree_adult: false,
};

type SignedRecord = {
  id: string;
  signed_on: string;
  /** The participant. */
  name: string;
  /** Parent or legal guardian who signed, when the participant is under 18. */
  guardian?: string;
};

function readSigned(): SignedRecord | null {
  try {
    const raw = localStorage.getItem(SIGNED_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (v?.id && v?.signed_on && v?.name) return v as SignedRecord;
  } catch {
    /* ignore */
  }
  return null;
}

function WaiverPage() {
  const sign = useServerFn(signWaiver);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<SignedRecord | null>(null);
  const [remember, setRemember] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Hydrate from prior sign or saved prefill on mount
  useEffect(() => {
    const existing = readSigned();
    if (existing) {
      setDone(existing);
      return;
    }
    try {
      const prefillRaw = localStorage.getItem(PREFILL_KEY);
      const rsvpRaw = localStorage.getItem(RSVP_PREFILL_KEY);
      const prefill = prefillRaw ? JSON.parse(prefillRaw) : null;
      const rsvp = rsvpRaw ? JSON.parse(rsvpRaw) : null;
      setForm((f) => ({
        ...f,
        full_name: prefill?.full_name ?? rsvp?.name ?? "",
        email: prefill?.email ?? rsvp?.email ?? "",
        phone: prefill?.phone ?? rsvp?.phone ?? "",
        date_of_birth: prefill?.date_of_birth ?? "",
        emergency_contact_name: prefill?.emergency_contact_name ?? "",
        emergency_contact_phone: prefill?.emergency_contact_phone ?? "",
      }));
    } catch {
      /* ignore */
    }
  }, []);

  const age = useMemo(() => {
    if (!form.date_of_birth) return null;
    const d = new Date(form.date_of_birth);
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a;
  }, [form.date_of_birth]);

  const isMinor = age !== null && age < 18;
  const emailValid = /^\S+@\S+\.\S+$/.test(form.email.trim());
  // A minor's waiver is signed by the parent or legal guardian, so the typed
  // signature must match the guardian's name instead of the participant's.
  const signerName = isMinor ? form.guardian_name : form.full_name;
  const guardianValid =
    form.guardian_name.trim().length > 1 &&
    form.guardian_relationship.trim().length > 1;
  const sigMatches =
    form.signature_text.trim().length > 0 &&
    signerName.trim().length > 0 &&
    form.signature_text.trim().toLowerCase() ===
      signerName.trim().toLowerCase();

  const step1Valid =
    form.full_name.trim().length > 1 &&
    emailValid &&
    !!form.date_of_birth &&
    (!isMinor || guardianValid);
  const step2Valid =
    form.emergency_contact_name.trim().length > 1 &&
    form.emergency_contact_phone.trim().length >= 7;
  const canSubmit =
    step1Valid &&
    step2Valid &&
    form.agree_release &&
    form.agree_fitness &&
    form.agree_adult &&
    sigMatches &&
    !submitting;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await sign({
        data: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          date_of_birth: form.date_of_birth,
          emergency_contact_name: form.emergency_contact_name,
          emergency_contact_phone: form.emergency_contact_phone,
          signature_text: form.signature_text,
          guardian_name: isMinor ? form.guardian_name : "",
          guardian_relationship: isMinor ? form.guardian_relationship : "",
          agree_release: form.agree_release as true,
          agree_fitness: form.agree_fitness as true,
          agree_adult: form.agree_adult as true,
        },
      });
      const record: SignedRecord = {
        id: res.id,
        signed_on: res.signed_on,
        name: form.full_name.trim(),
        ...(isMinor ? { guardian: form.guardian_name.trim() } : {}),
      };
      try {
        localStorage.setItem(SIGNED_KEY, JSON.stringify(record));
        if (remember) {
          localStorage.setItem(
            PREFILL_KEY,
            JSON.stringify({
              full_name: form.full_name.trim(),
              email: form.email.trim().toLowerCase(),
              phone: form.phone.trim(),
              date_of_birth: form.date_of_birth,
              emergency_contact_name: form.emergency_contact_name.trim(),
              emergency_contact_phone: form.emergency_contact_phone.trim(),
            }),
          );
        } else {
          localStorage.removeItem(PREFILL_KEY);
        }
      } catch {
        /* ignore */
      }
      setDone(record);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return <SignedView record={done} />;

  return (
    <main className="min-h-screen bg-ink text-paper">
      <PageHeader />

      <section className="px-6 sm:px-12 lg:px-24 pt-14 md:pt-20 pb-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="eyebrow eyebrow-blue mb-4">2026 season</div>
          <h1 className="display-condensed text-paper text-[clamp(46px,7vw,104px)] leading-[0.9] mb-4">
            Run club waiver.
          </h1>
          <p className="text-lg text-paper/80 max-w-[620px]">
            Three quick steps. About a minute. You're good through Dec 31, 2026.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-12 lg:px-24 pb-24">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-start">
          <WaiverText />

          <form
            onSubmit={onSubmit}
            className="border-2 border-blue p-6 md:p-8 bg-blue/[0.08] flex flex-col gap-5 lg:sticky lg:top-6 self-start"
          >
            <Stepper step={step} />

            {step === 0 && (
              <StepBlock
                title="Your info"
                subtitle="The runner's details. Under 18? A parent or legal guardian signs for them."
              >
                <Field label="Full legal name" required>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    className={inputCls}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    required
                    maxLength={200}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputCls}
                    autoComplete="email"
                  />
                  {form.email.length > 3 && !emailValid && (
                    <Hint>Use a real email so we can send your confirmation.</Hint>
                  )}
                </Field>
                <Field label="Phone (optional)">
                  <input
                    type="tel"
                    maxLength={40}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputCls}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Date of birth" required>
                  <input
                    type="date"
                    required
                    max={TODAY_ISO()}
                    value={form.date_of_birth}
                    onChange={(e) => set("date_of_birth", e.target.value)}
                    className={inputCls}
                  />
                  {isMinor && (
                    <Hint>
                      Under 18. A parent or legal guardian signs below, and must
                      run with them or be present at the run.
                    </Hint>
                  )}
                </Field>

                {isMinor && (
                  <>
                    <Field label="Parent or legal guardian full name" required>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={form.guardian_name}
                        onChange={(e) => set("guardian_name", e.target.value)}
                        className={inputCls}
                        autoComplete="off"
                      />
                    </Field>
                    <Field label="Relationship to the runner" required>
                      <input
                        type="text"
                        required
                        maxLength={60}
                        value={form.guardian_relationship}
                        onChange={(e) =>
                          set("guardian_relationship", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Mother, father, legal guardian"
                        autoComplete="off"
                      />
                    </Field>
                  </>
                )}
              </StepBlock>
            )}

            {step === 1 && (
              <StepBlock
                title="Emergency contact"
                subtitle="In case something happens on the run. We'll only call if we have to."
              >
                <Field label="Contact name" required>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={form.emergency_contact_name}
                    onChange={(e) =>
                      set("emergency_contact_name", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Their phone" required>
                  <input
                    type="tel"
                    required
                    maxLength={40}
                    value={form.emergency_contact_phone}
                    onChange={(e) =>
                      set("emergency_contact_phone", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
              </StepBlock>
            )}

            {step === 2 && (
              <StepBlock
                title="Read & sign"
                subtitle={
                  isMinor
                    ? "Parent or legal guardian: confirm you read the waiver on the left, then type your name."
                    : "Confirm you read the waiver on the left, then type your name."
                }
              >
                <div className="flex flex-col gap-3 pt-1">
                  <Check
                    checked={form.agree_release}
                    onChange={(v) => set("agree_release", v)}
                    label={
                      isMinor
                        ? "I have read and agree to the release of liability on behalf of my child."
                        : "I have read and agree to the release of liability."
                    }
                  />
                  <Check
                    checked={form.agree_fitness}
                    onChange={(v) => set("agree_fitness", v)}
                    label={
                      isMinor
                        ? "My child is physically able to participate and we have consulted a physician as needed."
                        : "I am physically able to participate and have consulted a physician as needed."
                    }
                  />
                  <Check
                    checked={form.agree_adult}
                    onChange={(v) => set("agree_adult", v)}
                    label={
                      isMinor
                        ? "I am 18 or older and the parent or legal guardian of this runner, and I will be with them at the run."
                        : "I am 18 years or older."
                    }
                  />
                </div>

                <Field
                  label={
                    isMinor
                      ? "Parent or guardian: type your full name to sign"
                      : "Type your full name to sign"
                  }
                  required
                >
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={form.signature_text}
                    onChange={(e) => set("signature_text", e.target.value)}
                    className={`${inputCls} font-serif italic text-[20px]`}
                    placeholder={signerName || "Your full legal name"}
                    autoComplete="off"
                  />
                  {form.signature_text.length > 0 && !sigMatches && (
                    <Hint>
                      {isMinor
                        ? "Signature must match the parent or guardian's full legal name exactly."
                        : "Signature must match your full legal name exactly."}
                    </Hint>
                  )}
                </Field>

                <label className="flex items-start gap-2.5 cursor-pointer text-[13px] text-paper/75 select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-blue"
                  />
                  <span>
                    Remember my info on this device so I can RSVP faster next
                    time. Nothing leaves your browser.
                  </span>
                </label>

                <div className="text-[13px] text-paper/60">
                  Signing date:{" "}
                  <span className="text-paper">{TODAY_ISO()}</span>
                </div>

                {error && (
                  <div
                    className="border border-blue bg-blue/10 px-4 py-3 text-[14px] text-paper"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                )}
              </StepBlock>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-paper/15">
              <button
                type="button"
                onClick={() => setStep((s) => (s > 0 ? ((s - 1) as 0 | 1 | 2) : s))}
                disabled={step === 0}
                className="text-[13px] font-bold tracking-[0.1em] uppercase px-4 py-3 border border-paper/30 text-paper hover:bg-paper hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {step < 2 ? (
                <button
                  type="button"
                  onClick={() =>
                    setStep((s) => ((s + 1) as 0 | 1 | 2))
                  }
                  disabled={step === 0 ? !step1Valid : !step2Valid}
                  className="text-[13px] font-bold tracking-[0.1em] uppercase px-6 py-3 bg-blue text-ink hover:bg-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="text-[13px] font-bold tracking-[0.1em] uppercase px-6 py-3 bg-blue text-ink hover:bg-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {submitting ? "Signing…" : "Sign the 2026 waiver"}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function SignedView({ record }: { record: SignedRecord }) {
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const W = doc.internal.pageSize.getWidth();
      let y = 56;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(58, 124, 165);
      doc.text("GRYT RUN CLUB · 2026 SEASON", 48, y);

      y += 28;
      doc.setFontSize(22);
      doc.setTextColor(10, 10, 10);
      doc.text("Waiver signed.", 48, y);

      y += 22;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(58, 58, 58);
      doc.text(
        doc.splitTextToSize(
          "This document confirms that the signer below executed the gryt run club release of liability, assumption of risk, and indemnity agreement for the 2026 season. One signature provides coverage through December 31, 2026.",
          W - 96,
        ),
        48,
        y,
      );

      y += 70;
      doc.setDrawColor(10, 10, 10);
      doc.setLineWidth(1.2);
      doc.rect(48, y, W - 96, 132 + (record.guardian ? 20 : 0));

      const rowY = (i: number) => y + 22 + i * 20;
      const writeRow = (i: number, label: string, val: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(106, 102, 92);
        doc.text(label.toUpperCase(), 64, rowY(i));
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(10, 10, 10);
        doc.text(val, 180, rowY(i));
      };
      writeRow(0, "Runner", record.name);
      let r = 1;
      if (record.guardian) {
        writeRow(r++, "Signed by guardian", record.guardian);
      }
      writeRow(r++, "Signed on", record.signed_on);
      writeRow(r++, "Coverage", "Through Dec 31, 2026");
      writeRow(r++, "Confirmation", record.id);
      writeRow(r++, "Version", "gryt-run-club-2026-v1");

      y += 160 + (record.guardian ? 20 : 0);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(
        doc.splitTextToSize(
          "Electronic signature has the same legal effect as a handwritten signature. The full waiver text is available at grytrunclub.com/waiver.",
          W - 96,
        ),
        48,
        y,
      );

      y += 48;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(10, 10, 10);
      doc.text("DO HARD THINGS TOGETHER.", 48, y);

      doc.save(`gryt-waiver-2026-${record.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink text-paper">
      <PageHeader />
      <section className="px-6 sm:px-12 lg:px-24 py-20 md:py-28">
        <div className="max-w-[760px] mx-auto">
          <div className="eyebrow eyebrow-blue mb-4">Signed · 2026 season</div>
          <h1
            className="display-condensed text-paper text-[clamp(44px,6vw,92px)] leading-[0.92] mb-6"
            aria-live="polite"
          >
            Waiver signed —<br />
            <span className="text-blue">
              you're covered through Dec 31, 2026.
            </span>
          </h1>
          <p className="text-lg text-paper/80 mb-10 max-w-[560px]">
            Nice work, {record.name.split(" ")[0]}. One signature covers you
            for the whole 2026 season. We just emailed your confirmation —
            check your inbox (and spam, just in case).
          </p>
          <div className="border border-paper/20 p-6 md:p-8 bg-ink/40 mb-10 text-[14px] font-mono text-paper/70 flex flex-col gap-1.5">
            <div>
              <span className="text-paper/40">Runner:</span> {record.name}
            </div>
            {record.guardian && (
              <div>
                <span className="text-paper/40">Signed by guardian:</span>{" "}
                {record.guardian}
              </div>
            )}
            <div>
              <span className="text-paper/40">Signed on:</span> {record.signed_on}
            </div>
            <div>
              <span className="text-paper/40">Confirmation:</span> {record.id}
            </div>
            <div>
              <span className="text-paper/40">Version:</span> gryt-run-club-2026-v1
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 bg-blue text-ink hover:bg-paper transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Back to the run
            </Link>
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 border border-paper/30 text-paper hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {downloading ? "Preparing…" : "Download PDF copy"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 border border-paper/20 text-paper/70 hover:bg-paper hover:text-ink transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Print
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function PageHeader() {
  return (
    <header className="px-6 sm:px-12 lg:px-24 py-6 border-b border-paper/15">
      <Link to="/" className="inline-flex items-center gap-2 group">
        <img src={grytBearAsset.url} alt="" className="h-9 w-9" width={36} height={36} />
        <span
          className="wordmark uppercase text-[18px] leading-none text-paper"
          style={{ textShadow: "2px 2px 0 var(--blue)" }}
        >
          Run Club
        </span>
      </Link>
    </header>
  );
}

function Stepper({ step }: { step: 0 | 1 | 2 }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-[11px] tracking-[0.14em] uppercase font-bold">
        <span className="text-paper/60">
          Step {step + 1} of {STEPS.length}
        </span>
        <span className="text-blue">{STEPS[step]}</span>
      </div>
      <div className="h-1.5 bg-paper/15 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-blue transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[10px] tracking-[0.12em] uppercase text-paper/40">
        {STEPS.map((s, i) => (
          <span key={s} className={i <= step ? "text-paper/80" : ""}>
            {String(i + 1).padStart(2, "0")} · {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="display-condensed text-paper text-[24px] leading-tight">
          {title}
        </h2>
        <p className="text-[13px] text-paper/65 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function WaiverText() {
  return (
    <article className="border border-paper/15 p-6 md:p-9 bg-ink/40 text-paper/85">
      <h2 className="display-condensed text-paper text-[26px] mb-2">
        Release of liability, assumption of risk, and indemnity agreement
      </h2>
      <p className="text-[12px] tracking-[0.14em] uppercase text-paper/50 mb-6">
        gryt run club · 2026 season · v1
      </p>
      <div className="flex flex-col gap-5 text-[15px] leading-[1.7]">
        <p>
          In consideration of being permitted to participate in any activity
          organized by <strong>gryt run club</strong> ("the Club"), including
          but not limited to group runs, training sessions, social meetups,
          trail outings, and any related travel or gatherings (collectively,
          "Activities"), I, the undersigned, acknowledge and agree to the
          following on my own behalf and on behalf of my heirs, executors,
          administrators, and assigns.
        </p>
        <Clause n="1. Assumption of risk">
          I understand that running, walking, and related physical activity
          involve inherent risks, including but not limited to: falls, contact
          with other participants, the effects of weather and temperature,
          traffic, road and trail conditions, equipment failure, and the
          actions of other people. I expressly assume all such risks, known
          and unknown, and accept full responsibility for any injury, illness,
          death, or property loss that may result.
        </Clause>
        <Clause n="2. Physical condition">
          I represent that I am physically able to participate in the
          Activities and have no medical condition that would prevent safe
          participation. I have been advised to consult a physician before
          beginning any new exercise program, and I take responsibility for
          doing so. If I become aware of any condition that affects my ability
          to participate safely, I will stop and seek appropriate care.
        </Clause>
        <Clause n="3. Release and waiver">
          I hereby <strong>release, waive, discharge, and covenant not to sue</strong>{" "}
          the Club, its founders, organizers, volunteers, members, sponsors,
          and any landowner whose property is used for an Activity
          (collectively, "Released Parties") from any and all liability,
          claims, demands, actions, and causes of action arising out of or
          related to any loss, damage, or injury sustained while participating
          in the Activities, whether caused by the negligence of the Released
          Parties or otherwise, to the fullest extent permitted by law.
        </Clause>
        <Clause n="4. Indemnification">
          I agree to indemnify and hold harmless the Released Parties from any
          loss, liability, damage, or cost they may incur due to my
          participation, whether caused by my negligence or otherwise.
        </Clause>
        <Clause n="5. Medical authorization">
          I authorize the Club to seek emergency medical care on my behalf if
          I am unable to do so. I acknowledge that I am responsible for any
          medical expenses incurred.
        </Clause>
        <Clause n="6. Photo and media release">
          I grant the Club permission to use photographs, video, or audio
          recordings of me taken during the Activities for promotional or
          educational purposes, without compensation. I may revoke this
          permission in writing at any time, after which the Club will use
          reasonable efforts to discontinue future use of identifying media.
        </Clause>
        <Clause n="7. Minors and guardians">
          Runners under the age of 18 are welcome. A parent or legal guardian
          must complete and sign this waiver on the minor's behalf, naming the
          minor as the participant and stating their own relationship to the
          minor. By signing, the parent or legal guardian agrees to every term
          above on the minor's behalf and on their own, confirms they are 18 or
          older, and agrees to accompany the minor at Activities or arrange for
          another responsible adult to do so. A minor may not sign this
          agreement for themselves.
        </Clause>
        <Clause n="8. Term and governing law">
          This agreement is effective from the date of signing through{" "}
          <strong>December 31, 2026</strong>. It is governed by the laws of
          the Commonwealth of Pennsylvania. If any provision is held
          unenforceable, the remainder shall remain in full force.
        </Clause>
        <p className="text-paper/70 italic">
          By typing my name as a signature, I confirm that I have read,
          understood, and agree to this waiver, and that my electronic
          signature has the same legal effect as a handwritten signature.
        </p>
      </div>
    </article>
  );
}

function Clause({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="display-condensed text-paper text-[18px] mb-1.5">{n}</h3>
      <p>{children}</p>
    </div>
  );
}

const inputCls =
  "w-full bg-ink border border-paper/25 px-3.5 py-2.5 text-paper text-[15px] focus:outline-none focus:border-blue focus:bg-ink";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-paper/70">
        {label}
        {required && <span className="text-blue"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-[13px] text-blue font-semibold">{children}</p>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-blue cursor-pointer"
      />
      <span className="text-[14px] leading-[1.5] text-paper/85 group-hover:text-paper">
        {label}
      </span>
    </label>
  );
}
