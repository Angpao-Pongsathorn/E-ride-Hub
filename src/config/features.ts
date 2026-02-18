/**
 * Feature Flags — Juad Delivery
 *
 * เปิด/ปิด feature ที่นี่ที่เดียว
 * true  = เปิดใช้งาน
 * false = ปิด (แสดง "เร็วๆ นี้")
 */
export const FEATURES = {
  /** สั่งอาหาร / Marketplace */
  marketplace: true,

  /** เรียกรถ */
  ride: true,

  /** ส่งพัสดุ */
  parcel: true,

  /** โปรโมชั่น */
  promotions: true,

  /** เปิดร้านค้า */
  registerShop: true,

  /** สมัครไรเดอร์ */
  registerRider: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;
