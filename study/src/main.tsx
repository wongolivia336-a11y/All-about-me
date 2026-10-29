import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GlobalLoadingProvider } from "./ui/loading/LoadingManager";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalLoadingProvider>
      <App />
    </GlobalLoadingProvider>
  </StrictMode>,
);
