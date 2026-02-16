'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Liff } from '@line/liff';

interface UseLiffReturn {
  liff: Liff | null;
  isReady: boolean;
  isLoggedIn: boolean;
  profile: { userId: string; displayName: string; pictureUrl?: string } | null;
  accessToken: string | null;
  error: string | null;
  login: () => void;
  logout: () => void;
}

export function useLiff(liffId: string): UseLiffReturn {
  const [liff, setLiff] = useState<Liff | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UseLiffReturn['profile']>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!liffId) return;

    (async () => {
      try {
        const liffModule = (await import('@line/liff')).default;
        await liffModule.init({ liffId });
        setLiff(liffModule as unknown as Liff);

        if (liffModule.isLoggedIn()) {
          setIsLoggedIn(true);
          const p = await liffModule.getProfile();
          setProfile({
            userId: p.userId,
            displayName: p.displayName,
            pictureUrl: p.pictureUrl,
          });
          setAccessToken(liffModule.getAccessToken());
        }
        setIsReady(true);
      } catch (err) {
        setError((err as Error).message);
        setIsReady(true);
      }
    })();
  }, [liffId]);

  const login = useCallback(() => {
    if (liff && !liff.isLoggedIn()) {
      liff.login();
    }
  }, [liff]);

  const logout = useCallback(() => {
    if (liff && liff.isLoggedIn()) {
      liff.logout();
      setIsLoggedIn(false);
      setProfile(null);
      setAccessToken(null);
    }
  }, [liff]);

  return { liff, isReady, isLoggedIn, profile, accessToken, error, login, logout };
}
