import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  ShipwrightJobResponse,
  ShipwrightJobDetailsResponse,
} from '@core/gen/shipwright/api/shipwright_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type {
  ShipwrightJobRequest,
  ShipwrightJobListRequest,
} from '@core/gen/shipwright/api/shipwright_pb';
import { getServices } from '@core/services';

interface ShipwrightJobsState {
  items: ShipwrightJobResponse[];
  loading: boolean;
  error: string | null;
  selectedJobDetails: ShipwrightJobDetailsResponse | null;
  detailsLoading: boolean;
  detailsError: string | null;
}

const initialState: ShipwrightJobsState = {
  items: [],
  loading: false,
  error: null,
  selectedJobDetails: null,
  detailsLoading: false,
  detailsError: null,
};

export const fetchShipwrightJobs = createAsyncThunk(
  'shipwrightJobs/fetch',
  async (filters?: PartialMessage<ShipwrightJobListRequest>) => {
    const response = await getServices().shipwright.listJobs(filters);
    return response.shipwrightJobResponses;
  }
);

export const createShipwrightJob = createAsyncThunk(
  'shipwrightJobs/create',
  async (data: PartialMessage<ShipwrightJobRequest>) => {
    return await getServices().shipwright.createConfigureJob(data);
  }
);

export const fetchShipwrightJobDetails = createAsyncThunk(
  'shipwrightJobs/fetchDetails',
  async (jobId: string) => {
    return await getServices().shipwright.getJobDetails(jobId);
  }
);

const shipwrightJobsSlice = createSlice({
  name: 'shipwrightJobs',
  initialState,
  reducers: {
    clearJobDetails(state) {
      state.selectedJobDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List jobs
      .addCase(fetchShipwrightJobs.pending, (state) => {
        state.loading = state.items.length === 0;
      })
      .addCase(fetchShipwrightJobs.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchShipwrightJobs.rejected, (state, action) => {
        state.loading = false;
        // Only set error if we have no existing data — don't nuke the UI on a transient refresh failure
        if (state.items.length === 0) {
          state.error = action.error.message ?? 'Failed to load jobs';
        }
      })
      // Create job (re-fetch after success handled by hook)
      .addCase(createShipwrightJob.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create job';
      })
      // Job details
      .addCase(fetchShipwrightJobDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchShipwrightJobDetails.fulfilled, (state, action) => {
        state.selectedJobDetails = action.payload;
        state.detailsLoading = false;
      })
      .addCase(fetchShipwrightJobDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.error.message ?? 'Failed to load job details';
      });
  },
});

export const { clearJobDetails } = shipwrightJobsSlice.actions;
export default shipwrightJobsSlice.reducer;
