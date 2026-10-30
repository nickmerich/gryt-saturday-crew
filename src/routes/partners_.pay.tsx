import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PaymentFrame, TestPaymentForm } from "@/components/payments/TestPaymentPage";
import { getTestPackage } from "@/lib/test-payments.functions";
import { paymentHead, usd } from "@/lib/test-payment-rules";
export const Route = createFileRoute("/partners_/pay")({
  head: () => paymentHead("Private partner payment", "Private GRYT partner package test payment."),
  validateSearch: (search: Record<string, unknown>) => ({
    token:
      typeof search.token === "string" && /^[a-f0-9]{64}$/.test(search.token) ? search.token : "",
  }),
  component: Page,
});
function Page() {
  const { token } = Route.useSearch();
  const read = useServerFn(getTestPackage);
  const q = useQuery({
    queryKey: ["test-package", token],
    queryFn: () => read({ data: { token } }),
    enabled: Boolean(token),
    retry: false,
  });
  return (
    <PaymentFrame title="Partner payment">
      {q.isLoading ? (
        <p>Loading your package...</p>
      ) : q.error ? (
        <p role="alert">This package could not load.</p>
      ) : !q.data ? (
        <p>A valid private package link is required. Contact nick@gryt.club.</p>
      ) : (
        <>
          <p className="text-blue">{q.data.partner_name}</p>
          <h2 className="mt-4 font-condensed text-3xl uppercase">{q.data.name}</h2>
          <p className="mt-3 whitespace-pre-wrap text-paper/80">{q.data.description}</p>
          <p className="mt-5 text-3xl text-blue">{usd(q.data.amount_cents)}</p>
          {q.data.amount_cents > 100000 && (
            <p className="mt-3 text-paper/75">
              Card or US bank payment. Bank payments stay pending until funds settle.
            </p>
          )}
          <TestPaymentForm type="partner" token={token} amount={q.data.amount_cents} />
        </>
      )}
    </PaymentFrame>
  );
}
