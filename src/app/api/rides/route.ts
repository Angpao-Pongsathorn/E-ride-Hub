import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const lineUserId = searchParams.get('lineUserId');

  try {
    let customerId: string | null = null;
    if (lineUserId) {
      const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
      customerId = user?.id || null;
    }

    const query = supabase.from('rides').select('*, rider:riders(full_name, phone, vehicle_plate, vehicle_type)').order('created_at', { ascending: false });
    const { data, error } = customerId ? await query.eq('customer_id', customerId) : await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await req.json();
    const { lineUserId, pickupAddress, pickupLatitude, pickupLongitude, dropoffAddress, dropoffLatitude, dropoffLongitude, fare, paymentMethod } = body;

    let customerId: string | null = null;
    if (lineUserId) {
      const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
      customerId = user?.id || null;
    }

    const rideNumber = generateOrderNumber('RID');
    const { data, error } = await supabase
      .from('rides')
      .insert({
        ride_number: rideNumber,
        customer_id: customerId,
        status: 'searching',
        pickup_address: pickupAddress,
        pickup_latitude: pickupLatitude,
        pickup_longitude: pickupLongitude,
        dropoff_address: dropoffAddress,
        dropoff_latitude: dropoffLatitude,
        dropoff_longitude: dropoffLongitude,
        fare,
        payment_method: paymentMethod || 'cash',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
