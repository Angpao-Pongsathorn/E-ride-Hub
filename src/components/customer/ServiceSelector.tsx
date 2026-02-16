'use client';

import Link from 'next/link';
import { Utensils, Car, Package } from 'lucide-react';

const SERVICES = [
  {
    href: '/restaurants',
    icon: <Utensils className="h-8 w-8" />,
    label: 'สั่งอาหาร',
    description: 'ร้านอาหารในอำเภอ',
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    href: '/ride',
    icon: <Car className="h-8 w-8" />,
    label: 'เรียกรถ',
    description: 'รับส่งในพื้นที่',
    bg: 'bg-amber-400',
    light: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    href: '/parcel',
    icon: <Package className="h-8 w-8" />,
    label: 'ส่งพัสดุ',
    description: 'ส่งของ เอกสาร',
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
  },
];

export function ServiceSelector() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {SERVICES.map((s) => (
        <Link key={s.href} href={s.href}>
          <div className={`flex flex-col items-center gap-2 rounded-2xl ${s.light} p-4 transition-transform active:scale-95`}>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${s.bg} text-white shadow-md`}>
              {s.icon}
            </div>
            <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
            <span className="text-center text-xs text-gray-400">{s.description}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
