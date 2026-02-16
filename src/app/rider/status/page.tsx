'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/hooks/useLiff';
import { useRiderLocationUpdater } from '@/hooks/useLocation';
import { StatusToggle } from '@/components/rider/StatusToggle';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Rider } from '@/types/database';

export default function RiderStatusPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, profile } = useLiff(process.env.NEXT_PUBLIC_LIFF_ID_RIDER!);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const { lat, lng } = useRiderLocationUpdater(rider?.id || null, 30000);

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/riders?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((d) => { setRider(d.data || null); setLoading(false); });
  }, [profile]);

  const handleToggle = async (online: boolean) => {
    if (!rider) return;
    await fetch(`/api/riders/${rider.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_online: online }),
    });
    setRider((r) => r ? { ...r, is_online: online } : null);
  };

  if (!isReady || loading) return <PageLoader />;
  if (!rider) return <div className="p-4 text-center">ไม่พบข้อมูลไรเดอร์</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">สถานะ GPS</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <StatusToggle isOnline={rider.is_online} onChange={handleToggle} />

        {lat && lng && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-emerald-500" />
              <p className="font-semibold text-gray-900">ตำแหน่งปัจจุบัน</p>
            </div>
            <p className="text-sm text-gray-600">Lat: {lat.toFixed(6)}</p>
            <p className="text-sm text-gray-600">Lng: {lng.toFixed(6)}</p>
            <p className="mt-2 text-xs text-gray-400">อัปเดตตำแหน่งทุก 30 วินาที</p>
          </div>
        )}

        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-sm font-medium text-amber-700">ℹ️ เปิดรับงานเพื่อรับออเดอร์ใหม่</p>
          <p className="text-xs text-amber-600 mt-1">ระบบจะส่งออเดอร์มาให้อัตโนมัติ เมื่อคุณอยู่ในรัศมี 5 กม. จากร้าน</p>
        </div>
      </div>
    </div>
  );
}
