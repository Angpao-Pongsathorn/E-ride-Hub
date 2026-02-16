'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/hooks/useLiff';
import { useAvailableJobs } from '@/hooks/useRealtimeRider';
import { JobCard } from '@/components/rider/JobCard';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Rider, Order } from '@/types/database';

export default function RiderJobsPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, profile } = useLiff(process.env.NEXT_PUBLIC_LIFF_ID_RIDER!);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const { jobs } = useAvailableJobs(rider?.id || null);

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/riders?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then((data) => { setRider(data.data || null); setLoading(false); });
  }, [profile]);

  const handleAccept = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'picking_up', riderId: rider?.id }),
    });
  };

  const handleComplete = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered' }),
    });
  };

  if (!isReady || loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">งานของฉัน</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <div className="text-4xl mb-2">🛵</div>
            <p>ยังไม่มีงาน</p>
            <p className="text-sm mt-1">เปิดรับงานเพื่อรับออเดอร์ใหม่</p>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              order={job.data as unknown as Order}
              onAccept={handleAccept}
              onComplete={handleComplete}
            />
          ))
        )}
      </div>
    </div>
  );
}
