import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { pushOrderStatusUpdate } from '@/lib/line/messaging';
import { getOrderStatusText } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  try {
    const body = await req.json();
    const { status, riderId } = body;

    const updateData: Record<string, unknown> = { status };
    if (riderId) updateData.rider_id = riderId;
    if (status === 'delivered') updateData.actual_delivery_time = new Date().toISOString();

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select('*, customer:users(line_user_id)')
      .single();

    if (error) throw error;

    // Send LINE notification to customer
    const customer = order.customer as { line_user_id: string } | null;
    if (customer?.line_user_id) {
      await pushOrderStatusUpdate(
        customer.line_user_id,
        order.order_number,
        status,
        getOrderStatusText(status)
      ).catch(console.error);
    }

    return NextResponse.json({ data: order });
  } catch (err) {
    console.error('Update status error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
