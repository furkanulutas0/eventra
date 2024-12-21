import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUrl: null,
};

const startPointSlice = createSlice({
  name: 'startPoint',
  initialState,
  reducers: {
    setCurrentUrl: (state, action) => {
      state.currentUrl = action.payload;
    },
    clearCurrentUrl: (state) => {
      state.currentUrl = null;
    },
  },
});

export const { setCurrentUrl, clearCurrentUrl } = startPointSlice.actions;
export default startPointSlice.reducer;