import { render, screen } from '@testing-library/react';
import { KeelCatalog } from './KeelCatalog';

describe('KeelCatalog', () => {
  it('renders card title', () => {
    render(<KeelCatalog />);
    expect(screen.getByText('Keel')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<KeelCatalog />);
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Proto Enum')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('renders chassis entries', () => {
    render(<KeelCatalog />);
    expect(screen.getAllByText('Chassis').length).toBeGreaterThan(0);
  });

  it('renders data rows', () => {
    const { container } = render(<KeelCatalog />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });
});
