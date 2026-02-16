'use client';

import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useLocation(autoGet = false) {
  const [state, setState] = useState<LocationState>({
    lat: null, lng: null, accuracy: null, error: null, loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'เบราว์เซอร์ไม่รองรับ GPS' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'ไม่ได้รับสิทธิ์ใช้ GPS',
          2: 'ไม่สามารถหาตำแหน่งได้',
          3: 'หมดเวลาการค้นหาตำแหน่ง',
        };
        setState((s) => ({ ...s, error: msgs[err.code] || 'เกิดข้อผิดพลาด GPS', loading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    if (autoGet) getLocation();
  }, [autoGet, getLocation]);

  return { ...state, getLocation };
}

export function useRiderLocationUpdater(riderId: string | null, intervalMs = 30000) {
  const { lat, lng, getLocation } = useLocation(true);

  useEffect(() => {
    if (!riderId || lat === null || lng === null) return;

    const updateLocation = async () => {
      try {
        await fetch('/api/riders/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ riderId, lat, lng }),
        });
      } catch (err) {
        console.error('Failed to update rider location:', err);
      }
    };

    updateLocation();
    const interval = setInterval(() => {
      getLocation();
      updateLocation();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [riderId, lat, lng, intervalMs, getLocation]);

  return { lat, lng };
}
