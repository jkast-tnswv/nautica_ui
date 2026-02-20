import type { BadgeVariant } from './Badge';

export interface ProgressSegment {
  /** Number of items in this segment */
  count: number;
  /** Visual variant — maps to semantic color */
  variant: BadgeVariant;
}

interface ProgressBarProps {
  segments: ProgressSegment[];
  /** Bar height in px (default 4) */
  height?: number;
  className?: string;
}

export function ProgressBar({ segments, height = 4, className }: ProgressBarProps) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return null;

  const classes = ['progress-bar', className].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ height }}>
      {segments.map(
        (seg, i) =>
          seg.count > 0 && (
            <div
              key={i}
              className={`progress-bar-segment progress-bar-${seg.variant}`}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
          ),
      )}
    </div>
  );
}
