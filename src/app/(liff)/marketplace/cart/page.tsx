'use client';

import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <ShoppingCart className="h-16 w-16 text-gray-200 mb-4" />
        <p className="text-gray-500 font-medium mb-2">ตะกร้าว่างเปล่า</p>
        <p className="text-sm text-gray-400 mb-6">เลือกสินค้าจากร้านค้าก่อนนะ</p>
        <Link href="/marketplace" className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white">
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  const deliveryFee = 20;
  const platformFee = 5;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">ตะกร้า</h1>
        <button onClick={clearCart} className="flex items-center gap-1 text-xs text-red-400">
          <Trash2 className="h-3.5 w-3.5" /> ล้าง
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          {items.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-sm text-orange-500 font-semibold mt-0.5">฿{(item.price * item.quantity).toFixed(0)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100"
                >
                  {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-red-400" /> : <Minus className="h-3 w-3 text-gray-600" />}
                </button>
                <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100"
                >
                  <Plus className="h-3 w-3 text-orange-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-2">
          <p className="font-semibold text-gray-900 mb-2">สรุปค่าใช้จ่าย</p>
          <div className="flex justify-between text-sm text-gray-600">
            <span>ยอดสินค้า</span>
            <span>฿{total.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>ค่าจัดส่ง</span>
            <span>฿{deliveryFee}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>ค่าบริการ</span>
            <span>฿{platformFee}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
            <span>รวมทั้งหมด</span>
            <span className="text-orange-500">฿{(total + deliveryFee + platformFee).toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe">
        <button
          onClick={() => router.push('/marketplace/checkout')}
          className="w-full rounded-2xl bg-orange-500 py-3.5 text-center font-semibold text-white"
        >
          สั่งซื้อ (฿{(total + deliveryFee + platformFee).toFixed(0)})
        </button>
      </div>
    </div>
  );
}
