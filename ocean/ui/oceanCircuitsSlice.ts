import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { OceanCircuit } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanCircuitListRequest } from '@core/gen/ocean/api/ocean_pb';
import { getServices } from '@core/services';

interface OceanCircuitsState {
  items: OceanCircuit[];
  loading: boolean;
  error: string | null;
}

const initialState: OceanCircuitsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOceanCircuits = createAsyncThunk(
  'oceanCircuits/fetch',
  async (filters?: PartialMessage<OceanCircuitListRequest>) => {
    const response = await getServices().ocean.listCircuits(filters);
    return response.oceanCircuits;
  }
);

const oceanCircuitsSlice = createSlice({
  name: 'oceanCircuits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOceanCircuits.pending, (state) => {
        state.loading = state.items.length === 0;
      })
      .addCase(fetchOceanCircuits.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchOceanCircuits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load circuits';
      });
  },
});

export default oceanCircuitsSlice.reducer;
