'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/hooks/use-liff';
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete';

export default function RidePage() {
  const router = useRouter();
  const { profile } = useLiff();
  const [origin, setOrigin] = useState('');
  const [originLat, setOriginLat] = useState<number | null>(null);
  const [originLng, setOriginLng] = useState<number | null>(null);
  const [destination, setDestination] = useState('');
  const [destLat, setDestLat] = useState<number | null>(null);
  const [destLng, setDestLng] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fare, setFare] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError('กรุณากรอกต้นทางและปลายทาง');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: 'ride', origin, destination }),
      });
      const data = await res.json();
      setFare(data.data?.fare ?? null);
    } catch {
      setError('คำนวณราคาไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBook = async () => {
    if (!profile?.userId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUserId: profile.userId,
          pickupAddress: origin,
          dropoffAddress: destination,
          pickupLat: originLat,
          pickupLng: originLng,
          dropoffLat: destLat,
          dropoffLng: destLng,
          fare,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      alert('จองรถสำเร็จ! ไรเดอร์กำลังมา');
      router.push('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">เรียกรถ</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">ต้นทาง</label>
            <AddressAutocomplete
              value={origin}
              onChange={(addr, lat, lng) => {
                setOrigin(addr);
                if (lat !== undefined) setOriginLat(lat);
                if (lng !== undefined) setOriginLng(lng);
              }}
              placeholder="ระบุจุดรับ"
              icon={<MapPin className="h-4 w-4 text-green-500" />}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">ปลายทาง</label>
            <AddressAutocomplete
              value={destination}
              onChange={(addr, lat, lng) => {
                setDestination(addr);
                if (lat !== undefined) setDestLat(lat);
                if (lng !== undefined) setDestLng(lng);
              }}
              placeholder="ไปที่ไหน?"
              icon={<Navigation className="h-4 w-4 text-red-500" />}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleCalculate}
            disabled={submitting}
            className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-60"
          >
            คำนวณราคา
          </button>
        </div>

        {fare !== null && (
          <div className="rounded-2xl bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-gray-900">ค่าเดินทาง</p>
              <p className="text-2xl font-bold text-orange-500">฿{fare}</p>
            </div>
            <p className="text-xs text-gray-400">ราคารวมค่าบริการและน้ำมัน</p>
            <button
              onClick={handleBook}
              disabled={submitting}
              className="mt-4 w-full rounded-2xl bg-orange-500 py-3.5 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'กำลังจอง...' : 'จองทันที'}
            </button>
          </div>
        )}

        <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
          <p className="text-sm font-medium text-green-700">🛵 ราคาเริ่มต้น</p>
          <p className="text-xs text-green-600 mt-1">3 กม.แรก = ฿25 · กม.ละ ฿5 · Peak hours +20%</p>
        </div>
      </div>
    </div>
  );
}
