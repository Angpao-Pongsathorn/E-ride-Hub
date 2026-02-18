'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
}

export function ComingSoon({ title = 'บริการนี้' }: ComingSoonProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-1">กำลังจะเปิดให้บริการเร็วๆ นี้</p>
      <p className="text-xs text-gray-400 mb-8">ติดตามข่าวสารผ่าน LINE ของเราได้เลยครับ</p>
      <button
        onClick={() => router.replace('/home')}
        className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับหน้าหลัก
      </button>
    </div>
  );
}
