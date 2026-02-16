import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const lineUserId = searchParams.get('lineUserId');
  const all = searchParams.get('all') === 'true';
  const online = searchParams.get('online') === 'true';

  try {
    let query = supabase.from('riders').select('*');

    if (lineUserId) {
      const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
      if (user) query = query.eq('user_id', user.id);
    } else if (online) {
      query = query.eq('is_online', true).eq('is_approved', true);
    } else if (!all) {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Single rider or list
    if (lineUserId) {
      return NextResponse.json({ data: data?.[0] || null });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await req.json();
    const { lineUserId, fullName, phone, vehicleType, vehiclePlate, vehicleBrand } = body;

    let userId: string | null = null;
    if (lineUserId) {
      const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
      userId = user?.id || null;
    }

    const { data, error } = await supabase
      .from('riders')
      .insert({
        user_id: userId,
        full_name: fullName,
        phone,
        vehicle_type: vehicleType,
        vehicle_plate: vehiclePlate,
        vehicle_brand: vehicleBrand,
        is_approved: false,
        is_online: false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
