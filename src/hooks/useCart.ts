'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemSimple {
  id: string;
  name: string;
  price: number;
  quantity: number;
  merchantId: string;
}

interface CartState {
  merchantId: string | null;
  items: CartItemSimple[];
  total: number;
  addItem: (item: { id: string; name: string; price: number; merchantId: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

function calcTotal(items: CartItemSimple[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      merchantId: null,
      items: [],
      total: 0,

      addItem: ({ id, name, price, merchantId }) => {
        const state = get();
        let newItems: CartItemSimple[];

        // Different merchant — clear cart
        if (state.merchantId && state.merchantId !== merchantId) {
          newItems = [{ id, name, price, quantity: 1, merchantId }];
        } else {
          const existing = state.items.findIndex((i) => i.id === id);
          if (existing >= 0) {
            newItems = state.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            newItems = [...state.items, { id, name, price, quantity: 1, merchantId }];
          }
        }

        set({ items: newItems, merchantId, total: calcTotal(newItems) });
      },

      removeItem: (id) => {
        const newItems = get().items.filter((i) => i.id !== id);
        set({
          items: newItems,
          total: calcTotal(newItems),
          merchantId: newItems.length === 0 ? null : get().merchantId,
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return; }
        const newItems = get().items.map((i) => i.id === id ? { ...i, quantity } : i);
        set({ items: newItems, total: calcTotal(newItems) });
      },

      clearCart: () => set({ items: [], merchantId: null, total: 0 }),
    }),
    { name: 'juad-cart-v2' }
  )
);
