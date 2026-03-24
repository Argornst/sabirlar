import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppProviders from "./app/providers/AppProviders";
import AppRouter from "./app/router";
import AppErrorBoundary from "./shared/components/system/AppErrorBoundary";
import AppBootstrapGuard from "./shared/components/system/AppBootstrapGuard";
import "./app/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <AppBootstrapGuard>
            <AppRouter />
          </AppBootstrapGuard>
        </AppProviders>
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>
);