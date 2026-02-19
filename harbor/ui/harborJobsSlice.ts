import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { HarborResponse } from '@core/gen/harbor/api/harbor_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { HarborRequest, HarborListRequest } from '@core/gen/harbor/api/harbor_pb';
import { getServices } from '@core/services';

interface HarborJobsState {
  items: HarborResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: HarborJobsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchHarborJobs = createAsyncThunk(
  'harborJobs/fetch',
  async (filters?: PartialMessage<HarborListRequest>) => {
    const response = await getServices().harbor.list(filters);
    return response.harborResponses;
  }
);

export const createHarborEmbark = createAsyncThunk(
  'harborJobs/embark',
  async (data: PartialMessage<HarborRequest>) => {
    return await getServices().harbor.embark(data);
  }
);

export const createHarborDisembark = createAsyncThunk(
  'harborJobs/disembark',
  async (data: PartialMessage<HarborRequest>) => {
    return await getServices().harbor.disembark(data);
  }
);

const harborJobsSlice = createSlice({
  name: 'harborJobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHarborJobs.pending, (state) => {
        state.loading = state.items.length === 0;
      })
      .addCase(fetchHarborJobs.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchHarborJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load harbor jobs';
      })
      .addCase(createHarborEmbark.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to embark';
      })
      .addCase(createHarborDisembark.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to disembark';
      });
  },
});

export default harborJobsSlice.reducer;
