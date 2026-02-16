'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Star, Clock } from 'lucide-react';
import { useLiff } from '@/hooks/useLiff';
import { useRealtimeMerchantOrders } from '@/hooks/useRealtimeOrder';
import { OrderNotification } from '@/components/merchant/OrderNotification';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { formatThaiCurrency } from '@/lib/utils';
import { Merchant } from '@/types/database';

export default function MerchantDashboardPage() {
  const { isReady, isLoggedIn, profile } = useLiff(process.env.NEXT_PUBLIC_LIFF_ID_MERCHANT!);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loadingMerchant, setLoadingMerchant] = useState(true);
  const { orders } = useRealtimeMerchantOrders(merchant?.id || null);

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/restaurants?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((data) => {
        setMerchant(data.data?.[0] || null);
        setLoadingMerchant(false);
      });
  }, [profile]);

  const handleAccept = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    });
  };

  const handleReject = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  if (!isReady || loadingMerchant) return <PageLoader />;
  if (!isLoggedIn) return <div className="p-4 text-center">กรุณาเข้าสู่ระบบ</div>;
  if (!merchant) return <div className="p-4 text-center">ไม่พบข้อมูลร้านค้า</div>;

  const todayOrders = orders.filter((o) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.created_at.slice(0, 10) === today;
  });
  const todayRevenue = todayOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.subtotal, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">แดชบอร์ด</p>
            <h1 className="text-xl font-bold text-white">{merchant.name}</h1>
          </div>
          <div className={`rounded-full px-3 py-1.5 text-xs font-bold ${merchant.is_open ? 'bg-white text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {merchant.is_open ? '🟢 เปิดอยู่' : '🔴 ปิด'}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: <ShoppingBag className="h-4 w-4" />, label: 'ออเดอร์วันนี้', value: todayOrders.length },
            { icon: <TrendingUp className="h-4 w-4" />, label: 'ยอดขายวันนี้', value: formatThaiCurrency(todayRevenue) },
            { icon: <Star className="h-4 w-4" />, label: 'คะแนน', value: merchant.rating.toFixed(1) },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl bg-white/20 p-3 text-center">
              <div className="flex justify-center mb-1 text-white">{stat.icon}</div>
              <p className="text-sm font-bold text-white">{stat.value}</p>
              <p className="text-xs text-emerald-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active orders */}
      <div className="px-4 pt-4">
        <h2 className="mb-3 text-base font-bold text-gray-900">
          ออเดอร์รอดำเนินการ
          {orders.filter((o) => o.status === 'pending').length > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {orders.filter((o) => o.status === 'pending').length}
            </span>
          )}
        </h2>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Clock className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">ยังไม่มีออเดอร์</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderNotification
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onReject={handleReject}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
