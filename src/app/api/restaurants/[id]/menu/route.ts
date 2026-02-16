import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: merchantId } = await params;
  const supabase = createAdminClient();
  try {
    const body = await req.json();
    const { name, price, description, categoryId, imageUrl, preparationTime } = body;

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        merchant_id: merchantId,
        category_id: categoryId || null,
        name,
        price,
        description,
        image_url: imageUrl || null,
        preparation_time: preparationTime || 15,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: merchantId } = await params;
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('menu_items')
      .update(body)
      .eq('id', itemId)
      .eq('merchant_id', merchantId)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
