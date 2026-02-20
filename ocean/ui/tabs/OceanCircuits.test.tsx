vi.mock('../hooks/useOceanCircuits', () => ({
  useOceanCircuits: vi.fn(() => ({
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
    refresh: vi.fn(),
  })),
}));

import { render, screen } from '@testing-library/react';
import { OceanCircuits } from './OceanCircuits';

describe('OceanCircuits', () => {
  it('renders card title', () => {
    render(<OceanCircuits />);
    expect(screen.getByText('Circuits')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<OceanCircuits />);
    expect(screen.getByText('Circuit ID')).toBeInTheDocument();
    expect(screen.getByText('A-Device')).toBeInTheDocument();
    expect(screen.getByText('A-Interface')).toBeInTheDocument();
    expect(screen.getByText('Z-Device')).toBeInTheDocument();
    expect(screen.getByText('Z-Interface')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
  });

  it('renders circuit data', () => {
    render(<OceanCircuits />);
    expect(screen.getByText('switch-01')).toBeInTheDocument();
    expect(screen.getByText('switch-02')).toBeInTheDocument();
  });

  it('renders row count', () => {
    render(<OceanCircuits />);
    expect(screen.getByText('1 row')).toBeInTheDocument();
  });
});
