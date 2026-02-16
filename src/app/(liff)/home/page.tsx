'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Bike, Package, Star, ChevronRight } from 'lucide-react';
import { useLiff } from '@/hooks/use-liff';
import { useEffect, useState } from 'react';

const SERVICES = [
  { href: '/marketplace', icon: ShoppingBag, label: 'สั่งอาหาร', color: 'bg-orange-100', iconColor: 'text-orange-500' },
  { href: '/delivery/ride', icon: Bike, label: 'เรียกรถ', color: 'bg-green-100', iconColor: 'text-green-500' },
  { href: '/delivery/parcel', icon: Package, label: 'ส่งพัสดุ', color: 'bg-blue-100', iconColor: 'text-blue-500' },
  { href: '/promotions', icon: Star, label: 'โปรโมชั่น', color: 'bg-yellow-100', iconColor: 'text-yellow-500' },
];

interface FeaturedShop {
  id: string;
  name: string;
  category: string;
  rating: number;
  delivery_time: number;
  cover_image_url: string | null;
}

export default function HomePage() {
  const { profile } = useLiff();
  const [shops, setShops] = useState<FeaturedShop[]>([]);

  useEffect(() => {
    fetch('/api/restaurants?limit=4')
      .then((r) => r.json())
      .then((d) => setShops(d.data?.slice(0, 4) || []))
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'อรุณสวัสดิ์' : hour < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-orange-500 px-4 pt-10 pb-6">
        <p className="text-orange-100 text-sm">{greeting} 👋</p>
        <p className="text-white font-bold text-xl mt-0.5">
          {profile?.displayName || 'ลูกค้า'}
        </p>
        <p className="text-orange-100 text-xs mt-1">E-RideHub คำเขื่อนแก้ว</p>
      </div>

      <div className="px-4 -mt-3">
        {/* Services Grid */}
        <div className="rounded-2xl bg-white shadow-sm p-4 mb-4">
          <div className="grid grid-cols-4 gap-3">
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} className="flex flex-col items-center gap-1.5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.color}`}>
                  <s.icon className={`h-6 w-6 ${s.iconColor}`} />
                </div>
                <span className="text-xs text-gray-600 text-center">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">ส่งฟรี!</p>
            <p className="text-orange-100 text-xs mt-0.5">สั่งครั้งแรก ลดทันที 20 บาท</p>
            <Link href="/promotions" className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs text-white">
              ดูโปรโมชั่น <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="text-4xl">🛵</div>
        </div>

        {/* Featured Shops */}
        <div className="mb-3 flex items-center justify-between">
          <p className="font-bold text-gray-900">ร้านแนะนำ</p>
          <Link href="/marketplace" className="flex items-center gap-0.5 text-xs text-orange-500">
            ดูทั้งหมด <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {shops.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            ))
          ) : (
            shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/marketplace/${shop.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {shop.cover_image_url && (
                    <Image
                      src={shop.cover_image_url}
                      alt={shop.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{shop.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{shop.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                      <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                      {shop.rating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">~{shop.delivery_time || 20} นาที</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </Link>
            ))
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href="/register-shop" className="rounded-2xl bg-orange-50 p-4 text-center">
            <div className="text-2xl mb-1">🏪</div>
            <p className="text-sm font-medium text-orange-600">เปิดร้านค้า</p>
            <p className="text-xs text-gray-500 mt-0.5">สมัครฟรี ไม่มีค่าธรรมเนียมรายเดือน</p>
          </Link>
          <Link href="/register-rider" className="rounded-2xl bg-green-50 p-4 text-center">
            <div className="text-2xl mb-1">🛵</div>
            <p className="text-sm font-medium text-green-600">สมัครไรเดอร์</p>
            <p className="text-xs text-gray-500 mt-0.5">รายได้ดี กำหนดเวลาเองได้</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
