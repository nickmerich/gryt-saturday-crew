import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import {
  checkoutInput,
  hatCheckoutOptions,
  partnerMethods,
  paymentEnvironment,
  environmentFromToken,
  sessionEnvironment,
} from "@/lib/test-payment-rules";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isAdminEmail } from "@/lib/admin/allowlist";

function buildEnvironment() {
  return environmentFromToken(import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN);
}

async function hashToken(token: string) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
export const getTestCatalog = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().max(120).default("") }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const db = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_")) headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const result = await db.rpc("gryt_payment_catalog", {
      event_slug: data.slug,
      payment_env: buildEnvironment(),
    });
    if (result.error) throw new Error("Payment catalog could not load. Please try again.");
    return result.data as unknown as {
      products: Array<{
        id: string;
        name: string;
        sku: string;
        amount_cents: number;
        description: string;
      }>;
      event: null | {
        id: string;
        slug: string;
        name: string;
        event_date: string;
        location: string;
        amount_cents: number;
        capacity: number;
        remaining: number;
      };
    };
  });

export const getTestPackage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).parse(input),
  )
  .handler(async ({ data }) => {
    // The high-entropy capability token authorizes this exact package only.
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const result = await db
      .from("gryt_partner_packages")
      .select("id,partner_name,name,amount_cents,description")
      .eq("environment", buildEnvironment())
      .eq("token_hash", await hashToken(data.token))
      .eq("active", true)
      .maybeSingle();
    if (result.error) throw new Error("Package could not load.");
    return result.data;
  });

// Verbatim customer resolution branches: searchable user metadata, legacy email, then create.
async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    const customer = found.data[0];
    if (customer) return customer.id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (options.userId && customer.metadata?.userId !== options.userId)
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      return customer.id;
    }
  }
  return (
    await stripe.customers.create({
      ...(options.email && { email: options.email }),
      ...(options.userId && { metadata: { userId: options.userId } }),
    })
  ).id;
}

export const createTestCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutInput.parse(input))
  .handler(async ({ data }) => {
    let orderId: string | undefined;
    try {
      const environment = buildEnvironment();
      const stripe = createStripeClient(environment);
      if (data.environment !== environment)
        throw new Error("Checkout environment does not match this build.");
      const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
      let item = "Support GRYT",
        cents = data.amount,
        itemId: string | undefined,
        returnPath = "/support";
      const quantity = data.type === "ticket" || data.type === "merch" ? data.quantity : 1;
      if (data.type === "merch") {
        const row = await db
          .from("gryt_payment_products")
          .select("*")
          .eq("id", data.itemId || "")
          .eq("active", true)
          .single();
        if (!row.data) throw new Error("Product is unavailable.");
        item = row.data.name;
        cents = row.data.amount_cents;
        itemId = row.data.id;
        returnPath = "/shop/checkout";
      } else if (data.type === "ticket") {
        if (!data.name.trim()) throw new Error("Attendee name is required.");
        const row = await db
          .from("gryt_ticket_events")
          .select("*")
          .eq("environment", environment)
          .eq("id", data.itemId || "")
          .eq("active", true)
          .single();
        if (!row.data || /saturday|weekly-run/i.test(row.data.slug))
          throw new Error("Event is unavailable. Saturday runs are always free.");
        item = row.data.name;
        cents = row.data.amount_cents;
        itemId = row.data.id;
        returnPath = `/events/${row.data.slug}`;
      } else if (data.type === "partner") {
        if (!data.token) throw new Error("Private package link is required.");
        const row = await db
          .from("gryt_partner_packages")
          .select("*")
          .eq("environment", buildEnvironment())
          .eq("token_hash", await hashToken(data.token))
          .eq("active", true)
          .single();
        if (!row.data) throw new Error("Package is unavailable.");
        item = row.data.name;
        cents = row.data.amount_cents;
        itemId = row.data.id;
        returnPath = `/partners/pay?token=${data.token}`;
      }
      const reserved = await db.rpc("gryt_reserve_payment_order", {
        payload: {
          environment,
          type: data.type,
          item_id: itemId || "",
          item,
          amount_cents: cents * quantity,
          quantity,
          email: data.email,
          attendee_name: data.name,
          fulfillment: data.type === "merch" ? data.fulfillment : "",
          monthly: data.type === "support" && data.monthly,
          return_path: returnPath,
        },
      });
      if (reserved.error || !reserved.data)
        throw new Error(reserved.error?.message || "Could not reserve checkout.");
      orderId = reserved.data;
      const request = getRequest();
      const origin = new URL(request.url).origin;
      // Identity is optional. Never accept user IDs from checkout input.
      let userId: string | undefined;
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const client = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          { auth: { persistSession: false } },
        );
        const verified = await client.auth.getUser(authHeader.slice(7));
        userId = verified.data.user?.id;
      }
      const customer = await resolveOrCreateCustomer(stripe, { email: data.email, userId });
      const recurring = data.type === "support" && data.monthly;
      const metadata = { orderId, type: data.type, ...(userId && { userId }) };
      let catalogPrice: string | undefined;
      const lookup =
        data.type === "merch" && cents === 3000
          ? "gryt_founding_member_cap_30"
          : data.type === "support" && [1000, 2500, 5000].includes(cents)
            ? `gryt_support_${cents / 100}${recurring ? "_monthly" : ""}`
            : undefined;
      if (lookup) {
        const prices = await stripe.prices.list({ lookup_keys: [lookup], active: true, limit: 1 });
        catalogPrice = prices.data[0]?.id;
        if (!catalogPrice)
          throw new Error("Payment catalog is not synced yet. Please retry shortly.");
      }
      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded_page",
        mode: recurring ? "subscription" : "payment",
        customer,
        line_items: [
          {
            ...(catalogPrice
              ? { price: catalogPrice }
              : {
                  price_data: {
                    currency: "usd",
                    product_data: {
                      name: item,
                      ...(data.type === "merch" && { tax_code: "txcd_20030000" }),
                    },
                    unit_amount: cents,
                    ...(recurring && { recurring: { interval: "month" } }),
                  },
                }),
            quantity,
          },
        ],
        return_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        metadata,
        payment_method_types: data.type === "partner" ? partnerMethods(cents) : ["card"],
        adaptive_pricing: { enabled: false },
        ...(recurring
          ? { subscription_data: { metadata } }
          : {
              payment_intent_data: {
                description: item,
                receipt_email: data.email,
                ...(data.type === "partner" &&
                  cents > 100000 && { statement_descriptor: "GRYT RUN CLUB" }),
              },
            }),
        ...(data.type === "merch" && hatCheckoutOptions(data.fulfillment)),
      });
      if (session.livemode !== (environment === "live") || !session.client_secret)
        throw new Error("Checkout was not created in the expected environment.");
      const saved = await db
        .from("gryt_payment_orders")
        .update({
          stripe_session_id: session.id,
          stripe_customer_id: customer,
          stripe_subscription_id:
            typeof session.subscription === "string" ? session.subscription : null,
        })
        .eq("id", orderId);
      if (saved.error) {
        await stripe.checkout.sessions.expire(session.id);
        throw new Error("Checkout was not saved. Please retry.");
      }
      return { clientSecret: session.client_secret, sessionId: session.id };
    } catch (error) {
      if (orderId) {
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        await db
          .from("gryt_payment_orders")
          .update({ status: "failed" })
          .eq("id", orderId)
          .eq("status", "reserved");
      }
      return { error: getStripeErrorMessage(error) };
    }
  });

export const cancelTestCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        clientSecret: z.string().min(20).max(1000),
        sessionId: z
          .string()
          .regex(/^cs_(test|live)_[A-Za-z0-9_]+$/)
          .max(240),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const environment = sessionEnvironment(data.sessionId);
      const stripe = createStripeClient(environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      if (
        session.client_secret !== data.clientSecret ||
        session.livemode !== (environment === "live") ||
        session.status !== "open"
      )
        throw new Error("Checkout is already completed or expired.");
      await stripe.checkout.sessions.expire(session.id);
      const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
      const result = await db
        .from("gryt_payment_orders")
        .update({ status: "expired" })
        .eq("stripe_session_id", session.id)
        .eq("environment", sessionEnvironment(session.id))
        .eq("status", "reserved");
      if (result.error) throw new Error("Reservation could not be released.");
      return { ok: true };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const readTestResult = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        sessionId: z
          .string()
          .regex(/^cs_(test|live)_[A-Za-z0-9_]+$/)
          .max(240),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const session = await createStripeClient(
        sessionEnvironment(data.sessionId),
      ).checkout.sessions.retrieve(data.sessionId);
      const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
      const order = await db
        .from("gryt_payment_orders")
        .select("return_path,status")
        .eq("stripe_session_id", session.id)
        .eq("environment", sessionEnvironment(session.id))
        .maybeSingle();
      return {
        status:
          session.status === "complete"
            ? session.payment_status === "unpaid"
              ? "pending"
              : "paid"
            : session.status,
        returnPath: order.data?.return_path || "/support",
        recorded: order.data?.status === "paid",
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

const productSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1).max(120),
  sku: z.string().min(1).max(80),
  amount_cents: z.number().int().min(500).max(10000000),
  description: z.string().max(2000),
  active: z.boolean(),
});
const eventSchema = z.object({
  id: z.uuid().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(120)
    .refine((s) => !/saturday|weekly-run/i.test(s), "Saturday runs stay free."),
  name: z.string().min(1).max(120),
  event_date: z.string().datetime(),
  location: z.string().min(1).max(300),
  amount_cents: z.number().int().min(500).max(10000000),
  capacity: z.number().int().min(1).max(100000),
  active: z.boolean(),
});
export const manageTestPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .discriminatedUnion("action", [
        z.object({ action: z.literal("list") }),
        z.object({ action: z.literal("product"), record: productSchema }),
        z.object({ action: z.literal("event"), record: eventSchema }),
        z.object({
          action: z.literal("package"),
          record: z.object({
            partner_name: z.string().min(1).max(120),
            name: z.string().min(1).max(120),
            amount_cents: z.number().int().min(500).max(10000000),
            description: z.string().max(2000),
          }),
        }),
        z.object({ action: z.literal("cancel-monthly"), orderId: z.uuid() }),
        z.object({ action: z.literal("expire-package"), packageId: z.uuid() }),
      ])
      .and(z.object({ environment: paymentEnvironment }))
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const verified = await context.supabase.auth.getUser();
    if (!verified.data.user?.email_confirmed_at || !isAdminEmail(verified.data.user.email))
      throw new Error("Admin access required.");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    if (data.action === "list") {
      const [payments, products, events, packages, orders] = await Promise.all([
        db
          .from("payments")
          .select("*")
          .eq("environment", data.environment)
          .order("created_at", { ascending: false })
          .limit(500),
        db.from("gryt_payment_products").select("*"),
        db.from("gryt_ticket_events").select("*").eq("environment", data.environment),
        db
          .from("gryt_partner_packages")
          .select("id,partner_name,name,amount_cents,description,active")
          .eq("environment", data.environment),
        db
          .from("gryt_payment_orders")
          .select("id,item,email,monthly,status,stripe_subscription_id")
          .eq("environment", data.environment)
          .eq("monthly", true),
      ]);
      if ([payments, products, events, packages, orders].some((r) => r.error))
        throw new Error("Payment desk could not load.");
      return {
        payments: payments.data || [],
        products: products.data || [],
        events: events.data || [],
        packages: packages.data || [],
        orders: orders.data || [],
        link: "",
      };
    }
    if (data.action === "expire-package") {
      const result = await db
        .from("gryt_partner_packages")
        .update({ active: false })
        .eq("id", data.packageId)
        .eq("environment", data.environment);
      if (result.error) throw new Error("Private link could not be expired.");
      return { link: "", message: "Private link expired." };
    }
    if (data.action === "cancel-monthly") {
      try {
        const order = await db
          .from("gryt_payment_orders")
          .select("stripe_subscription_id")
          .eq("id", data.orderId)
          .eq("environment", data.environment)
          .eq("monthly", true)
          .single();
        if (!order.data?.stripe_subscription_id)
          throw new Error("Monthly subscription is not available.");
        await createStripeClient(data.environment).subscriptions.update(
          order.data.stripe_subscription_id,
          { cancel_at_period_end: true },
        );
        return { link: "", message: "Monthly support will stop at the end of this paid period." };
      } catch (error) {
        return { error: getStripeErrorMessage(error) };
      }
    }
    if (data.action === "package") {
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      const result = await db
        .from("gryt_partner_packages")
        .insert({
          ...data.record,
          environment: data.environment,
          token_hash: await hashToken(token),
        });
      if (result.error) throw new Error("Package was not saved.");
      return { link: `/partners/pay?token=${token}` };
    }
    let result;
    if (data.action === "product") {
      const { id, ...fields } = data.record;
      result = id
        ? await db.from("gryt_payment_products").update(fields).eq("id", id)
        : await db.from("gryt_payment_products").insert(fields);
    } else {
      const { id, ...fields } = data.record;
      result = id
        ? await db
            .from("gryt_ticket_events")
            .update(fields)
            .eq("id", id)
            .eq("environment", data.environment)
        : await db.from("gryt_ticket_events").insert({ ...fields, environment: data.environment });
    }
    if (result.error) throw new Error("Record was not saved. Check the unique SKU or slug.");
    return { link: "" };
  });
