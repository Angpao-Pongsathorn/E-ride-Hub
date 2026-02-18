'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Users, Bike, Store, TrendingUp, DollarSign, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatThaiCurrency } from '@/lib/utils';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalRiders: number;
  totalMerchants: number;
  pendingOrders: number;
  platformRevenue: number;
}

interface DailyData {
  date: string;
  orders: number;
  revenue: number;
}

const NAV_ITEMS = [
  { href: '/admin/orders', icon: ShoppingBag, label: 'ออเดอร์', color: 'text-blue-600 bg-blue-50' },
  { href: '/admin/merchants', icon: Store, label: 'ร้านค้า', color: 'text-emerald-600 bg-emerald-50' },
  { href: '/admin/riders', icon: Bike, label: 'ไรเดอร์', color: 'text-amber-600 bg-amber-50' },
  { href: '/admin/users', icon: Users, label: 'ผู้ใช้', color: 'text-purple-600 bg-purple-50' },
  { href: '/admin/pricing', icon: Settings, label: 'ราคา', color: 'text-red-600 bg-red-50' },
  { href: '/admin/reports', icon: BarChart2, label: 'รายงาน', color: 'text-indigo-600 bg-indigo-50' },
  { href: '/admin/promotions', icon: TrendingUp, label: 'โปรโมชั่น', color: 'text-pink-600 bg-pink-50' },
];

// Mock weekly data (replace with real API call)
const MOCK_WEEKLY: DailyData[] = [
  { date: 'จ', orders: 12, revenue: 2400 },
  { date: 'อ', orders: 19, revenue: 3800 },
  { date: 'พ', orders: 8, revenue: 1600 },
  { date: 'พฤ', orders: 25, revenue: 5000 },
  { date: 'ศ', orders: 32, revenue: 6400 },
  { date: 'ส', orders: 45, revenue: 9000 },
  { date: 'อา', orders: 38, revenue: 7600 },
];

const MOCK_MONTHLY: DailyData[] = [
  { date: 'ต.ค.', orders: 180, revenue: 36000 },
  { date: 'พ.ย.', orders: 220, revenue: 44000 },
  { date: 'ธ.ค.', orders: 310, revenue: 62000 },
  { date: 'ม.ค.', orders: 280, revenue: 56000 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chart, setChart] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setStats(d.data))
      .catch(() => {});
  }, []);

  const chartData = chart === 'weekly' ? MOCK_WEEKLY : MOCK_MONTHLY;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 pb-6 pt-8">
        <h1 className="text-2xl font-bold text-white">Juad Delivery Admin</h1>
        <p className="text-gray-400 text-sm mt-1">อำเภอคำเขื่อนแก้ว · ยโสธร</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'ออเดอร์ทั้งหมด', value: stats?.totalOrders ?? '—', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'ยอดรวม', value: stats ? formatThaiCurrency(stats.totalRevenue) : '—', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'ผู้ใช้ทั้งหมด', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'รายได้แพลตฟอร์ม', value: stats ? formatThaiCurrency(stats.platformRevenue ?? 0) : '—', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} mb-2`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Pending alert */}
        {stats && stats.pendingOrders > 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
            <p className="font-semibold text-amber-700 text-sm">⚠️ ออเดอร์รอ: {stats.pendingOrders}</p>
            <Link href="/admin/orders" className="text-sm text-amber-600 font-medium">ดูทั้งหมด →</Link>
          </div>
        )}

        {/* Bar Chart - Orders */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">ออเดอร์</p>
            <div className="flex gap-1">
              {(['weekly', 'monthly'] as const).map((v) => (
                <button key={v} onClick={() => setChart(v)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${chart === v ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {v === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                cursor={{ fill: '#fff7ed' }}
              />
              <Bar dataKey="orders" name="ออเดอร์" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Revenue */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <p className="font-semibold text-gray-900 mb-3">ยอดขาย (บาท)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number | undefined) => [`฿${(v ?? 0).toLocaleString()}`, 'ยอดขาย']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="revenue" name="ยอดขาย" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-3 gap-3">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <div className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-gray-900">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
