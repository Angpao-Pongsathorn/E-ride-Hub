'use client';

import Link from 'next/link';
import { ArrowLeft, Bike, Package, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SERVICES = [
  {
    href: '/delivery/ride',
    icon: Bike,
    title: 'เรียกรถ',
    desc: 'รถรับส่งบุคคล — มอเตอร์ไซค์, รถยนต์',
    color: 'bg-green-50',
    iconColor: 'text-green-500',
    badge: 'เร็ว',
  },
  {
    href: '/delivery/parcel',
    icon: Package,
    title: 'ส่งพัสดุ',
    desc: 'ส่งของในอำเภอ — คำนวณราคาตามน้ำหนัก',
    color: 'bg-blue-50',
    iconColor: 'text-blue-500',
    badge: null,
  },
  {
    href: '/delivery/parcel',
    icon: FileText,
    title: 'ส่งเอกสาร',
    desc: 'ซองเอกสาร, จดหมาย, แฟกซ์',
    color: 'bg-purple-50',
    iconColor: 'text-purple-500',
    badge: 'ถูก',
  },
];

export default function DeliveryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">บริการรับส่ง</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {SERVICES.map((s) => (
          <Link key={s.href + s.title} href={s.href} className={`flex items-center gap-4 rounded-2xl ${s.color} p-4`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm flex-shrink-0">
              <s.icon className={`h-6 w-6 ${s.iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{s.title}</p>
                {s.badge && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">{s.badge}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{s.desc}</p>
            </div>
          </Link>
        ))}

        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mt-4">
          <p className="text-sm font-medium text-amber-700">📍 พื้นที่ให้บริการ</p>
          <p className="text-xs text-amber-600 mt-1">อำเภอคำเขื่อนแก้ว จ.ยโสธร และพื้นที่ใกล้เคียง</p>
        </div>
      </div>
    </div>
  );
}
