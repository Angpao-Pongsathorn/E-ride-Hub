'use client';

import { Check, Home, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterShopSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-orange-500 flex flex-col items-center justify-center px-6 text-center">
      <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
        <Store className="h-10 w-10 text-white" />
      </div>
      <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4 -mt-8 ml-10">
        <Check className="h-6 w-6 text-orange-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">ลงทะเบียนร้านสำเร็จ!</h1>
      <p className="text-orange-100 text-sm mb-1">ทีมงานจะตรวจสอบและอนุมัติภายใน 1-2 วันทำการ</p>
      <p className="text-white/70 text-xs mb-10">คุณจะได้รับแจ้งเตือนผ่าน LINE เมื่ออนุมัติแล้ว</p>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => router.push('/home')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-semibold text-orange-500 shadow"
        >
          <Home className="h-4 w-4" />
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
