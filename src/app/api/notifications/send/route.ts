import { NextRequest, NextResponse } from 'next/server';
import { pushMessage } from '@/lib/line/messaging';

export async function POST(req: NextRequest) {
  const { lineUserId, message, type = 'text' } = await req.json();

  if (!lineUserId || !message) {
    return NextResponse.json({ error: 'lineUserId and message are required' }, { status: 400 });
  }

  try {
    await pushMessage(lineUserId, [{ type, text: message }]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
