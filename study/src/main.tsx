import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GlobalLoadingProvider } from "./ui/loading/LoadingManager";
import { LanguageProvider } from "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <GlobalLoadingProvider onReturnToIndex={() => {
        window.location.hash = "#index/build";
      }}>
        <App />
      </GlobalLoadingProvider>
    </LanguageProvider>
  </StrictMode>,
);
