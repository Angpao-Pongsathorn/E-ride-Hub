import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[48px] touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
        secondary: 'bg-amber-400 text-white hover:bg-amber-500 active:bg-amber-600',
        outline: 'border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50',
        ghost: 'hover:bg-gray-100 text-gray-700',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        link: 'text-emerald-600 underline-offset-4 hover:underline min-h-0',
      },
      size: {
        default: 'h-12 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
