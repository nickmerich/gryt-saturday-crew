import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PaymentFrame } from "@/components/payments/TestPaymentPage";
import { Button } from "@/components/ui/button";
import { readTestResult } from "@/lib/test-payments.functions";
import { paymentHead } from "@/lib/test-payment-rules";
export const Route = createFileRoute("/thank-you")({
  head: () => paymentHead("Test payment result", "Your GRYT test payment status."),
  validateSearch: (search: Record<string, unknown>) => ({
    session_id:
      typeof search.session_id === "string" && /^cs_test_[A-Za-z0-9_]+$/.test(search.session_id)
        ? search.session_id
        : "",
  }),
  component: Page,
});
function Page() {
  const { session_id } = Route.useSearch();
  const read = useServerFn(readTestResult);
  const q = useQuery({
    queryKey: ["test-payment-result", session_id],
    queryFn: () => read({ data: { sessionId: session_id } }),
    enabled: Boolean(session_id),
    retry: false,
    refetchInterval: (query) =>
      query.state.data && "recorded" in query.state.data && !query.state.data.recorded
        ? 3000
        : false,
  });
  const result = q.data && !("error" in q.data) ? q.data : null;
  return (
    <PaymentFrame
      title={
        result?.status === "paid"
          ? "Thank you."
          : result?.status === "pending"
            ? "Payment pending."
            : "Test payment status"
      }
    >
      <div role="status" className="text-lg text-paper/85">
        {!session_id
          ? "No valid test checkout was provided."
          : q.isLoading
            ? "Checking your test payment..."
            : q.error || (q.data && "error" in q.data)
              ? "Payment status could not be confirmed. Contact nick@gryt.club."
              : result?.status === "paid"
                ? `Your test payment is confirmed.${result.recorded ? " Recorded in the payment desk." : " Waiting for the payment record to arrive."}`
                : result?.status === "pending"
                  ? "Your bank payment was submitted. It is not paid until funds settle."
                  : "Checkout was not completed. You can return and try again."}
      </div>
      <Button asChild className="mt-8 min-h-12">
        <a href={result?.returnPath || "/support"}>Return to where you started</a>
      </Button>
    </PaymentFrame>
  );
}
