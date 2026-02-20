import React, { useMemo, useState, type FormEvent } from 'react';
import { useLedger } from './useLedger';
import { Table, Cell, Card, InfoSection } from '@components';
import type { LedgerDnsRecord } from '@core/gen/ledger/api/ledger_pb';
import { ledgerDnsRecordTypeLabel } from '@core/nautica-types';

export function LedgerSearch() {
  const { records, loading, error, query, search, clear } = useLedger();
  const [showInfo, setShowInfo] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    search(searchInput);
  };

  const columns = useMemo(() => [
    {
      header: 'Name',
      accessor: 'name' as keyof LedgerDnsRecord,
      searchable: true,
    },
    {
      header: 'Type',
      accessor: (r: LedgerDnsRecord) => Cell.badge(
        ledgerDnsRecordTypeLabel(r.ledgerDnsRecordType),
        'info',
      ),
      width: '120px',
      filterValue: (r: LedgerDnsRecord) => ledgerDnsRecordTypeLabel(r.ledgerDnsRecordType),
    },
    {
      header: 'Value',
      accessor: 'value' as keyof LedgerDnsRecord,
      searchable: true,
    },
  ], []);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <Card
      title="DNS Search"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Hostname or IP address..."
            style={{ minWidth: '240px' }}
          />
          <button type="submit" className="btn btn-sm btn-primary" disabled={!searchInput.trim() || loading}>
            <span className="material-icons-outlined">search</span>
            Search
          </button>
          {records.length > 0 && (
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => { clear(); setSearchInput(''); }}>
              Clear
            </button>
          )}
        </form>
      }
    >
      <InfoSection open={showInfo}>
        <p>Search DNS records by hostname or IP address. Ledger returns matching A, AAAA, CNAME, MX, TXT, SRV, and other DNS record types.</p>
      </InfoSection>
      <Table
        data={records}
        columns={columns}
        getRowKey={(r) => `${r.name}-${r.ledgerDnsRecordType}-${r.value}`}
        emptyMessage={loading ? 'Searching...' : query ? 'No records found' : 'Enter a hostname or IP to search'}
        searchable
        searchPlaceholder="Filter results..."
        paginate
        pageSize={25}
        tableId="ledger-search"
      />
    </Card>
  );
}
