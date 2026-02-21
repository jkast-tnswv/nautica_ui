import { useOceanCircuits } from '../hooks/useOceanCircuits';

const mockRefresh = vi.fn();
let mockReturn = {
  circuits: [
    {
      circuitId: 'cir-001',
      aDevice: { hostname: 'switch-01' },
      aInterface: 'Ethernet1/1',
      zDevice: { hostname: 'switch-02' },
      zInterface: 'Ethernet1/1',
      speedMbps: 100000,
      oceanCircuitStatus: 1,
      oceanCircuitState: 1,
    },
  ],
  loading: false,
  error: null as string | null,
  refresh: mockRefresh,
};

vi.mock('../hooks/useOceanCircuits', () => ({
  useOceanCircuits: vi.fn(() => mockReturn),
}));

import { render, screen } from '@testing-library/react';
import { OceanCircuits } from './OceanCircuits';

beforeEach(() => {
  vi.clearAllMocks();
  mockReturn = {
    circuits: [
      {
        circuitId: 'cir-001',
        aDevice: { hostname: 'switch-01' },
        aInterface: 'Ethernet1/1',
        zDevice: { hostname: 'switch-02' },
        zInterface: 'Ethernet1/1',
        speedMbps: 100000,
        oceanCircuitStatus: 1,
        oceanCircuitState: 1,
      },
    ],
    loading: false,
    error: null,
    refresh: mockRefresh,
  };
  vi.mocked(useOceanCircuits).mockImplementation(() => mockReturn as any);
});

describe('OceanCircuits', () => {
  it('renders card title and column headers', () => {
    render(<OceanCircuits />);
    expect(screen.getByText('Circuits')).toBeInTheDocument();
    expect(screen.getByText('Circuit ID')).toBeInTheDocument();
    expect(screen.getByText('A-Device')).toBeInTheDocument();
    expect(screen.getByText('A-Interface')).toBeInTheDocument();
    expect(screen.getByText('Z-Device')).toBeInTheDocument();
    expect(screen.getByText('Z-Interface')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
  });

  it('renders circuit data from hook', () => {
    render(<OceanCircuits />);
    expect(screen.getByText('switch-01')).toBeInTheDocument();
    expect(screen.getByText('switch-02')).toBeInTheDocument();
    expect(screen.getByText('1 row')).toBeInTheDocument();
  });

  it('shows loading message when loading and no circuits', () => {
    vi.mocked(useOceanCircuits).mockReturnValue({
      circuits: [],
      loading: true,
      error: null,
      refresh: mockRefresh,
    } as any);

    render(<OceanCircuits />);
    expect(screen.getByText('Loading circuits...')).toBeInTheDocument();
  });

  it('shows empty message when not loading and no circuits', () => {
    vi.mocked(useOceanCircuits).mockReturnValue({
      circuits: [],
      loading: false,
      error: null,
      refresh: mockRefresh,
    } as any);

    render(<OceanCircuits />);
    expect(screen.getByText('No circuits found')).toBeInTheDocument();
  });

  it('renders error message when error present', () => {
    vi.mocked(useOceanCircuits).mockReturnValue({
      circuits: [],
      loading: false,
      error: 'gRPC unavailable',
      refresh: mockRefresh,
    } as any);

    render(<OceanCircuits />);
    expect(screen.getByText(/gRPC unavailable/)).toBeInTheDocument();
  });
});
