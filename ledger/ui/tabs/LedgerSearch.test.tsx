const mockSearch = vi.fn();
const mockClear = vi.fn();

const defaultRecords = [
  { name: 'host-01.example.com', ledgerDnsRecordType: 1, value: '10.0.0.1' },
];

vi.mock('../hooks/useLedger', () => ({
  useLedger: vi.fn(() => ({
    records: defaultRecords,
    loading: false,
    error: null,
    query: 'host-01',
    search: mockSearch,
    clear: mockClear,
  })),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { useLedger } from '../hooks/useLedger';
import { LedgerSearch } from './LedgerSearch';

describe('LedgerSearch', () => {
  beforeEach(() => {
    mockSearch.mockClear();
    mockClear.mockClear();
  });

  it('renders card title', () => {
    render(<LedgerSearch />);
    expect(screen.getByText('Leger Lookup')).toBeInTheDocument();
  });

  it('renders search input and button', () => {
    render(<LedgerSearch />);
    expect(screen.getByPlaceholderText('Hostname or IP address...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<LedgerSearch />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('shows empty search message', () => {
    vi.mocked(useLedger).mockReturnValueOnce({
      records: [],
      loading: false,
      error: null,
      query: '',
      search: mockSearch,
      clear: mockClear,
    });
    render(<LedgerSearch />);
    expect(screen.getByText('Enter a hostname or IP to search')).toBeInTheDocument();
  });

  it('calls search on form submit', () => {
    render(<LedgerSearch />);
    const input = screen.getByPlaceholderText('Hostname or IP address...');
    fireEvent.change(input, { target: { value: 'example.com' } });
    const form = input.closest('form')!;
    fireEvent.submit(form);
    expect(mockSearch).toHaveBeenCalledWith('example.com');
  });

  it('renders Clear button when records exist', () => {
    render(<LedgerSearch />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('calls clear and resets input on Clear click', () => {
    render(<LedgerSearch />);
    const input = screen.getByPlaceholderText('Hostname or IP address...');
    fireEvent.change(input, { target: { value: 'something' } });
    fireEvent.click(screen.getByText('Clear'));
    expect(mockClear).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('renders error state', () => {
    vi.mocked(useLedger).mockReturnValueOnce({
      records: [],
      loading: false,
      error: 'DNS lookup failed',
      query: '',
      search: mockSearch,
      clear: mockClear,
    });
    render(<LedgerSearch />);
    expect(screen.getByText('Error: DNS lookup failed')).toBeInTheDocument();
    expect(screen.queryByText('Leger Lookup')).not.toBeInTheDocument();
  });

  it('shows loading message', () => {
    vi.mocked(useLedger).mockReturnValueOnce({
      records: [],
      loading: true,
      error: null,
      query: 'test',
      search: mockSearch,
      clear: mockClear,
    });
    render(<LedgerSearch />);
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('shows no records found message', () => {
    vi.mocked(useLedger).mockReturnValueOnce({
      records: [],
      loading: false,
      error: null,
      query: 'nonexistent',
      search: mockSearch,
      clear: mockClear,
    });
    render(<LedgerSearch />);
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });
});
