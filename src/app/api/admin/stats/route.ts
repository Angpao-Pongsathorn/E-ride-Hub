import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  try {
    const [
      { count: totalOrders },
      { count: totalUsers },
      { count: totalRiders },
      { count: totalMerchants },
      { count: pendingOrders },
      { data: revenueData },
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('riders').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('total').eq('status', 'delivered'),
    ]);

    const totalRevenue = (revenueData || []).reduce((s: number, o: { total: number }) => s + (o.total || 0), 0);
    const platformRevenue = Math.round(totalRevenue * 0.15); // 15% commission

    return NextResponse.json({
      data: {
        totalOrders: totalOrders || 0,
        totalRevenue,
        platformRevenue,
        totalUsers: totalUsers || 0,
        totalRiders: totalRiders || 0,
        totalMerchants: totalMerchants || 0,
        pendingOrders: pendingOrders || 0,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
