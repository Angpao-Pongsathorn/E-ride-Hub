'use client';

import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Store, MapPin, User, Image as ImageIcon, Clock, CreditCard, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/hooks/use-liff';
import { GoogleMapPicker } from '@/components/shared/GoogleMapPicker';
import { FEATURES } from '@/config/features';
import { ComingSoon } from '@/components/shared/ComingSoon';

const CATEGORIES = ['อาหาร', 'OTOP', 'ของสด', 'เครื่องดื่ม', 'ขนม', 'อื่นๆ'];

const STEPS = [
  { label: 'ข้อมูลร้าน', icon: Store },
  { label: 'ที่ตั้ง', icon: MapPin },
  { label: 'เจ้าของ', icon: User },
  { label: 'รูปภาพ', icon: ImageIcon },
  { label: 'เวลาเปิด', icon: Clock },
  { label: 'บัญชีธนาคาร', icon: CreditCard },
];

interface FormData {
  name: string;
  category: string;
  description: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  lat: string;
  lng: string;
  ownerName: string;
  ownerIdCard: string;
  ownerPhone: string;
  lineId: string;
  coverImage: File | null;
  openTime: string;
  closeTime: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
}

const INITIAL: FormData = {
  name: '', category: 'อาหาร', description: '', phone: '',
  address: '', district: 'คำเขื่อนแก้ว', province: 'ยโสธร', lat: '', lng: '',
  ownerName: '', ownerIdCard: '', ownerPhone: '', lineId: '',
  coverImage: null,
  openTime: '08:00', closeTime: '21:00',
  bankName: '', bankAccount: '', bankAccountName: '',
};

export default function RegisterShopPage() {
  const router = useRouter();
  const { profile } = useLiff();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [mapJump, setMapJump] = useState<{ lat: number; lng: number } | null>(null);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const isJumpingRef = useRef(false); // ป้องกัน input ถูก overwrite ตอน jump

  if (!FEATURES.registerShop) return <ComingSoon title="เปิดร้านค้า" />;

  const set = (field: keyof FormData, value: string | File | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validateStep = (): boolean => {
    setError('');
    if (step === 0 && (!form.name.trim() || !form.phone.trim())) {
      setError('กรุณากรอกชื่อร้านและเบอร์โทร'); return false;
    }
    if (step === 1 && !form.address.trim()) {
      setError('กรุณากรอกที่อยู่'); return false;
    }
    if (step === 2 && (!form.ownerName.trim() || !form.ownerIdCard.trim())) {
      setError('กรุณากรอกชื่อและเลขบัตรประชาชน'); return false;
    }
    // step 5: bank info is optional — no validation needed
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!profile?.userId) return;
    setSubmitting(true);
    setError('');

    const payload = {
      lineUserId: profile.userId,
      name: form.name,
      category: form.category,
      description: form.description,
      phone: form.phone,
      address: form.address,
      district: form.district,
      province: form.province,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      ownerName: form.ownerName,
      ownerIdCard: form.ownerIdCard,
      ownerPhone: form.ownerPhone,
      lineId: form.lineId,
      openTime: form.openTime,
      closeTime: form.closeTime,
      bankName: form.bankName,
      bankAccount: form.bankAccount,
      bankAccountName: form.bankAccountName,
    };

    try {
      // ส่งทั้ง 2 พร้อมกัน — ถ้า Google Sheet ล้มเหลวก็ไม่ block หลัก
      const [apiRes] = await Promise.allSettled([
        fetch('/api/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        // ส่งไป Google Apps Script Webhook (บันทึกใน Google Sheet)
        process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK
          ? fetch(process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' }, // Apps Script ต้องการ text/plain
              body: JSON.stringify(payload),
            }).catch(() => null) // ไม่ throw ถ้า sheet ล้มเหลว
          : Promise.resolve(null),
      ]);

      if (apiRes.status === 'fulfilled') {
        const data = await apiRes.value.json();
        if (!apiRes.value.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      } else {
        throw new Error(apiRes.reason?.message || 'เกิดข้อผิดพลาด');
      }

      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (done) router.replace('/register-shop/success');
  }, [done, router]);

  if (done) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => step > 0 ? setStep((s) => s - 1) : router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">เปิดร้านค้า</h1>
        </div>
        {/* Progress */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-orange-500' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">ขั้นตอน {step + 1}/{STEPS.length}: {STEPS[step].label}</p>
      </div>

      <div className="px-4 py-4 pb-32">
        {/* Step 0: Shop Info */}
        {step === 0 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ชื่อร้าน *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="เช่น ร้านส้มตำแม่สมศรี" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ประเภทร้าน *</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => set('category', c)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${form.category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">รายละเอียดร้าน</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                placeholder="แนะนำร้านของคุณ..." rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">เบอร์โทรร้าน *</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} type="tel"
                placeholder="08x-xxx-xxxx" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
        )}

        {/* Step 1: Address + Map */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ปักหมุดตำแหน่งร้าน *</label>
              <GoogleMapPicker
                initialLat={form.lat ? parseFloat(form.lat) : undefined}
                initialLng={form.lng ? parseFloat(form.lng) : undefined}
                jumpTo={mapJump}
                onLocationSelect={(lat, lng, addr, district, province) => {
                  // อัปเดต input เฉพาะตอนที่ผู้ใช้ปักหมุดเอง (ไม่ใช่ตอน jump จาก input)
                  if (!isJumpingRef.current) {
                    setLatInput(lat.toFixed(6));
                    setLngInput(lng.toFixed(6));
                  }
                  isJumpingRef.current = false;
                  setForm((f) => ({
                    ...f,
                    lat: lat.toString(),
                    lng: lng.toString(),
                    address: addr,
                    district: district || f.district,
                    province: province || f.province,
                  }));
                }}
              />
            </div>

            {/* Manual lat/lng input */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-500">หรือกรอกพิกัดโดยตรง</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] text-gray-400 mb-0.5 block">ละติจูด</label>
                  <input
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    placeholder="เช่น 15.66170"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-gray-400 mb-0.5 block">ลองจิจูด</label>
                  <input
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    placeholder="เช่น 104.14030"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const lat = parseFloat(latInput);
                      const lng = parseFloat(lngInput);
                      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        isJumpingRef.current = true; // บอกว่ากำลัง jump — อย่า overwrite input
                        setMapJump({ lat, lng });
                        setTimeout(() => setMapJump(null), 300);
                      }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 active:bg-orange-600"
                    title="ไปตำแหน่งนี้"
                  >
                    <Navigation className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">กรอกแล้วกด <span className="inline-flex items-center gap-0.5 text-orange-500">🧭</span> เพื่อเลื่อนหมุด</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ที่อยู่ร้าน *</label>
              <textarea value={form.address} onChange={(e) => set('address', e.target.value)}
                placeholder="บ้านเลขที่, หมู่, ถนน, ตำบล..." rows={2}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">อำเภอ</label>
                <input value={form.district} onChange={(e) => set('district', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">จังหวัด</label>
                <input value={form.province} onChange={(e) => set('province', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            </div>
            {form.lat && form.lng && (
              <p className="text-xs text-green-600 text-center">
                ✓ ได้พิกัดแล้ว: {parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Owner */}
        {step === 2 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ชื่อ-นามสกุลเจ้าของ *</label>
              <input value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)}
                placeholder="ชื่อ นามสกุล" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">เลขบัตรประชาชน *</label>
              <input value={form.ownerIdCard} onChange={(e) => set('ownerIdCard', e.target.value)}
                placeholder="1 xxxx xxxxx xx x" maxLength={13}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">เบอร์โทรเจ้าของ</label>
              <input value={form.ownerPhone} onChange={(e) => set('ownerPhone', e.target.value)} type="tel"
                placeholder="08x-xxx-xxxx" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">LINE ID <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
              <input value={form.lineId} onChange={(e) => set('lineId', e.target.value)}
                placeholder="@yourlineid" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">อัปโหลดรูปหน้าร้าน</p>
              <p className="text-xs text-gray-400 mb-3">JPG, PNG ขนาดไม่เกิน 5MB</p>
              <input type="file" accept="image/*" onChange={(e) => set('coverImage', e.target.files?.[0] || null)}
                className="hidden" id="cover-upload" />
              <label htmlFor="cover-upload" className="cursor-pointer rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white">
                เลือกรูป
              </label>
              {form.coverImage && (
                <p className="mt-2 text-xs text-green-600">✓ {form.coverImage.name}</p>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center">รูปจะแสดงให้ลูกค้าเห็นในรายการร้านค้า</p>
          </div>
        )}

        {/* Step 4: Hours */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">เวลาเปิด</label>
                <input value={form.openTime} onChange={(e) => set('openTime', e.target.value)} type="time"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">เวลาปิด</label>
                <input value={form.closeTime} onChange={(e) => set('closeTime', e.target.value)} type="time"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-sm text-amber-700">💡 สามารถเปิด/ปิดร้านแบบ manual ได้จาก Dashboard ของร้านค้า</p>
            </div>
          </div>
        )}

        {/* Step 5: Banking */}
        {step === 5 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ธนาคาร <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
              <select value={form.bankName} onChange={(e) => set('bankName', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white">
                <option value="">เลือกธนาคาร</option>
                {['กสิกรไทย', 'กรุงไทย', 'ไทยพาณิชย์', 'กรุงเทพ', 'ออมสิน', 'ธ.ก.ส.', 'ทหารไทยธนชาต'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">เลขบัญชี <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
              <input value={form.bankAccount} onChange={(e) => set('bankAccount', e.target.value)}
                placeholder="xxx-x-xxxxx-x" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ชื่อบัญชี</label>
              <input value={form.bankAccountName} onChange={(e) => set('bankAccountName', e.target.value)}
                placeholder="ชื่อ นามสกุล" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-sm text-blue-700">🔒 ข้อมูลบัญชีของคุณจะถูกเก็บอย่างปลอดภัยและใช้เพื่อการโอนเงินเท่านั้น</p>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe">
        <button
          onClick={handleNext}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'กำลังส่ง...' : step === STEPS.length - 1 ? (
            <><Check className="h-5 w-5" /> ส่งใบสมัคร</>
          ) : (
            <>{STEPS[step + 1].label} <ArrowRight className="h-5 w-5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
