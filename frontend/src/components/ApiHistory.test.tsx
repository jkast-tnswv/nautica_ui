import { render, screen, fireEvent } from '@testing-library/react';
import { ApiHistory } from './ApiHistory';

const now = Date.now();

const mockEntries = [
  {
    id: '1',
    method: 'GET',
    path: '/api/devices',
    url: 'http://localhost:8080/api/devices',
    queryParams: { limit: '100' },
    requestBody: null,
    responseBody: [{ id: 1 }],
    status: 200,
    error: null,
    durationMs: 42,
    timestamp: now - 5000,
  },
  {
    id: '2',
    method: 'POST',
    path: '/api/devices',
    url: 'http://localhost:8080/api/devices',
    queryParams: {},
    requestBody: { name: 'test' },
    responseBody: null,
    status: null,
    error: 'Connection refused',
    durationMs: 0,
    timestamp: now - 10000,
  },
  {
    id: '3',
    method: 'gRPC (query)',
    path: '/grpc/service/Method',
    url: 'http://localhost:8080/grpc/service/Method',
    queryParams: {},
    requestBody: null,
    responseBody: { ok: true },
    status: 0,
    error: null,
    durationMs: 5,
    timestamp: now - 15000,
  },
  {
    id: '4',
    method: 'DELETE',
    path: '/api/devices/1',
    url: 'http://localhost:8080/api/devices/1',
    queryParams: {},
    requestBody: null,
    responseBody: null,
    status: 404,
    error: null,
    durationMs: 12,
    timestamp: now - 20000,
  },
];

const mockClearApiHistory = vi.fn();

vi.mock('@core', async () => {
  const actual = await vi.importActual('@core');
  return {
    ...actual,
    useApiHistory: () => mockEntries,
    clearApiHistory: (...args: unknown[]) => mockClearApiHistory(...args),
  };
});

describe('ApiHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders nothing when closed', () => {
    render(<ApiHistory isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('API History')).not.toBeInTheDocument();
  });

  it('renders entry list when open', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('API History')).toBeInTheDocument();
    expect(screen.getByText('4 calls')).toBeInTheDocument();
  });

  it('shows method badges', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('gRPC (query)')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
  });

  it('shows status badges with correct classes', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    // 200 → online class
    expect(screen.getByText('200').className).toContain('online');
    // null with error → ERR
    expect(screen.getByText('ERR')).toBeInTheDocument();
    // gRPC OK (0) → 'OK' text, online class
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('OK').className).toContain('online');
    // 404 → provisioning class
    expect(screen.getByText('404').className).toContain('provisioning');
  });

  it('expands entry detail on click showing URL and params', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    const rows = screen.getAllByText('/api/devices');
    fireEvent.click(rows[0]);
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Params')).toBeInTheDocument();
    expect(screen.getByText('limit')).toBeInTheDocument();
  });

  it('shows response body in detail', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    const rows = screen.getAllByText('/api/devices');
    fireEvent.click(rows[0]);
    expect(screen.getByText('Response')).toBeInTheDocument();
  });

  it('shows request body and error in detail', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    const rows = screen.getAllByText('/api/devices');
    fireEvent.click(rows[1]);
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Connection refused')).toBeInTheDocument();
  });

  it('collapses entry on second click', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    const row = screen.getAllByText('/api/devices')[0];
    fireEvent.click(row);
    expect(screen.getByText('Params')).toBeInTheDocument();
    fireEvent.click(row);
    expect(screen.queryByText('Params')).not.toBeInTheDocument();
  });

  it('calls clearApiHistory when clear button clicked', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByTitle('Clear history'));
    expect(mockClearApiHistory).toHaveBeenCalled();
  });

  it('marks error entries with error class', () => {
    const { container } = render(<ApiHistory isOpen={true} onClose={() => {}} />);
    expect(container.querySelector('.api-history-error')).toBeInTheDocument();
  });

  it('shows duration', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('42ms')).toBeInTheDocument();
    expect(screen.getByText('5ms')).toBeInTheDocument();
  });

  it('auto-expands entry matching highlightTimestamp', () => {
    const { container } = render(
      <ApiHistory isOpen={true} onClose={() => {}} highlightTimestamp={now - 10000} />,
    );
    // The error entry (id=2) should be auto-expanded and highlighted
    expect(container.querySelector('.api-history-highlight')).toBeInTheDocument();
    expect(screen.getByText('Connection refused')).toBeInTheDocument();
  });

  it('does not highlight when timestamp too far from any error', () => {
    const { container } = render(
      <ApiHistory isOpen={true} onClose={() => {}} highlightTimestamp={1} />,
    );
    expect(container.querySelector('.api-history-highlight')).not.toBeInTheDocument();
  });

  it('does not highlight when highlightTimestamp is null', () => {
    const { container } = render(
      <ApiHistory isOpen={true} onClose={() => {}} highlightTimestamp={null} />,
    );
    expect(container.querySelector('.api-history-highlight')).not.toBeInTheDocument();
  });

  it('does not show Params section when no query params', () => {
    render(<ApiHistory isOpen={true} onClose={() => {}} />);
    // Expand gRPC entry (no query params)
    fireEvent.click(screen.getByText('/grpc/service/Method'));
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.queryByText('Params')).not.toBeInTheDocument();
  });
});
