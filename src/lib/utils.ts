import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatThaiCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatThaiDate(dateStr: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function getOrderStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: 'รอร้านรับออเดอร์',
    confirmed: 'ร้านรับออเดอร์แล้ว',
    preparing: 'กำลังเตรียมอาหาร',
    ready: 'อาหารพร้อม รอไรเดอร์',
    picking_up: 'ไรเดอร์กำลังไปรับ',
    delivering: 'กำลังจัดส่ง',
    delivered: 'ส่งสำเร็จ',
    cancelled: 'ยกเลิกแล้ว',
  };
  return map[status] || status;
}

export function getRideStatusText(status: string): string {
  const map: Record<string, string> = {
    searching: 'กำลังหาคนขับ',
    driver_assigned: 'คนขับรับแล้ว',
    arriving: 'คนขับกำลังมา',
    in_progress: 'กำลังเดินทาง',
    completed: 'เดินทางถึงแล้ว',
    cancelled: 'ยกเลิกแล้ว',
  };
  return map[status] || status;
}

export function generateOrderNumber(prefix = 'ERH'): string {
  const now = new Date();
  const bangkokTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const date = bangkokTime.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${date}-${rand}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
