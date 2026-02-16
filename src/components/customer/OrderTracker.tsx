'use client';

import { Check, Clock, ChefHat, Package, Bike, Home } from 'lucide-react';
import { OrderStatus } from '@/types/database';
import { cn } from '@/lib/utils';

const STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'confirmed', label: 'ร้านรับแล้ว', icon: <Check className="h-4 w-4" /> },
  { status: 'preparing', label: 'กำลังเตรียม', icon: <ChefHat className="h-4 w-4" /> },
  { status: 'ready', label: 'พร้อมส่ง', icon: <Package className="h-4 w-4" /> },
  { status: 'picking_up', label: 'ไรเดอร์รับของ', icon: <Bike className="h-4 w-4" /> },
  { status: 'delivering', label: 'กำลังส่ง', icon: <Bike className="h-4 w-4" /> },
  { status: 'delivered', label: 'ส่งสำเร็จ', icon: <Home className="h-4 w-4" /> },
];

const STATUS_ORDER: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'picking_up', 'delivering', 'delivered',
];

interface OrderTrackerProps {
  status: OrderStatus;
  estimatedMinutes?: number;
}

export function OrderTracker({ status, estimatedMinutes }: OrderTrackerProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-center">
        <p className="font-semibold text-red-600">ออเดอร์ถูกยกเลิก</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      {estimatedMinutes && (
        <div className="mb-4 flex items-center gap-2 text-emerald-600">
          <Clock className="h-5 w-5" />
          <span className="font-semibold">ประมาณ {estimatedMinutes} นาที</span>
        </div>
      )}

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const stepIndex = STATUS_ORDER.indexOf(step.status);
          const isDone = stepIndex < currentIndex;
          const isCurrent = stepIndex === currentIndex;

          return (
            <div key={step.status} className="flex items-center gap-3">
              {/* Icon circle */}
              <div
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isDone ? 'border-emerald-500 bg-emerald-500 text-white' :
                  isCurrent ? 'border-emerald-500 bg-emerald-50 text-emerald-600 animate-pulse' :
                  'border-gray-200 bg-gray-50 text-gray-400'
                )}
              >
                {step.icon}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-emerald-600' :
                  isDone ? 'text-gray-500 line-through' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="ml-4 mt-2 h-3 w-0.5 bg-gray-200 absolute translate-x-3.5 translate-y-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
