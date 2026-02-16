'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating: number;
  total?: number;
  size?: 'sm' | 'md';
}

export function RatingDisplay({ rating, total, size = 'sm' }: RatingDisplayProps) {
  const sizeMap = { sm: 'h-3 w-3', md: 'h-4 w-4' };
  return (
    <span className="flex items-center gap-0.5">
      <Star className={cn(sizeMap[size], 'fill-amber-400 text-amber-400')} />
      <span className={cn('font-medium text-gray-700', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
      {total !== undefined && (
        <span className={cn('text-gray-400', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({total})
        </span>
      )}
    </span>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}

export function RatingInput({ value, onChange, label }: RatingInputProps) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition-transform active:scale-110"
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors',
                (hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
