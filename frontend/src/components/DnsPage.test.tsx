vi.mock('@twcode/ledger-ui', () => ({
  LedgerSearch: () => <div>LedgerSearch</div>,
}));

import { render, screen } from '@testing-library/react';
import { DnsPage } from './DnsPage';

describe('DnsPage', () => {
  it('renders LedgerSearch', () => {
    render(<DnsPage />);
    expect(screen.getByText('LedgerSearch')).toBeInTheDocument();
  });
});
