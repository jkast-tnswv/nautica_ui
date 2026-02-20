vi.mock('../hooks/useHarborJobs', () => ({
  useHarborJobs: vi.fn(() => ({
    jobs: [
      {
        jobId: 'hj-001',
        hostname: 'switch-01.dc1',
        harborJobType: 1,
        owner: 'jsmith',
        harborJobStatus: 2,
        dryRun: false,
      },
    ],
    loading: false,
    error: null,
    refresh: vi.fn(),
    embark: vi.fn(),
    disembark: vi.fn(),
  })),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { HarborJobs } from './HarborJobs';

describe('HarborJobs', () => {
  it('renders card title', () => {
    render(<HarborJobs />);
    expect(screen.getByText('Harbor')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<HarborJobs />);
    expect(screen.getByText('Job ID')).toBeInTheDocument();
    expect(screen.getByText('Hostname')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Dry Run')).toBeInTheDocument();
  });

  it('renders job data', () => {
    render(<HarborJobs />);
    expect(screen.getByText('switch-01.dc1')).toBeInTheDocument();
    expect(screen.getByText('jsmith')).toBeInTheDocument();
  });

  it('opens Embark dialog', () => {
    render(<HarborJobs />);
    fireEvent.click(screen.getByRole('button', { name: /Embark/ }));
    expect(screen.getByText('Embark Device')).toBeInTheDocument();
  });

  it('opens Disembark dialog', () => {
    render(<HarborJobs />);
    fireEvent.click(screen.getByRole('button', { name: /Disembark/ }));
    expect(screen.getByText('Disembark Device')).toBeInTheDocument();
  });

  it('renders dialog form fields', () => {
    render(<HarborJobs />);
    fireEvent.click(screen.getByRole('button', { name: /Embark/ }));
    expect(screen.getByLabelText(/Hostname/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Dry Run/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Force/ })).toBeInTheDocument();
  });
});
