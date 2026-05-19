import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "../features/auth/auth.slice";
import { apiSlice, catalogMediaApi } from "./apiSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [catalogMediaApi.reducerPath]: catalogMediaApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(apiSlice.middleware, catalogMediaApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
