vi.mock('@twcode/ocean-ui', () => ({
  OceanDevices: () => <div>OceanDevices</div>,
  OceanCircuits: () => <div>OceanCircuits</div>,
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { DevicesPage } from './DevicesPage';

describe('DevicesPage', () => {
  it('renders tab labels', () => {
    render(<DevicesPage />);
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Circuits')).toBeInTheDocument();
  });

  it('renders OceanDevices tab by default', () => {
    render(<DevicesPage />);
    expect(screen.getByText('OceanDevices')).toBeInTheDocument();
  });

  it('switches to Circuits tab', () => {
    render(<DevicesPage />);
    fireEvent.click(screen.getByText('Circuits'));
    expect(screen.getByText('OceanCircuits')).toBeInTheDocument();
  });
});
