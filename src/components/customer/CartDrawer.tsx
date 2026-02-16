'use client';

import Link from 'next/link';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function CartDrawer() {
  const { items, total } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Link href="/marketplace/cart">
        <div className="flex items-center justify-between rounded-2xl bg-orange-500 px-4 py-3 shadow-lg text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="font-semibold">{count} รายการ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">฿{total.toFixed(0)}</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </Link>
    </div>
  );
}
