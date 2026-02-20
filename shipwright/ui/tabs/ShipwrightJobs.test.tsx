const mockCreateJob = vi.fn();
const mockLoadDetails = vi.fn();
const mockClearDetails = vi.fn();

vi.mock('../hooks/useShipwrightJobs', () => ({
  useShipwrightJobs: vi.fn(() => ({
    jobs: [
      {
        jobId: 'job-001',
        hostname: 'switch-01.dc1',
        shipwrightJobType: 1,
        owner: 'jsmith',
        shipwrightJobStatus: 2,
        timestampJobCreated: { seconds: BigInt(1700000000), nanos: 0 },
        timestampJobEnded: undefined,
      },
    ],
    loading: false,
    error: null,
    refresh: vi.fn(),
    createJob: mockCreateJob,
    selectedJobDetails: null,
    detailsJobId: null,
    detailsLoading: false,
    detailsError: null,
    loadJobDetails: mockLoadDetails,
    clearDetails: mockClearDetails,
  })),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { ShipwrightJobs } from './ShipwrightJobs';

describe('ShipwrightJobs', () => {
  it('renders card title', () => {
    render(<ShipwrightJobs />);
    expect(screen.getByText('Shipwright')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<ShipwrightJobs />);
    expect(screen.getByText('Job ID')).toBeInTheDocument();
    expect(screen.getByText('Hostname')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('renders job data', () => {
    render(<ShipwrightJobs />);
    expect(screen.getByText('switch-01.dc1')).toBeInTheDocument();
    expect(screen.getByText('jsmith')).toBeInTheDocument();
  });

  it('opens New Job dialog', () => {
    render(<ShipwrightJobs />);
    fireEvent.click(screen.getByText('New Job'));
    expect(screen.getByText('Create Shipwright Job')).toBeInTheDocument();
  });

  it('renders dialog form fields', () => {
    render(<ShipwrightJobs />);
    fireEvent.click(screen.getByText('New Job'));
    expect(screen.getByLabelText(/Hostname/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner/)).toBeInTheDocument();
  });

  it('renders row count', () => {
    render(<ShipwrightJobs />);
    expect(screen.getByText('1 row')).toBeInTheDocument();
  });
});
