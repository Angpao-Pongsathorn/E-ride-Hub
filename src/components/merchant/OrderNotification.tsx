'use client';

import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Order } from '@/types/database';
import { Button } from '@/components/ui/button';
import { formatThaiCurrency, formatShortDate } from '@/lib/utils';

interface OrderNotificationProps {
  order: Order;
  onAccept: (orderId: string) => Promise<void>;
  onReject: (orderId: string) => Promise<void>;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
}

export function OrderNotification({ order, onAccept, onReject, onUpdateStatus }: OrderNotificationProps) {
  const items = order.order_items || [];

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{formatShortDate(order.created_at)}</p>
          <p className="font-bold text-gray-900">#{order.order_number}</p>
        </div>
        <span className="font-bold text-emerald-600 text-xl">{formatThaiCurrency(order.total)}</span>
      </div>

      {/* Items */}
      <div className="mt-3 space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">{item.quantity}x {item.item_name}</span>
            <span className="text-gray-500">{formatThaiCurrency(item.total_price)}</span>
          </div>
        ))}
      </div>

      {/* Delivery address */}
      {order.delivery_address && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 p-2">
          <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">{order.delivery_address}</p>
        </div>
      )}

      {/* Delivery note */}
      {order.delivery_note && (
        <p className="mt-2 text-xs text-amber-600 italic">📝 {order.delivery_note}</p>
      )}

      {/* Estimated time */}
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
        <Clock className="h-3 w-3" />
        <span>ชำระโดย: {order.payment_method === 'cash' ? 'เงินสด' : 'พร้อมเพย์'}</span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {order.status === 'pending' && (
          <>
            <Button className="flex-1" onClick={() => onAccept(order.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              รับออเดอร์
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => onReject(order.id)}>
              <XCircle className="mr-2 h-4 w-4" />
              ปฏิเสธ
            </Button>
          </>
        )}
        {order.status === 'confirmed' && (
          <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'preparing')}>
            เริ่มเตรียมอาหาร
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button className="w-full" onClick={() => onUpdateStatus(order.id, 'ready')}>
            อาหารพร้อมแล้ว
          </Button>
        )}
        {order.status === 'ready' && (
          <div className="w-full rounded-xl bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-600">
            รอไรเดอร์มารับ...
          </div>
        )}
      </div>
    </div>
  );
}
