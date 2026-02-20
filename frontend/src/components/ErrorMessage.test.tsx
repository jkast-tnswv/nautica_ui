import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders with default "Error" prefix', () => {
    render(<ErrorMessage error="something went wrong" />);
    expect(screen.getByText(/Error: something went wrong/)).toBeInTheDocument();
  });

  it('renders with custom prefix', () => {
    render(<ErrorMessage error="timeout" prefix="Network" />);
    expect(screen.getByText(/Network: timeout/)).toBeInTheDocument();
  });

  it('has the error-message class', () => {
    const { container } = render(<ErrorMessage error="fail" />);
    expect(container.firstChild).toHaveClass('error-message');
  });
});
