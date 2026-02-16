'use client';

import type { Liff } from '@line/liff';

let liffInstance: Liff | null = null;

export async function initializeLiff(liffId: string): Promise<Liff> {
  if (liffInstance) return liffInstance;

  const liff = (await import('@line/liff')).default;
  await liff.init({ liffId });
  liffInstance = liff;
  return liff;
}

export function getLiff(): Liff | null {
  return liffInstance;
}

export async function getLiffProfile() {
  if (!liffInstance || !liffInstance.isLoggedIn()) {
    return null;
  }
  return await liffInstance.getProfile();
}

export function getAccessToken(): string | null {
  if (!liffInstance) return null;
  return liffInstance.getAccessToken();
}

export async function sendFlexMessage(altText: string, contents: object) {
  if (!liffInstance) return;
  try {
    await liffInstance.sendMessages([
      {
        type: 'flex',
        altText,
        contents: contents as never,
      },
    ]);
  } catch (err) {
    console.error('sendFlexMessage error:', err);
  }
}

export function closeLiff() {
  if (liffInstance) {
    liffInstance.closeWindow();
  }
}
