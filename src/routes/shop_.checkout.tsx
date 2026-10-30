import { createFileRoute } from "@tanstack/react-router";
import { PaymentFrame, TestPaymentForm } from "@/components/payments/TestPaymentPage";
import { getTestCatalog } from "@/lib/test-payments.functions";
import { paymentHead, usd } from "@/lib/test-payment-rules";
import cap from "@/assets/cap/cap-front.jpg.asset.json";
export const Route = createFileRoute("/shop_/checkout")({
  head: () =>
    paymentHead("Hat checkout", "Separate checkout for GRYT hats. Shopify remains unchanged."),
  loader: () => getTestCatalog({ data: { slug: "" } }),
  component: Page,
});
function Page() {
  const { products } = Route.useLoaderData();
  return (
    <PaymentFrame title="Hat checkout">
      <p className="text-paper/75">Separate checkout. Your Shopify cart is unchanged.</p>
      {products.length === 0 ? (
        <p className="mt-8">No products are available.</p>
      ) : (
        products.map((product) => (
          <section key={product.id} className="mt-8 border-t border-paper/25 pt-8">
            <img
              src={cap.url}
              alt="GRYT Founding Member Cap, front view"
              className="h-64 w-full max-w-xl object-contain bg-paper"
            />
            <h2 className="mt-5 font-condensed text-3xl uppercase">{product.name}</h2>
            <p className="mt-2 text-xl text-blue">{usd(product.amount_cents)}</p>
            <p className="mt-2 text-sm text-paper/70">{product.sku}</p>
            <TestPaymentForm type="merch" itemId={product.id} amount={product.amount_cents} />
          </section>
        ))
      )}
    </PaymentFrame>
  );
}
