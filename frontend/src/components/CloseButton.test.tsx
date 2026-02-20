import { render, screen, fireEvent } from '@testing-library/react';
import { CloseButton } from './CloseButton';

describe('CloseButton', () => {
  it('renders with default aria-label "Close"', () => {
    render(<CloseButton />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<CloseButton label="Dismiss" />);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('fires onClick', () => {
    const onClick = vi.fn();
    render(<CloseButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies variant class', () => {
    render(<CloseButton variant="subtle" />);
    expect(screen.getByRole('button')).toHaveClass('close-button-subtle');
  });

  it('applies default variant class', () => {
    render(<CloseButton />);
    expect(screen.getByRole('button')).toHaveClass('close-button-default');
  });

  it('renders close icon', () => {
    render(<CloseButton />);
    expect(screen.getByText('close')).toBeInTheDocument();
  });
});
