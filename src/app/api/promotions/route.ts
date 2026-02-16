import { NextResponse } from 'next/server';

// Static promotions (replace with DB when platform_promotions table is added)
const PROMOTIONS = [
  { id: '1', title: 'สั่งครั้งแรก ลด 20 บาท', code: 'NEW20', discount: 20, type: 'fixed', active: true, expiry: '2025-02-28' },
  { id: '2', title: 'ส่งฟรีทุกวันศุกร์', code: null, discount: 0, type: 'free_delivery', active: true, expiry: null },
  { id: '3', title: 'ลด 15% ร้าน OTOP', code: 'OTOP15', discount: 15, type: 'percent', active: true, expiry: '2025-03-31' },
  { id: '4', title: 'เรียกรถ 2 เที่ยว ลด 10 บาท', code: 'RIDE10', discount: 10, type: 'fixed', active: false, expiry: '2025-02-28' },
];

export async function GET() {
  return NextResponse.json({ data: PROMOTIONS.filter((p) => p.active) });
}
