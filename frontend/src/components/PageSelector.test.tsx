import { render, screen, fireEvent } from '@testing-library/react';
import { PageSelector } from './PageSelector';

const pages = [
  { id: 'devices', label: 'Devices' },
  { id: 'templates', label: 'Templates' },
  { id: 'jobs', label: 'Jobs' },
];

describe('PageSelector', () => {
  it('renders all page tabs', () => {
    render(<PageSelector pages={pages} activePage="devices" onPageChange={() => {}} />);
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
  });

  it('marks active page with active class', () => {
    render(<PageSelector pages={pages} activePage="templates" onPageChange={() => {}} />);
    expect(screen.getByText('Templates')).toHaveClass('active');
    expect(screen.getByText('Devices')).not.toHaveClass('active');
  });

  it('calls onPageChange when tab clicked', () => {
    const onPageChange = vi.fn();
    render(<PageSelector pages={pages} activePage="devices" onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('Jobs'));
    expect(onPageChange).toHaveBeenCalledWith('jobs');
  });
});
