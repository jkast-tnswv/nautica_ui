vi.mock('@twcode/shipwright-ui', () => ({
  ShipwrightJobs: () => <div>ShipwrightJobs</div>,
}));
vi.mock('@twcode/harbor-ui', () => ({
  HarborJobs: () => <div>HarborJobs</div>,
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { JobsPage } from './JobsPage';

describe('JobsPage', () => {
  it('renders tab labels', () => {
    render(<JobsPage />);
    expect(screen.getByText('Shipwright')).toBeInTheDocument();
    expect(screen.getByText('Harbor')).toBeInTheDocument();
  });

  it('renders ShipwrightJobs tab by default', () => {
    render(<JobsPage />);
    expect(screen.getByText('ShipwrightJobs')).toBeInTheDocument();
  });

  it('switches to Harbor tab', () => {
    render(<JobsPage />);
    fireEvent.click(screen.getByText('Harbor'));
    expect(screen.getByText('HarborJobs')).toBeInTheDocument();
  });
});
