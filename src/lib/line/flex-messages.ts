import { Order } from '@/types/database';

export function buildOrderConfirmFlex(order: Order, merchantName: string) {
  return {
    type: 'flex',
    altText: `ยืนยันออเดอร์ #${order.order_number}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#10B981',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: 'ยืนยันออเดอร์แล้ว ✓', color: '#ffffff', weight: 'bold', size: 'lg' },
          { type: 'text', text: `#${order.order_number}`, color: '#d1fae5', size: 'sm' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: merchantName, weight: 'bold', size: 'md', color: '#111827' },
          { type: 'separator', margin: 'md' },
          {
            type: 'box', layout: 'horizontal', margin: 'md',
            contents: [
              { type: 'text', text: 'ยอดรวม', flex: 1, color: '#6B7280', size: 'sm' },
              { type: 'text', text: `฿${order.subtotal.toFixed(2)}`, flex: 1, align: 'end', size: 'sm' },
            ],
          },
          {
            type: 'box', layout: 'horizontal', margin: 'sm',
            contents: [
              { type: 'text', text: 'ค่าจัดส่ง', flex: 1, color: '#6B7280', size: 'sm' },
              { type: 'text', text: `฿${order.delivery_fee.toFixed(2)}`, flex: 1, align: 'end', size: 'sm' },
            ],
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'box', layout: 'horizontal', margin: 'md',
            contents: [
              { type: 'text', text: 'ทั้งหมด', flex: 1, weight: 'bold' },
              { type: 'text', text: `฿${order.total.toFixed(2)}`, flex: 1, align: 'end', weight: 'bold', color: '#10B981', size: 'lg' },
            ],
          },
          {
            type: 'box', layout: 'horizontal', margin: 'md',
            contents: [
              { type: 'text', text: 'เวลาประมาณ', flex: 1, color: '#6B7280', size: 'sm' },
              { type: 'text', text: `~${order.estimated_delivery_time || 30} นาที`, flex: 1, align: 'end', size: 'sm' },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ติดตามออเดอร์',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}`,
            },
            style: 'primary',
            color: '#10B981',
          },
        ],
      },
    },
  };
}

export function buildRiderArrivedFlex(orderNumber: string, riderName: string) {
  return {
    type: 'flex',
    altText: `ไรเดอร์มาถึงแล้ว — ออเดอร์ #${orderNumber}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        contents: [
          { type: 'text', text: '🛵 ไรเดอร์มาถึงแล้ว!', weight: 'bold', size: 'xl', align: 'center' },
          { type: 'text', text: riderName, align: 'center', color: '#6B7280', margin: 'sm' },
          { type: 'text', text: 'กรุณารับสินค้าของท่าน', align: 'center', margin: 'md', color: '#111827' },
        ],
      },
    },
  };
}

export function buildDeliveryCompleteFlex(orderNumber: string, total: number, orderId: string) {
  return {
    type: 'flex',
    altText: `ส่งสำเร็จ! ออเดอร์ #${orderNumber}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#059669', paddingAll: '16px',
        contents: [{ type: 'text', text: '✅ ส่งสำเร็จ!', color: '#ffffff', weight: 'bold', size: 'lg' }],
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '16px',
        contents: [
          { type: 'text', text: `ออเดอร์ #${orderNumber}`, weight: 'bold' },
          { type: 'text', text: `ยอดชำระ ฿${total.toFixed(2)}`, color: '#10B981', size: 'lg', margin: 'sm' },
          { type: 'text', text: 'ขอบคุณที่ใช้บริการ Juad Delivery', color: '#6B7280', margin: 'md', size: 'sm' },
        ],
      },
      footer: {
        type: 'box', layout: 'vertical', paddingAll: '12px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ให้คะแนนบริการ ⭐',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}?rate=true`,
            },
            style: 'primary', color: '#F59E0B',
          },
        ],
      },
    },
  };
}
