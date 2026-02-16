'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface PricingSettings {
  base_delivery_fee: number;
  fee_per_km: number;
  free_km: number;
  platform_commission_rate: number;
  rider_revenue_rate: number;
  community_fund_rate: number;
  surge_multiplier: number;
  surge_hours_start: number;
  surge_hours_end: number;
  base_ride_fare: number;
  ride_fare_per_km: number;
}

const DEFAULT: PricingSettings = {
  base_delivery_fee: 20, fee_per_km: 5, free_km: 3,
  platform_commission_rate: 0.15, rider_revenue_rate: 0.70, community_fund_rate: 0.01,
  surge_multiplier: 1.2, surge_hours_start: 11, surge_hours_end: 13,
  base_ride_fare: 25, ride_fare_per_km: 5,
};

export default function AdminPricingPage() {
  const [settings, setSettings] = useState<PricingSettings>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then((r) => r.json())
      .then((d) => { if (d.data) setSettings(d.data); })
      .catch(() => {});
  }, []);

  const set = (k: keyof PricingSettings, v: number) =>
    setSettings((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const Field = ({ label, fieldKey, min, max, step = 1, format }: {
    label: string; fieldKey: keyof PricingSettings; min: number; max: number; step?: number; format?: string;
  }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number" value={settings[fieldKey]} min={min} max={max} step={step}
          onChange={(e) => set(fieldKey, parseFloat(e.target.value))}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
        />
        {format && <span className="text-xs text-gray-400 flex-shrink-0">{format}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">ตั้งค่าราคา</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
          <p className="font-semibold text-gray-900">ค่าจัดส่งอาหาร</p>
          <Field label="ค่าจัดส่งเริ่มต้น (บาท)" fieldKey="base_delivery_fee" min={0} max={100} format="฿" />
          <Field label="ค่าต่อกิโลเมตร (บาท)" fieldKey="fee_per_km" min={0} max={50} format="฿/กม." />
          <Field label="ระยะฟรีแรก (กม.)" fieldKey="free_km" min={0} max={10} format="กม." />
        </div>

        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
          <p className="font-semibold text-gray-900">การแบ่งรายได้</p>
          <Field label="ค่าคอมมิชชั่นแพลตฟอร์ม" fieldKey="platform_commission_rate" min={0.1} max={0.3} step={0.01} format="(0.15 = 15%)" />
          <Field label="ส่วนแบ่งไรเดอร์" fieldKey="rider_revenue_rate" min={0.5} max={0.9} step={0.01} format="(0.70 = 70%)" />
          <Field label="กองทุนชุมชน" fieldKey="community_fund_rate" min={0} max={0.05} step={0.005} format="(0.01 = 1%)" />
        </div>

        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
          <p className="font-semibold text-gray-900">Surge Pricing</p>
          <Field label="ตัวคูณ Surge" fieldKey="surge_multiplier" min={1} max={2} step={0.1} format="x (1.2 = +20%)" />
          <Field label="เวลาเริ่มต้น (ชั่วโมง)" fieldKey="surge_hours_start" min={0} max={23} format="น." />
          <Field label="เวลาสิ้นสุด (ชั่วโมง)" fieldKey="surge_hours_end" min={0} max={23} format="น." />
        </div>

        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
          <p className="font-semibold text-gray-900">ค่าเรียกรถ</p>
          <Field label="ค่าโดยสารเริ่มต้น (บาท)" fieldKey="base_ride_fare" min={0} max={100} format="฿" />
          <Field label="ค่าต่อกิโลเมตร (บาท)" fieldKey="ride_fare_per_km" min={0} max={30} format="฿/กม." />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <button onClick={handleSave} disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-semibold text-white disabled:opacity-60">
          <Save className="h-5 w-5" />
          {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว!' : 'บันทึกการตั้งค่า'}
        </button>
      </div>
    </div>
  );
}
