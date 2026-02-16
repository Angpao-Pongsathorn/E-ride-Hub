'use client';

import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const MONTHLY_DATA = [
  { month: 'ต.ค.', food: 180, ride: 45, parcel: 32 },
  { month: 'พ.ย.', food: 220, ride: 60, parcel: 41 },
  { month: 'ธ.ค.', food: 310, ride: 89, parcel: 55 },
  { month: 'ม.ค.', food: 280, ride: 75, parcel: 48 },
];

const SERVICE_SPLIT = [
  { name: 'อาหาร', value: 990, color: '#f97316' },
  { name: 'เรียกรถ', value: 269, color: '#10b981' },
  { name: 'ส่งพัสดุ', value: 176, color: '#3b82f6' },
];

const TOP_MERCHANTS = [
  { name: 'ร้านส้มตำแม่สมศรี', orders: 89, revenue: 17800 },
  { name: 'ร้านก๋วยเตี๋ยวเรือ', orders: 76, revenue: 15200 },
  { name: 'OTOP คำเขื่อนแก้ว', orders: 62, revenue: 31000 },
  { name: 'ชาไทยคนดัง', orders: 54, revenue: 8100 },
  { name: 'ข้าวมันไก่พิเศษ', orders: 48, revenue: 9600 },
];

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold flex-1 text-gray-900">รายงาน</h1>
        <button className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Service breakdown */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <p className="font-semibold text-gray-900 mb-3">สัดส่วนบริการ</p>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={SERVICE_SPLIT} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {SERVICE_SPLIT.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {SERVICE_SPLIT.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-gray-600">{s.name}</span>
                  <span className="ml-auto text-xs font-semibold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly orders by service */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <p className="font-semibold text-gray-900 mb-3">ออเดอร์รายเดือน</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="food" name="อาหาร" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
              <Bar dataKey="ride" name="เรียกรถ" stackId="a" fill="#10b981" />
              <Bar dataKey="parcel" name="พัสดุ" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top merchants */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <p className="font-semibold text-gray-900 mb-3">ร้านค้า Top 5</p>
          <div className="space-y-2">
            {TOP_MERCHANTS.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3">
                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.orders} ออเดอร์</p>
                </div>
                <p className="text-sm font-bold text-orange-500">฿{m.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
