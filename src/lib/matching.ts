import { Rider } from '@/types/database';
import { haversineDistanceKm } from './pricing';

export interface RiderScore {
  rider: Rider;
  score: number;
  distanceKm: number;
}

const SEARCH_RADIUS_KM = 5;

export function findAndRankRiders(
  riders: Rider[],
  orderLat: number,
  orderLon: number,
  todayDeliveriesMap: Map<string, number>
): RiderScore[] {
  const candidates = riders.filter((r) => {
    if (!r.is_online || !r.is_approved) return false;
    if (r.current_latitude == null || r.current_longitude == null) return false;
    const dist = haversineDistanceKm(r.current_latitude, r.current_longitude, orderLat, orderLon);
    return dist <= SEARCH_RADIUS_KM;
  });

  const maxDeliveries = Math.max(...candidates.map((r) => todayDeliveriesMap.get(r.id) ?? 0), 1);

  const scored: RiderScore[] = candidates.map((r) => {
    const distKm = haversineDistanceKm(r.current_latitude!, r.current_longitude!, orderLat, orderLon);

    // Distance score (40%): closer = higher score (0-1)
    const distScore = 1 - distKm / SEARCH_RADIUS_KM;

    // Rating score (30%): 5 stars = 1.0
    const ratingScore = (r.rating || 5) / 5;

    // Acceptance rate score (20%): 100% = 1.0
    const acceptScore = (r.acceptance_rate || 100) / 100;

    // Today deliveries score (10%): fewer = higher (load balancing)
    const todayCount = todayDeliveriesMap.get(r.id) ?? 0;
    const loadScore = maxDeliveries > 0 ? 1 - todayCount / maxDeliveries : 1;

    const score =
      distScore * 0.4 +
      ratingScore * 0.3 +
      acceptScore * 0.2 +
      loadScore * 0.1;

    return { rider: r, score, distanceKm: distKm };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export const RIDER_ACCEPT_TIMEOUT_MS = 60_000; // 60 seconds
export const MAX_OFFER_ROUNDS = 3;
