import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LedgerSearch } from '@twcode/ledger-ui';

export function DnsPage() {
  return <ErrorBoundary><LedgerSearch /></ErrorBoundary>;
}
