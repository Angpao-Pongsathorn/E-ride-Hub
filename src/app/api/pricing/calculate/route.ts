import { NextRequest, NextResponse } from 'next/server';
import { calculateDeliveryFee, calculateRideFare, ServiceCategory } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const { distanceKm, category, serviceType } = await req.json();

    if (serviceType === 'ride') {
      const fare = calculateRideFare(distanceKm || 3);
      return NextResponse.json({ data: { fare, type: 'ride' } });
    }

    const pricing = calculateDeliveryFee(distanceKm || 3, (category as ServiceCategory) || 'food');
    return NextResponse.json({ data: pricing });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
