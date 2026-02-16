import { NextRequest, NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json(); // 'approved' | 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from('merchants')
    .update({ is_approved: status === 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify merchant via LINE if approved
  if (status === 'approved' && data.line_user_id) {
    const { pushMessage } = await import('@/lib/line/messaging');
    await pushMessage(data.line_user_id, [{
      type: 'text',
      text: `🎉 ร้านค้า "${data.name}" ได้รับการอนุมัติแล้ว!\nเริ่มขายได้เลยที่ LINE Official Account @786zqjkg`,
    }]).catch(() => {});
  }

  return NextResponse.json({ data });
}
