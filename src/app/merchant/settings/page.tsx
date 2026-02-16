'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/hooks/useLiff';
import { Merchant } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/shared/LoadingSpinner';

export default function MerchantSettingsPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, profile } = useLiff(process.env.NEXT_PUBLIC_LIFF_ID_MERCHANT!);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', phone: '', openingTime: '', closingTime: '', isOpen: true });

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/restaurants?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((data) => {
        const m = data.data?.[0];
        if (m) {
          setMerchant(m);
          setForm({
            name: m.name,
            description: m.description || '',
            phone: m.phone || '',
            openingTime: m.opening_time?.slice(0, 5) || '08:00',
            closingTime: m.closing_time?.slice(0, 5) || '22:00',
            isOpen: m.is_open,
          });
        }
        setLoading(false);
      });
  }, [profile]);

  const handleSave = async () => {
    if (!merchant) return;
    setSaving(true);
    await fetch(`/api/restaurants/${merchant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        phone: form.phone,
        opening_time: form.openingTime,
        closing_time: form.closingTime,
        is_open: form.isOpen,
      }),
    });
    setSaving(false);
    router.push('/merchant/dashboard');
  };

  if (!isReady || loading) return <PageLoader />;
  if (!isLoggedIn || !merchant) return <div className="p-4">ไม่พบข้อมูล</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">ตั้งค่าร้าน</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">ข้อมูลร้าน</h3>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">ชื่อร้าน</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">รายละเอียด</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">เบอร์โทร</label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">เวลาทำการ</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">เปิด</label>
              <Input type="time" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ปิด</label>
              <Input type="time" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">สถานะร้าน</p>
              <p className="text-sm text-gray-500">{form.isOpen ? 'เปิดรับออเดอร์' : 'ปิดรับออเดอร์'}</p>
            </div>
            <button
              onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${form.isOpen ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.isOpen ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>
    </div>
  );
}
