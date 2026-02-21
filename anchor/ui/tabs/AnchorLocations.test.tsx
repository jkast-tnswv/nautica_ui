import { render, screen, fireEvent } from '@testing-library/react';
import { AnchorLocations } from './AnchorLocations';

describe('AnchorLocations', () => {
  it('renders card title and column headers', () => {
    render(<AnchorLocations />);
    expect(screen.getByText('Anchor')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('renders multiple location categories from proto enum data', () => {
    render(<AnchorLocations />);
    expect(screen.getAllByText('Campus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Building').length).toBeGreaterThan(0);
  });

  it('renders data rows for location entries', () => {
    const { container } = render(<AnchorLocations />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('toggles info section when info button is clicked', () => {
    render(<AnchorLocations />);
    // Info section should be hidden initially
    expect(screen.queryByText(/physical location hierarchy/)).not.toBeInTheDocument();

    // Click the info toggle
    fireEvent.click(screen.getByTitle('Show info'));

    // Info section should now be visible
    expect(screen.getByText(/physical location hierarchy/)).toBeInTheDocument();

    // Click again to hide
    fireEvent.click(screen.getByTitle('Hide info'));
    expect(screen.queryByText(/physical location hierarchy/)).not.toBeInTheDocument();
  });

  it('filters rows when using table search', () => {
    const { container } = render(<AnchorLocations />);

    // Open search
    fireEvent.click(screen.getByTitle('Search'));

    // Type a search query
    const searchInput = screen.getByPlaceholderText('Search locations...');
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_QUERY_XYZ' } });

    // Should show no results message
    expect(screen.getByText(/No results for/)).toBeInTheDocument();
  });
});
