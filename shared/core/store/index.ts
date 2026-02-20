import { configureStore } from '@reduxjs/toolkit';
import { oceanDevicesReducer, oceanCircuitsReducer } from '@twcode/ocean-ui';
import { shipwrightJobsReducer } from '@twcode/shipwright-ui';
import { harborJobsReducer } from '@twcode/harbor-ui';
import { ledgerReducer } from '@twcode/ledger-ui';
import { captainUsersReducer, captainGroupsReducer } from '@twcode/captain-ui';
import { skipperReducer } from '@twcode/skipper-ui';

export const store = configureStore({
  reducer: {
    oceanDevices: oceanDevicesReducer,
    oceanCircuits: oceanCircuitsReducer,
    shipwrightJobs: shipwrightJobsReducer,
    harborJobs: harborJobsReducer,
    ledger: ledgerReducer,
    captainUsers: captainUsersReducer,
    captainGroups: captainGroupsReducer,
    skipper: skipperReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Protobuf message objects are not plain serializable
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from './hooks';
export { createEntitySlice, type EntityState } from './createEntitySlice';
