'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Navigation, Package, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FEATURES } from '@/config/features';
import { ComingSoon } from '@/components/shared/ComingSoon';
import { useLiff } from '@/hooks/use-liff';
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete';
import { OrderCountdownOverlay } from '@/components/shared/OrderCountdownOverlay';

const SIZES = [
  { value: 'S', label: 'S — เล็ก', desc: 'น้ำหนักไม่เกิน 1 กก.', price: 30 },
  { value: 'M', label: 'M — กลาง', desc: 'น้ำหนัก 1–3 กก.', price: 50 },
  { value: 'L', label: 'L — ใหญ่', desc: 'น้ำหนัก 3–10 กก.', price: 80 },
  { value: 'XL', label: 'XL — ใหญ่พิเศษ', desc: 'น้ำหนักเกิน 10 กก.', price: 120 },
];

export default function ParcelPage() {
  const router = useRouter();
  const { profile } = useLiff();
  const [pickup, setPickup] = useState('');

  if (!FEATURES.parcel) return <ComingSoon title="บริการส่งพัสดุ" />;
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropoff, setDropoff] = useState('');
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);
  const [size, setSize] = useState('S');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedSize = SIZES.find((s) => s.value === size)!;

  const handlePressConfirm = () => {
    if (!pickup.trim() || !dropoff.trim()) {
      setError('กรุณากรอกที่อยู่รับและส่ง');
      return;
    }
    if (!profile?.userId) return;
    setError('');
    setShowCountdown(true);
  };

  const handleCountdownConfirm = async () => {
    setShowCountdown(false);
    setSubmitting(true);
    try {
      const res = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUserId: profile!.userId,
          pickupAddress: pickup,
          dropoffAddress: dropoff,
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          parcelSize: size,
          description,
          fee: selectedSize.price,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-orange-500 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-7xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-white mb-1">ส่งคำขอสำเร็จ!</h1>
        <p className="text-orange-100 text-sm mb-2">ไรเดอร์จะมารับพัสดุของคุณเร็วๆ นี้</p>
        <p className="text-white/80 text-xs mb-8">ค่าบริการ ฿{selectedSize.price}</p>
        <button
          onClick={() => router.push('/home')}
          className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border-2 border-white/40 py-3.5 font-semibold text-white"
        >
          <Home className="h-4 w-4" />
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {showCountdown && (
        <OrderCountdownOverlay
          orderType="parcel"
          onConfirm={handleCountdownConfirm}
          onCancel={() => setShowCountdown(false)}
        />
      )}

      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}

      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">ส่งพัสดุ</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Addresses */}
        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">รับของที่</label>
            <AddressAutocomplete
              value={pickup}
              onChange={(addr, lat, lng) => {
                setPickup(addr);
                if (lat !== undefined) setPickupLat(lat);
                if (lng !== undefined) setPickupLng(lng);
              }}
              placeholder="ที่อยู่รับพัสดุ"
              icon={<MapPin className="h-4 w-4 text-green-500" />}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">ส่งถึง</label>
            <AddressAutocomplete
              value={dropoff}
              onChange={(addr, lat, lng) => {
                setDropoff(addr);
                if (lat !== undefined) setDropoffLat(lat);
                if (lng !== undefined) setDropoffLng(lng);
              }}
              placeholder="ที่อยู่ปลายทาง"
              icon={<Navigation className="h-4 w-4 text-red-500" />}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">รายละเอียดพัสดุ</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น เสื้อผ้า, อาหาร, ยา"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Size */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <p className="font-semibold text-gray-900 mb-3">ขนาดพัสดุ</p>
          <div className="grid grid-cols-2 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={`rounded-xl border-2 p-3 text-left transition-colors ${
                  size === s.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                <p className="text-sm font-bold text-orange-500 mt-1">฿{s.price}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe">
        <button
          onClick={handlePressConfirm}
          disabled={submitting || showCountdown}
          className="w-full rounded-2xl bg-orange-500 py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {`ส่งพัสดุ ฿${selectedSize.price}`}
        </button>
      </div>
    </div>
  );
}
