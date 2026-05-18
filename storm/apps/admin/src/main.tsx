import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import { AuthBootstrap } from "./components/AuthBootstrap";
import { store } from "./store";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("root element missing");

createRoot(rootEl).render(
  <StrictMode>
    <Provider store={store}>
      <AuthBootstrap />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
