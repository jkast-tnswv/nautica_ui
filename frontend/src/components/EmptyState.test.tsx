import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState message="Empty" icon="search" />);
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('renders custom iconElement over icon prop', () => {
    render(<EmptyState message="Empty" icon="search" iconElement={<span data-testid="custom">!</span>} />);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState message="Empty" description="Try adjusting filters" />);
    expect(screen.getByText('Try adjusting filters')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState message="Empty" />);
    expect(container.querySelector('.empty-state-description')).not.toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<EmptyState message="Empty" action={<button>Add Item</button>} />);
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('applies size variant class', () => {
    const { container } = render(<EmptyState message="Empty" size="lg" />);
    expect(container.firstChild).toHaveClass('empty-state-lg');
  });

  it('defaults to md size', () => {
    const { container } = render(<EmptyState message="Empty" />);
    expect(container.firstChild).toHaveClass('empty-state-md');
  });
});
