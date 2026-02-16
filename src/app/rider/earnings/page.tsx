'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/hooks/useLiff';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { formatThaiCurrency, formatShortDate } from '@/lib/utils';

interface EarningRecord {
  id: string;
  date: string;
  amount: number;
  type: string;
  reference: string;
}

export default function RiderEarningsPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, profile } = useLiff(process.env.NEXT_PUBLIC_LIFF_ID_RIDER!);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/riders/earnings?lineUserId=${profile.userId}&period=${period}`)
      .then((r) => r.json())
      .then((data) => { setEarnings(data.data || []); setLoading(false); });
  }, [profile, period]);

  const total = earnings.reduce((s, e) => s + e.amount, 0);

  if (!isReady || loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">รายได้</h1>
      </div>

      {/* Summary card */}
      <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5" />
          <span className="text-emerald-100 text-sm">รายได้รวม</span>
        </div>
        <p className="text-3xl font-bold">{formatThaiCurrency(total)}</p>
        <p className="text-emerald-100 text-sm mt-1">{earnings.length} งาน</p>
      </div>

      {/* Period filter */}
      <div className="mx-4 mt-4 flex gap-2">
        {([['today', 'วันนี้'], ['week', 'สัปดาห์นี้'], ['month', 'เดือนนี้']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              period === val ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mx-4 mt-4 space-y-2">
        {earnings.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">ยังไม่มีรายได้ในช่วงนี้</p>
          </div>
        ) : (
          earnings.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs text-gray-400">{formatShortDate(e.date)}</p>
                <p className="font-medium text-gray-900">{e.type}</p>
                <p className="text-xs text-gray-400">#{e.reference}</p>
              </div>
              <span className="font-bold text-emerald-600">{formatThaiCurrency(e.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
