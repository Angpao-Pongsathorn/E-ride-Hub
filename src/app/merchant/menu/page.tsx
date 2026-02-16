'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/hooks/useLiff';
import { MenuItem, MenuCategory, Merchant } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { formatThaiCurrency } from '@/lib/utils';

export default function MerchantMenuPage() {
  const router = useRouter();
  const { isReady, isLoggedIn, profile } = useLiff(process.env.NEXT_PUBLIC_LIFF_ID_MERCHANT!);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [categories, setCategories] = useState<(MenuCategory & { items: MenuItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', categoryId: '' });

  useEffect(() => {
    if (!profile?.userId) return;
    fetch(`/api/restaurants?lineUserId=${profile.userId}`)
      .then((r) => r.json())
      .then(async (data) => {
        const m = data.data?.[0];
        if (!m) { setLoading(false); return; }
        setMerchant(m);
        const menuRes = await fetch(`/api/restaurants/${m.id}`);
        const menuData = await menuRes.json();
        setCategories(menuData.data?.categories || []);
        setLoading(false);
      });
  }, [profile]);

  const handleAddItem = async () => {
    if (!merchant || !newItem.name || !newItem.price) return;
    const res = await fetch(`/api/restaurants/${merchant.id}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newItem.name,
        price: parseFloat(newItem.price),
        description: newItem.description,
        categoryId: newItem.categoryId || null,
      }),
    });
    if (res.ok) {
      const updated = await fetch(`/api/restaurants/${merchant.id}`);
      const d = await updated.json();
      setCategories(d.data?.categories || []);
      setNewItem({ name: '', price: '', description: '', categoryId: '' });
      setShowAddItem(false);
    }
  };

  const handleToggleAvail = async (itemId: string, current: boolean) => {
    await fetch(`/api/restaurants/${merchant?.id}/menu/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: !current }),
    });
    const updated = await fetch(`/api/restaurants/${merchant!.id}`);
    const d = await updated.json();
    setCategories(d.data?.categories || []);
  };

  if (!isReady || loading) return <PageLoader />;
  if (!isLoggedIn || !merchant) return <div className="p-4 text-center">ไม่พบข้อมูลร้านค้า</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">จัดการเมนู</h1>
        <Button size="sm" className="ml-auto" onClick={() => setShowAddItem(!showAddItem)}>
          <Plus className="h-4 w-4 mr-1" /> เพิ่มเมนู
        </Button>
      </div>

      {/* Add item form */}
      {showAddItem && (
        <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">เพิ่มเมนูใหม่</h3>
          <Input placeholder="ชื่อเมนู *" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          <Input placeholder="ราคา (บาท) *" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
          <Input placeholder="รายละเอียด" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleAddItem}>บันทึก</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowAddItem(false)}>ยกเลิก</Button>
          </div>
        </div>
      )}

      {/* Menu list */}
      <div className="px-4 mt-4 space-y-6">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h3 className="mb-3 font-semibold text-gray-700">{cat.name}</h3>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                  <div className="flex-1">
                    <p className={`font-medium ${item.is_available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                      {item.name}
                    </p>
                    <p className="text-sm text-emerald-600 font-semibold">{formatThaiCurrency(item.price)}</p>
                  </div>
                  <button
                    onClick={() => handleToggleAvail(item.id, item.is_available)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.is_available ? 'มีสินค้า' : 'หมด'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
