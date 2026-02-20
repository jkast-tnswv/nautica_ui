import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export interface EntityState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
}

interface EntitySliceConfig<T, FetchArg, CreateArg> {
  name: string;
  fetch?: {
    type: string;
    fn: (arg: FetchArg) => Promise<T[]>;
  };
  create?: {
    type: string;
    fn: (arg: CreateArg) => Promise<T>;
  };
}

export function createEntitySlice<
  T,
  FetchArg = void,
  CreateArg = void,
>(config: EntitySliceConfig<T, FetchArg, CreateArg>) {
  const initialState: EntityState<T> = {
    items: [],
    loading: false,
    error: null,
  };

  const fetchThunk = config.fetch
    ? createAsyncThunk(config.fetch.type, config.fetch.fn)
    : undefined;

  const createThunk = config.create
    ? createAsyncThunk(config.create.type, config.create.fn)
    : undefined;

  const slice = createSlice({
    name: config.name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      if (fetchThunk) {
        builder
          .addCase(fetchThunk.pending, (state) => {
            // Only show loading spinner on first load
            state.loading = state.items.length === 0;
          })
          .addCase(fetchThunk.fulfilled, (state, action: PayloadAction<T[]>) => {
            state.items = (action.payload || []) as any;
            state.loading = false;
            state.error = null;
          })
          .addCase(fetchThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? `Failed to load ${config.name}`;
          });
      }

      if (createThunk) {
        builder
          .addCase(createThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(createThunk.fulfilled, (state, action: PayloadAction<T>) => {
            state.items.push(action.payload as any);
            state.loading = false;
            state.error = null;
          })
          .addCase(createThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? `Failed to create ${config.name}`;
          });
      }
    },
  });

  return {
    reducer: slice.reducer,
    actions: slice.actions,
    ...(fetchThunk ? { fetchThunk } : {}),
    ...(createThunk ? { createThunk } : {}),
  } as {
    reducer: typeof slice.reducer;
    actions: typeof slice.actions;
  } & (typeof fetchThunk extends undefined ? {} : { fetchThunk: NonNullable<typeof fetchThunk> })
    & (typeof createThunk extends undefined ? {} : { createThunk: NonNullable<typeof createThunk> });
}
