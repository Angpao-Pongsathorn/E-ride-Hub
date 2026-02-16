import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ className, size = 'md', text }: LoadingSpinnerProps) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-emerald-500',
          sizeMap[size]
        )}
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = 'กำลังโหลด...' }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-4 shadow-sm">
      <div className="h-40 rounded-xl bg-gray-200" />
      <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/4 rounded bg-gray-200" />
    </div>
  );
}
