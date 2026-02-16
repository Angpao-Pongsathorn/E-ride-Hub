'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, User, Bike, FileText, CreditCard, Shield, Camera, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/hooks/use-liff';

// ---- DocUpload component ----
interface DocUploadProps {
  label: string;
  icon: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

function DocUpload({ label, icon, file, onChange }: DocUploadProps) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    onChange(f);
    if (f && f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleClear = () => {
    onChange(null);
    setPreview(null);
    if (galleryRef.current) galleryRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-medium text-gray-800 flex-1">{label}</p>
        {file && (
          <button onClick={handleClear} className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Preview / Buttons */}
      {file ? (
        <div className="p-3 space-y-2">
          {preview ? (
            <img src={preview} alt="preview" className="w-full max-h-40 object-contain rounded-xl bg-gray-50" />
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
              <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-600 truncate">{file.name}</p>
            </div>
          )}
          <p className="text-xs text-green-600 text-center font-medium">✓ อัพโหลดแล้ว</p>
          <button
            onClick={handleClear}
            className="w-full rounded-xl border border-gray-200 py-1.5 text-xs text-gray-500"
          >
            เปลี่ยนไฟล์
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          {/* Gallery */}
          <label className="flex flex-col items-center gap-2 py-4 cursor-pointer active:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
              <Upload className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-xs font-medium text-gray-700">อัพโหลดไฟล์</p>
            <p className="text-[10px] text-gray-400">รูปภาพ / PDF</p>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Camera */}
          <label className="flex flex-col items-center gap-2 py-4 cursor-pointer active:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Camera className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs font-medium text-gray-700">ถ่ายรูป</p>
            <p className="text-[10px] text-gray-400">กล้องโทรศัพท์</p>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      )}
    </div>
  );
}
// ---- end DocUpload ----

const STEPS = [
  { label: 'ข้อมูลส่วนตัว', icon: User },
  { label: 'ยานพาหนะ', icon: Bike },
  { label: 'เอกสาร', icon: FileText },
  { label: 'บัญชีธนาคาร', icon: CreditCard },
  { label: 'เงื่อนไข', icon: Shield },
];

interface FormData {
  fullName: string;
  idCard: string;
  phone: string;
  address: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  idCardFile: File | null;
  vehicleDoc: File | null;
  driverLicense: File | null;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  agreeTerms: boolean;
}

const INITIAL: FormData = {
  fullName: '', idCard: '', phone: '', address: '',
  vehicleType: 'motorcycle', vehicleBrand: '', vehicleModel: '', licensePlate: '',
  idCardFile: null, vehicleDoc: null, driverLicense: null,
  bankName: '', bankAccount: '', bankAccountName: '',
  agreeTerms: false,
};

export default function RegisterRiderPage() {
  const router = useRouter();
  const { profile } = useLiff();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (field: keyof FormData, value: string | boolean | File | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validateStep = (): boolean => {
    setError('');
    if (step === 0 && (!form.fullName.trim() || !form.idCard.trim() || !form.phone.trim())) {
      setError('กรุณากรอกข้อมูลให้ครบ'); return false;
    }
    if (step === 1 && !form.licensePlate.trim()) {
      setError('กรุณากรอกทะเบียนรถ'); return false;
    }
    if (step === 3 && (!form.bankName.trim() || !form.bankAccount.trim())) {
      setError('กรุณากรอกข้อมูลธนาคาร'); return false;
    }
    if (step === 4 && !form.agreeTerms) {
      setError('กรุณายอมรับเงื่อนไขการใช้งาน'); return false;
    }
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
    try {
      const res = await fetch('/api/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUserId: profile.userId,
          displayName: profile.displayName,
          fullName: form.fullName,
          idCard: form.idCard,
          phone: form.phone,
          address: form.address,
          vehicleType: form.vehicleType,
          vehicleBrand: form.vehicleBrand,
          vehicleModel: form.vehicleModel,
          licensePlate: form.licensePlate,
          bankName: form.bankName,
          bankAccount: form.bankAccount,
          bankAccountName: form.bankAccountName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">สมัครสำเร็จ!</h2>
        <p className="text-gray-500 text-sm mb-1">ทีมงานจะตรวจสอบและอนุมัติภายใน 1-2 วันทำการ</p>
        <p className="text-gray-400 text-xs mb-6">คุณจะได้รับแจ้งเตือนผ่าน LINE เมื่ออนุมัติแล้ว</p>
        <button onClick={() => router.push('/home')} className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white">
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => step > 0 ? setStep((s) => s - 1) : router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">สมัครไรเดอร์</h1>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-orange-500' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">ขั้นตอน {step + 1}/{STEPS.length}: {STEPS[step].label}</p>
      </div>

      <div className="px-4 py-4 pb-32">
        {/* Step 0: Personal */}
        {step === 0 && (
          <div className="space-y-3">
            {[
              { label: 'ชื่อ-นามสกุล *', field: 'fullName', placeholder: 'ชื่อ นามสกุล' },
              { label: 'เลขบัตรประชาชน *', field: 'idCard', placeholder: '1 xxxx xxxxx xx x' },
              { label: 'เบอร์โทร *', field: 'phone', placeholder: '08x-xxx-xxxx', type: 'tel' },
              { label: 'ที่อยู่', field: 'address', placeholder: 'ที่อยู่ปัจจุบัน' },
            ].map((f) => (
              <div key={f.field}>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{f.label}</label>
                <input
                  value={form[f.field as keyof FormData] as string}
                  onChange={(e) => set(f.field as keyof FormData, e.target.value)}
                  placeholder={f.placeholder}
                  type={f.type || 'text'}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Vehicle */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ประเภทยานพาหนะ</label>
              <div className="flex gap-2">
                {[{ v: 'motorcycle', l: '🏍 มอเตอร์ไซค์' }, { v: 'car', l: '🚗 รถยนต์' }].map((t) => (
                  <button key={t.v} onClick={() => set('vehicleType', t.v)}
                    className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-colors ${form.vehicleType === t.v ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
            {[
              { label: 'ยี่ห้อรถ', field: 'vehicleBrand', placeholder: 'เช่น Honda, Toyota' },
              { label: 'รุ่นรถ', field: 'vehicleModel', placeholder: 'เช่น Wave, Yaris' },
              { label: 'ทะเบียนรถ *', field: 'licensePlate', placeholder: 'กข 1234 ยโสธร' },
            ].map((f) => (
              <div key={f.field}>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{f.label}</label>
                <input value={form[f.field as keyof FormData] as string}
                  onChange={(e) => set(f.field as keyof FormData, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 text-center">อัพโหลดหรือถ่ายรูปเอกสารแต่ละรายการ</p>
            <DocUpload
              label="บัตรประชาชน"
              icon="🪪"
              file={form.idCardFile}
              onChange={(f) => set('idCardFile', f)}
            />
            <DocUpload
              label="ทะเบียนรถ / พรบ."
              icon="📄"
              file={form.vehicleDoc}
              onChange={(f) => set('vehicleDoc', f)}
            />
            <DocUpload
              label="ใบขับขี่"
              icon="🚗"
              file={form.driverLicense}
              onChange={(f) => set('driverLicense', f)}
            />
            <p className="text-xs text-gray-400 text-center">* เอกสารจะถูกตรวจสอบโดยทีมงานก่อนอนุมัติ</p>
          </div>
        )}

        {/* Step 3: Banking */}
        {step === 3 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ธนาคาร *</label>
              <select value={form.bankName} onChange={(e) => set('bankName', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white">
                <option value="">เลือกธนาคาร</option>
                {['กสิกรไทย', 'กรุงไทย', 'ไทยพาณิชย์', 'กรุงเทพ', 'ออมสิน', 'ธ.ก.ส.', 'ทหารไทยธนชาต'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">เลขบัญชี *</label>
              <input value={form.bankAccount} onChange={(e) => set('bankAccount', e.target.value)}
                placeholder="xxx-x-xxxxx-x" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ชื่อบัญชี</label>
              <input value={form.bankAccountName} onChange={(e) => set('bankAccountName', e.target.value)}
                placeholder="ชื่อ นามสกุล" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
              <p className="text-sm text-green-700">💰 คุณจะได้รับ 70% ของค่าจัดส่งทุกออเดอร์ โอนรายสัปดาห์</p>
            </div>
          </div>
        )}

        {/* Step 4: Terms */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3 text-sm text-gray-600 leading-relaxed max-h-64 overflow-y-auto">
              <p className="font-bold text-gray-900">เงื่อนไขการเป็นไรเดอร์ E-RideHub</p>
              <p>1. ไรเดอร์ต้องมีอายุ 18 ปีขึ้นไป และมีใบขับขี่ที่ถูกต้องตามกฎหมาย</p>
              <p>2. ไรเดอร์ต้องรักษามาตรฐานการให้บริการ — อัตราการยอมรับงานไม่ต่ำกว่า 70%</p>
              <p>3. ค่าตอบแทน 70% ของค่าจัดส่ง โอนทุกวันจันทร์</p>
              <p>4. แพลตฟอร์มสามารถระงับบัญชีหากพบการละเมิดข้อกำหนด</p>
              <p>5. ไรเดอร์ต้องปฏิบัติตามกฎจราจรและแต่งกายสุภาพขณะปฏิบัติงาน</p>
              <p>6. ข้อมูลส่วนตัวจะถูกเก็บรักษาตาม PDPA</p>
            </div>
            <button
              onClick={() => set('agreeTerms', !form.agreeTerms)}
              className="flex items-center gap-3 w-full"
            >
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${form.agreeTerms ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                {form.agreeTerms && <Check className="h-3 w-3 text-white" />}
              </div>
              <p className="text-sm text-gray-700">ฉันได้อ่านและยอมรับเงื่อนไขทั้งหมด</p>
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
      </div>

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
