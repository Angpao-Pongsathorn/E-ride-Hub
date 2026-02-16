import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { findAndRankRiders } from '@/lib/matching';
import { pushNewJobNotification } from '@/lib/line/messaging';
import { Rider } from '@/types/database';

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { orderId, merchantId } = await req.json();

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*, merchant:merchants(latitude, longitude, address_text)')
      .eq('id', orderId)
      .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const merchant = order.merchant as { latitude: number; longitude: number; address_text: string };
    if (!merchant?.latitude) {
      return NextResponse.json({ error: 'Merchant location not set' }, { status: 400 });
    }

    // Get online riders
    const { data: riders } = await supabase
      .from('riders')
      .select('*')
      .eq('is_online', true)
      .eq('is_approved', true);

    if (!riders?.length) {
      return NextResponse.json({ message: 'No riders available' });
    }

    // Get today's delivery counts
    const today = new Date().toISOString().slice(0, 10);
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('rider_id')
      .gte('created_at', today)
      .not('rider_id', 'is', null);

    const todayDeliveriesMap = new Map<string, number>();
    (todayOrders || []).forEach((o) => {
      if (o.rider_id) {
        todayDeliveriesMap.set(o.rider_id, (todayDeliveriesMap.get(o.rider_id) || 0) + 1);
      }
    });

    // Rank riders
    const ranked = findAndRankRiders(
      riders as Rider[],
      merchant.latitude,
      merchant.longitude,
      todayDeliveriesMap
    );

    if (!ranked.length) {
      return NextResponse.json({ message: 'No riders in range' });
    }

    // Assign best rider
    const bestRider = ranked[0].rider;

    // Get rider's LINE user ID
    const { data: riderUser } = await supabase
      .from('users')
      .select('line_user_id')
      .eq('id', bestRider.user_id)
      .single();

    // Send notification to rider
    if (riderUser?.line_user_id) {
      await pushNewJobNotification(
        riderUser.line_user_id,
        orderId,
        'food_delivery',
        merchant.address_text || 'ร้านค้า',
        order.delivery_address || 'ที่อยู่ลูกค้า',
        order.delivery_fee
      ).catch(console.error);
    }

    return NextResponse.json({ data: { riderId: bestRider.id, distance: ranked[0].distanceKm } });
  } catch (err) {
    console.error('Rider matching error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
