import { render, screen } from '@testing-library/react';
import { AnchorLocations } from './AnchorLocations';

describe('AnchorLocations', () => {
  it('renders card title', () => {
    render(<AnchorLocations />);
    expect(screen.getByText('Anchor')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<AnchorLocations />);
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('renders location categories', () => {
    render(<AnchorLocations />);
    expect(screen.getAllByText('Campus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Building').length).toBeGreaterThan(0);
  });

  it('renders data rows', () => {
    const { container } = render(<AnchorLocations />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });
});
