import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  try {
    const { data: merchant, error: mErr } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', id)
      .single();
    if (mErr) throw mErr;

    // Get categories with items
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('merchant_id', id)
      .eq('is_active', true)
      .order('sort_order');

    const { data: items } = await supabase
      .from('menu_items')
      .select('*')
      .eq('merchant_id', id)
      .order('sort_order');

    // Group items by category
    const categoriesWithItems = categories?.map((cat) => ({
      ...cat,
      items: (items || []).filter((i) => i.category_id === cat.id),
    })) || [];

    // Items without category
    const uncategorized = (items || []).filter((i) => !i.category_id);
    if (uncategorized.length > 0 && categoriesWithItems.length === 0) {
      categoriesWithItems.push({ id: 'default', merchant_id: id, name: 'เมนูทั้งหมด', sort_order: 0, is_active: true, items: uncategorized });
    }

    return NextResponse.json({ data: { merchant, categories: categoriesWithItems } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('merchants')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
