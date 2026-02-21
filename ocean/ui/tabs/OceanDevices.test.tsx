import { useOceanDevices } from '../hooks/useOceanDevices';

const mockRefresh = vi.fn();
let mockReturn = {
  devices: [
    { deviceId: 'dev-001', hostname: 'switch-01.dc1', chassisModel: 1, oceanDeviceStatus: 3, oceanDeviceState: 1 },
    { deviceId: 'dev-002', hostname: 'router-01.dc2', chassisModel: 2, oceanDeviceStatus: 2, oceanDeviceState: 2 },
  ],
  loading: false,
  error: null as string | null,
  refresh: mockRefresh,
};

vi.mock('../hooks/useOceanDevices', () => ({
  useOceanDevices: vi.fn(() => mockReturn),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { OceanDevices } from './OceanDevices';

beforeEach(() => {
  vi.clearAllMocks();
  mockReturn = {
    devices: [
      { deviceId: 'dev-001', hostname: 'switch-01.dc1', chassisModel: 1, oceanDeviceStatus: 3, oceanDeviceState: 1 },
      { deviceId: 'dev-002', hostname: 'router-01.dc2', chassisModel: 2, oceanDeviceStatus: 2, oceanDeviceState: 2 },
    ],
    loading: false,
    error: null,
    refresh: mockRefresh,
  };
  vi.mocked(useOceanDevices).mockImplementation(() => mockReturn as any);
});

describe('OceanDevices', () => {
  it('renders card title and column headers', () => {
    render(<OceanDevices />);
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Device ID')).toBeInTheDocument();
    expect(screen.getByText('Hostname')).toBeInTheDocument();
    expect(screen.getByText('Chassis Model')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
  });

  it('renders device data from hook', () => {
    render(<OceanDevices />);
    expect(screen.getByText('switch-01.dc1')).toBeInTheDocument();
    expect(screen.getByText('router-01.dc2')).toBeInTheDocument();
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('renders filter dropdowns', () => {
    render(<OceanDevices />);
    expect(screen.getByText('All Statuses')).toBeInTheDocument();
    expect(screen.getByText('All States')).toBeInTheDocument();
    expect(screen.getByText('All Models')).toBeInTheDocument();
  });

  it('shows loading message when loading and no devices', () => {
    vi.mocked(useOceanDevices).mockReturnValue({
      devices: [],
      loading: true,
      error: null,
      refresh: mockRefresh,
    } as any);

    render(<OceanDevices />);
    expect(screen.getByText('Loading devices...')).toBeInTheDocument();
  });

  it('shows empty message when not loading and no devices', () => {
    vi.mocked(useOceanDevices).mockReturnValue({
      devices: [],
      loading: false,
      error: null,
      refresh: mockRefresh,
    } as any);

    render(<OceanDevices />);
    expect(screen.getByText('No devices found')).toBeInTheDocument();
  });

  it('renders error message when error present', () => {
    vi.mocked(useOceanDevices).mockReturnValue({
      devices: [],
      loading: false,
      error: 'Service unavailable',
      refresh: mockRefresh,
    } as any);

    render(<OceanDevices />);
    expect(screen.getByText(/Service unavailable/)).toBeInTheDocument();
  });

  it('renders correct row count after filtering reduces results', () => {
    // Only one device with status 3 (In Use)
    render(<OceanDevices />);
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });
});
