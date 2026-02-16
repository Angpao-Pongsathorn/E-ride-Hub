'use client';

import { useEffect, useState } from 'react';
import { User, MapPin, Clock, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLiff } from '@/hooks/use-liff';

interface OrderSummary {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function ProfilePage() {
  const { profile, logout } = useLiff();
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/orders?lineUserId=${profile.userId}&limit=5`)
      .then((r) => r.json())
      .then((d) => setOrders(d.data || []))
      .catch(() => {});
  }, [profile]);

  const STATUS_MAP: Record<string, string> = {
    pending: 'รอร้านรับ',
    confirmed: 'ยืนยันแล้ว',
    preparing: 'กำลังเตรียม',
    delivering: 'กำลังส่ง',
    delivered: 'ส่งแล้ว',
    cancelled: 'ยกเลิก',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-orange-500 px-4 pt-10 pb-8">
        <div className="flex items-center gap-4">
          {profile?.pictureUrl ? (
            <Image src={profile.pictureUrl} alt={profile.displayName} width={64} height={64} className="rounded-full" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-orange-400 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          )}
          <div>
            <p className="text-white font-bold text-lg">{profile?.displayName}</p>
            <p className="text-orange-100 text-sm mt-0.5">สมาชิก E-RideHub</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        {/* Quick Actions */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <Link href="/register-shop" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
            <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <span className="text-lg">🏪</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">เปิดร้านค้า</p>
              <p className="text-xs text-gray-400">สมัครเป็นพาร์ทเนอร์ร้านค้า</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link href="/register-rider" className="flex items-center gap-3 px-4 py-3.5">
            <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-lg">🛵</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">สมัครไรเดอร์</p>
              <p className="text-xs text-gray-400">รับงานได้ทันที ไม่มีค่าสมัคร</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>

        {/* Order History */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <p className="font-semibold text-gray-900">ประวัติออเดอร์</p>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีประวัติออเดอร์</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/marketplace/orders/${o.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{o.order_number}</p>
                    <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-500">฿{o.total_amount?.toFixed(0)}</p>
                    <p className="text-xs text-gray-400">{STATUS_MAP[o.status] || o.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Help */}
        <Link href="/help" className="flex items-center gap-3 rounded-2xl bg-white shadow-sm px-4 py-3.5">
          <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg">❓</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">ช่วยเหลือ</p>
            <p className="text-xs text-gray-400">FAQ, ติดต่อ, รายงานปัญหา</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl bg-white shadow-sm px-4 py-3.5 text-left"
        >
          <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center">
            <LogOut className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-sm font-medium text-red-500">ออกจากระบบ</p>
        </button>
      </div>
    </div>
  );
}
