'use client';

import { ArrowLeft, Tag, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PROMOTIONS = [
  {
    id: 1,
    title: 'สั่งครั้งแรก ลด 20 บาท',
    desc: 'สำหรับลูกค้าใหม่เท่านั้น ใช้ได้กับทุกร้าน',
    code: 'NEW20',
    expiry: '28 ก.พ. 2025',
    color: 'from-orange-500 to-orange-400',
  },
  {
    id: 2,
    title: 'ส่งฟรีทุกวันศุกร์',
    desc: 'ไม่ต้องใช้โค้ด — ส่งฟรีทุกวันศุกร์ 11:00-13:00',
    code: null,
    expiry: 'ทุกวันศุกร์',
    color: 'from-green-500 to-green-400',
  },
  {
    id: 3,
    title: 'ลด 15% ร้าน OTOP',
    desc: 'สำหรับสินค้า OTOP คำเขื่อนแก้วทุกชิ้น',
    code: 'OTOP15',
    expiry: '31 มี.ค. 2025',
    color: 'from-blue-500 to-blue-400',
  },
  {
    id: 4,
    title: 'เรียกรถ 2 เที่ยว ลด 10 บาท',
    desc: 'ต่อวัน สำหรับสมาชิกทุกคน',
    code: 'RIDE10',
    expiry: '28 ก.พ. 2025',
    color: 'from-purple-500 to-purple-400',
  },
];

export default function PromotionsPage() {
  const router = useRouter();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      alert(`คัดลอก "${code}" แล้ว!`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">โปรโมชั่น</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 fill-white stroke-white" />
            <p className="font-bold">โปรโมชั่นพิเศษ</p>
          </div>
          <p className="text-orange-100 text-sm">ลดราคาต้อนรับปีใหม่ไทย — กดคัดลอกโค้ดเพื่อใช้งาน</p>
        </div>

        {PROMOTIONS.map((promo) => (
          <div key={promo.id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${promo.color} px-4 py-3`}>
              <p className="text-white font-bold">{promo.title}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600">{promo.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <div>
                  {promo.code ? (
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {promo.code}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">ไม่ต้องใช้โค้ด</span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">หมดอายุ: {promo.expiry}</p>
                </div>
                {promo.code && (
                  <button
                    onClick={() => handleCopy(promo.code!)}
                    className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600"
                  >
                    คัดลอก
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
