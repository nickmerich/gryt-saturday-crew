import { createFileRoute, Link, useServerFn } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
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
        content:
          "Read it, sign it once, you're good through Dec 31, 2026.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WaiverPage,
});

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

function WaiverPage() {
  const sign = useServerFn(signWaiver);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; signed_on: string; name: string } | null>(
    null,
  );

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    signature_text: "",
    agree_release: false,
    agree_fitness: false,
    agree_adult: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

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
  const sigMatches =
    form.signature_text.trim().length > 0 &&
    form.signature_text.trim().toLowerCase() === form.full_name.trim().toLowerCase();

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
          agree_release: form.agree_release as true,
          agree_fitness: form.agree_fitness as true,
          agree_adult: form.agree_adult as true,
        },
      });
      setDone({ id: res.id, signed_on: res.signed_on, name: form.full_name.trim() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-ink text-paper">
        <header className="px-6 sm:px-12 lg:px-24 py-6 border-b border-paper/15">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <img src={grytBearAsset.url} alt="" className="h-9 w-9" />
            <span
              className="wordmark uppercase text-[18px] leading-none text-paper"
              style={{ textShadow: "2px 2px 0 var(--blue)" }}
            >
              Run Club
            </span>
          </Link>
        </header>
        <section className="px-6 sm:px-12 lg:px-24 py-20 md:py-28">
          <div className="max-w-[760px] mx-auto">
            <div className="eyebrow eyebrow-blue mb-4">Signed · 2026 season</div>
            <h1 className="display-condensed text-paper text-[clamp(44px,6vw,92px)] leading-[0.92] mb-6">
              You're in, {done.name.split(" ")[0]}.<br />
              <span className="text-blue">See you Saturday.</span>
            </h1>
            <p className="text-lg text-paper/80 mb-10 max-w-[560px]">
              Your 2026 waiver is on file. One signature covers you for the whole season —
              you don't need to do this again until January 2027.
            </p>
            <div className="border border-paper/20 p-6 md:p-8 bg-ink/40 mb-10 text-[14px] font-mono text-paper/70 flex flex-col gap-1.5">
              <div>
                <span className="text-paper/40">Signer:</span> {done.name}
              </div>
              <div>
                <span className="text-paper/40">Signed on:</span> {done.signed_on}
              </div>
              <div>
                <span className="text-paper/40">Confirmation:</span> {done.id}
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
                onClick={() => window.print()}
                className="inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 border border-paper/30 text-paper hover:bg-paper hover:text-ink transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Print confirmation
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink text-paper">
      <header className="px-6 sm:px-12 lg:px-24 py-6 border-b border-paper/15">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={grytBearAsset.url} alt="" className="h-9 w-9" />
          <span
            className="wordmark uppercase text-[18px] leading-none text-paper"
            style={{ textShadow: "2px 2px 0 var(--blue)" }}
          >
            Run Club
          </span>
        </Link>
      </header>

      <section className="px-6 sm:px-12 lg:px-24 pt-16 md:pt-24 pb-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="eyebrow eyebrow-blue mb-4">2026 season</div>
          <h1 className="display-condensed text-paper text-[clamp(46px,7vw,104px)] leading-[0.9] mb-5">
            Run club waiver.
          </h1>
          <p className="text-lg text-paper/80 max-w-[620px]">
            Read it. Sign it once. You're good through December 31, 2026.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-12 lg:px-24 pb-24">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-start">
          {/* Waiver text */}
          <article className="border border-paper/15 p-7 md:p-10 bg-ink/40 text-paper/85">
            <h2 className="display-condensed text-paper text-[28px] mb-2">
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

              <div>
                <h3 className="display-condensed text-paper text-[18px] mb-1.5">
                  1. Assumption of risk
                </h3>
                <p>
                  I understand that running, walking, and related physical activity
                  involve inherent risks, including but not limited to: falls,
                  contact with other participants, the effects of weather and
                  temperature, traffic, road and trail conditions, equipment
                  failure, and the actions of other people. I expressly assume all
                  such risks, known and unknown, and accept full responsibility for
                  any injury, illness, death, or property loss that may result.
                </p>
              </div>

              <div>
                <h3 className="display-condensed text-paper text-[18px] mb-1.5">
                  2. Physical condition
                </h3>
                <p>
                  I represent that I am physically able to participate in the
                  Activities and have no medical condition that would prevent safe
                  participation. I have been advised to consult a physician before
                  beginning any new exercise program, and I take responsibility
                  for doing so. If I become aware of any condition that affects my
                  ability to participate safely, I will stop and seek appropriate
                  care.
                </p>
              </div>

              <div>
                <h3 className="display-condensed text-paper text-[18px] mb-1.5">
                  3. Release and waiver
                </h3>
                <p>
                  I hereby <strong>release, waive, discharge, and covenant not to sue</strong>{" "}
                  the Club, its founders, organizers, volunteers, members, sponsors,
                  and any landowner whose property is used for an Activity
                  (collectively, "Released Parties") from any and all liability,
                  claims, demands, actions, and causes of action arising out of or
                  related to any loss, damage, or injury sustained while
                  participating in the Activities, whether caused by the negligence
                  of the Released Parties or otherwise, to the fullest extent
                  permitted by law.
                </p>
              </div>

              <div>
                <h3 className="display-condensed text-paper text-[18px] mb-1.5">
                  4. Indemnification
                </h3>
                <p>
                  I agree to indemnify and hold harmless the Released Parties from
                  any loss, liability, damage, or cost they may incur due to my
                  participation, whether caused by my negligence or otherwise.
                </p>
              </div>

              <div>
                <h3 className="display-condensed text-paper text-[18px] mb-1.5">
                  5. Medical authorization
                </h3>
                <p>
                  I authorize the Club to seek emergency medical care on my behalf
                  if I am unable to do so. I acknowledge that I am responsible for
                  any medical expenses incurred.
                </p>
              </div>

              <div>
                <h3 className="display-condensed text-paper text-[18px] mb-1.5">
                  6. Photo and media release
                </h3>
                <p>
                  I grant the Club permission to use photographs, video, or audio
                  recordings of me taken during the Activities for promotional or
                  educational purposes, without compensation. I may revoke this
                  permission in writing at any time, after which the Club will use
                  reasonable efforts to discontinue future use of identifying media.
                </p>
              </div>

              <div>
                <h3 className="display-condensed text-paper text-[18px] mb-1.5">
                  7. Minors
                </h3>
                <p>
                  Participants under the age of 18 must sign this waiver in person
                  together with a parent or legal guardian. The online form is for
                  adults 18+ only.
                </p>
              </div>

              <div>
                <h3 className="display-condensed text-paper text-[18px] mb-1.5">
                  8. Term and governing law
                </h3>
                <p>
                  This agreement is effective from the date of signing through{" "}
                  <strong>December 31, 2026</strong>. It is governed by the laws of
                  the Commonwealth of Pennsylvania. If any provision is held
                  unenforceable, the remainder shall remain in full force.
                </p>
              </div>

              <p className="text-paper/70 italic">
                By typing my name as a signature below, I confirm that I have read,
                understood, and agree to this waiver, and that my electronic
                signature has the same legal effect as a handwritten signature.
              </p>
            </div>
          </article>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="border-2 border-blue p-7 md:p-9 bg-blue/[0.08] flex flex-col gap-5 sticky top-6 self-start"
          >
            <div>
              <div className="eyebrow eyebrow-blue mb-2">Sign &amp; submit</div>
              <h2 className="display-condensed text-paper text-[26px] leading-tight">
                One signature. Whole 2026 season.
              </h2>
            </div>

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
                <p className="mt-1.5 text-[13px] text-blue font-semibold">
                  Minors must sign in person with a parent or guardian. We can't
                  accept this online.
                </p>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Emergency contact" required>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={form.emergency_contact_name}
                  onChange={(e) => set("emergency_contact_name", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Their phone" required>
                <input
                  type="tel"
                  required
                  maxLength={40}
                  value={form.emergency_contact_phone}
                  onChange={(e) => set("emergency_contact_phone", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-paper/15">
              <Check
                checked={form.agree_release}
                onChange={(v) => set("agree_release", v)}
                label="I have read and agree to the release of liability above."
              />
              <Check
                checked={form.agree_fitness}
                onChange={(v) => set("agree_fitness", v)}
                label="I am physically able to participate and have consulted a physician as needed."
              />
              <Check
                checked={form.agree_adult}
                onChange={(v) => set("agree_adult", v)}
                label="I am 18 years or older."
              />
            </div>

            <Field label="Type your full name to sign" required>
              <input
                type="text"
                required
                maxLength={120}
                value={form.signature_text}
                onChange={(e) => set("signature_text", e.target.value)}
                className={`${inputCls} font-serif italic text-[20px]`}
                placeholder={form.full_name || "Your full legal name"}
                autoComplete="off"
              />
              {form.signature_text.length > 0 && !sigMatches && (
                <p className="mt-1.5 text-[13px] text-blue font-semibold">
                  Signature must match your full legal name exactly.
                </p>
              )}
            </Field>

            <div className="text-[13px] text-paper/60">
              Signing date: <span className="text-paper">{TODAY_ISO()}</span>
            </div>

            {error && (
              <div className="border border-blue bg-blue/10 px-4 py-3 text-[14px] text-paper">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                isMinor ||
                !sigMatches ||
                !form.agree_release ||
                !form.agree_fitness ||
                !form.agree_adult
              }
              className="mt-1 inline-block text-sm font-bold tracking-[0.1em] uppercase px-7 py-4 bg-blue text-ink hover:bg-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {submitting ? "Signing…" : "Sign the 2026 waiver"}
            </button>
          </form>
        </div>
      </section>
    </main>
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
  children: React.ReactNode;
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
