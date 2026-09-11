import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatProgressPercent(progress: number): string {
  return `${Math.round(Math.min(Math.max(progress, 0), 1) * 100)}%`;
}
