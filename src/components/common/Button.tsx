import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono text-xs uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-40 select-none';

    const variants = {
      primary:
        'bg-foreground text-background font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-[0.98]',
      secondary:
        'bg-[#181822] text-foreground border border-white/[0.08] hover:bg-[#20202e] hover:border-white/20 active:scale-[0.98]',
      outline:
        'border border-white/[0.12] bg-black/40 backdrop-blur-md text-foreground hover:bg-white/[0.06] hover:border-white/30 active:scale-[0.98]',
      ghost:
        'text-muted-foreground hover:text-foreground hover:bg-white/[0.04] active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-7 px-2.5 rounded-sm gap-1.5 text-[11px]',
      md: 'h-8 px-3.5 rounded-sm gap-2 text-xs',
      lg: 'h-10 px-5 rounded-sm gap-2.5 text-xs',
      icon: 'h-8 w-8 rounded-sm p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
