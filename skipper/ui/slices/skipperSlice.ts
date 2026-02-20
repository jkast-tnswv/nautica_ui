import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { SkipperBuildRequest } from '@core/gen/skipper/api/skipper_pb';
import { getServices } from '@core/services';

interface SkipperBuild {
  packageName: string;
  packageVersion: string;
  owner: string;
  status: 'pending' | 'building' | 'done' | 'failed';
  timestamp: number;
}

interface SkipperState {
  builds: SkipperBuild[];
  loading: boolean;
  error: string | null;
}

const initialState: SkipperState = {
  builds: [],
  loading: false,
  error: null,
};

export const buildSkipperPackage = createAsyncThunk(
  'skipper/build',
  async (data: PartialMessage<SkipperBuildRequest>) => {
    await getServices().skipper.buildPackage(data);
    return {
      packageName: data.packageName ?? '',
      packageVersion: data.packageVersion ?? '',
      owner: data.owner ?? '',
    };
  }
);

const skipperSlice = createSlice({
  name: 'skipper',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buildSkipperPackage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.builds.unshift({
          packageName: action.meta.arg.packageName ?? '',
          packageVersion: action.meta.arg.packageVersion ?? '',
          owner: action.meta.arg.owner ?? '',
          status: 'building',
          timestamp: Date.now(),
        });
      })
      .addCase(buildSkipperPackage.fulfilled, (state) => {
        state.loading = false;
        const building = state.builds.find(b => b.status === 'building');
        if (building) building.status = 'done';
      })
      .addCase(buildSkipperPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Build failed';
        const building = state.builds.find(b => b.status === 'building');
        if (building) building.status = 'failed';
      });
  },
});

export default skipperSlice.reducer;
