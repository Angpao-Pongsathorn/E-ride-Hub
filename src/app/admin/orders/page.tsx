'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  delivering: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอรับ', confirmed: 'ยืนยัน', preparing: 'เตรียม',
  delivering: 'กำลังส่ง', delivered: 'ส่งแล้ว', cancelled: 'ยกเลิก',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders?limit=50')
      .then((r) => r.json())
      .then((d) => { setOrders(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.delivery_address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">ออเดอร์ทั้งหมด</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาออเดอร์..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400" />
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {loading ? <div className="p-8 text-center text-gray-400">กำลังโหลด...</div> :
          filtered.length === 0 ? <div className="p-8 text-center text-gray-400">ไม่พบออเดอร์</div> :
          filtered.map((o) => (
            <div key={o.id} className="bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">#{o.order_number}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5 truncate">{o.delivery_address}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString('th-TH')}</p>
                <p className="text-sm font-bold text-orange-500">฿{o.total_amount?.toFixed(0)}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
