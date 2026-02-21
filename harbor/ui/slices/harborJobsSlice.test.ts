import reducer from './harborJobsSlice';

const initialState = { items: [], loading: false, error: null };

describe('harborJobsSlice', () => {
  describe('fetchHarborJobs', () => {
    it('pending sets loading true when items are empty', () => {
      const state = reducer(initialState, { type: 'harborJobs/fetch/pending' });

      expect(state.loading).toBe(true);
    });

    it('pending does not set loading when items already exist', () => {
      const stateWithItems = { ...initialState, items: [{ id: '1' }] };
      const state = reducer(stateWithItems as any, { type: 'harborJobs/fetch/pending' });

      expect(state.loading).toBe(false);
    });

    it('fulfilled sets items and clears error', () => {
      const prevState = { ...initialState, loading: true, error: 'old error' };
      const items = [{ id: '1' }, { id: '2' }];
      const state = reducer(prevState, {
        type: 'harborJobs/fetch/fulfilled',
        payload: items,
      });

      expect(state.items).toEqual(items);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('rejected sets error and stops loading', () => {
      const prevState = { ...initialState, loading: true };
      const state = reducer(prevState, {
        type: 'harborJobs/fetch/rejected',
        error: { message: 'Network error' },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('createHarborEmbark', () => {
    it('rejected sets error', () => {
      const state = reducer(initialState, {
        type: 'harborJobs/embark/rejected',
        error: { message: 'embark fail' },
      });

      expect(state.error).toBe('embark fail');
    });
  });

  describe('createHarborDisembark', () => {
    it('rejected sets error', () => {
      const state = reducer(initialState, {
        type: 'harborJobs/disembark/rejected',
        error: { message: 'disembark fail' },
      });

      expect(state.error).toBe('disembark fail');
    });
  });
});
