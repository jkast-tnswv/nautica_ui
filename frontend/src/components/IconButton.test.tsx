import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders children', () => {
    render(<IconButton>X</IconButton>);
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<IconButton>X</IconButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('icon-btn', 'icon-btn-secondary');
  });

  it('applies variant class', () => {
    render(<IconButton variant="danger">X</IconButton>);
    expect(screen.getByRole('button')).toHaveClass('icon-btn-danger');
  });

  it('applies size class for non-default sizes', () => {
    render(<IconButton size="lg">X</IconButton>);
    expect(screen.getByRole('button')).toHaveClass('icon-btn-lg');
  });

  it('does not add size class for default sm', () => {
    render(<IconButton>X</IconButton>);
    expect(screen.getByRole('button').className).not.toContain('icon-btn-sm');
  });

  it('shows spinner when loading', () => {
    const { container } = render(<IconButton isLoading>X</IconButton>);
    expect(container.querySelector('.btn-spinner')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<IconButton isLoading>X</IconButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onClick', () => {
    const onClick = vi.fn();
    render(<IconButton onClick={onClick}>X</IconButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
