import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AuthGate from "./AuthGate.jsx";
import VaultGate from "./vault/VaultGate.jsx";
import { VaultProvider } from "./vault/VaultContext.jsx";
import "./index.css";

const vaultEnabled = (import.meta.env.VITE_FINANCIAL_VAULT_ENABLED || "false") === "true";

function Root() {
  const app = <AuthGate><App /></AuthGate>;
  if (!vaultEnabled) return app;
  return <VaultProvider><VaultGate>{app}</VaultGate></VaultProvider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
);
