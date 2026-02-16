'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category: string;
}

interface Shop {
  id: string;
  name: string;
  category: string;
  rating: number;
  is_open: boolean;
  cover_image_url: string | null;
  menu_items?: MenuItem[];
}

export default function ShopPage({ params }: { params: { shopId: string } }) {
  const router = useRouter();
  const { items, addItem, removeItem, updateQuantity, total, merchantId } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConflict, setShowConflict] = useState(false);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${params.shopId}`)
      .then((r) => r.json())
      .then((d) => { setShop(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.shopId]);

  const getQty = (itemId: string) => items.find((i) => i.id === itemId)?.quantity || 0;

  const handleAdd = (item: MenuItem) => {
    if (merchantId && merchantId !== params.shopId) {
      setPendingItem(item);
      setShowConflict(true);
      return;
    }
    addItem({ id: item.id, name: item.name, price: item.price, merchantId: params.shopId });
  };

  const menuByCategory = (shop?.menu_items || []).reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category || 'เมนู';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!shop) {
    return <div className="p-6 text-center text-gray-500">ไม่พบร้านค้า</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{shop.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{shop.category}</span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-0.5 text-xs text-yellow-500">
              <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
              {shop.rating?.toFixed(1) || '5.0'}
            </span>
            {!shop.is_open && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-500">ปิด</span>
            )}
          </div>
        </div>
        {cartCount > 0 && (
          <button onClick={() => router.push('/marketplace/cart')} className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="relative h-40 bg-gray-200">
        {shop.cover_image_url && (
          <Image src={shop.cover_image_url} alt={shop.name} fill className="object-cover" />
        )}
        {!shop.is_open && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-gray-700">ร้านปิด</span>
          </div>
        )}
      </div>

      {/* Menu */}
      {Object.entries(menuByCategory).map(([category, items]) => (
        <div key={category} className="mb-2">
          <div className="bg-gray-100 px-4 py-2">
            <p className="text-sm font-semibold text-gray-600">{category}</p>
          </div>
          <div className="bg-white divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${!item.is_available ? 'opacity-50' : ''}`}>
                {item.image_url && (
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image src={item.image_url} alt={item.name} width={64} height={64} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                  <p className="text-sm font-semibold text-orange-500 mt-1">฿{item.price.toFixed(0)}</p>
                </div>
                {item.is_available && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {getQty(item.id) > 0 ? (
                      <>
                        <button
                          onClick={() => getQty(item.id) === 1 ? removeItem(item.id) : updateQuantity(item.id, getQty(item.id) - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100"
                        >
                          <Minus className="h-3 w-3 text-orange-600" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">{getQty(item.id)}</span>
                      </>
                    ) : null}
                    <button
                      onClick={() => handleAdd(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500"
                    >
                      <Plus className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Cart Floating Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-20">
          <button
            onClick={() => router.push('/marketplace/cart')}
            className="flex w-full items-center justify-between rounded-2xl bg-orange-500 px-5 py-3.5 shadow-lg"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30">
              <span className="text-xs font-bold text-white">{cartCount}</span>
            </div>
            <span className="font-semibold text-white">ดูตะกร้า</span>
            <span className="font-semibold text-white">฿{total.toFixed(0)}</span>
          </button>
        </div>
      )}

      {/* Conflict Modal */}
      {showConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <p className="font-bold text-gray-900 text-center mb-2">เริ่มออเดอร์ใหม่?</p>
            <p className="text-sm text-gray-500 text-center mb-5">ตะกร้ามีสินค้าจากร้านอื่น ต้องการล้างตะกร้าและเริ่มใหม่?</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowConflict(false); setPendingItem(null); }} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600">ยกเลิก</button>
              <button
                onClick={() => {
                  if (pendingItem) {
                    // Clear cart by removing all items and adding new one
                    items.forEach(i => removeItem(i.id));
                    addItem({ id: pendingItem.id, name: pendingItem.name, price: pendingItem.price, merchantId: params.shopId });
                  }
                  setShowConflict(false);
                  setPendingItem(null);
                }}
                className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white"
              >
                เริ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
