import { useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { SiteNav, SiteFooter } from "@/components/site/Chrome";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createTestCheckout, cancelTestCheckout } from "@/lib/test-payments.functions";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { usd } from "@/lib/test-payment-rules";
import crew from "@/assets/photos/manifesto/crew-trail.jpg.asset.json";

export function PaymentFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <SiteNav />
      <div className="border-y border-blue bg-blue px-5 py-3 text-center text-sm font-semibold text-ink">
        TEST PAYMENTS ONLY. No real money is charged.
      </div>
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <p className="eyebrow text-blue">GRYT · OPTIONAL PAYMENTS</p>
        <h1 className="my-5 font-condensed text-5xl font-bold uppercase leading-tight sm:text-6xl">
          {title}
        </h1>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
export function TestPaymentForm({
  type,
  itemId,
  token,
  amount = 3000,
  remaining = 10,
}: {
  type: "support" | "merch" | "ticket" | "partner";
  itemId?: string;
  token?: string;
  amount?: number;
  remaining?: number;
}) {
  const create = useServerFn(createTestCheckout);
  const cancel = useServerFn(cancelTestCheckout);
  const [cents, setCents] = useState(2500);
  const [monthly, setMonthly] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  useEffect(() => setReady(true), []);
  const [fulfillment, setFulfillment] = useState<"shipping" | "pickup">("pickup");
  const [quantity, setQuantity] = useState(1);
  const inputClass =
    "mt-2 min-h-12 w-full border border-paper/40 bg-ink px-3 text-base text-paper focus-visible:outline-2 focus-visible:outline-blue";
  if (clientSecret)
    return (
      <section aria-label="Stripe test checkout" className="mt-8">
        <Button
          disabled={busy}
          variant="outline"
          className="mb-5 min-h-12 border-paper/40"
          onClick={async () => {
            setBusy(true);
            try {
              if (!sessionId) throw new Error("Checkout is unavailable.");
              const result = await cancel({ data: { clientSecret, sessionId } });
              if ("error" in result) throw new Error(result.error);
              setClientSecret(undefined);
              setError("Checkout cancelled. No payment was made.");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not cancel checkout.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Cancel and return
        </Button>
        {error && (
          <p role="alert" className="mb-5 text-blue">
            {error}
          </p>
        )}
        <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </section>
    );
  return (
    <form
      ref={formRef}
      method="post"
      aria-busy={busy || !ready}
      className="mt-8 max-w-xl space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!ready || submitting.current) return;
        submitting.current = true;
        setError("");
        setBusy(true);
        const fields = new FormData(event.currentTarget);
        try {
          if (getStripeEnvironment() !== "sandbox")
            throw new Error("These pages accept test payments only. Live checkout is disabled.");
          const stripe = await getStripe();
          if (!stripe) throw new Error("Stripe could not load. Please retry.");
          const result = await create({
            data: {
              type,
              environment: "sandbox",
              amount: type === "support" ? cents : amount,
              monthly,
              itemId,
              token,
              quantity,
              fulfillment,
              email: String(fields.get("email")),
              name: String(fields.get("name")),
            },
          });
          if ("error" in result && result.error) throw new Error(result.error);
          if (!result.clientSecret) throw new Error("Checkout did not return a payment form.");
          setClientSecret(result.clientSecret);
          setSessionId(result.sessionId);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Checkout could not start.");
        } finally {
          submitting.current = false;
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={!ready || busy} className="space-y-6">
      {type === "support" && (
        <>
          <fieldset>
            <legend className="font-semibold">Choose your support</legend>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[1000, 2500, 5000].map((value) => (
                <Button
                  type="button"
                  key={value}
                  aria-pressed={cents === value}
                  variant={cents === value ? "default" : "outline"}
                  className="min-h-14 border-paper/40 text-lg"
                  onClick={() => setCents(value)}
                >
                  {usd(value)}
                </Button>
              ))}
            </div>
            <label className="mt-5 block">
              Custom amount (USD)
              <input
                aria-label="Custom amount (USD)"
                className={inputClass}
                type="number"
                min="5"
                max="1000"
                step="0.01"
                value={cents / 100}
                onChange={(e) => setCents(Math.round(Number(e.target.value) * 100))}
                required
              />
            </label>
            <p className="mt-2 text-sm text-paper/70">$5 minimum · $1,000 maximum</p>
          </fieldset>
          <div className="flex min-h-12 items-center gap-4">
            <Switch
              id="monthly"
              className="border-paper/60 data-[state=unchecked]:bg-paper/30"
              checked={monthly}
              onCheckedChange={setMonthly}
            />
            <label htmlFor="monthly">Make it monthly</label>
          </div>
          {monthly && (
            <p className="text-sm text-paper/75">
              {usd(cents)} each month. To stop future support, contact nick@gryt.club.
            </p>
          )}
        </>
      )}
      <label className="block">
        {type === "ticket" ? "Attendee name" : "Full name"}
        <input className={inputClass} name="name" autoComplete="name" maxLength={120} required />
      </label>
      <label className="block">
        Email
        <input
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>
      {(type === "merch" || type === "ticket") && (
        <label className="block">
          Quantity
          <input
            className={inputClass}
            aria-label="Quantity"
            type="number"
            min={1}
            max={Math.min(10, remaining)}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </label>
      )}
      {type === "merch" && (
        <fieldset>
          <legend className="font-semibold">Delivery</legend>
          {(["pickup", "shipping"] as const).map((value) => (
            <label
              key={value}
              className="mt-3 flex min-h-12 items-center gap-3 border border-paper/30 px-4"
            >
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillment === value}
                onChange={() => setFulfillment(value)}
                className="size-5 accent-blue"
              />
              {value === "pickup" ? "Pick up at Saturday run · Free" : "US shipping · Free"}
            </label>
          ))}
          <p className="mt-2 text-sm text-paper/70">
            Shipping is US only. Applicable tax is calculated in Checkout.
          </p>
        </fieldset>
      )}
      </fieldset>
      {error && (
        <p role="alert" className="border-l-4 border-blue py-3 pl-4 text-blue">
          {error}
        </p>
      )}
      <Button
        type="button"
        disabled={!ready || busy || remaining === 0}
        onClick={() => formRef.current?.requestSubmit()}
        className="min-h-14 w-full text-base uppercase"
      >
        {!ready
          ? "Loading payment form..."
          : busy
          ? "Opening test checkout..."
          : remaining === 0
            ? "Sold out"
            : `${monthly && type === "support" ? "Subscribe" : "Continue"} · ${usd((type === "support" ? cents : amount) * quantity)}${monthly && type === "support" ? " / month" : ""}`}
      </Button>
      {busy && <p role="status" className="text-sm text-paper/85">Opening secure Stripe test checkout...</p>}
      <p className="text-sm text-paper/70">
        Saturday runs are always free. This payment is separate from RSVP and the waiver.
      </p>
    </form>
  );
}
export function SupportPage() {
  return (
    <PaymentFrame title="Support GRYT">
      <p className="max-w-xl text-lg text-paper/85">
        Runs are always free. Optional support helps cover permits, insurance, water and coffee.
      </p>
      <img
        src={crew.url}
        alt="The real GRYT crew together on the trail"
        className="mt-7 h-56 w-full object-cover sm:h-72"
      />
      <TestPaymentForm type="support" />
    </PaymentFrame>
  );
}
