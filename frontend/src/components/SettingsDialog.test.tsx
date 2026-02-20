import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsDialog } from './SettingsDialog';
import { configureServices } from '@core/services/base';
import { clearTablePageSizeOverrides } from '@core';

const mockUpdateSettings = vi.fn();

vi.mock('@core', async () => {
  const actual = await vi.importActual('@core');
  return {
    ...actual,
    useLocalSettings: () => ({
      settings: { apiUrl: 'http://localhost:8080/api', defaultPageSize: 25 },
      updateSettings: mockUpdateSettings,
    }),
    clearTablePageSizeOverrides: vi.fn(),
  };
});

vi.mock('@core/services/base', async () => {
  const actual = await vi.importActual('@core/services/base');
  return {
    ...actual,
    configureServices: vi.fn(),
  };
});

// Mock LayoutSettings since it requires LayoutProvider context
vi.mock('./LayoutSettings', () => ({
  LayoutSettings: () => <div data-testid="layout-settings">Layout Settings Mock</div>,
}));

describe('SettingsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<SettingsDialog isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('renders title and sections when open', () => {
    render(<SettingsDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Connection')).toBeInTheDocument();
    expect(screen.getByText('Tables')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('renders API URL field with current value', () => {
    render(<SettingsDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByDisplayValue('http://localhost:8080/api')).toBeInTheDocument();
  });

  it('renders page size selector', () => {
    render(<SettingsDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Rows per page')).toBeInTheDocument();
  });

  it('renders Save Settings button', () => {
    render(<SettingsDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
  });

  it('renders layout settings section', () => {
    render(<SettingsDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByTestId('layout-settings')).toBeInTheDocument();
  });

  it('renders hints', () => {
    render(<SettingsDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Base URL for API requests/)).toBeInTheDocument();
    expect(screen.getByText(/Default number of rows/)).toBeInTheDocument();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn();
    render(<SettingsDialog isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('saves changed API URL on submit', () => {
    const onClose = vi.fn();
    render(<SettingsDialog isOpen={true} onClose={onClose} />);
    const input = screen.getByDisplayValue('http://localhost:8080/api');
    fireEvent.change(input, { target: { value: 'http://new-server:9090/api' } });
    fireEvent.click(screen.getByText('Save Settings'));
    expect(configureServices).toHaveBeenCalledWith({ baseUrl: 'http://new-server:9090/api' });
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ apiUrl: 'http://new-server:9090/api' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('saves changed page size on submit', () => {
    const onClose = vi.fn();
    render(<SettingsDialog isOpen={true} onClose={onClose} />);
    // SelectField is a custom dropdown — click trigger, then click option
    fireEvent.click(screen.getByLabelText('Rows per page'));
    fireEvent.click(screen.getByRole('option', { name: '50' }));
    fireEvent.click(screen.getByText('Save Settings'));
    expect(clearTablePageSizeOverrides).toHaveBeenCalled();
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ defaultPageSize: 50 }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call updateSettings when nothing changed', () => {
    const onClose = vi.fn();
    render(<SettingsDialog isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Save Settings'));
    expect(mockUpdateSettings).not.toHaveBeenCalled();
    expect(configureServices).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
