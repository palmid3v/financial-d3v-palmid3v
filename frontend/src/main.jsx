import React from "react";
import ReactDOM from "react-dom/client";
import VaultGate from "./vault/VaultGate.jsx";
import { VaultProvider } from "./vault/VaultContext.jsx";
import "./index.css";

const vaultEnabled = (import.meta.env.VITE_FINANCIAL_VAULT_ENABLED || "true") === "true";

function Root() {
  if (vaultEnabled) {
    return <VaultProvider><VaultGate /></VaultProvider>;
  }

  return <VaultProvider><VaultGate /></VaultProvider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
);
