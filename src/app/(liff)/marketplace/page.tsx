'use client';

import { useEffect, useState } from 'react';
import { Search, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['ทั้งหมด', 'อาหาร', 'OTOP', 'ของสด', 'เครื่องดื่ม', 'ขนม'];

interface Shop {
  id: string;
  name: string;
  category: string;
  rating: number;
  delivery_time: number;
  cover_image_url: string | null;
  is_open: boolean;
  min_order: number;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [filtered, setFiltered] = useState<Shop[]>([]);
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((d) => { setShops(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = shops;
    if (activeCategory !== 'ทั้งหมด') {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [shops, activeCategory, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.push('/home')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">ร้านค้า</h1>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาร้านค้า..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-500">ไม่พบร้านค้า</p>
          </div>
        ) : (
          filtered.map((shop) => (
            <Link
              key={shop.id}
              href={`/marketplace/${shop.id}`}
              className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ${!shop.is_open ? 'opacity-60' : ''}`}
            >
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {shop.cover_image_url ? (
                  <Image src={shop.cover_image_url} alt={shop.name} width={80} height={80} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-3xl">🏪</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{shop.name}</p>
                  {!shop.is_open && (
                    <span className="flex-shrink-0 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">ปิด</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{shop.category}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                    <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                    {shop.rating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-xs text-gray-400">~{shop.delivery_time || 20} นาที</span>
                  {shop.min_order > 0 && (
                    <span className="text-xs text-gray-400">ขั้นต่ำ ฿{shop.min_order}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
