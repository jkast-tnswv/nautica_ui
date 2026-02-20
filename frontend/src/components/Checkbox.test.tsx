import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders checkbox input', () => {
    render(<Checkbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('reflects checked state', () => {
    render(<Checkbox checked={true} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange with toggled value', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders label when provided', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('does not render label wrapper when no label', () => {
    const { container } = render(<Checkbox checked={false} onChange={() => {}} />);
    expect(container.querySelector('.checkbox-label')).not.toBeInTheDocument();
  });

  it('applies checked class', () => {
    const { container } = render(<Checkbox checked={true} onChange={() => {}} />);
    expect(container.querySelector('.checkbox-checked')).toBeInTheDocument();
  });

  it('applies indeterminate class', () => {
    const { container } = render(<Checkbox checked={false} onChange={() => {}} indeterminate />);
    expect(container.querySelector('.checkbox-indeterminate')).toBeInTheDocument();
  });

  it('applies disabled state', () => {
    render(<Checkbox checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
