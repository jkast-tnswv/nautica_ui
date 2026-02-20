import { render, screen, fireEvent } from '@testing-library/react';
import { StatTile } from './StatTile';

const defaultProps = {
  title: 'Devices',
  icon: 'dns',
  headline: <span>42</span>,
  loading: false,
  error: null,
  expanded: false,
  onToggle: vi.fn(),
};

describe('StatTile', () => {
  it('renders title and headline', () => {
    render(<StatTile {...defaultProps}>Details</StatTile>);
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<StatTile {...defaultProps}>Details</StatTile>);
    expect(screen.getByText('dns')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<StatTile {...defaultProps} loading={true}>Details</StatTile>);
    expect(container.querySelector('.icon-spin')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<StatTile {...defaultProps} error="Failed to load">Details</StatTile>);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<StatTile {...defaultProps} onToggle={onToggle}>Details</StatTile>);
    fireEvent.click(screen.getByText('Devices'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('applies expanded class when expanded', () => {
    const { container } = render(<StatTile {...defaultProps} expanded={true}>Details</StatTile>);
    expect(container.firstChild).toHaveClass('stat-tile-expanded');
  });

  it('renders children content', () => {
    render(<StatTile {...defaultProps} expanded={true}>Breakdown content</StatTile>);
    expect(screen.getByText('Breakdown content')).toBeInTheDocument();
  });

  it('shows error message in expanded content when error', () => {
    render(<StatTile {...defaultProps} error="Load failed" expanded={true}>Details</StatTile>);
    expect(screen.getByText('Load failed')).toBeInTheDocument();
  });
});
