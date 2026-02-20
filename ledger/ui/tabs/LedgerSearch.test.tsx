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

import { render, screen } from '@testing-library/react';
import { useLedger } from '../hooks/useLedger';
import { LedgerSearch } from './LedgerSearch';

describe('LedgerSearch', () => {
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
});
