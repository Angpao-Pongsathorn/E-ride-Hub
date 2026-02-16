'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Bike } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Rider } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { formatThaiDate } from '@/lib/utils';

export default function AdminRidersPage() {
  const router = useRouter();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRiders = () => {
    fetch('/api/riders?all=true')
      .then((r) => r.json())
      .then((d) => { setRiders(d.data || []); setLoading(false); });
  };

  useEffect(() => { fetchRiders(); }, []);

  const handleApprove = async (id: string) => {
    await fetch(`/api/riders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: true }),
    });
    fetchRiders();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">จัดการไรเดอร์</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {riders.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Bike className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{r.full_name}</p>
                  <p className="text-xs text-gray-400">{r.phone} · {r.vehicle_type || 'มอเตอร์ไซค์'}</p>
                  <p className="text-xs text-gray-400">{formatThaiDate(r.created_at)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={r.is_approved ? 'default' : 'secondary'}>
                  {r.is_approved ? 'อนุมัติ' : 'รออนุมัติ'}
                </Badge>
                <Badge variant={r.is_online ? 'blue' : 'gray'}>
                  {r.is_online ? '🟢 ออนไลน์' : '⭕ ออฟไลน์'}
                </Badge>
              </div>
            </div>

            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span>ส่งแล้ว {r.total_deliveries} งาน</span>
              <span>⭐ {r.rating.toFixed(1)}</span>
              <span>รับงาน {r.acceptance_rate.toFixed(0)}%</span>
            </div>

            {!r.is_approved && (
              <Button size="sm" className="mt-3 w-full" onClick={() => handleApprove(r.id)}>
                <CheckCircle className="h-4 w-4 mr-2" /> อนุมัติไรเดอร์
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
