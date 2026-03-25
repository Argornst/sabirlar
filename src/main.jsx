import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppProviders from "./app/providers/AppProviders";
import AppRouter from "./app/router";
import "./app/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </BrowserRouter>
);