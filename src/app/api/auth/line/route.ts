import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { lineUserId, displayName, pictureUrl, accessToken } = await req.json();

    if (!lineUserId) {
      return NextResponse.json({ error: 'lineUserId required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upsert user
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        {
          line_user_id: lineUserId,
          display_name: displayName,
          avatar_url: pictureUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'line_user_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: user });
  } catch (err) {
    console.error('LINE auth error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
