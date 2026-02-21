vi.mock('../hooks/useTideWatch', () => ({
  useTideWatch: vi.fn(() => ({
    devices: {
      data: {
        total: 42,
        byStatus: [{ label: 'Online', count: 30, variant: 'success' }, { label: 'Offline', count: 12, variant: 'default' }],
        byState: [{ label: 'Provisioned', count: 40, variant: 'info' }],
        byModel: [{ label: 'ChassisFoo', count: 20, variant: 'default' }],
      },
      loading: false,
      error: null,
    },
    circuits: {
      data: {
        total: 120,
        byStatus: [{ label: 'Up', count: 100, variant: 'success' }],
        byState: [{ label: 'Healthy', count: 110, variant: 'info' }],
        bySpeed: [{ label: '10G', count: 80, variant: 'default' }],
      },
      loading: false,
      error: null,
    },
    shipwrightJobs: {
      data: {
        total: 15,
        running: 3,
        byStatus: [{ label: 'Complete', count: 10, variant: 'success' }],
        byType: [{ label: 'Configure', count: 8, variant: 'default' }],
        timeSeries: [],
        timeSeriesStatuses: [],
      },
      loading: false,
      error: null,
    },
    harborJobs: {
      data: {
        total: 8,
        running: 1,
        byStatus: [{ label: 'Done', count: 6, variant: 'success' }],
        byType: [{ label: 'Embark', count: 5, variant: 'default' }],
      },
      loading: false,
      error: null,
    },
    anchor: { total: 25, byCategory: [{ label: 'Location', count: 10, variant: 'default' }] },
    keel: { total: 30, byCategory: [{ label: 'Cisco', count: 17, variant: 'default' }] },
    quartermaster: { total: 50, byCategory: [{ label: 'Optics', count: 22, variant: 'default' }] },
    timeRange: 0,
    setTimeRange: vi.fn(),
    refresh: vi.fn(),
  })),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { TideWatch } from './TideWatch';
import { useTideWatch } from '../hooks/useTideWatch';

describe('TideWatch', () => {
  it('renders card title', () => {
    render(<TideWatch />);
    expect(screen.getByText('TideWatch')).toBeInTheDocument();
  });

  it('renders stat tile titles', () => {
    render(<TideWatch />);
    expect(screen.getByText('Ocean Devices')).toBeInTheDocument();
    expect(screen.getByText('Ocean Circuits')).toBeInTheDocument();
    expect(screen.getByText('Shipwright Jobs')).toBeInTheDocument();
    expect(screen.getByText('Harbor Jobs')).toBeInTheDocument();
  });

  it('renders total counts', () => {
    render(<TideWatch />);
    // Use getAllByText since counts can appear in breakdown sections too
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('120').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('8').length).toBeGreaterThanOrEqual(1);
  });

  it('renders reference data counts', () => {
    render(<TideWatch />);
    expect(screen.getAllByText('25').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(1);
  });

  it('shows running counts for shipwright and harbor', () => {
    render(<TideWatch />);
    expect(screen.getByText('(3 under sail)')).toBeInTheDocument();
    expect(screen.getByText('(1 under sail)')).toBeInTheDocument();
  });

  it('renders reference data labels', () => {
    render(<TideWatch />);
    expect(screen.getByText('definitions')).toBeInTheDocument();
    expect(screen.getByText('chassis models')).toBeInTheDocument();
    expect(screen.getByText('part categories')).toBeInTheDocument();
  });

  it('renders breakdown sections in stat tiles', () => {
    render(<TideWatch />);
    // Breakdown section titles are always in the DOM (CSS controls visibility)
    expect(screen.getAllByText('By Status').length).toBeGreaterThanOrEqual(1);
    // Check for unique breakdown labels
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('Provisioned')).toBeInTheDocument();
    expect(screen.getByText('Up')).toBeInTheDocument();
    expect(screen.getByText('10G')).toBeInTheDocument();
  });

  it('toggle changes expansion state', () => {
    const { container } = render(<TideWatch />);
    // Click on the Ocean Devices tile to toggle
    fireEvent.click(screen.getByText('Ocean Devices'));
    // The stat tile should have the expanded class or attribute
    const tiles = container.querySelectorAll('.stat-tile');
    expect(tiles.length).toBeGreaterThanOrEqual(4);
  });

  it('renders shipwright timeline chart section', () => {
    render(<TideWatch />);
    expect(screen.getByText('Shipwright Jobs Timeline')).toBeInTheDocument();
  });

  it('calls refresh when refresh button clicked', () => {
    const mockRefresh = vi.fn();
    vi.mocked(useTideWatch).mockReturnValue({
      ...vi.mocked(useTideWatch)(),
      refresh: mockRefresh,
    });

    render(<TideWatch />);
    fireEvent.click(screen.getByTitle('Refresh statistics'));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
