'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Bike, Package, Clock } from 'lucide-react';
import { useRealtimeOrder } from '@/hooks/useRealtimeOrder';
import type { Order } from '@/types/database';

const STATUS_STEPS = [
  { key: 'pending', label: 'รอร้านรับออเดอร์' },
  { key: 'confirmed', label: 'ร้านรับออเดอร์แล้ว' },
  { key: 'preparing', label: 'กำลังเตรียม' },
  { key: 'ready', label: 'พร้อมส่ง' },
  { key: 'picking_up', label: 'ไรเดอร์รับของ' },
  { key: 'delivering', label: 'กำลังจัดส่ง' },
  { key: 'delivered', label: 'ส่งแล้ว ✓' },
] as const;

function getStepIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const { order, loading } = useRealtimeOrder(params.orderId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 text-center text-gray-500">ไม่พบออเดอร์</div>;
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDone = order.status === 'delivered';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Banner */}
      <div className={`px-4 pt-10 pb-6 ${isDone ? 'bg-green-500' : isCancelled ? 'bg-red-500' : 'bg-orange-500'}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">
            {isDone ? '✅' : isCancelled ? '❌' : '🛵'}
          </div>
          <p className="text-white font-bold text-xl">
            {isCancelled ? 'ออเดอร์ถูกยกเลิก' : isDone ? 'จัดส่งสำเร็จ!' : STATUS_STEPS[currentStep]?.label || order.status}
          </p>
          <p className="text-white/80 text-sm mt-1">#{order.order_number}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Progress Steps */}
        {!isCancelled && (
          <div className="rounded-2xl bg-white shadow-sm p-4">
            <p className="font-semibold text-gray-900 mb-4">สถานะออเดอร์</p>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 ${active ? 'text-orange-500' : 'text-green-500'}`} />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0 text-gray-200" />
                    )}
                    <p className={`text-sm ${done ? (active ? 'font-semibold text-orange-500' : 'text-gray-900') : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="rounded-2xl bg-white shadow-sm p-4 space-y-2">
          <p className="font-semibold text-gray-900 mb-1">รายละเอียดออเดอร์</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">หมายเลขออเดอร์</span>
            <span className="font-medium text-gray-900">{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ยอดรวม</span>
            <span className="font-bold text-orange-500">฿{(order.total ?? 0).toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">วิธีชำระ</span>
            <span className="text-gray-900">{order.payment_method === 'cash' ? 'เงินสด' : 'พร้อมเพย์'}</span>
          </div>
          {order.delivery_address && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ที่อยู่</span>
              <span className="text-gray-900 text-right max-w-[60%]">{order.delivery_address}</span>
            </div>
          )}
        </div>

        {isDone && (
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-center">
            <p className="text-green-700 font-medium">ขอบคุณที่ใช้บริการ! 🙏</p>
            <p className="text-green-600 text-sm mt-0.5">อร่อยไหม? อย่าลืมให้คะแนนร้านค้านะ</p>
          </div>
        )}
      </div>
    </div>
  );
}
