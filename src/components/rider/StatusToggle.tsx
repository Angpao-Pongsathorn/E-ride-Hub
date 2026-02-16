'use client';

import { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface StatusToggleProps {
  isOnline: boolean;
  onChange: (online: boolean) => Promise<void>;
}

export function StatusToggle({ isOnline, onChange }: StatusToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (value: boolean) => {
    setLoading(true);
    try {
      await onChange(value);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-between rounded-2xl p-4 transition-colors',
      isOnline ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50 border-2 border-gray-200'
    )}>
      <div>
        <p className="font-semibold text-gray-900">
          {isOnline ? '🟢 กำลังรับงาน' : '⭕ ปิดรับงาน'}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {isOnline ? 'คุณกำลังออนไลน์ และรับงานได้' : 'กดเปิดเพื่อรับงาน'}
        </p>
      </div>

      <Switch
        checked={isOnline}
        onCheckedChange={handleToggle}
        disabled={loading}
        className={cn(
          'relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50',
          isOnline ? 'bg-emerald-500' : 'bg-gray-300'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform',
            isOnline ? 'translate-x-8' : 'translate-x-1'
          )}
        />
      </Switch>
    </div>
  );
}
