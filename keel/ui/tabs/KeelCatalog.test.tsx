import { render, screen, fireEvent } from '@testing-library/react';
import { KeelCatalog } from './KeelCatalog';

describe('KeelCatalog', () => {
  it('renders card title and column headers', () => {
    render(<KeelCatalog />);
    expect(screen.getByText('Keel')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Proto Enum')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('renders chassis model rows from proto enum data', () => {
    const { container } = render(<KeelCatalog />);
    expect(screen.getAllByText('Chassis').length).toBeGreaterThan(0);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('toggles info section when info button is clicked', () => {
    render(<KeelCatalog />);
    // Info section should be hidden initially
    expect(screen.queryByText(/physical hardware taxonomy/)).not.toBeInTheDocument();

    // Click the info toggle button
    fireEvent.click(screen.getByTitle('Show info'));

    // Info section should now be visible
    expect(screen.getByText(/physical hardware taxonomy/)).toBeInTheDocument();

    // Click again to hide
    fireEvent.click(screen.getByTitle('Hide info'));
    expect(screen.queryByText(/physical hardware taxonomy/)).not.toBeInTheDocument();
  });

  it('filters rows when using table search', () => {
    const { container } = render(<KeelCatalog />);
    const rowCountBefore = container.querySelectorAll('tbody tr').length;

    // Open search
    fireEvent.click(screen.getByTitle('Search'));

    // Type a search query
    const searchInput = screen.getByPlaceholderText('Search hardware...');
    fireEvent.change(searchInput, { target: { value: 'CHASSIS_MODEL' } });

    // Should still have some matching rows (all chassis models match)
    const rowCountAfter = container.querySelectorAll('tbody tr').length;
    expect(rowCountAfter).toBeGreaterThan(0);
    // Verify the search count indicator appears
    expect(screen.getByText(/of \d+/)).toBeInTheDocument();
  });
});
