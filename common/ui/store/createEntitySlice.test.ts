import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { createEntitySlice } from './createEntitySlice';

interface TestItem {
  id: string;
  name: string;
}

function createTestStore(reducer: ReturnType<typeof createEntitySlice>['reducer']) {
  return configureStore({ reducer: { entity: reducer } });
}

describe('createEntitySlice', () => {
  it('creates slice with fetch thunk', () => {
    const fetchFn = vi.fn(async () => []);
    const slice = createEntitySlice<TestItem>({
      name: 'test',
      fetch: { type: 'test/fetch', fn: fetchFn },
    });

    expect(slice.reducer).toBeDefined();
    expect(slice.actions).toBeDefined();
    expect(slice.fetchThunk).toBeDefined();
  });

  it('creates slice with create thunk', () => {
    const createFn = vi.fn(async (arg: Partial<TestItem>) => ({ id: '1', name: 'New' }));
    const slice = createEntitySlice<TestItem, void, Partial<TestItem>>({
      name: 'test',
      create: { type: 'test/create', fn: createFn },
    });

    expect(slice.reducer).toBeDefined();
    expect(slice.actions).toBeDefined();
    expect(slice.createThunk).toBeDefined();
  });

  it('fetch pending sets loading when items empty', () => {
    const fetchFn = vi.fn(async () => []);
    const slice = createEntitySlice<TestItem>({
      name: 'test',
      fetch: { type: 'test/fetch', fn: fetchFn },
    });

    const store = createTestStore(slice.reducer);
    store.dispatch(slice.fetchThunk.pending('requestId', undefined));

    const state = store.getState().entity;
    expect(state.loading).toBe(true);
  });

  it('fetch pending does not set loading when items exist', () => {
    const fetchFn = vi.fn(async () => []);
    const slice = createEntitySlice<TestItem>({
      name: 'test',
      fetch: { type: 'test/fetch', fn: fetchFn },
    });

    const store = createTestStore(slice.reducer);

    // First, populate items via fulfilled action
    store.dispatch(
      slice.fetchThunk.fulfilled([{ id: '1', name: 'Existing' }], 'requestId', undefined),
    );
    expect(store.getState().entity.items).toHaveLength(1);

    // Now dispatch pending - loading should stay false because items exist
    store.dispatch(slice.fetchThunk.pending('requestId2', undefined));
    expect(store.getState().entity.loading).toBe(false);
  });

  it('fetch fulfilled sets items', () => {
    const fetchFn = vi.fn(async () => []);
    const slice = createEntitySlice<TestItem>({
      name: 'test',
      fetch: { type: 'test/fetch', fn: fetchFn },
    });

    const store = createTestStore(slice.reducer);
    const items = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    store.dispatch(slice.fetchThunk.fulfilled(items, 'requestId', undefined));

    const state = store.getState().entity;
    expect(state.items).toEqual(items);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetch rejected sets error', () => {
    const fetchFn = vi.fn(async () => []);
    const slice = createEntitySlice<TestItem>({
      name: 'test',
      fetch: { type: 'test/fetch', fn: fetchFn },
    });

    const store = createTestStore(slice.reducer);
    const error = new Error('Network failure');

    store.dispatch(slice.fetchThunk.rejected(error, 'requestId', undefined));

    const state = store.getState().entity;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network failure');
  });

  it('create pending sets loading', () => {
    const createFn = vi.fn(async (arg: Partial<TestItem>) => ({ id: '1', name: 'New' }));
    const slice = createEntitySlice<TestItem, void, Partial<TestItem>>({
      name: 'test',
      create: { type: 'test/create', fn: createFn },
    });

    const store = createTestStore(slice.reducer);
    store.dispatch(slice.createThunk.pending('requestId', { name: 'New' }));

    const state = store.getState().entity;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('create fulfilled pushes item', () => {
    const createFn = vi.fn(async (arg: Partial<TestItem>) => ({ id: '1', name: 'New' }));
    const slice = createEntitySlice<TestItem, void, Partial<TestItem>>({
      name: 'test',
      create: { type: 'test/create', fn: createFn },
    });

    const store = createTestStore(slice.reducer);
    const newItem = { id: '1', name: 'Created Item' };

    store.dispatch(slice.createThunk.fulfilled(newItem, 'requestId', { name: 'Created Item' }));

    const state = store.getState().entity;
    expect(state.items).toEqual([newItem]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('create rejected sets error', () => {
    const createFn = vi.fn(async (arg: Partial<TestItem>) => ({ id: '1', name: 'New' }));
    const slice = createEntitySlice<TestItem, void, Partial<TestItem>>({
      name: 'test',
      create: { type: 'test/create', fn: createFn },
    });

    const store = createTestStore(slice.reducer);
    const error = new Error('Create failed');

    store.dispatch(slice.createThunk.rejected(error, 'requestId', { name: 'New' }));

    const state = store.getState().entity;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Create failed');
  });
});
