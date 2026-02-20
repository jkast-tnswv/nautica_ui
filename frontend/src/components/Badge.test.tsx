import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass('badge', 'badge-default');
  });

  it('applies specified variant class', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.firstChild).toHaveClass('badge-success');
  });

  it('applies badge-sm when size="sm"', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    expect(container.firstChild).toHaveClass('badge-sm');
  });

  it('applies badge-dot when dot prop is set', () => {
    const { container } = render(<Badge dot>Online</Badge>);
    expect(container.firstChild).toHaveClass('badge-dot');
  });

  it('merges custom className', () => {
    const { container } = render(<Badge className="custom">Test</Badge>);
    expect(container.firstChild).toHaveClass('badge', 'custom');
  });
});
