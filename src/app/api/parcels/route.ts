import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const lineUserId = searchParams.get('lineUserId');

  try {
    let senderId: string | null = null;
    if (lineUserId) {
      const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
      senderId = user?.id || null;
    }
    const query = supabase.from('parcels').select('*').order('created_at', { ascending: false });
    const { data, error } = senderId ? await query.eq('sender_id', senderId) : await query;
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
    const {
      lineUserId,
      pickupAddress, pickupLatitude, pickupLongitude, pickupContactName, pickupContactPhone,
      dropoffAddress, dropoffLatitude, dropoffLongitude, dropoffContactName, dropoffContactPhone,
      description, size, weightKg, deliveryFee, paymentMethod,
    } = body;

    let senderId: string | null = null;
    if (lineUserId) {
      const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
      senderId = user?.id || null;
    }

    const parcelNumber = generateOrderNumber('PKG');
    const { data, error } = await supabase
      .from('parcels')
      .insert({
        parcel_number: parcelNumber,
        sender_id: senderId,
        status: 'pending',
        pickup_address: pickupAddress,
        pickup_latitude: pickupLatitude,
        pickup_longitude: pickupLongitude,
        pickup_contact_name: pickupContactName,
        pickup_contact_phone: pickupContactPhone,
        dropoff_address: dropoffAddress,
        dropoff_latitude: dropoffLatitude,
        dropoff_longitude: dropoffLongitude,
        dropoff_contact_name: dropoffContactName,
        dropoff_contact_phone: dropoffContactPhone,
        description,
        size,
        weight_kg: weightKg,
        delivery_fee: deliveryFee,
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
