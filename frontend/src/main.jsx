import React from "react";
import ReactDOM from "react-dom/client";
import AuthGate from "./AuthGate.jsx";
import VaultGate from "./vault/VaultGate.jsx";
import { VaultProvider } from "./vault/VaultContext.jsx";
import "./index.css";

const vaultEnabled = (import.meta.env.VITE_FINANCIAL_VAULT_ENABLED || "false") === "true";

function Root() {
  if (vaultEnabled) {
    return <VaultProvider><VaultGate /></VaultProvider>;
  }

  return <AuthGate><div className="legacy-shell">Legacy API mode is disabled for the Financial Vault build.</div></AuthGate>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
);
