'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FAQS = [
  { q: 'ออเดอร์อาหารใช้เวลานานแค่ไหน?', a: 'โดยทั่วไปใช้เวลา 20-45 นาที ขึ้นอยู่กับระยะทางและร้านค้า' },
  { q: 'พื้นที่ให้บริการครอบคลุมที่ไหนบ้าง?', a: 'ครอบคลุมทั้งอำเภอคำเขื่อนแก้ว จ.ยโสธร และพื้นที่ใกล้เคียงในรัศมี 15 กม.' },
  { q: 'ค่าจัดส่งคำนวณอย่างไร?', a: 'ค่าจัดส่งเริ่มต้นที่ 20 บาท บวกระยะทาง ระยะ 3 กม.แรกฟรี จากนั้น กม.ละ 5 บาท' },
  { q: 'สามารถยกเลิกออเดอร์ได้หรือไม่?', a: 'สามารถยกเลิกได้ก่อนที่ร้านรับออเดอร์ หลังจากนั้นไม่สามารถยกเลิกได้' },
  { q: 'ไรเดอร์มาช้ากว่าที่คาดไว้ ทำอย่างไร?', a: 'กด "รายงานปัญหา" ด้านล่าง หรือติดต่อ Call Center ที่ 081-xxx-xxxx' },
  { q: 'สมัครเป็นร้านค้าพาร์ทเนอร์ได้อย่างไร?', a: 'ไปที่หน้าโปรไฟล์ → เปิดร้านค้า กรอกข้อมูลและรอการอนุมัติ 1-2 วันทำการ' },
];

export default function HelpPage() {
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [report, setReport] = useState('');
  const [sent, setSent] = useState(false);

  const handleReport = () => {
    if (!report.trim()) return;
    // TODO: send report via API
    setSent(true);
    setReport('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">ช่วยเหลือ</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:081xxxxxxx" className="flex flex-col items-center gap-2 rounded-2xl bg-green-50 p-4">
            <Phone className="h-6 w-6 text-green-500" />
            <p className="text-sm font-medium text-green-700">Call Center</p>
            <p className="text-xs text-green-600">081-xxx-xxxx</p>
          </a>
          <a href="https://line.me/R/ti/p/@786zqjkg" className="flex flex-col items-center gap-2 rounded-2xl bg-blue-50 p-4">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <p className="text-sm font-medium text-blue-700">LINE OA</p>
            <p className="text-xs text-blue-600">@786zqjkg</p>
          </a>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="font-semibold text-gray-900">คำถามที่พบบ่อย</p>
          </div>
          {FAQS.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full text-left px-4 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">{faq.q}</p>
                {openIdx === idx ? (
                  <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
              </div>
              {openIdx === idx && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
              )}
            </button>
          ))}
        </div>

        {/* Report */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <p className="font-semibold text-gray-900">รายงานปัญหา</p>
          </div>
          {sent ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">✅ ส่งรายงานแล้ว ขอบคุณ!</p>
              <button onClick={() => setSent(false)} className="mt-2 text-sm text-gray-400">ส่งรายงานใหม่</button>
            </div>
          ) : (
            <>
              <textarea
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="อธิบายปัญหาที่พบ..."
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
              />
              <button
                onClick={handleReport}
                className="mt-3 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white"
              >
                ส่งรายงาน
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
