'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Merchant } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { formatThaiDate } from '@/lib/utils';

export default function AdminMerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const fetchMerchants = () => {
    fetch('/api/restaurants?all=true')
      .then((r) => r.json())
      .then((d) => { setMerchants(d.data || []); setLoading(false); });
  };

  useEffect(() => { fetchMerchants(); }, []);

  const handleApprove = async (id: string) => {
    await fetch(`/api/restaurants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: true }),
    });
    fetchMerchants();
  };

  const filtered = merchants.filter((m) => {
    if (filter === 'pending') return !m.is_approved;
    if (filter === 'approved') return m.is_approved;
    return true;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">จัดการร้านค้า</h1>
      </div>

      <div className="px-4 py-4">
        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium ${filter === f ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 shadow-sm'}`}
            >
              {f === 'all' ? 'ทั้งหมด' : f === 'pending' ? 'รออนุมัติ' : 'อนุมัติแล้ว'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <Store className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.category} · {formatThaiDate(m.created_at)}</p>
                  </div>
                </div>
                <Badge variant={m.is_approved ? 'default' : 'secondary'}>
                  {m.is_approved ? 'อนุมัติ' : 'รออนุมัติ'}
                </Badge>
              </div>

              {!m.is_approved && (
                <Button size="sm" className="mt-3 w-full" onClick={() => handleApprove(m.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" /> อนุมัติร้านค้า
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
