import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin } from 'lucide-react';
import { Merchant } from '@/types/database';
import { RatingDisplay } from '@/components/shared/Rating';
import { Badge } from '@/components/ui/badge';

interface RestaurantCardProps {
  merchant: Merchant;
  distanceKm?: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  'อาหาร': '🍜',
  'เครื่องดื่ม': '🥤',
  'ของชำ': '🛒',
  'OTOP': '🏺',
  'ขนม': '🍰',
  'default': '🍽️',
};

export function RestaurantCard({ merchant, distanceKm }: RestaurantCardProps) {
  const emoji = CATEGORY_EMOJI[merchant.category || ''] || CATEGORY_EMOJI.default;

  return (
    <Link href={`/restaurants/${merchant.id}`} className="block">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm active:scale-98 transition-transform">
        {/* Cover image */}
        <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-emerald-200">
          {merchant.cover_image_url ? (
            <Image
              src={merchant.cover_image_url}
              alt={merchant.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">{emoji}</div>
          )}
          {!merchant.is_open && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-t-2xl">
              <span className="text-white font-semibold text-lg">ปิดอยู่</span>
            </div>
          )}
          {merchant.category && (
            <Badge className="absolute top-3 left-3" variant="default">
              {merchant.category}
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{merchant.name}</h3>
            <RatingDisplay rating={merchant.rating || 0} />
          </div>

          {merchant.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">{merchant.description}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            {distanceKm !== undefined && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {distanceKm.toFixed(1)} กม.
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {merchant.opening_time
                ? `${merchant.opening_time.slice(0, 5)}–${merchant.closing_time?.slice(0, 5) || '22:00'}`
                : '8:00–22:00'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
