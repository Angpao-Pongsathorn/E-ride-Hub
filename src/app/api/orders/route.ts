import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateOrderNumber } from '@/lib/utils';
import { buildOrderConfirmFlex } from '@/lib/line/flex-messages';
import { pushMessage } from '@/lib/line/messaging';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const lineUserId = searchParams.get('lineUserId');
  const merchantId = searchParams.get('merchantId');

  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*), merchant:merchants(name, image_url), rider:riders(full_name, phone)')
      .order('created_at', { ascending: false });

    if (lineUserId) {
      const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
      if (user) query = query.eq('customer_id', user.id);
    } else if (merchantId) {
      query = query.eq('merchant_id', merchantId);
    }

    const limitParam = parseInt(searchParams.get('limit') || '50');
    const { data, error } = await query.limit(limitParam);
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
      merchantId, lineUserId, items,
      deliveryAddress, deliveryLatitude, deliveryLongitude, deliveryNote,
      subtotal, deliveryFee, platformFee, paymentMethod,
    } = body;
    const total = body.total ?? body.totalAmount ?? (subtotal + (deliveryFee || 0) + (platformFee || 0));

    // Get user
    let customerId: string | null = null;
    if (lineUserId) {
      const { data: user } = await supabase.from('users').select('id').eq('line_user_id', lineUserId).single();
      customerId = user?.id || null;
    }

    // Get merchant commission
    const { data: merchant } = await supabase.from('merchants').select('commission_rate, name').eq('id', merchantId).single();
    const commissionAmount = merchant ? subtotal * (merchant.commission_rate / 100) : 0;

    const orderNumber = generateOrderNumber('ERH');

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        merchant_id: merchantId,
        status: 'pending',
        delivery_address: deliveryAddress,
        delivery_latitude: deliveryLatitude,
        delivery_longitude: deliveryLongitude,
        delivery_note: deliveryNote,
        subtotal,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        total,
        commission_amount: commissionAmount,
        payment_method: paymentMethod || 'cash',
        estimated_delivery_time: 30,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Create order items
    if (items?.length > 0) {
      await supabase.from('order_items').insert(
        items.map((item: { menuItemId: string; name?: string; quantity: number; unitPrice?: number; price?: number; totalPrice?: number; options?: object; specialInstructions?: string }) => {
          const unitPrice = item.unitPrice ?? item.price ?? 0;
          return {
            order_id: order.id,
            menu_item_id: item.menuItemId,
            item_name: item.name || '',
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: item.totalPrice ?? (unitPrice * item.quantity),
            options: item.options || null,
            special_instructions: item.specialInstructions || null,
          };
        })
      );
    }

    // Send LINE notification to customer
    if (lineUserId && merchant) {
      const orderWithItems = { ...order, order_items: items };
      const flexMsg = buildOrderConfirmFlex(orderWithItems as never, merchant.name);
      await pushMessage(lineUserId, [flexMsg]).catch(console.error);
    }

    // Trigger rider matching (async)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/riders/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, merchantId }),
    }).catch(console.error);

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
