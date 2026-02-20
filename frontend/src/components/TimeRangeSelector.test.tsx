import { render, screen, fireEvent } from '@testing-library/react';
import { TimeRangeSelector } from './TimeRangeSelector';

describe('TimeRangeSelector', () => {
  it('renders with value decomposed into amount and unit', () => {
    render(<TimeRangeSelector value={120} onChange={() => {}} />);
    // 120 minutes = 2 hours
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('renders 0 for zero value', () => {
    render(<TimeRangeSelector value={0} onChange={() => {}} />);
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });

  it('calls onChange when amount changes', () => {
    const onChange = vi.fn();
    render(<TimeRangeSelector value={60} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith(180); // 3 hours * 60
  });

  it('decomposes days correctly', () => {
    render(<TimeRangeSelector value={2880} onChange={() => {}} />);
    // 2880 = 2 days
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('decomposes weeks correctly', () => {
    render(<TimeRangeSelector value={20160} onChange={() => {}} />);
    // 20160 = 2 weeks
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('falls back to minutes for non-divisible values', () => {
    render(<TimeRangeSelector value={45} onChange={() => {}} />);
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
  });

  it('handles empty input', () => {
    const onChange = vi.fn();
    render(<TimeRangeSelector value={60} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '' } });
    // Should set amount to 0, not call onChange
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });
});
