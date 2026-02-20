import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
export type BadgeSize = 'sm' | 'default';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show a dot indicator before the text */
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'default', size, dot, className }: BadgeProps) {
  const classes = [
    'badge',
    `badge-${variant}`,
    size === 'sm' && 'badge-sm',
    dot && 'badge-dot',
    className,
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}
