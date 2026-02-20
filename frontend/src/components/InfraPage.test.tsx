vi.mock('@twcode/anchor-ui', () => ({
  AnchorLocations: () => <div>AnchorLocations</div>,
}));
vi.mock('@twcode/keel-ui', () => ({
  KeelCatalog: () => <div>KeelCatalog</div>,
}));
vi.mock('@twcode/quartermaster-ui', () => ({
  QuartermasterParts: () => <div>QuartermasterParts</div>,
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { InfraPage } from './InfraPage';

describe('InfraPage', () => {
  it('renders tab labels', () => {
    render(<InfraPage />);
    expect(screen.getByText('Anchor')).toBeInTheDocument();
    expect(screen.getByText('Keel')).toBeInTheDocument();
    expect(screen.getByText('Quartermaster')).toBeInTheDocument();
  });

  it('renders AnchorLocations tab by default', () => {
    render(<InfraPage />);
    expect(screen.getByText('AnchorLocations')).toBeInTheDocument();
  });

  it('switches to Keel tab', () => {
    render(<InfraPage />);
    fireEvent.click(screen.getByText('Keel'));
    expect(screen.getByText('KeelCatalog')).toBeInTheDocument();
  });

  it('switches to Quartermaster tab', () => {
    render(<InfraPage />);
    fireEvent.click(screen.getByText('Quartermaster'));
    expect(screen.getByText('QuartermasterParts')).toBeInTheDocument();
  });
});
