import type Stripe from "stripe";

export async function recordTestPayment(event: Stripe.Event) {
  if (event.livemode) return;
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  if (event.type.startsWith("checkout.session.")) {
    const session = event.data.object as Stripe.Checkout.Session;
    const id = session.metadata?.["orderId"];
    if (!id || !/^[a-f0-9-]{36}$/.test(id)) return;
    const result = await db
      .from("gryt_payment_orders")
      .select("*")
      .eq("id", id)
      .eq("environment", "sandbox")
      .single();
    if (result.error || !result.data) throw new Error("Payment order not found.");
    const order = result.data;
    if (session.amount_subtotal !== order.amount_cents || session.currency !== "usd")
      throw new Error("Payment amount does not match the order.");
    const isPaid =
      event.type === "checkout.session.async_payment_succeeded" ||
      (event.type === "checkout.session.completed" && session.payment_status !== "unpaid");
    const status = isPaid
      ? "paid"
      : event.type === "checkout.session.expired"
        ? "expired"
        : event.type === "checkout.session.async_payment_failed"
          ? "failed"
          : "pending";
    // Never downgrade a paid order on a delayed/out-of-order delivery.
    if (order.status !== "paid") {
      const saved = await db
        .from("gryt_payment_orders")
        .update({
          status,
          stripe_session_id: session.id,
          stripe_subscription_id:
            typeof session.subscription === "string" ? session.subscription : null,
        })
        .eq("id", id);
      if (saved.error) throw new Error("Payment status was not saved.");
    }
    if (event.type !== "checkout.session.expired") {
      const payment = await db.from("payments").upsert(
        {
          type: order.type,
          amount: session.amount_total || 0,
          email: session.customer_details?.email || order.email,
          item: order.item,
          stripe_session_id: session.id,
          stripe_event_id: event.id,
          order_id: id,
          status: order.status === "paid" ? "paid" : status,
          environment: "sandbox",
        },
        { onConflict: "stripe_session_id", ignoreDuplicates: false },
      );
      if (payment.error) throw new Error("Payment receipt was not recorded.");
    }
  } else if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    // First subscription invoice is represented by its checkout session.
    if (invoice.billing_reason === "subscription_create") return;
    const id = invoice.parent?.subscription_details?.metadata?.["orderId"];
    if (!id) return;
    const order = await db
      .from("gryt_payment_orders")
      .select("*")
      .eq("id", id)
      .eq("monthly", true)
      .single();
    if (!order.data) throw new Error("Monthly support order not found.");
    const receipt = await db.from("payments").upsert(
      {
        type: "support",
        amount: invoice.amount_paid,
        email: order.data.email,
        item: order.data.item,
        stripe_invoice_id: invoice.id,
        stripe_event_id: event.id,
        order_id: id,
        status: "paid",
        environment: "sandbox",
      },
      { onConflict: "stripe_invoice_id", ignoreDuplicates: true },
    );
    if (receipt.error) throw new Error("Monthly receipt was not recorded.");
  }
}
