import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { OceanDevice } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanDeviceListRequest } from '@core/gen/ocean/api/ocean_pb';
import { getServices } from '@core/services';

interface OceanDevicesState {
  items: OceanDevice[];
  loading: boolean;
  error: string | null;
}

const initialState: OceanDevicesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOceanDevices = createAsyncThunk(
  'oceanDevices/fetch',
  async (filters?: PartialMessage<OceanDeviceListRequest>) => {
    const response = await getServices().ocean.listDevices(filters);
    return response.oceanDevices;
  }
);

const oceanDevicesSlice = createSlice({
  name: 'oceanDevices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOceanDevices.pending, (state) => {
        state.loading = state.items.length === 0;
      })
      .addCase(fetchOceanDevices.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchOceanDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load devices';
      });
  },
});

export default oceanDevicesSlice.reducer;
