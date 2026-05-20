"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { AuthBootstrap } from "../components/domain/AuthBootstrap";
import { CartMergeOnLogin } from "../features/cart/CartMergeOnLogin";
import { store } from "./index";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap />
      <CartMergeOnLogin />
      {children}
    </Provider>
  );
}
