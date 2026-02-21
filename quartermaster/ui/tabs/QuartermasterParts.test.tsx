import { render, screen, fireEvent } from '@testing-library/react';
import { QuartermasterParts } from './QuartermasterParts';

describe('QuartermasterParts', () => {
  it('renders card title and column headers', () => {
    render(<QuartermasterParts />);
    expect(screen.getByText('Quartermaster')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Part Category')).toBeInTheDocument();
    expect(screen.getByText('Proto Enum')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('renders part category rows from proto enum data', () => {
    const { container } = render(<QuartermasterParts />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('toggles info section when info button is clicked', () => {
    render(<QuartermasterParts />);
    // Info section should be hidden initially
    expect(screen.queryByText(/taxonomy of trackable parts/)).not.toBeInTheDocument();

    // Click the info toggle
    fireEvent.click(screen.getByTitle('Show info'));

    // Info section should now be visible
    expect(screen.getByText(/taxonomy of trackable parts/)).toBeInTheDocument();

    // Click again to hide
    fireEvent.click(screen.getByTitle('Hide info'));
    expect(screen.queryByText(/taxonomy of trackable parts/)).not.toBeInTheDocument();
  });

  it('filters rows when using table search', () => {
    const { container } = render(<QuartermasterParts />);

    // Open search
    fireEvent.click(screen.getByTitle('Search'));

    // Type a search query that matches nothing
    const searchInput = screen.getByPlaceholderText('Search parts...');
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_QUERY_XYZ' } });

    // Should show no results message
    expect(screen.getByText(/No results for/)).toBeInTheDocument();
  });
});
