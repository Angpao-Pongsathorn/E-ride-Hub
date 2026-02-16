# E-RideHub คำเขื่อนแก้ว — Setup Guide

## 1. LINE Developer Console

### 1.1 LINE Official Account
- LINE OA: @786zqjkg (มีแล้ว)
- เข้า https://developers.line.biz
- สร้าง Provider → สร้าง Messaging API channel
- คัดลอก: Channel ID, Channel Secret, Channel Access Token

### 1.2 LIFF Apps (สร้าง 3 apps)
ใน LINE Developers → Messaging API channel → LIFF:
- **LIFF ลูกค้า**: Endpoint URL = `https://your-app.vercel.app/` (Full screen)
- **LIFF ร้านค้า**: Endpoint URL = `https://your-app.vercel.app/merchant/dashboard` (Full screen)
- **LIFF ไรเดอร์**: Endpoint URL = `https://your-app.vercel.app/rider/dashboard` (Full screen)

คัดลอก LIFF IDs ทั้ง 3 ตัว

### 1.3 Webhook URL
ตั้ง Webhook URL = `https://your-app.vercel.app/api/webhook/line`

---

## 2. Supabase

### 2.1 สร้าง Project
- เข้า https://supabase.com → New project
- Region: Southeast Asia (Singapore)
- คัดลอก: Project URL, Anon Key, Service Role Key

### 2.2 Run Migration
- เข้า Supabase Dashboard → SQL Editor
- Copy เนื้อหาจาก `supabase/migrations/001_initial_schema.sql`
- Click "Run"

### 2.3 Storage Buckets
สร้าง buckets ใน Storage:
- `public` (Public bucket) — สำหรับ images ร้านค้า, เมนู
- `documents` (Public bucket) — สำหรับเอกสารไรเดอร์

---

## 3. Environment Variables

แก้ไข `.env.local`:
```
LINE_CHANNEL_ID=2007...
LINE_CHANNEL_SECRET=abc...
LINE_CHANNEL_ACCESS_TOKEN=xyz...
NEXT_PUBLIC_LIFF_ID_CUSTOMER=2007...-xxxxxxxx
NEXT_PUBLIC_LIFF_ID_MERCHANT=2007...-xxxxxxxx
NEXT_PUBLIC_LIFF_ID_RIDER=2007...-xxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

---

## 4. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

หรือ connect GitHub repo กับ Vercel และ set environment variables ใน Vercel Dashboard

---

## 5. LINE Rich Menu

สร้าง Rich Menu ด้วย LINE Messaging API หรือ OA Manager:
- 6 ปุ่ม: สั่งสินค้า | เรียกรถ | โปรโมชั่น | บัญชี | ช่วยเหลือ | ข่าวสาร
- Link แต่ละปุ่มไปยัง LIFF URL ที่เกี่ยวข้อง

---

## 6. ขั้นตอนสร้างร้านค้าแรก (Admin)

1. เข้า `/admin` (ใช้ browser ปกติ ไม่ต้องผ่าน LINE)
2. ไปที่ `/admin/merchants` เพื่ออนุมัติร้านค้า
3. ไปที่ `/admin/riders` เพื่ออนุมัติไรเดอร์

---

## 7. URL Structure

| Path | ผู้ใช้ | หมายเหตุ |
|------|--------|---------|
| `/` | ลูกค้า | หน้าหลัก LIFF |
| `/restaurants` | ลูกค้า | รายการร้าน |
| `/cart` | ลูกค้า | ตะกร้า |
| `/checkout` | ลูกค้า | ชำระเงิน |
| `/orders` | ลูกค้า | ประวัติ |
| `/orders/[id]` | ลูกค้า | ติดตามออเดอร์ |
| `/ride` | ลูกค้า | เรียกรถ |
| `/parcel` | ลูกค้า | ส่งพัสดุ |
| `/merchant/dashboard` | ร้านค้า | LIFF แยก |
| `/merchant/menu` | ร้านค้า | จัดการเมนู |
| `/merchant/orders` | ร้านค้า | รับออเดอร์ |
| `/rider/dashboard` | ไรเดอร์ | LIFF แยก |
| `/rider/jobs` | ไรเดอร์ | รายการงาน |
| `/rider/earnings` | ไรเดอร์ | รายได้ |
| `/rider/status` | ไรเดอร์ | GPS toggle |
| `/admin` | Admin | Web browser |
