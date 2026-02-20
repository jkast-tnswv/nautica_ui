import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CaptainUser } from '@core/gen/captain/api/captain_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { CaptainCreateUserRequest } from '@core/gen/captain/api/captain_pb';
import { getServices } from '@core/services';

interface CaptainUsersState {
  items: CaptainUser[];
  loading: boolean;
  error: string | null;
}

const initialState: CaptainUsersState = {
  items: [],
  loading: false,
  error: null,
};

export const createCaptainUser = createAsyncThunk(
  'captainUsers/create',
  async (data: PartialMessage<CaptainCreateUserRequest>) => {
    return await getServices().captain.createUser(data);
  }
);

const captainUsersSlice = createSlice({
  name: 'captainUsers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCaptainUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCaptainUser.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createCaptainUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to create user';
      });
  },
});

export default captainUsersSlice.reducer;
