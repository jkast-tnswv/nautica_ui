import reducer, { clearJobDetails } from './shipwrightJobsSlice';

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedJobDetails: null,
  detailsJobId: null,
  detailsLoading: false,
  detailsError: null,
};

describe('shipwrightJobsSlice', () => {
  describe('fetchShipwrightJobs', () => {
    it('pending sets loading true when items are empty', () => {
      const state = reducer(initialState, { type: 'shipwrightJobs/fetch/pending' });

      expect(state.loading).toBe(true);
    });

    it('pending does not set loading when items already exist', () => {
      const stateWithItems = { ...initialState, items: [{ id: '1' }] };
      const state = reducer(stateWithItems as any, { type: 'shipwrightJobs/fetch/pending' });

      expect(state.loading).toBe(false);
    });

    it('fulfilled sets items and clears error', () => {
      const prevState = { ...initialState, loading: true, error: 'old error' };
      const items = [{ id: '1' }, { id: '2' }];
      const state = reducer(prevState, {
        type: 'shipwrightJobs/fetch/fulfilled',
        payload: items,
      });

      expect(state.items).toEqual(items);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('rejected sets error when items are empty', () => {
      const prevState = { ...initialState, loading: true };
      const state = reducer(prevState, {
        type: 'shipwrightJobs/fetch/rejected',
        error: { message: 'Network error' },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('rejected preserves existing error when items exist', () => {
      const stateWithItems = {
        ...initialState,
        items: [{ id: '1' }],
        loading: true,
        error: null,
      };
      const state = reducer(stateWithItems as any, {
        type: 'shipwrightJobs/fetch/rejected',
        error: { message: 'Transient failure' },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('createShipwrightJob', () => {
    it('rejected sets error', () => {
      const state = reducer(initialState, {
        type: 'shipwrightJobs/create/rejected',
        error: { message: 'Failed to create job' },
      });

      expect(state.error).toBe('Failed to create job');
    });
  });

  describe('fetchShipwrightJobDetails', () => {
    it('pending sets detailsJobId, detailsLoading, and clears detailsError', () => {
      const state = reducer(initialState, {
        type: 'shipwrightJobs/fetchDetails/pending',
        meta: { arg: 'job-123' },
      });

      expect(state.detailsJobId).toBe('job-123');
      expect(state.detailsLoading).toBe(true);
      expect(state.detailsError).toBeNull();
    });

    it('fulfilled sets selectedJobDetails and stops loading', () => {
      const prevState = { ...initialState, detailsLoading: true, detailsJobId: 'job-123' };
      const details = { jobId: 'job-123', status: 'complete', logs: [] };
      const state = reducer(prevState, {
        type: 'shipwrightJobs/fetchDetails/fulfilled',
        payload: details,
      });

      expect(state.selectedJobDetails).toEqual(details);
      expect(state.detailsLoading).toBe(false);
    });

    it('rejected stops loading and sets detailsError', () => {
      const prevState = { ...initialState, detailsLoading: true, detailsJobId: 'job-123' };
      const state = reducer(prevState, {
        type: 'shipwrightJobs/fetchDetails/rejected',
        error: { message: 'Details not found' },
      });

      expect(state.detailsLoading).toBe(false);
      expect(state.detailsError).toBe('Details not found');
    });
  });

  describe('clearJobDetails', () => {
    it('sets selectedJobDetails to null', () => {
      const prevState = {
        ...initialState,
        selectedJobDetails: { jobId: 'job-123', status: 'complete' } as any,
      };
      const state = reducer(prevState, clearJobDetails());

      expect(state.selectedJobDetails).toBeNull();
    });
  });
});
