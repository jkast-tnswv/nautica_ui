import reducer from './skipperSlice';

const initialState = { builds: [], loading: false, error: null };

describe('skipperSlice', () => {
  describe('buildSkipperPackage', () => {
    it('pending sets loading, clears error, and unshifts a building entry', () => {
      const state = reducer(initialState, {
        type: 'skipper/build/pending',
        meta: { arg: { packageName: 'pkg', packageVersion: '1.0', owner: 'user' } },
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.builds).toHaveLength(1);
      expect(state.builds[0].packageName).toBe('pkg');
      expect(state.builds[0].packageVersion).toBe('1.0');
      expect(state.builds[0].owner).toBe('user');
      expect(state.builds[0].status).toBe('building');
      expect(state.builds[0].timestamp).toEqual(expect.any(Number));
    });

    it('pending unshifts new build to front of list', () => {
      const stateWithBuilds = {
        ...initialState,
        builds: [
          { packageName: 'old', packageVersion: '0.1', owner: 'prev', status: 'done' as const, timestamp: 1000 },
        ],
      };
      const state = reducer(stateWithBuilds, {
        type: 'skipper/build/pending',
        meta: { arg: { packageName: 'new-pkg', packageVersion: '2.0', owner: 'new-user' } },
      });

      expect(state.builds).toHaveLength(2);
      expect(state.builds[0].packageName).toBe('new-pkg');
      expect(state.builds[0].status).toBe('building');
      expect(state.builds[1].packageName).toBe('old');
    });

    it('fulfilled stops loading and marks first building entry as done', () => {
      const stateWithBuilding = {
        ...initialState,
        loading: true,
        builds: [
          { packageName: 'pkg', packageVersion: '1.0', owner: 'user', status: 'building' as const, timestamp: 1000 },
        ],
      };
      const state = reducer(stateWithBuilding, {
        type: 'skipper/build/fulfilled',
        payload: { packageName: 'pkg', packageVersion: '1.0', owner: 'user' },
      });

      expect(state.loading).toBe(false);
      expect(state.builds[0].status).toBe('done');
    });

    it('rejected stops loading, sets error, and marks first building entry as failed', () => {
      const stateWithBuilding = {
        ...initialState,
        loading: true,
        builds: [
          { packageName: 'pkg', packageVersion: '1.0', owner: 'user', status: 'building' as const, timestamp: 1000 },
        ],
      };
      const state = reducer(stateWithBuilding, {
        type: 'skipper/build/rejected',
        error: { message: 'Build failed' },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Build failed');
      expect(state.builds[0].status).toBe('failed');
    });

    it('fulfilled only changes the first building entry', () => {
      const stateWithMultiple = {
        ...initialState,
        loading: true,
        builds: [
          { packageName: 'first', packageVersion: '1.0', owner: 'user', status: 'building' as const, timestamp: 2000 },
          { packageName: 'second', packageVersion: '2.0', owner: 'user', status: 'building' as const, timestamp: 1000 },
        ],
      };
      const state = reducer(stateWithMultiple, {
        type: 'skipper/build/fulfilled',
        payload: { packageName: 'first', packageVersion: '1.0', owner: 'user' },
      });

      expect(state.builds[0].status).toBe('done');
      expect(state.builds[1].status).toBe('building');
    });
  });
});
