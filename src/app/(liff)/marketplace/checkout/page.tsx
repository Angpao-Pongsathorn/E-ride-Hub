'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useLiff } from '@/hooks/use-liff';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'เงินสด', icon: '💵' },
  { value: 'promptpay', label: 'พร้อมเพย์', icon: '📱' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { profile } = useLiff();
  const { items, total, merchantId, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState('cash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = 20;
  const platformFee = 5;
  const grandTotal = total + deliveryFee + platformFee;

  const handleSubmit = async () => {
    if (!address.trim()) { setError('กรุณากรอกที่อยู่จัดส่ง'); return; }
    if (!profile?.userId) { setError('กรุณาเข้าสู่ระบบ'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUserId: profile.userId,
          merchantId,
          items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity, price: i.price })),
          deliveryAddress: address,
          deliveryNote: note,
          paymentMethod: payment,
          subtotal: total,
          deliveryFee,
          platformFee,
          totalAmount: grandTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      clearCart();
      router.replace(`/marketplace/orders/${data.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    router.replace('/marketplace/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">ยืนยันออเดอร์</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Address */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-orange-500" />
            <p className="font-semibold text-gray-900">ที่อยู่จัดส่ง</p>
          </div>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="หมายเหตุ (ไม่บังคับ)"
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
          />
        </div>

        {/* Payment */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-orange-500" />
            <p className="font-semibold text-gray-900">วิธีชำระเงิน</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setPayment(m.value)}
                className={`rounded-xl border-2 p-3 text-left transition-colors ${
                  payment === m.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="text-lg mb-0.5">{m.icon}</div>
                <p className="text-sm font-medium text-gray-900">{m.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-2">
          <p className="font-semibold text-gray-900 mb-1">สรุปออเดอร์</p>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>{item.name} ×{item.quantity}</span>
              <span>฿{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>ค่าจัดส่ง</span><span>฿{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>ค่าบริการ</span><span>฿{platformFee}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1">
              <span>รวมทั้งหมด</span>
              <span className="text-orange-500">฿{grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-2xl bg-orange-500 py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'กำลังสั่งซื้อ...' : `ยืนยันคำสั่งซื้อ ฿${grandTotal.toFixed(0)}`}
        </button>
      </div>
    </div>
  );
}
