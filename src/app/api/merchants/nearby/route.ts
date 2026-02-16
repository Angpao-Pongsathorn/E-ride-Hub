import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '5'); // km
  const category = searchParams.get('category');

  if (!lat || !lng) {
    // Fallback: return all open merchants
    const query = adminSupabase
      .from('merchants')
      .select('id, name, category, rating, is_open, cover_image_url, delivery_time, min_order')
      .eq('is_approved', true)
      .eq('is_open', true)
      .order('rating', { ascending: false });

    if (category && category !== 'ทั้งหมด') query.eq('category', category);

    const { data, error } = await query.limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  // PostGIS query for nearby merchants within radius km
  const { data, error } = await adminSupabase.rpc('get_nearby_merchants', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radius,
  });

  if (error) {
    // Fallback to all merchants if PostGIS not available
    const { data: fallback } = await adminSupabase
      .from('merchants')
      .select('id, name, category, rating, is_open, cover_image_url, delivery_time, min_order')
      .eq('is_approved', true)
      .limit(20);

    return NextResponse.json({ data: fallback });
  }

  return NextResponse.json({ data });
}
