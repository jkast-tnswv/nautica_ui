const mockRefresh = vi.fn();
vi.mock('../hooks/useIslandModels', () => ({
  useIslandAssignments: vi.fn(() => ({
    assignments: [
      { firmwareId: 'fw-001', chassisModel: 1, islandFirmware: { firmwareId: 'fw-001', filename: 'nos-4.2.1.swi', version: '4.2.1', vendor: 1, platform: 'DCS-7050', status: 2 } },
      { firmwareId: 'fw-002', chassisModel: 2, islandFirmware: undefined },
    ],
    loading: false,
    error: null,
    refresh: mockRefresh,
  })),
}));

import { render, screen } from '@testing-library/react';
import { IslandModels } from './IslandModels';

describe('IslandModels (Assignments)', () => {
  it('renders card title', () => {
    render(<IslandModels />);
    expect(screen.getByText('Assignments')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<IslandModels />);
    expect(screen.getByText('Chassis Model')).toBeInTheDocument();
    expect(screen.getByText('Firmware')).toBeInTheDocument();
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders firmware info when set', () => {
    render(<IslandModels />);
    expect(screen.getByText('nos-4.2.1.swi v4.2.1')).toBeInTheDocument();
  });

  it('renders dash for missing firmware', () => {
    render(<IslandModels />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('renders row count', () => {
    render(<IslandModels />);
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });
});
