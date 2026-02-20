import { render, screen, fireEvent } from '@testing-library/react';
import { Message } from './Message';

describe('Message', () => {
  it('renders message text', () => {
    render(<Message type="success" text="Operation completed" />);
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('applies type class', () => {
    const { container } = render(<Message type="error" text="Failed" />);
    expect(container.firstChild).toHaveClass('message', 'error');
  });

  it('applies success type class', () => {
    const { container } = render(<Message type="success" text="Done" />);
    expect(container.firstChild).toHaveClass('message', 'success');
  });

  it('renders dismiss button when onDismiss provided', () => {
    render(<Message type="success" text="Done" onDismiss={() => {}} />);
    expect(screen.getByRole('button', { name: 'Dismiss message' })).toBeInTheDocument();
  });

  it('does not render dismiss button when no onDismiss', () => {
    render(<Message type="success" text="Done" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('fires onDismiss when dismiss clicked', () => {
    const onDismiss = vi.fn();
    render(<Message type="error" text="Oops" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
