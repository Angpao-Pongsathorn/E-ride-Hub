'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, User, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface UserData {
  id: string;
  line_user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => { setUsers(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.line_user_id?.toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_LABELS: Record<string, string> = {
    customer: 'ลูกค้า', merchant: 'ร้านค้า', rider: 'ไรเดอร์', admin: 'แอดมิน'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <h1 className="text-lg font-bold flex-1 text-gray-900">ผู้ใช้งาน ({filtered.length})</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาผู้ใช้..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400" />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">ไม่พบผู้ใช้</div>
        ) : filtered.map((u) => (
          <div key={u.id} className="bg-white flex items-center gap-3 px-4 py-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
              {u.avatar_url ? (
                <Image src={u.avatar_url} alt={u.display_name || ''} width={40} height={40} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{u.display_name || 'ไม่ระบุ'}</p>
              <p className="text-xs text-gray-400 truncate">{u.line_user_id}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                u.role === 'admin' ? 'bg-red-100 text-red-600' :
                u.role === 'merchant' ? 'bg-emerald-100 text-emerald-600' :
                u.role === 'rider' ? 'bg-amber-100 text-amber-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {ROLE_LABELS[u.role] || u.role}
              </span>
              <p className="text-xs text-gray-400 mt-1">{new Date(u.created_at).toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
