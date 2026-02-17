'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export type OrderType = 'food' | 'parcel' | 'ride';

interface OrderCountdownOverlayProps {
  orderType: OrderType;
  seconds?: number; // default 5
  onConfirm: () => void;   // called when countdown finishes
  onCancel: () => void;    // called when user taps cancel
}

const ORDER_COPY: Record<OrderType, { emoji: string; title: string; subtitle: string; cancelLabel: string }> = {
  food: {
    emoji: '🛵',
    title: 'กำลังส่งคำสั่งซื้อ...',
    subtitle: 'กดยกเลิกหากต้องการเปลี่ยนใจ',
    cancelLabel: 'ยกเลิกคำสั่งซื้อ',
  },
  parcel: {
    emoji: '📦',
    title: 'กำลังส่งคำขอพัสดุ...',
    subtitle: 'กดยกเลิกหากต้องการเปลี่ยนใจ',
    cancelLabel: 'ยกเลิกคำขอ',
  },
  ride: {
    emoji: '🏍️',
    title: 'กำลังจองรถ...',
    subtitle: 'กดยกเลิกหากต้องการเปลี่ยนใจ',
    cancelLabel: 'ยกเลิกการจอง',
  },
};

export function OrderCountdownOverlay({
  orderType,
  seconds = 5,
  onConfirm,
  onCancel,
}: OrderCountdownOverlayProps) {
  const [remaining, setRemaining] = useState(seconds);
  const confirmedRef = useRef(false);
  const copy = ORDER_COPY[orderType];

  useEffect(() => {
    if (remaining <= 0) {
      if (!confirmedRef.current) {
        confirmedRef.current = true;
        onConfirm();
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onConfirm]);

  const progress = ((seconds - remaining) / seconds) * 100; // 0→100

  // SVG circle progress
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-3xl bg-white px-6 pb-6 pt-8 shadow-2xl text-center">
        {/* Emoji */}
        <div className="text-5xl mb-4">{copy.emoji}</div>

        {/* Title */}
        <p className="text-lg font-bold text-gray-900">{copy.title}</p>
        <p className="text-sm text-gray-500 mt-1 mb-6">{copy.subtitle}</p>

        {/* SVG Hourglass / countdown ring */}
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
            {/* Track */}
            <circle
              cx="56" cy="56" r={r}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            {/* Progress arc */}
            <circle
              cx="56" cy="56" r={r}
              fill="none"
              stroke="#f97316"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          {/* Center number */}
          <span className="text-4xl font-bold text-gray-900 tabular-nums">{remaining}</span>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-600 active:bg-gray-50"
        >
          <X className="h-4 w-4" />
          {copy.cancelLabel}
        </button>
      </div>
    </div>
  );
}
