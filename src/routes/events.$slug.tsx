import { createFileRoute } from "@tanstack/react-router";
import { PaymentFrame, TestPaymentForm } from "@/components/payments/TestPaymentPage";
import { getTestCatalog } from "@/lib/test-payments.functions";
import { paymentHead, usd } from "@/lib/test-payment-rules";
export const Route = createFileRoute("/events/$slug")({
  head: () => paymentHead("Event tickets", "Separate GRYT event tickets. Saturday runs stay free."),
  loader: ({ params }) => getTestCatalog({ data: { slug: params.slug } }),
  component: Page,
});
function Page() {
  const { event } = Route.useLoaderData();
  if (!event)
    return (
      <PaymentFrame title="Event unavailable">
        <p>No active event is listed here. Saturday runs remain free.</p>
      </PaymentFrame>
    );
  return (
    <PaymentFrame title={event.name}>
      <p className="text-lg">
        {new Date(event.event_date).toLocaleString("en-US", { timeZone: "America/New_York" })}{" "}
        Eastern
      </p>
      <p className="mt-2">{event.location}</p>
      <p className="mt-4 text-xl text-foreground">
        {usd(event.amount_cents)} per ticket · {event.remaining} remaining
      </p>
      <TestPaymentForm
        type="ticket"
        itemId={event.id}
        amount={event.amount_cents}
        remaining={event.remaining}
      />
    </PaymentFrame>
  );
}
