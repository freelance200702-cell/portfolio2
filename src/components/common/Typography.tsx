import React from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  className,
  children,
  ...props
}) => {
  const Component = (`h${level}` as const);
  const sizeStyles = {
    1: 'text-2xl sm:text-4xl font-bold tracking-tight text-foreground',
    2: 'text-xl sm:text-2xl font-semibold tracking-tight text-foreground',
    3: 'text-lg sm:text-xl font-medium text-foreground',
    4: 'text-sm sm:text-base font-medium text-foreground',
  }[level];

  return (
    <Component className={cn(sizeStyles, className)} {...props}>
      {children}
    </Component>
  );
};

export const Paragraph: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('text-xs sm:text-sm text-muted-foreground leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
};

export const MonoLabel: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground select-none',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
