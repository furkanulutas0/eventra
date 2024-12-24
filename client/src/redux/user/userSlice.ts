import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  message: null,
  expiresAt: null as number | null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.message = null;
      state.expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour
    },
    signInFailure: (state, action) => {
      state.message = action.payload;
    },
    signOutSuccess: (state) => {
      state.currentUser = null;
    },
    //diğer signout reducerları eklenecek
  },
});

export const { signInSuccess, signInFailure, signOutSuccess } = userSlice.actions;

export default userSlice.reducer;