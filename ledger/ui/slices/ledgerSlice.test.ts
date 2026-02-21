import reducer, { clearResults } from './ledgerSlice';

const initialState = { items: [], loading: false, error: null, query: '' };

describe('ledgerSlice', () => {
  describe('searchLedger', () => {
    it('pending sets loading and clears error', () => {
      const prevState = { ...initialState, error: 'old error' };
      const state = reducer(prevState, { type: 'ledger/search/pending' });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('fulfilled sets items and query, stops loading', () => {
      const prevState = { ...initialState, loading: true };
      const records = [{ name: 'example.com', type: 'A' }];
      const state = reducer(prevState, {
        type: 'ledger/search/fulfilled',
        payload: { records, query: 'example' },
      });

      expect(state.items).toEqual(records);
      expect(state.query).toBe('example');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('rejected sets error and stops loading', () => {
      const prevState = { ...initialState, loading: true };
      const state = reducer(prevState, {
        type: 'ledger/search/rejected',
        error: { message: 'Search failed' },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Search failed');
    });
  });

  describe('clearResults', () => {
    it('resets items, query, and error', () => {
      const prevState = {
        items: [{ name: 'example.com' }] as any[],
        loading: false,
        error: 'some error',
        query: 'example',
      };
      const state = reducer(prevState, clearResults());

      expect(state.items).toEqual([]);
      expect(state.query).toBe('');
      expect(state.error).toBeNull();
    });
  });
});
