import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  addLineToShopifyCart,
  cartStillOpen,
  createShopifyCart,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
} from "@/lib/shopify-storefront";

export interface CartItem {
  lineId: string | null;
  variantId: string;
  title: string;
  variantTitle: string;
  imageUrl: string | null;
  price: { amount: string; currencyCode: string };
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<boolean>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

const FRIENDLY = "The cart did not update. Try again in a moment.";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      error: null,

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existing = items.find((i) => i.variantId === item.variantId);
        set({ isLoading: true, error: null });
        try {
          if (!cartId) {
            const result = await createShopifyCart(item.variantId, item.quantity);
            if (!result) throw new Error(FRIENDLY);
            set({
              cartId: result.cartId,
              checkoutUrl: result.checkoutUrl,
              items: [{ ...item, lineId: result.lineId }],
            });
            return true;
          }
          if (existing?.lineId) {
            const quantity = existing.quantity + item.quantity;
            const result = await updateShopifyCartLine(cartId, existing.lineId, quantity);
            if ("cartNotFound" in result) {
              clearCart();
              return get().addItem(item);
            }
            set({
              items: get().items.map((i) => (i.variantId === item.variantId ? { ...i, quantity } : i)),
            });
            return true;
          }
          const result = await addLineToShopifyCart(cartId, item.variantId, item.quantity);
          if ("cartNotFound" in result) {
            clearCart();
            return get().addItem(item);
          }
          set({ items: [...get().items, { ...item, lineId: result.lineId }] });
          return true;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : FRIENDLY });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true, error: null });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if ("cartNotFound" in result) return clearCart();
          set({ items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : FRIENDLY });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true, error: null });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if ("cartNotFound" in result) return clearCart();
          const next = get().items.filter((i) => i.variantId !== variantId);
          if (next.length === 0) clearCart();
          else set({ items: next });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : FRIENDLY });
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const open = await cartStillOpen(cartId);
          if (open === false) clearCart();
        } catch {
          // Keep the local cart on network errors.
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "gryt-shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, cartId: s.cartId, checkoutUrl: s.checkoutUrl }),
    },
  ),
);
