import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-white/[0.04] text-muted-foreground border-white/[0.08]',
    primary: 'bg-white/[0.08] text-foreground border-white/20 font-semibold',
    secondary: 'bg-[#181822] text-foreground border-white/[0.1]',
    outline: 'border-white/[0.12] text-foreground/80 bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
