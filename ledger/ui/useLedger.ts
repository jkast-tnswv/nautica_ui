import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { searchLedger, clearResults } from './ledgerSlice';
import type { LedgerDnsRecord } from '@core/gen/ledger/api/ledger_pb';

export interface UseLedgerReturn {
  records: LedgerDnsRecord[];
  loading: boolean;
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  clear: () => void;
}

export function useLedger(): UseLedgerReturn {
  const dispatch = useAppDispatch();
  const { items: records, loading, error, query } = useAppSelector((state) => state.ledger);

  const search = useCallback(async (name: string) => {
    if (!name.trim()) return;
    await dispatch(searchLedger(name.trim()));
  }, [dispatch]);

  const clear = useCallback(() => {
    dispatch(clearResults());
  }, [dispatch]);

  return { records: records as LedgerDnsRecord[], loading, error, query, search, clear };
}
