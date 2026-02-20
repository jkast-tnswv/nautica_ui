import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

const emptyEntity = { items: [], loading: false, error: null };

export function defaultStoreState(overrides: Record<string, any> = {}) {
  return {
    oceanDevices: { ...emptyEntity },
    oceanCircuits: { ...emptyEntity },
    shipwrightJobs: {
      ...emptyEntity,
      selectedJobDetails: null,
      detailsJobId: null,
      detailsLoading: false,
      detailsError: null,
    },
    harborJobs: { ...emptyEntity },
    ledger: { ...emptyEntity, query: '' },
    captainUsers: { ...emptyEntity },
    captainGroups: { ...emptyEntity },
    skipper: { builds: [], loading: false, error: null },
    ...overrides,
  };
}

export function createMockStore(overrides: Record<string, any> = {}) {
  const state = defaultStoreState(overrides);
  return configureStore({
    reducer: Object.fromEntries(
      Object.keys(state).map((key) => [key, (s = state[key as keyof typeof state]) => s]),
    ),
    preloadedState: state,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }),
  });
}

export function renderWithStore(
  ui: React.ReactElement,
  storeOverrides: Record<string, any> = {},
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) {
  const store = createMockStore(storeOverrides);
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
