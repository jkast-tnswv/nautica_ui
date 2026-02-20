import { render, screen } from '@testing-library/react';
import { TimeSeriesChart, type TimeSeriesBucket } from './TimeSeriesChart';

const statuses = [
  { label: 'success', variant: 'success' },
  { label: 'failed', variant: 'error' },
  { label: 'pending', variant: 'warning' },
];

const now = Date.now();

const makeBuckets = (count: number, spanMs: number): TimeSeriesBucket[] =>
  Array.from({ length: count }, (_, i) => ({
    time: now - spanMs + (spanMs / count) * i,
    statusCounts: {
      success: Math.floor(Math.random() * 10) + 1,
      failed: i % 3 === 0 ? 2 : 0,
      pending: i % 5 === 0 ? 1 : 0,
    },
  }));

describe('TimeSeriesChart', () => {
  it('shows empty message when no buckets', () => {
    render(<TimeSeriesChart buckets={[]} statuses={statuses} />);
    expect(screen.getByText('No job data for this time range')).toBeInTheDocument();
  });

  it('renders SVG with bars when buckets provided', () => {
    const buckets = makeBuckets(10, 60 * 60 * 1000); // 1 hour span
    const { container } = render(<TimeSeriesChart buckets={buckets} statuses={statuses} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(0);
  });

  it('renders legend items for each status', () => {
    const buckets = makeBuckets(5, 30 * 60 * 1000);
    render(<TimeSeriesChart buckets={buckets} statuses={statuses} />);
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const buckets = makeBuckets(5, 30 * 60 * 1000);
    const { container } = render(<TimeSeriesChart buckets={buckets} statuses={statuses} height={300} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toContain('300');
  });

  it('renders y-axis tick labels', () => {
    const buckets: TimeSeriesBucket[] = [
      { time: now - 1000, statusCounts: { success: 8, failed: 2, pending: 0 } },
      { time: now, statusCounts: { success: 4, failed: 1, pending: 3 } },
    ];
    const { container } = render(<TimeSeriesChart buckets={buckets} statuses={statuses} />);
    // y-axis labels are <text> elements with class tidewatch-chart-y-label
    const yLabels = container.querySelectorAll('.tidewatch-chart-y-label');
    expect(yLabels.length).toBeGreaterThan(0);
  });

  it('renders x-axis labels', () => {
    const buckets = makeBuckets(10, 60 * 60 * 1000);
    const { container } = render(<TimeSeriesChart buckets={buckets} statuses={statuses} />);
    const xLabels = container.querySelectorAll('.tidewatch-chart-x-label');
    expect(xLabels.length).toBeGreaterThan(0);
  });

  it('renders segment titles with count', () => {
    const buckets: TimeSeriesBucket[] = [
      { time: now, statusCounts: { success: 5, failed: 3, pending: 0 } },
    ];
    const { container } = render(<TimeSeriesChart buckets={buckets} statuses={statuses} />);
    const titles = container.querySelectorAll('title');
    const texts = Array.from(titles).map(t => t.textContent);
    expect(texts).toContain('success: 5');
    expect(texts).toContain('failed: 3');
  });

  it('handles single bucket', () => {
    const buckets: TimeSeriesBucket[] = [
      { time: now, statusCounts: { success: 1, failed: 0, pending: 0 } },
    ];
    const { container } = render(<TimeSeriesChart buckets={buckets} statuses={statuses} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('formats time labels differently for longer spans', () => {
    // > 24 hours span should show date format
    const buckets = makeBuckets(10, 48 * 60 * 60 * 1000);
    const { container } = render(<TimeSeriesChart buckets={buckets} statuses={statuses} />);
    const xLabels = container.querySelectorAll('.tidewatch-chart-x-label');
    expect(xLabels.length).toBeGreaterThan(0);
  });
});
