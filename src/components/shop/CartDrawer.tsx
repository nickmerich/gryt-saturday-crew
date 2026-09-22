import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } =
    useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );
  const currency = items[0]?.price.currencyCode || "USD";

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open cart"
          className="relative inline-flex items-center justify-center h-11 w-11 border border-paper/25 text-paper hover:bg-blue hover:text-ink hover:border-blue transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 flex items-center justify-center text-[11px] font-bold bg-blue text-ink">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-ink text-paper border-paper/15">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="display-condensed uppercase text-2xl text-paper">
            Your cart
          </SheetTitle>
          <SheetDescription className="text-paper/60">
            {totalItems === 0
              ? "Nothing in here yet."
              : `${totalItems} item${totalItems !== 1 ? "s" : ""} ready to go.`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0 px-4">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-paper/30 mx-auto mb-4" />
                <p className="text-paper/60">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 p-2 border border-paper/10">
                      <div className="w-16 h-16 bg-paper/10 overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.product.node.title}</h4>
                        <p className="text-sm text-paper/60">
                          {item.selectedOptions.map((o) => o.value).join(" · ")}
                        </p>
                        <p className="font-semibold">
                          {formatPrice(item.price.amount, item.price.currencyCode)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <button
                          aria-label="Remove item"
                          className="h-7 w-7 inline-flex items-center justify-center text-paper/60 hover:text-blue"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            aria-label="Decrease quantity"
                            className="h-7 w-7 inline-flex items-center justify-center border border-paper/25 hover:bg-blue hover:text-ink"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            className="h-7 w-7 inline-flex items-center justify-center border border-paper/25 hover:bg-blue hover:text-ink"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 py-4 border-t border-paper/15">
                <div className="flex justify-between items-center">
                  <span className="eyebrow text-paper/60">Total</span>
                  <span className="text-xl font-bold">
                    {formatPrice(String(totalPrice), currency)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isLoading || isSyncing}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue text-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] hover:bg-paper transition-colors disabled:opacity-40"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Checkout with Shopify
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
