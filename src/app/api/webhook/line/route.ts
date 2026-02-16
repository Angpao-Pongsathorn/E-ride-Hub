import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { replyMessage } from '@/lib/line/messaging';

function verifySignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET!;
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-line-signature') || '';

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const events = payload.events || [];

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.trim().toLowerCase();

      if (text.includes('สั่งอาหาร') || text.includes('order')) {
        await replyMessage(event.replyToken, [
          {
            type: 'text',
            text: 'กดปุ่ม "สั่งสินค้า" บน Rich Menu ด้านล่างเพื่อเริ่มสั่งอาหารได้เลยค่ะ 🍜',
          },
        ]);
      } else if (text.includes('ช่วยเหลือ') || text.includes('help')) {
        await replyMessage(event.replyToken, [
          {
            type: 'flex',
            altText: 'ช่วยเหลือ E-RideHub',
            contents: {
              type: 'bubble',
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  { type: 'text', text: 'E-RideHub คำเขื่อนแก้ว', weight: 'bold', size: 'lg' },
                  { type: 'text', text: '🍜 สั่งอาหาร: กดปุ่มบน Rich Menu', size: 'sm', margin: 'md', color: '#6B7280' },
                  { type: 'text', text: '🛵 เรียกรถ: กดปุ่มบน Rich Menu', size: 'sm', color: '#6B7280' },
                  { type: 'text', text: '📦 ส่งพัสดุ: กดปุ่มบน Rich Menu', size: 'sm', color: '#6B7280' },
                  { type: 'text', text: '📞 โทร: 043-xxx-xxx', size: 'sm', color: '#6B7280', margin: 'md' },
                ],
              },
            },
          },
        ]);
      } else {
        await replyMessage(event.replyToken, [
          {
            type: 'text',
            text: 'สวัสดีค่ะ! กดปุ่มบน Rich Menu เพื่อใช้บริการ E-RideHub คำเขื่อนแก้วได้เลยค่ะ 😊',
          },
        ]);
      }
    }
  }

  return NextResponse.json({ status: 'ok' });
}
