import { useMemo } from 'react';

export interface TimeSeriesBucket {
  time: number;
  statusCounts: Record<string, number>;
}

const VARIANT_COLORS: Record<string, string> = {
  success: 'var(--color-success, #22c55e)',
  warning: 'var(--color-warning, #f59e0b)',
  info: 'var(--color-info, #3b82f6)',
  error: 'var(--color-error, #ef4444)',
  default: 'var(--color-text-muted, #94a3b8)',
};

interface TimeSeriesChartProps {
  buckets: TimeSeriesBucket[];
  statuses: { label: string; variant: string }[];
  height?: number;
}

function formatTimeLabel(ms: number, span: number): string {
  const d = new Date(ms);
  if (span <= 60 * 60 * 1000) {
    // <= 1h: show HH:MM:SS
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  if (span <= 24 * 60 * 60 * 1000) {
    // <= 1d: show HH:MM
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  // > 1d: show MM/DD HH:MM
  return `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function TimeSeriesChart({ buckets, statuses, height = 200 }: TimeSeriesChartProps) {
  const { bars, maxCount, labelIndices, totalSpan } = useMemo(() => {
    if (buckets.length === 0) return { bars: [], maxCount: 0, labelIndices: [] as number[], totalSpan: 0 };

    const statusLabels = statuses.map((s) => s.label);
    let peak = 0;

    const computed = buckets.map((bucket) => {
      let total = 0;
      const segments: { label: string; count: number; variant: string }[] = [];
      for (const s of statuses) {
        const count = bucket.statusCounts[s.label] ?? 0;
        segments.push({ label: s.label, count, variant: s.variant });
        total += count;
      }
      if (total > peak) peak = total;
      return { time: bucket.time, total, segments };
    });

    // Pick ~5-8 label positions evenly spaced
    const labelCount = Math.min(buckets.length, 7);
    const step = Math.max(1, Math.floor(buckets.length / labelCount));
    const indices: number[] = [];
    for (let i = 0; i < buckets.length; i += step) indices.push(i);
    if (indices[indices.length - 1] !== buckets.length - 1) indices.push(buckets.length - 1);

    const span = buckets.length > 1 ? buckets[buckets.length - 1].time - buckets[0].time : 0;

    return { bars: computed, maxCount: peak, labelIndices: indices, totalSpan: span };
  }, [buckets, statuses]);

  if (bars.length === 0) {
    return <div className="tidewatch-chart-empty">No job data for this time range</div>;
  }

  const margin = { top: 8, right: 12, bottom: 32, left: 40 };
  const width = 900;
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  const barWidth = Math.max(2, (chartW / bars.length) - 2);
  const barGap = Math.max(1, (chartW - barWidth * bars.length) / Math.max(1, bars.length - 1));

  // Y axis ticks
  const yMax = maxCount || 1;
  const yTicks: number[] = [];
  const yStep = Math.max(1, Math.ceil(yMax / 4));
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);
  if (yTicks[yTicks.length - 1] < yMax) yTicks.push(yMax);

  return (
    <div className="tidewatch-chart">
      <div className="tidewatch-chart-legend">
        {statuses.map((s) => (
          <span key={s.label} className="tidewatch-chart-legend-item">
            <span
              className="tidewatch-chart-legend-swatch"
              style={{ background: VARIANT_COLORS[s.variant] || VARIANT_COLORS.default }}
            />
            {s.label}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="tidewatch-chart-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y axis grid + labels */}
        {yTicks.map((v) => {
          const y = margin.top + chartH - (v / yMax) * chartH;
          return (
            <g key={v}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y}
                y2={y}
                className="tidewatch-chart-grid"
              />
              <text x={margin.left - 6} y={y + 4} className="tidewatch-chart-y-label">
                {v}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((bar, i) => {
          const x = margin.left + i * (barWidth + barGap);
          let yOffset = 0;

          return (
            <g key={bar.time}>
              {bar.segments.map((seg) => {
                if (seg.count === 0) return null;
                const segH = (seg.count / yMax) * chartH;
                const y = margin.top + chartH - yOffset - segH;
                yOffset += segH;
                return (
                  <rect
                    key={seg.label}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={segH}
                    rx={Math.min(2, barWidth / 2)}
                    fill={VARIANT_COLORS[seg.variant] || VARIANT_COLORS.default}
                  >
                    <title>{`${seg.label}: ${seg.count}`}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}

        {/* X axis labels */}
        {labelIndices.map((i) => {
          const bar = bars[i];
          if (!bar) return null;
          const x = margin.left + i * (barWidth + barGap) + barWidth / 2;
          return (
            <text
              key={i}
              x={x}
              y={height - 4}
              className="tidewatch-chart-x-label"
            >
              {formatTimeLabel(bar.time, totalSpan)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
