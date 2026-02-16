'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Rider } from '@/types/database';

export function useRealtimeRiderLocation(riderId: string | null) {
  const [rider, setRider] = useState<Rider | null>(null);

  useEffect(() => {
    if (!riderId) return;
    const supabase = createClient();

    supabase
      .from('riders')
      .select('*')
      .eq('id', riderId)
      .single()
      .then(({ data }) => { if (data) setRider(data as Rider); });

    const channel = supabase
      .channel(`rider-location:${riderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'riders', filter: `id=eq.${riderId}` },
        (payload) => {
          setRider((prev) => prev ? { ...prev, ...payload.new } : payload.new as Rider);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [riderId]);

  return rider;
}

export function useAvailableJobs(riderId: string | null) {
  const [jobs, setJobs] = useState<{ type: string; id: string; data: Record<string, unknown> }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!riderId) return;
    const supabase = createClient();

    // Fetch orders assigned to this rider that are in picking_up status
    const fetchJobs = async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('*, merchant:merchants(*), order_items(*)')
        .eq('rider_id', riderId)
        .in('status', ['picking_up', 'delivering'])
        .order('created_at', { ascending: false });

      const jobList = (orders || []).map((o) => ({
        type: 'food_delivery',
        id: o.id,
        data: o as Record<string, unknown>,
      }));
      setJobs(jobList);
      setLoading(false);
    };

    fetchJobs();

    const channel = supabase
      .channel(`rider-jobs:${riderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `rider_id=eq.${riderId}` },
        () => { fetchJobs(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [riderId]);

  return { jobs, loading };
}
