import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const lineUserId = searchParams.get('lineUserId');
  const all = searchParams.get('all') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50');
  const category = searchParams.get('category');

  try {
    let query = supabase
      .from('merchants')
      .select('id, name, category, rating, is_open, cover_image_url, delivery_time, min_order, address_text, created_at')
      .order('rating', { ascending: false });

    if (lineUserId) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('line_user_id', lineUserId)
        .single();
      if (user) query = query.eq('user_id', user.id);
    } else if (!all) {
      query = query.eq('is_approved', true);
    }

    if (category && category !== 'ทั้งหมด') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.limit(limit);
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
      lineUserId, name, description, category, phone,
      address, district, province, lat, lng,
      ownerName, ownerIdCard, ownerPhone,
      openTime, closeTime,
      bankName, bankAccount, bankAccountName,
    } = body;

    // Get or create user
    let userId: string | null = null;
    if (lineUserId) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('line_user_id', lineUserId)
        .single();
      userId = user?.id || null;
    }

    const addressText = [address, district, province].filter(Boolean).join(' ');

    const insertData: Record<string, unknown> = {
      user_id: userId,
      line_user_id: lineUserId,
      name,
      description,
      category,
      phone,
      address_text: addressText,
      is_approved: false,
      is_open: false,
      open_time: openTime,
      close_time: closeTime,
    };

    if (lat) insertData.latitude = lat;
    if (lng) insertData.longitude = lng;
    if (ownerName) insertData.owner_name = ownerName;
    if (ownerIdCard) insertData.owner_id_card = ownerIdCard;
    if (ownerPhone) insertData.owner_phone = ownerPhone;
    if (bankName) insertData.bank_name = bankName;
    if (bankAccount) insertData.bank_account = bankAccount;
    if (bankAccountName) insertData.bank_account_name = bankAccountName;

    const { data, error } = await supabase
      .from('merchants')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
