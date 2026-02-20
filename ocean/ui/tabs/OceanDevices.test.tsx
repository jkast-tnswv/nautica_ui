const mockRefresh = vi.fn();
vi.mock('../hooks/useOceanDevices', () => ({
  useOceanDevices: vi.fn(() => ({
    devices: [
      { deviceId: 'dev-001', hostname: 'switch-01.dc1', chassisModel: 1, oceanDeviceStatus: 3, oceanDeviceState: 1 },
      { deviceId: 'dev-002', hostname: 'router-01.dc2', chassisModel: 2, oceanDeviceStatus: 2, oceanDeviceState: 2 },
    ],
    loading: false,
    error: null,
    refresh: mockRefresh,
  })),
}));

import { render, screen } from '@testing-library/react';
import { OceanDevices } from './OceanDevices';

describe('OceanDevices', () => {
  it('renders card title', () => {
    render(<OceanDevices />);
    expect(screen.getByText('Devices')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<OceanDevices />);
    expect(screen.getByText('Device ID')).toBeInTheDocument();
    expect(screen.getByText('Hostname')).toBeInTheDocument();
    expect(screen.getByText('Chassis Model')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
  });

  it('renders device hostnames', () => {
    render(<OceanDevices />);
    expect(screen.getByText('switch-01.dc1')).toBeInTheDocument();
    expect(screen.getByText('router-01.dc2')).toBeInTheDocument();
  });

  it('renders filter dropdowns', () => {
    render(<OceanDevices />);
    expect(screen.getByText('All Statuses')).toBeInTheDocument();
    expect(screen.getByText('All States')).toBeInTheDocument();
    expect(screen.getByText('All Models')).toBeInTheDocument();
  });

  it('renders row count', () => {
    render(<OceanDevices />);
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });
});
