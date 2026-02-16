'use client';

import { MapPin, Clock, DollarSign } from 'lucide-react';
import { Order } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatThaiCurrency, getOrderStatusText } from '@/lib/utils';

interface JobCardProps {
  order: Order;
  onAccept?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
  showActions?: boolean;
}

export function JobCard({ order, onAccept, onComplete, showActions = true }: JobCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400">#{order.order_number}</p>
          <Badge variant="blue" className="mt-1">{getOrderStatusText(order.status)}</Badge>
        </div>
        <span className="font-bold text-emerald-600 text-lg">
          {formatThaiCurrency(order.delivery_fee)}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {order.merchant && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">รับที่</p>
              <p className="font-medium text-gray-800">{(order.merchant as { name: string }).name}</p>
            </div>
          </div>
        )}

        {order.delivery_address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">ส่งที่</p>
              <p className="font-medium text-gray-800">{order.delivery_address}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {order.order_items?.length || 0} รายการ
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            รวม {formatThaiCurrency(order.total)}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="mt-3 flex gap-2">
          {order.status === 'ready' && onAccept && (
            <Button className="flex-1" onClick={() => onAccept(order.id)}>
              รับงานนี้
            </Button>
          )}
          {order.status === 'delivering' && onComplete && (
            <Button className="flex-1" onClick={() => onComplete(order.id)}>
              ส่งสำเร็จ
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
