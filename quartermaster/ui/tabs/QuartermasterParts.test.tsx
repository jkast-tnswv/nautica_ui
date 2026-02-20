import { render, screen } from '@testing-library/react';
import { QuartermasterParts } from './QuartermasterParts';

describe('QuartermasterParts', () => {
  it('renders card title', () => {
    render(<QuartermasterParts />);
    expect(screen.getByText('Quartermaster')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<QuartermasterParts />);
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Part Category')).toBeInTheDocument();
    expect(screen.getByText('Proto Enum')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('renders part group entries', () => {
    const { container } = render(<QuartermasterParts />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });
});
