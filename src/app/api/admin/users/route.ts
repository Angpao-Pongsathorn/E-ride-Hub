import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase/admin';

export async function GET() {
  const { data, error } = await adminSupabase
    .from('users')
    .select('id, line_user_id, display_name, avatar_url, role, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
