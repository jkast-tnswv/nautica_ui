import { render } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('returns null when total is 0', () => {
    const { container } = render(<ProgressBar segments={[{ count: 0, variant: 'success' }]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders segments with correct widths', () => {
    const { container } = render(
      <ProgressBar segments={[
        { count: 3, variant: 'success' },
        { count: 1, variant: 'error' },
      ]} />,
    );
    const segments = container.querySelectorAll('.progress-bar-segment');
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveStyle({ width: '75%' });
    expect(segments[1]).toHaveStyle({ width: '25%' });
  });

  it('applies variant class to segments', () => {
    const { container } = render(
      <ProgressBar segments={[{ count: 1, variant: 'warning' }]} />,
    );
    expect(container.querySelector('.progress-bar-warning')).toBeInTheDocument();
  });

  it('skips zero-count segments', () => {
    const { container } = render(
      <ProgressBar segments={[
        { count: 5, variant: 'success' },
        { count: 0, variant: 'error' },
      ]} />,
    );
    expect(container.querySelectorAll('.progress-bar-segment')).toHaveLength(1);
  });

  it('applies custom height', () => {
    const { container } = render(
      <ProgressBar segments={[{ count: 1, variant: 'info' }]} height={8} />,
    );
    expect(container.firstChild).toHaveStyle({ height: '8px' });
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProgressBar segments={[{ count: 1, variant: 'info' }]} className="custom" />,
    );
    expect(container.firstChild).toHaveClass('progress-bar', 'custom');
  });
});
