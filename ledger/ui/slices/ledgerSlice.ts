import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LedgerDnsRecord } from '@core/gen/ledger/api/ledger_pb';
import { getServices } from '@core/services';

interface LedgerState {
  items: LedgerDnsRecord[];
  loading: boolean;
  error: string | null;
  query: string;
}

const initialState: LedgerState = {
  items: [],
  loading: false,
  error: null,
  query: '',
};

export const searchLedger = createAsyncThunk(
  'ledger/search',
  async (name: string) => {
    const response = await getServices().ledger.search({ target: { value: name, case: 'name' } });
    return { records: response.ledgerDnsRecords, query: name };
  }
);

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    clearResults(state) {
      state.items = [];
      state.query = '';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchLedger.fulfilled, (state, action) => {
        state.items = (action.payload.records || []) as LedgerDnsRecord[];
        state.query = action.payload.query;
        state.loading = false;
        state.error = null;
      })
      .addCase(searchLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Search failed';
      });
  },
});

export const { clearResults } = ledgerSlice.actions;
export default ledgerSlice.reducer;
