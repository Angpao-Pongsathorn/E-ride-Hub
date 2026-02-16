import { LiffProvider } from '@/components/liff/LiffProvider';

export default function LiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER!}>
      {children}
    </LiffProvider>
  );
}
