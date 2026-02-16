'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLiff } from '@/hooks/useLiff';
import { useRealtimeMerchantOrders } from '@/hooks/useRealtimeOrder';
import { OrderNotification } from '@/components/merchant/OrderNotification';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Merchant } from '@/types/database';

export default function MerchantOrdersPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, profile } = useLiff(process.env.NEXT_PUBLIC_LIFF_ID_MERCHANT!);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const { orders } = useRealtimeMerchantOrders(merchant?.id || null);

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/restaurants?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((d) => { setMerchant(d.data?.[0] || null); setLoading(false); });
  }, [profile]);

  const handleAccept = async (id: string) => {
    await fetch(`/api/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) });
  };
  const handleReject = async (id: string) => {
    await fetch(`/api/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
  };
  const handleUpdate = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  };

  if (!isReady || loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">ออเดอร์</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {orders.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>ยังไม่มีออเดอร์</p>
          </div>
        ) : (
          orders.map((o) => (
            <OrderNotification key={o.id} order={o} onAccept={handleAccept} onReject={handleReject} onUpdateStatus={handleUpdate} />
          ))
        )}
      </div>
    </div>
  );
}
