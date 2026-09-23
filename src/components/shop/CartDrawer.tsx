import { useEffect, useState } from "react";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { items, isLoading, isSyncing, error, updateQuantity, removeItem, checkoutUrl, syncCart } =
    useCartStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (open) void syncCart();
  }, [open, syncCart]);

  const count = hydrated ? items.reduce((n, i) => n + i.quantity, 0) : 0;
  const total = items.reduce((n, i) => n + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "USD";

  const checkout = () => {
    if (!checkoutUrl) return;
    window.open(checkoutUrl, "_blank");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          className="relative inline-flex items-center gap-2 border border-paper/25 px-4 py-3 text-xs uppercase tracking-[0.14em] hover:border-blue hover:text-blue transition-colors"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          Cart
          {count > 0 && (
            <span className="ml-1 bg-blue text-ink px-1.5 py-0.5 text-[10px] font-bold">{count}</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-ink text-paper border-paper/15">
        <SheetHeader>
          <SheetTitle className="display-condensed uppercase text-3xl text-paper">Cart</SheetTitle>
          <SheetDescription className="text-paper/60">
            {count === 0 ? "Nothing in here yet." : `${count} item${count === 1 ? "" : "s"}`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center text-paper/50 text-sm">Your cart is empty.</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pt-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4 border-b border-paper/10 pb-4">
                  <div className="w-16 h-16 bg-paper/5 overflow-hidden shrink-0">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-paper/60">
                      {money(parseFloat(item.price.amount), item.price.currencyCode)}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="One fewer"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="h-8 w-8 grid place-items-center border border-paper/20"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="One more"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="h-8 w-8 grid place-items-center border border-paper/20"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => removeItem(item.variantId)}
                    className="self-start p-1 text-paper/50 hover:text-paper"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-paper/15 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="eyebrow">Subtotal</span>
                <span className="display-condensed text-2xl">{money(total, currency)}</span>
              </div>
              <p className="text-xs text-paper/50">Shipping and tax are added at checkout.</p>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="button"
                onClick={checkout}
                disabled={!checkoutUrl || isLoading || isSyncing}
                className="w-full bg-blue text-ink px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] hover:bg-paper transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check out"}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
