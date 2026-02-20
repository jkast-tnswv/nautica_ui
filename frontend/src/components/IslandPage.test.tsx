vi.mock('@twcode/island-ui', () => ({
  IslandFirmware: () => <div data-testid="island-firmware">Firmware Tab</div>,
  IslandModels: () => <div data-testid="island-models">Models Tab</div>,
}));

import { render, screen } from '@testing-library/react';
import { IslandPage } from './IslandPage';

describe('IslandPage', () => {
  it('renders firmware tab by default', () => {
    render(<IslandPage />);
    expect(screen.getByText('Firmware')).toBeInTheDocument();
    expect(screen.getByTestId('island-firmware')).toBeInTheDocument();
  });

  it('renders models tab option', () => {
    render(<IslandPage />);
    expect(screen.getByText('Models')).toBeInTheDocument();
  });

  it('shows both tab labels', () => {
    render(<IslandPage />);
    expect(screen.getByText('Firmware')).toBeInTheDocument();
    expect(screen.getByText('Models')).toBeInTheDocument();
  });
});
