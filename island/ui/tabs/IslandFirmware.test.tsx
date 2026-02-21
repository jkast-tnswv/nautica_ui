const mockRefresh = vi.fn();
vi.mock('../hooks/useIslandFirmware', () => ({
  useIslandFirmware: vi.fn(() => ({
    firmware: [
      { firmwareId: 'fw-001', filename: 'nos-4.2.1.swi', version: '4.2.1', vendor: 1, platform: 'DCS-7050', sizeBytes: 524288000n, checksumSha256: 'abc123', status: 2, owner: 'admin' },
      { firmwareId: 'fw-002', filename: 'onie-2.0.0.bin', version: '2.0.0', vendor: 2, platform: 'N9K', sizeBytes: 104857600n, checksumSha256: 'def456', status: 2, owner: 'admin' },
    ],
    loading: false,
    error: null,
    refresh: mockRefresh,
  })),
}));

const mockUploadFirmware = vi.fn().mockResolvedValue({});
vi.mock('@core/services', () => ({
  getServices: () => ({
    island: { uploadFirmware: mockUploadFirmware },
  }),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { IslandFirmware } from './IslandFirmware';
import { useIslandFirmware } from '../hooks/useIslandFirmware';

describe('IslandFirmware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders card title', () => {
    render(<IslandFirmware />);
    expect(screen.getByText('Firmware')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<IslandFirmware />);
    expect(screen.getByText('Filename')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('renders firmware versions', () => {
    render(<IslandFirmware />);
    expect(screen.getByText('4.2.1')).toBeInTheDocument();
    expect(screen.getByText('2.0.0')).toBeInTheDocument();
  });

  it('renders row count', () => {
    render(<IslandFirmware />);
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('renders upload button', () => {
    render(<IslandFirmware />);
    expect(screen.getByText('Upload Firmware')).toBeInTheDocument();
  });

  it('opens upload dialog on button click', () => {
    render(<IslandFirmware />);
    fireEvent.click(screen.getByText('Upload Firmware'));
    expect(screen.getByRole('heading', { name: 'Upload Firmware' })).toBeInTheDocument();
  });

  it('renders form fields in upload dialog', () => {
    render(<IslandFirmware />);
    fireEvent.click(screen.getByText('Upload Firmware'));
    expect(screen.getByLabelText('Platform')).toBeInTheDocument();
    expect(screen.getByLabelText('Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Vendor')).toBeInTheDocument();
    expect(screen.getByLabelText('Firmware File')).toBeInTheDocument();
  });

  it('disables submit when platform is empty', () => {
    render(<IslandFirmware />);
    fireEvent.click(screen.getByText('Upload Firmware'));
    expect(screen.getByText('Upload')).toBeDisabled();
  });

  it('renders vendor labels', () => {
    render(<IslandFirmware />);
    expect(screen.getByText('Arista')).toBeInTheDocument();
    expect(screen.getByText('Edgecore')).toBeInTheDocument();
  });

  it('renders status labels', () => {
    render(<IslandFirmware />);
    expect(screen.getAllByText('Available')).toHaveLength(2);
  });

  it('shows error message when error is set', () => {
    vi.mocked(useIslandFirmware).mockReturnValueOnce({
      firmware: [],
      loading: false,
      error: 'Load failed',
      refresh: mockRefresh,
    });
    render(<IslandFirmware />);
    expect(screen.getByText('Error loading firmware: Load failed')).toBeInTheDocument();
  });

  it('fills upload form fields', () => {
    render(<IslandFirmware />);
    fireEvent.click(screen.getByText('Upload Firmware'));
    const platformInput = screen.getByLabelText('Platform');
    fireEvent.change(platformInput, { target: { name: 'platform', value: 'DCS-7050' } });
    expect(platformInput).toHaveValue('DCS-7050');
  });

  it('reopening upload dialog resets form', () => {
    render(<IslandFirmware />);
    fireEvent.click(screen.getByText('Upload Firmware'));
    const platformInput = screen.getByLabelText('Platform');
    fireEvent.change(platformInput, { target: { name: 'platform', value: 'DCS-7050' } });
    expect(platformInput).toHaveValue('DCS-7050');
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Upload Firmware'));
    expect(screen.getByLabelText('Platform')).toHaveValue('');
  });
});
