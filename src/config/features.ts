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
  ride: false,

  /** ส่งพัสดุ */
  parcel: false,

  /** โปรโมชั่น */
  promotions: false,

  /** เปิดร้านค้า */
  registerShop: false,

  /** สมัครไรเดอร์ */
  registerRider: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
