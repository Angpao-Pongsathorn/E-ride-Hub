export type ServiceCategory = 'food' | 'document' | 'parcel_small' | 'parcel_large' | 'ride';

interface PricingConfig {
  baseFare: number;
  extraFee: number;
  freeDistanceKm: number;
  perKmRate: number;
  surgePeakMultiplier: number;
  platformFeeRate: number;
  riderShareRate: number;
  communityFundRate: number;
}

const PRICING: PricingConfig = {
  baseFare: 25,
  extraFee: 0,
  freeDistanceKm: 2,
  perKmRate: 10,
  surgePeakMultiplier: 1.3,
  platformFeeRate: 0.04, // 4%
  riderShareRate: 0.70,  // 70%
  communityFundRate: 0.01, // 1%
};

const BASE_FARES: Record<ServiceCategory, { base: number; extra: number }> = {
  food:          { base: 25, extra: 0 },
  document:      { base: 20, extra: 0 },
  parcel_small:  { base: 20, extra: 10 },
  parcel_large:  { base: 30, extra: 50 },
  ride:          { base: 25, extra: 0 },
};

function isSurgePeriod(date: Date = new Date()): boolean {
  const bangkokOffset = 7 * 60;
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const bangkokMinutes = (utcMinutes + bangkokOffset) % (24 * 60);
  const hour = Math.floor(bangkokMinutes / 60);
  return (hour >= 11 && hour < 13) || (hour >= 17 && hour < 20);
}

export function haversineDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface PriceBreakdown {
  baseFare: number;
  extraFee: number;
  distanceFee: number;
  surgeFee: number;
  subtotal: number;
  platformFee: number;
  total: number;
  deliveryFee: number;
  riderEarnings: number;
  platformEarnings: number;
  communityFund: number;
  isSurge: boolean;
  distanceKm: number;
}

export function calculateDeliveryFee(
  distanceKm: number,
  category: ServiceCategory = 'food',
  date: Date = new Date()
): PriceBreakdown {
  const { base, extra } = BASE_FARES[category];
  const surge = isSurgePeriod(date);

  const chargeableKm = Math.max(0, distanceKm - PRICING.freeDistanceKm);
  const distanceFee = chargeableKm * PRICING.perKmRate;

  const subtotal = base + extra + distanceFee;
  const surgeFee = surge ? subtotal * (PRICING.surgePeakMultiplier - 1) : 0;
  const deliveryFee = subtotal + surgeFee;

  const platformFee = deliveryFee * PRICING.platformFeeRate;
  const total = deliveryFee + platformFee;

  const riderEarnings = deliveryFee * PRICING.riderShareRate;
  const platformEarnings = deliveryFee * (1 - PRICING.riderShareRate - PRICING.communityFundRate);
  const communityFund = deliveryFee * PRICING.communityFundRate;

  return {
    baseFare: base,
    extraFee: extra,
    distanceFee,
    surgeFee,
    subtotal,
    platformFee,
    total: Math.ceil(total),
    deliveryFee: Math.ceil(deliveryFee),
    riderEarnings: Math.round(riderEarnings * 100) / 100,
    platformEarnings: Math.round(platformEarnings * 100) / 100,
    communityFund: Math.round(communityFund * 100) / 100,
    isSurge: surge,
    distanceKm: Math.round(distanceKm * 100) / 100,
  };
}

export function calculateRideFare(distanceKm: number, surgeMultiplier = 1.0): number {
  const base = BASE_FARES.ride.base;
  const chargeableKm = Math.max(0, distanceKm - 2);
  const distanceFee = chargeableKm * PRICING.perKmRate;
  return Math.ceil((base + distanceFee) * surgeMultiplier);
}

export function calculateCommission(subtotal: number, commissionRate: number): number {
  return Math.round(subtotal * (commissionRate / 100) * 100) / 100;
}
