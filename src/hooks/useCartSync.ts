import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

/** Clears the cart after a completed checkout (on load and on tab return). */
export function useCartSync() {
  const syncCart = useCartStore((s) => s.syncCart);
  useEffect(() => {
    void syncCart();
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncCart();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [syncCart]);
}
