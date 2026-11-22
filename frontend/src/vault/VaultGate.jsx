import { useRef, useState } from "react";
import App from "../App.jsx";
import { useVault } from "./VaultContext";

function Field({ label, ...props }) {
  return <label className="field vault-field"><span>{label}</span><input {...props} /></label>;
}

export default function VaultGate() {
  const { locked, createVault, unlockFile } = useVault();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mode, setMode] = useState("open");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileHandle, setFileHandle] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  if (!locked) return <App />;

  const acceptFile = (file, handle = null) => {
    setFileHandle(handle);
    setSelectedFile(file || null);
    setSelectedFileName(file?.name || "");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (!password) throw new Error("Enter the vault password.");

      if (mode === "create") {
        if (password !== confirm) throw new Error("Passwords do not match.");
        await createVault(password);
      } else {
        const file = selectedFile || fileRef.current?.files?.[0];
        if (!file) throw new Error("Choose your encrypted .fdv vault file first.");
        await unlockFile(file, password, fileHandle);
      }

      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || "Unable to open the Financial Vault.");
    } finally {
      setBusy(false);
    }
  };

  const chooseWithNativePicker = () => {
    setError("");
    fileRef.current?.click();
  };

  const chooseWithSystemPicker = async () => {
    setError("");
    if (typeof window.showOpenFilePicker !== "function") {
      chooseWithNativePicker();
      return;
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        excludeAcceptAllOption: false,
        types: [{
          description: "Financial-D3v encrypted vault",
          accept: { "application/json": [".fdv", ".json"] },
        }],
      });
      const file = await handle.getFile();
      acceptFile(file, handle);
    } catch (err) {
      if (err?.name === "AbortError") return;
      // Keep the second route available if a browser exposes but cannot use the File System Access API.
      chooseWithNativePicker();
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    if (nextMode === "create") {
      acceptFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <main className="vault-gate">
      <section className="vault-card" aria-labelledby="vault-title">
        <header className="vault-brand">
          <b aria-hidden="true">F</b>
          <div><strong>Financial-D3v</strong><small>PRIVATE FINANCE · PERSONAL VAULT</small></div>
          <span className="vault-secure-pill"><i /> ENCRYPTED</span>
        </header>

        <div className="vault-intro">
          <span className="vault-eyebrow">YOUR PRIVATE FINANCIAL SPACE</span>
          <h1 id="vault-title">{mode === "create" ? "Create your vault." : "Your money. Your privacy."}</h1>
          <p>{mode === "create"
            ? "Set a strong password to create your encrypted financial workspace."
            : "Unlock your workspace securely. Your decrypted financial data stays in memory."}</p>
        </div>

        <div className="vault-tabs" role="tablist" aria-label="Vault action">
          <button type="button" role="tab" aria-selected={mode === "open"} className={mode === "open" ? "active" : ""} onClick={() => switchMode("open")}>Open vault</button>
          <button type="button" role="tab" aria-selected={mode === "create"} className={mode === "create" ? "active" : ""} onClick={() => switchMode("create")}>Create vault</button>
        </div>

        <form onSubmit={submit} className="vault-form">
          {mode === "open" && (
            <section className="vault-file-section" aria-labelledby="vault-file-label">
              <div className="vault-section-heading">
                <span className="vault-step">01</span>
                <div><label id="vault-file-label">Encrypted vault file</label><small>Select the .fdv file stored on your device</small></div>
              </div>

              <div className="vault-picker-actions">
                <button className="vault-picker-primary" type="button" onClick={chooseWithNativePicker}>
                  <span aria-hidden="true">↥</span><span>Browse device</span>
                </button>
                <button className="vault-picker-secondary" type="button" onClick={chooseWithSystemPicker}>
                  <span aria-hidden="true">▤</span><span>System file picker</span>
                </button>
              </div>
              <input
                ref={fileRef}
                className="vault-file-input"
                type="file"
                tabIndex={-1}
                aria-label="Choose encrypted Financial-D3v vault file"
                onChange={(event) => acceptFile(event.target.files?.[0] || null)}
              />
              <div className={selectedFileName ? "vault-selected-file is-selected" : "vault-selected-file"}>
                <span className="vault-file-icon" aria-hidden="true">▧</span>
                <span>{selectedFileName || "No vault selected yet"}</span>
                {selectedFileName && <b>READY</b>}
              </div>
              <p className="vault-picker-hint">Both options work with desktop and mobile browsers. If your phone hides .fdv files, choose “All files” in the device picker.</p>
            </section>
          )}

          <div className="vault-password-section">
            <div className="vault-section-heading">
              <span className="vault-step">{mode === "create" ? "01" : "02"}</span>
              <div><label htmlFor="vault-password">Vault password</label><small>{mode === "create" ? "Protect your new encrypted vault" : "Enter the password used to encrypt this vault"}</small></div>
            </div>
            <input
              id="vault-password"
              className="vault-password-input"
              type="password"
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {mode === "create" && (
            <Field label="Confirm password" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          )}

          {error && <div className="vault-error" role="alert"><b>Unable to continue</b><span>{error}</span></div>}

          <button className="vault-submit" disabled={busy} type="submit">
            {busy ? "Please wait…" : mode === "create" ? "Create encrypted vault" : "Unlock my vault"}
            {!busy && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <footer className="vault-privacy">
          <span className="vault-privacy-icon" aria-hidden="true">◈</span>
          <div><strong>Privacy is the foundation.</strong><p>No plaintext financial data is intentionally persisted by this application. Your encrypted .fdv file is the persistence boundary.</p></div>
        </footer>
      </section>
      <p className="vault-page-caption">FINANCIAL-D3V <span>·</span> PRIVATE BY DESIGN</p>
    </main>
  );
}
