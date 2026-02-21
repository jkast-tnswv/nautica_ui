const mockEmbark = vi.fn();
const mockDisembark = vi.fn();
const mockRefresh = vi.fn();

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
    refresh: mockRefresh,
    embark: mockEmbark,
    disembark: mockDisembark,
  })),
}));

import { render, screen, fireEvent, act } from '@testing-library/react';
import { useHarborJobs } from '../hooks/useHarborJobs';
import { HarborJobs } from './HarborJobs';

describe('HarborJobs', () => {
  beforeEach(() => {
    mockEmbark.mockClear();
    mockDisembark.mockClear();
    mockRefresh.mockClear();
    vi.mocked(useHarborJobs).mockClear();
  });

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

  it('submits embark form successfully', async () => {
    mockEmbark.mockResolvedValueOnce(true);
    render(<HarborJobs />);

    fireEvent.click(screen.getByRole('button', { name: /Embark/ }));
    fireEvent.change(screen.getByLabelText(/Hostname/), { target: { name: 'hostname', value: 'switch-99.dc2' } });
    fireEvent.change(screen.getByLabelText(/Owner/), { target: { name: 'owner', value: 'testuser' } });

    await act(async () => {
      fireEvent.submit(screen.getByLabelText(/Hostname/).closest('form')!);
    });

    expect(mockEmbark).toHaveBeenCalledWith({
      hostname: 'switch-99.dc2',
      harborJobType: 1,
      owner: 'testuser',
      dryRun: false,
      force: false,
    });
    expect(screen.queryByText('Embark Device')).not.toBeInTheDocument();
  });

  it('submits disembark form successfully', async () => {
    mockDisembark.mockResolvedValueOnce(true);
    render(<HarborJobs />);

    fireEvent.click(screen.getByRole('button', { name: /Disembark/ }));
    fireEvent.change(screen.getByLabelText(/Hostname/), { target: { name: 'hostname', value: 'switch-50.dc3' } });
    fireEvent.change(screen.getByLabelText(/Owner/), { target: { name: 'owner', value: 'admin' } });

    await act(async () => {
      fireEvent.submit(screen.getByLabelText(/Hostname/).closest('form')!);
    });

    expect(mockDisembark).toHaveBeenCalledWith({
      hostname: 'switch-50.dc3',
      harborJobType: 2,
      owner: 'admin',
      dryRun: false,
      force: false,
    });
    expect(screen.queryByText('Disembark Device')).not.toBeInTheDocument();
  });

  it('keeps dialog open on failed submission', async () => {
    mockEmbark.mockResolvedValueOnce(false);
    render(<HarborJobs />);

    fireEvent.click(screen.getByRole('button', { name: /Embark/ }));
    fireEvent.change(screen.getByLabelText(/Hostname/), { target: { name: 'hostname', value: 'switch-01.dc1' } });
    fireEvent.change(screen.getByLabelText(/Owner/), { target: { name: 'owner', value: 'testuser' } });

    await act(async () => {
      fireEvent.submit(screen.getByLabelText(/Hostname/).closest('form')!);
    });

    expect(mockEmbark).toHaveBeenCalled();
    expect(screen.getByText('Embark Device')).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.mocked(useHarborJobs).mockReturnValueOnce({
      jobs: [],
      loading: false,
      error: 'Server error',
      refresh: mockRefresh,
      embark: mockEmbark,
      disembark: mockDisembark,
    });

    render(<HarborJobs />);
    expect(screen.getByText(/Error loading harbor jobs: Server error/)).toBeInTheDocument();
    expect(screen.queryByText('Harbor')).not.toBeInTheDocument();
  });

  it('toggles dry run checkbox', async () => {
    mockEmbark.mockResolvedValueOnce(true);
    render(<HarborJobs />);

    fireEvent.click(screen.getByRole('button', { name: /Embark/ }));
    fireEvent.change(screen.getByLabelText(/Hostname/), { target: { name: 'hostname', value: 'switch-01.dc1' } });
    fireEvent.change(screen.getByLabelText(/Owner/), { target: { name: 'owner', value: 'testuser' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Dry Run/ }));

    await act(async () => {
      fireEvent.submit(screen.getByLabelText(/Hostname/).closest('form')!);
    });

    expect(mockEmbark).toHaveBeenCalledWith(
      expect.objectContaining({
        dryRun: true,
      }),
    );
  });
});
