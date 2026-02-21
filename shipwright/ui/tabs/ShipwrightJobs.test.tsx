const mockCreateJob = vi.fn();
const mockLoadDetails = vi.fn();
const mockClearDetails = vi.fn();
const mockRefresh = vi.fn();

const defaultMockReturn = {
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
  refresh: mockRefresh,
  createJob: mockCreateJob,
  selectedJobDetails: null,
  detailsJobId: null,
  detailsLoading: false,
  detailsError: null,
  loadJobDetails: mockLoadDetails,
  clearDetails: mockClearDetails,
};

vi.mock('../hooks/useShipwrightJobs', () => ({
  useShipwrightJobs: vi.fn(() => ({ ...defaultMockReturn })),
}));

import { render, screen, fireEvent, act } from '@testing-library/react';
import { ShipwrightJobs } from './ShipwrightJobs';
import { useShipwrightJobs } from '../hooks/useShipwrightJobs';

describe('ShipwrightJobs', () => {
  beforeEach(() => {
    mockCreateJob.mockClear();
    mockLoadDetails.mockClear();
    mockClearDetails.mockClear();
    mockRefresh.mockClear();
    vi.mocked(useShipwrightJobs).mockImplementation(() => ({ ...defaultMockReturn }) as any);
  });

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

  it('submits create job form successfully', async () => {
    mockCreateJob.mockResolvedValueOnce(true);
    render(<ShipwrightJobs />);

    fireEvent.click(screen.getByText('New Job'));

    fireEvent.change(screen.getByLabelText(/Hostname/), {
      target: { name: 'hostname', value: 'router-05.dc2' },
    });
    fireEvent.change(screen.getByLabelText(/Owner/), {
      target: { name: 'owner', value: 'auser' },
    });

    await act(async () => {
      fireEvent.submit(screen.getByText('Create Job').closest('form')!);
    });

    expect(mockCreateJob).toHaveBeenCalledWith({
      hostname: 'router-05.dc2',
      shipwrightJobType: 1,
      owner: 'auser',
    });

    // Dialog should close on success
    expect(screen.queryByText('Create Shipwright Job')).not.toBeInTheDocument();
  });

  it('keeps dialog open on failed submission', async () => {
    mockCreateJob.mockResolvedValueOnce(false);
    render(<ShipwrightJobs />);

    fireEvent.click(screen.getByText('New Job'));

    fireEvent.change(screen.getByLabelText(/Hostname/), {
      target: { name: 'hostname', value: 'router-05.dc2' },
    });
    fireEvent.change(screen.getByLabelText(/Owner/), {
      target: { name: 'owner', value: 'auser' },
    });

    await act(async () => {
      fireEvent.submit(screen.getByText('Create Job').closest('form')!);
    });

    expect(mockCreateJob).toHaveBeenCalled();
    // Dialog should remain open on failure
    expect(screen.getByText('Create Shipwright Job')).toBeInTheDocument();
  });

  it('renders error state when error and no jobs', () => {
    vi.mocked(useShipwrightJobs).mockReturnValueOnce({
      ...defaultMockReturn,
      jobs: [],
      error: 'Connection failed',
    } as any);

    render(<ShipwrightJobs />);

    expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
    expect(screen.queryByText('Shipwright')).not.toBeInTheDocument();
  });

  it('calls loadJobDetails on row click', () => {
    render(<ShipwrightJobs />);

    fireEvent.click(screen.getByText('switch-01.dc1'));

    expect(mockLoadDetails).toHaveBeenCalledWith('job-001');
  });

  it('renders expanded row with loading state', () => {
    vi.mocked(useShipwrightJobs).mockImplementation(() => ({
      ...defaultMockReturn,
      detailsLoading: true,
      detailsJobId: 'job-001',
    }) as any);

    render(<ShipwrightJobs />);

    // Click the row to expand it
    fireEvent.click(screen.getByText('switch-01.dc1'));

    expect(screen.getByText('Loading workflow details...')).toBeInTheDocument();
  });
});
