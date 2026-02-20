import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders label text', () => {
    render(<Toggle label="Enable Feature" checked={false} onChange={() => {}} />);
    expect(screen.getByText('Enable Feature')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Toggle label="Feature" description="Does something cool" checked={false} onChange={() => {}} />);
    expect(screen.getByText('Does something cool')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<Toggle label="Feature" checked={false} onChange={() => {}} />);
    expect(container.querySelector('.toggle-description')).not.toBeInTheDocument();
  });

  it('calls onChange with toggled value on click', () => {
    const onChange = vi.fn();
    render(<Toggle label="Feature" checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects checked state', () => {
    render(<Toggle label="Feature" checked={true} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('reflects unchecked state', () => {
    render(<Toggle label="Feature" checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('applies disabled state', () => {
    render(<Toggle label="Feature" checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
