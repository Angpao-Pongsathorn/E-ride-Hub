'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types/database';

export function useRealtimeOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const supabase = createClient();

    // Initial fetch
    supabase
      .from('orders')
      .select('*, merchant:merchants(*), rider:riders(*), order_items(*)')
      .eq('id', orderId)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setOrder(data as Order);
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder((prev) => prev ? { ...prev, ...payload.new } : payload.new as Order);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  return { order, loading, error };
}

export function useRealtimeMerchantOrders(merchantId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!merchantId) return;
    const supabase = createClient();

    supabase
      .from('orders')
      .select('*, order_items(*), rider:riders(*)')
      .eq('merchant_id', merchantId)
      .not('status', 'in', '("delivered","cancelled")')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) || []);
        setLoading(false);
      });

    const channel = supabase
      .channel(`merchant-orders:${merchantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `merchant_id=eq.${merchantId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [merchantId]);

  return { orders, loading };
}
