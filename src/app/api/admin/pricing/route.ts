import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase/admin';

export async function GET() {
  const { data, error } = await adminSupabase
    .from('platform_settings')
    .select('settings')
    .eq('key', 'pricing')
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data?.settings || null });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const { error } = await adminSupabase
    .from('platform_settings')
    .upsert({ key: 'pricing', settings: body, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
