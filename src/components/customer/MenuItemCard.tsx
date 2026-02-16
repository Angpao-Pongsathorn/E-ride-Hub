'use client';

import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface MenuItemCardProps {
  item: { id: string; name: string; description?: string | null; price: number; image_url?: string | null; is_available: boolean };
  merchantId: string;
}

export function MenuItemCard({ item, merchantId }: MenuItemCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const cartItem = items.find((i) => i.id === item.id);
  const qty = cartItem?.quantity || 0;

  return (
    <div className={`flex gap-3 rounded-2xl bg-white p-3 shadow-sm ${!item.is_available ? 'opacity-50' : ''}`}>
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">🍽️</div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          {item.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-orange-500">฿{item.price.toFixed(0)}</span>
          {item.is_available && (
            <div className="flex items-center gap-2">
              {qty > 0 && (
                <>
                  <button
                    onClick={() => qty === 1 ? removeItem(item.id) : updateQuantity(item.id, qty - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100"
                  >
                    <Minus className="h-3 w-3 text-orange-600" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{qty}</span>
                </>
              )}
              <button
                onClick={() => addItem({ id: item.id, name: item.name, price: item.price, merchantId })}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500"
              >
                <Plus className="h-3 w-3 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
