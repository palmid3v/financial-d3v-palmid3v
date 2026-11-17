import React from "react";
import ReactDOM from "react-dom/client";
import VaultGate from "./vault/VaultGate.jsx";
import PWAUpdatePrompt from "./PWAUpdatePrompt.jsx";
import { VaultProvider } from "./vault/VaultContext.jsx";
import "./index.css";

function Root() {
  return <VaultProvider><><VaultGate /><PWAUpdatePrompt /></></VaultProvider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
);
