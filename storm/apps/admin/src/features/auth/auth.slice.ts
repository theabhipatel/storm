import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { PublicUser } from "./auth.types";

export interface AuthState {
  currentUser: PublicUser | null;
  bootstrapped: boolean;
}

const initialState: AuthState = {
  currentUser: null,
  bootstrapped: false,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<PublicUser | null>) {
      state.currentUser = action.payload;
    },
    setBootstrapped(state, action: PayloadAction<boolean>) {
      state.bootstrapped = action.payload;
    },
  },
});

export const { setCurrentUser, setBootstrapped } = slice.actions;
export const authReducer = slice.reducer;
