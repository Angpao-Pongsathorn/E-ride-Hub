import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('riders')
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

// Create /api/riders/[id] directory for sub-routes
export const dynamic = 'force-dynamic';
