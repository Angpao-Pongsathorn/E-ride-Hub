'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Promo {
  id: number;
  title: string;
  code: string;
  discount: number;
  type: 'fixed' | 'percent';
  active: boolean;
}

const INITIAL_PROMOS: Promo[] = [
  { id: 1, title: 'สั่งครั้งแรก', code: 'NEW20', discount: 20, type: 'fixed', active: true },
  { id: 2, title: 'ร้าน OTOP', code: 'OTOP15', discount: 15, type: 'percent', active: true },
  { id: 3, title: 'เรียกรถ', code: 'RIDE10', discount: 10, type: 'fixed', active: false },
];

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>(INITIAL_PROMOS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ title: string; code: string; discount: string; type: 'fixed' | 'percent' }>({ title: '', code: '', discount: '', type: 'fixed' });

  const toggle = (id: number) =>
    setPromos((ps) => ps.map((p) => p.id === id ? { ...p, active: !p.active } : p));

  const remove = (id: number) => setPromos((ps) => ps.filter((p) => p.id !== id));

  const handleAdd = () => {
    if (!form.title || !form.code || !form.discount) return;
    setPromos((ps) => [...ps, {
      id: Date.now(), title: form.title, code: form.code,
      discount: parseFloat(form.discount), type: form.type, active: true,
    }]);
    setForm({ title: '', code: '', discount: '', type: 'fixed' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold flex-1 text-gray-900">โปรโมชั่น</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white">
          <Plus className="h-3.5 w-3.5" /> เพิ่ม
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {showForm && (
          <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
            <p className="font-semibold text-gray-900">เพิ่มโปรโมชั่นใหม่</p>
            {[
              { label: 'ชื่อโปรโมชั่น', key: 'title', placeholder: 'เช่น ส่งฟรีวันศุกร์' },
              { label: 'โค้ด', key: 'code', placeholder: 'FRIFREE' },
              { label: 'ส่วนลด', key: 'discount', placeholder: '20', type: 'number' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{f.label}</label>
                <input value={form[f.key as keyof typeof form]} type={f.type || 'text'}
                  onChange={(e) => setForm((fm) => ({ ...fm, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            ))}
            <div className="flex gap-2">
              {(['fixed', 'percent'] as const).map((t) => (
                <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-colors ${form.type === t ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'}`}>
                  {t === 'fixed' ? 'ลดบาท' : 'ลดเปอร์เซ็นต์'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600">ยกเลิก</button>
              <button onClick={handleAdd} className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white">บันทึก</button>
            </div>
          </div>
        )}

        {promos.map((p) => (
          <div key={p.id} className={`rounded-2xl bg-white shadow-sm p-4 ${!p.active ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{p.code}</span>
                  {' '}— ลด {p.discount}{p.type === 'percent' ? '%' : '฿'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(p.id)}
                  className={`relative h-6 w-10 rounded-full transition-colors ${p.active ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => remove(p.id)} className="text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
