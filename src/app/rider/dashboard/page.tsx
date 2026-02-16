'use client';

import { useEffect, useState } from 'react';
import { Bike, TrendingUp, Star, Package } from 'lucide-react';
import Link from 'next/link';
import { useLiff } from '@/hooks/useLiff';
import { useAvailableJobs } from '@/hooks/useRealtimeRider';
import { useRiderLocationUpdater } from '@/hooks/useLocation';
import { StatusToggle } from '@/components/rider/StatusToggle';
import { JobCard } from '@/components/rider/JobCard';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Rider, Order } from '@/types/database';
import { formatThaiCurrency } from '@/lib/utils';

export default function RiderDashboardPage() {
  const { isReady, isLoggedIn, profile } = useLiff(process.env.NEXT_PUBLIC_LIFF_ID_RIDER!);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const { jobs } = useAvailableJobs(rider?.id || null);
  useRiderLocationUpdater(rider?.id || null, 30000);

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/riders?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((data) => {
        setRider(data.data || null);
        setLoading(false);
      });
  }, [profile]);

  const handleToggleOnline = async (online: boolean) => {
    if (!rider) return;
    await fetch(`/api/riders/${rider.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_online: online }),
    });
    setRider((r) => r ? { ...r, is_online: online } : null);
  };

  const handleAcceptJob = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'picking_up', riderId: rider?.id }),
    });
  };

  const handleCompleteJob = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered' }),
    });
  };

  if (!isReady || loading) return <PageLoader />;
  if (!isLoggedIn) return <div className="p-4 text-center">กรุณาเข้าสู่ระบบ</div>;
  if (!rider) return <div className="p-4 text-center">ไม่พบข้อมูลไรเดอร์</div>;
  if (!rider.is_approved) return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-gray-900">รอการอนุมัติ</h2>
        <p className="mt-2 text-gray-500 text-sm">แอดมินกำลังตรวจสอบข้อมูลของคุณ</p>
      </div>
    </div>
  );

  const todayJobs = jobs.filter((j) => {
    const today = new Date().toISOString().slice(0, 10);
    return (j.data as unknown as Order).created_at?.slice(0, 10) === today;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-4 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-300 text-2xl">🛵</div>
          <div>
            <p className="text-amber-100 text-sm">ไรเดอร์</p>
            <h1 className="text-xl font-bold text-white">{rider.full_name}</h1>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: <Package className="h-4 w-4" />, label: 'งานวันนี้', value: todayJobs.length },
            { icon: <TrendingUp className="h-4 w-4" />, label: 'งานทั้งหมด', value: rider.total_deliveries },
            { icon: <Star className="h-4 w-4" />, label: 'คะแนน', value: rider.rating.toFixed(1) },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-white/20 p-3 text-center">
              <div className="flex justify-center mb-1 text-white">{s.icon}</div>
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-xs text-amber-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Status toggle */}
        <StatusToggle isOnline={rider.is_online} onChange={handleToggleOnline} />

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/rider/jobs">
            <div className="rounded-2xl bg-white p-4 shadow-sm text-center">
              <Bike className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <p className="font-semibold text-gray-900">งานของฉัน</p>
            </div>
          </Link>
          <Link href="/rider/earnings">
            <div className="rounded-2xl bg-white p-4 shadow-sm text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-gray-900">รายได้</p>
            </div>
          </Link>
        </div>

        {/* Active jobs */}
        {jobs.length > 0 && (
          <div>
            <h2 className="mb-3 text-base font-bold text-gray-900">งานปัจจุบัน</h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  order={job.data as unknown as Order}
                  onAccept={handleAcceptJob}
                  onComplete={handleCompleteJob}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
