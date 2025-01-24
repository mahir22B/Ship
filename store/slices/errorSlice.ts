// store/slices/errorSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const submitError = createAsyncThunk(
  'error/submitError',
  async (errorMessage: string) => {
    // Here you would typically make an API call to submit the error
    // For now, let's just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return errorMessage;
  }
);

interface ErrorState {
  submitting: boolean;
  lastSubmittedError: string | null;
  error: string | null;
}

const initialState: ErrorState = {
  submitting: false,
  lastSubmittedError: null,
  error: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitError.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitError.fulfilled, (state, action) => {
        state.submitting = false;
        state.lastSubmittedError = action.payload;
        state.error = null;
      })
      .addCase(submitError.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || 'Failed to submit error';
      });
  },
});

export default errorSlice.reducer;