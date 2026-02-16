import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const lineUserId = searchParams.get('lineUserId');
  const period = searchParams.get('period') || 'today';

  try {
    if (!lineUserId) return NextResponse.json({ data: [] });

    const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
    if (!user) return NextResponse.json({ data: [] });

    const { data: rider } = await supabase.from('riders').select('id').eq('user_id', user.id).single();
    if (!rider) return NextResponse.json({ data: [] });

    // Calculate date range
    const now = new Date();
    let startDate: string;
    if (period === 'today') {
      startDate = now.toISOString().slice(0, 10);
    } else if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().slice(0, 10);
    } else {
      const d = new Date(now);
      d.setDate(1);
      startDate = d.toISOString().slice(0, 10);
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, delivery_fee, created_at, status')
      .eq('rider_id', rider.id)
      .eq('status', 'delivered')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    const earnings = (orders || []).map((o) => ({
      id: o.id,
      date: o.created_at,
      amount: o.delivery_fee * 0.7, // 70% to rider
      type: 'ส่งอาหาร',
      reference: o.order_number,
    }));

    return NextResponse.json({ data: earnings });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
