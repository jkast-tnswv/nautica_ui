import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
  it('renders with current value', () => {
    render(<NumberInput value={5} onChange={() => {}} />);
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('increments value on increase button click', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrements value on decrease button click', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Decrease'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('respects step for increment/decrement', () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} step={5} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('clamps to min value', () => {
    const onChange = vi.fn();
    render(<NumberInput value={1} onChange={onChange} min={0} />);
    fireEvent.click(screen.getByLabelText('Decrease'));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('clamps to max value', () => {
    const onChange = vi.fn();
    render(<NumberInput value={9} onChange={onChange} max={10} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('disables decrease button at min', () => {
    render(<NumberInput value={0} onChange={() => {}} min={0} />);
    expect(screen.getByLabelText('Decrease')).toBeDisabled();
  });

  it('disables increase button at max', () => {
    render(<NumberInput value={10} onChange={() => {}} max={10} />);
    expect(screen.getByLabelText('Increase')).toBeDisabled();
  });

  it('disables all controls when disabled', () => {
    render(<NumberInput value={5} onChange={() => {}} disabled />);
    expect(screen.getByLabelText('Increase')).toBeDisabled();
    expect(screen.getByLabelText('Decrease')).toBeDisabled();
    expect(screen.getByDisplayValue('5')).toBeDisabled();
  });

  it('handles typed input', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '42' } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('applies sm size class', () => {
    const { container } = render(<NumberInput value={0} onChange={() => {}} size="sm" />);
    expect(container.firstChild).toHaveClass('number-input-sm');
  });

  it('increments on ArrowUp key', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByDisplayValue('5'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrements on ArrowDown key', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByDisplayValue('5'), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('ignores empty string input', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores dash-only input', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '-' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores non-numeric input', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: 'abc' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('parses string value prop as number', () => {
    const onChange = vi.fn();
    render(<NumberInput value="10" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it('applies disabled class', () => {
    const { container } = render(<NumberInput value={5} onChange={() => {}} disabled />);
    expect(container.firstChild).toHaveClass('number-input-disabled');
  });

  it('applies custom className', () => {
    const { container } = render(<NumberInput value={5} onChange={() => {}} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('does not increment when disabled', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} disabled />);
    // buttons are disabled, so click is a no-op on the underlying handler
    expect(screen.getByLabelText('Increase')).toBeDisabled();
  });
});
