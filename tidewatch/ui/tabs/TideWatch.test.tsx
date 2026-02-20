vi.mock('../hooks/useTideWatch', () => ({
  useTideWatch: vi.fn(() => ({
    devices: { data: { total: 42, byStatus: [], byState: [], byModel: [] }, loading: false, error: null },
    circuits: { data: { total: 120, byStatus: [], byState: [], bySpeed: [] }, loading: false, error: null },
    shipwrightJobs: {
      data: { total: 15, running: 3, byStatus: [], byType: [], timeSeries: [], timeSeriesStatuses: [] },
      loading: false,
      error: null,
    },
    harborJobs: { data: { total: 8, running: 1, byStatus: [], byType: [] }, loading: false, error: null },
    anchor: { total: 25, byCategory: [] },
    keel: { total: 30, byCategory: [] },
    quartermaster: { total: 50, byCategory: [] },
    timeRange: 0,
    setTimeRange: vi.fn(),
    refresh: vi.fn(),
  })),
}));

import { render, screen } from '@testing-library/react';
import { TideWatch } from './TideWatch';

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
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders reference data counts', () => {
    render(<TideWatch />);
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
