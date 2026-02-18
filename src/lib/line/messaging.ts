const LINE_API_URL = 'https://api.line.me/v2/bot/message';
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

interface PushMessagePayload {
  to: string;
  messages: object[];
}

export async function pushMessage(to: string, messages: object[]) {
  const payload: PushMessagePayload = { to, messages };
  const res = await fetch(`${LINE_API_URL}/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('LINE push error:', err);
  }
  return res;
}

export async function replyMessage(replyToken: string, messages: object[]) {
  const res = await fetch(`${LINE_API_URL}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('LINE reply error:', err);
  }
  return res;
}

export async function pushOrderStatusUpdate(lineUserId: string, orderNumber: string, status: string, statusText: string) {
  const colorMap: Record<string, string> = {
    pending: '#6B7280',
    confirmed: '#3B82F6',
    preparing: '#F59E0B',
    ready: '#8B5CF6',
    picking_up: '#EF4444',
    delivering: '#10B981',
    delivered: '#059669',
    cancelled: '#DC2626',
  };
  const color = colorMap[status] || '#6B7280';

  const flexMessage = {
    type: 'flex',
    altText: `อัปเดตออเดอร์ ${orderNumber}: ${statusText}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'Juad Delivery คำเขื่อนแก้ว',
            color: '#ffffff',
            weight: 'bold',
            size: 'sm',
          },
        ],
        backgroundColor: '#10B981',
        paddingAll: '12px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `ออเดอร์ #${orderNumber}`,
            weight: 'bold',
            size: 'lg',
            color: '#111827',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  { type: 'text', text: '●', color, size: 'xl' },
                ],
                flex: 0,
              },
              {
                type: 'text',
                text: statusText,
                weight: 'bold',
                color,
                margin: 'sm',
                flex: 1,
              },
            ],
            alignItems: 'center',
          },
        ],
        paddingAll: '16px',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียดออเดอร์',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderNumber}`,
            },
            style: 'primary',
            color: '#10B981',
          },
        ],
        paddingAll: '12px',
      },
    },
  };

  return pushMessage(lineUserId, [flexMessage]);
}

export async function pushNewJobNotification(
  lineUserId: string,
  jobId: string,
  jobType: 'food_delivery' | 'ride' | 'parcel',
  pickupAddress: string,
  dropoffAddress: string,
  fee: number
) {
  const typeText = {
    food_delivery: '🍜 ส่งอาหาร',
    ride: '🛵 รับส่งคน',
    parcel: '📦 ส่งพัสดุ',
  }[jobType];

  const flexMessage = {
    type: 'flex',
    altText: `งานใหม่! ${typeText} — ${fee.toFixed(0)} บาท`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `งานใหม่ ${typeText}`,
            color: '#ffffff',
            weight: 'bold',
          },
        ],
        backgroundColor: '#F59E0B',
        paddingAll: '12px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'รับที่:', color: '#6B7280', flex: 2, size: 'sm' },
              { type: 'text', text: pickupAddress, flex: 5, size: 'sm', wrap: true },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              { type: 'text', text: 'ส่งที่:', color: '#6B7280', flex: 2, size: 'sm' },
              { type: 'text', text: dropoffAddress, flex: 5, size: 'sm', wrap: true },
            ],
          },
          {
            type: 'text',
            text: `ค่าส่ง ${fee.toFixed(2)} บาท`,
            weight: 'bold',
            size: 'xl',
            color: '#10B981',
            margin: 'lg',
            align: 'center',
          },
        ],
        paddingAll: '16px',
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'รับงาน',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/rider/jobs/${jobId}?action=accept`,
            },
            style: 'primary',
            color: '#10B981',
            flex: 1,
          },
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ปฏิเสธ',
              uri: `${process.env.NEXT_PUBLIC_BASE_URL}/rider/jobs/${jobId}?action=reject`,
            },
            style: 'secondary',
            flex: 1,
            margin: 'sm',
          },
        ],
        paddingAll: '12px',
      },
    },
  };

  return pushMessage(lineUserId, [flexMessage]);
}
