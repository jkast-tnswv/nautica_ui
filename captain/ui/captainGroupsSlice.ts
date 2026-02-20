import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CaptainGroup } from '@core/gen/captain/api/captain_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { CaptainCreateGroupRequest } from '@core/gen/captain/api/captain_pb';
import { getServices } from '@core/services';

interface CaptainGroupsState {
  items: CaptainGroup[];
  loading: boolean;
  error: string | null;
}

const initialState: CaptainGroupsState = {
  items: [],
  loading: false,
  error: null,
};

export const createCaptainGroup = createAsyncThunk(
  'captainGroups/create',
  async (data: PartialMessage<CaptainCreateGroupRequest>) => {
    return await getServices().captain.createGroup(data);
  }
);

const captainGroupsSlice = createSlice({
  name: 'captainGroups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCaptainGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCaptainGroup.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createCaptainGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to create group';
      });
  },
});

export default captainGroupsSlice.reducer;
