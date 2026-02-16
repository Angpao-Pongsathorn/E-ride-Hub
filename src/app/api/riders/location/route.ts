import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { riderId, lat, lng } = await req.json();
    if (!riderId || lat == null || lng == null) {
      return NextResponse.json({ error: 'riderId, lat, lng required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('riders')
      .update({
        current_latitude: lat,
        current_longitude: lng,
      })
      .eq('id', riderId)
      .select('id, current_latitude, current_longitude')
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
