'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Liff } from '@line/liff';
import type { LiffProfile } from '@/types/database';

interface LiffContextValue {
  liff: Liff | null;
  isReady: boolean;
  isLoggedIn: boolean;
  profile: LiffProfile | null;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  error: string | null;
}

const LiffContext = createContext<LiffContextValue>({
  liff: null,
  isReady: false,
  isLoggedIn: false,
  profile: null,
  accessToken: null,
  login: () => {},
  logout: () => {},
  error: null,
});

// Dev mock profile — ใช้ตอน liffId ยังไม่ได้ตั้งค่า
const DEV_PROFILE: LiffProfile = {
  userId: 'dev-user-001',
  displayName: 'Dev User (ทดสอบ)',
  pictureUrl: undefined,
};

function isPlaceholder(id: string) {
  return !id || id.startsWith('your_') || id === 'undefined';
}

export function LiffProvider({ children, liffId }: { children: ReactNode; liffId: string }) {
  const [liff, setLiff] = useState<Liff | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dev mode bypass — ไม่ต้องมี LIFF ID จริง
    if (isPlaceholder(liffId)) {
      setProfile(DEV_PROFILE);
      setIsLoggedIn(true);
      setIsReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const liffModule = (await import('@line/liff')).default;
        await liffModule.init({ liffId });
        if (cancelled) return;
        setLiff(liffModule);

        if (!liffModule.isLoggedIn()) {
          liffModule.login();
          return;
        }

        const [p, token] = await Promise.all([
          liffModule.getProfile(),
          Promise.resolve(liffModule.getAccessToken()),
        ]);
        if (cancelled) return;

        setProfile(p);
        setAccessToken(token);
        setIsLoggedIn(true);

        // Upsert user in DB (fire and forget)
        fetch('/api/auth/line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineUserId: p.userId,
            displayName: p.displayName,
            pictureUrl: p.pictureUrl,
            statusMessage: p.statusMessage,
          }),
        }).catch(() => {});
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'LIFF init failed');
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [liffId]);

  const login = () => liff?.login();
  const logout = () => {
    liff?.logout();
    setIsLoggedIn(false);
    setProfile(null);
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <LiffContext.Provider value={{ liff, isReady, isLoggedIn, profile, accessToken, login, logout, error }}>
      {children}
    </LiffContext.Provider>
  );
}

export function useLiffContext() {
  return useContext(LiffContext);
}
