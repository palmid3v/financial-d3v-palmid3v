import { useRef, useState } from "react";
import App from "../App.jsx";
import { useVault } from "./VaultContext";

function Field({ label, ...props }) {
  return <label className="field"><span>{label}</span><input {...props} /></label>;
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
        if (!file) throw new Error("Select your Financial Vault file.");
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

  const chooseVaultFile = async () => {
    setError("");
    if (typeof window.showOpenFilePicker !== "function") {
      fileRef.current?.click();
      return;
    }
    try {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [{ description: "Financial-D3v encrypted vault", accept: { "application/json": [".fdv", ".json"] } }],
      });
      const file = await handle.getFile();
      setFileHandle(handle);
      setSelectedFile(file);
      setSelectedFileName(file.name);
    } catch (err) {
      if (err?.name !== "AbortError") setError("No se pudo seleccionar el archivo. Puedes usar el selector tradicional.");
    }
  };

  return <main className="vault-gate">
    <section className="vault-card">
      <div className="vault-brand"><b>F</b><div><strong>Financial-D3v</strong><small>Private finance</small></div></div>
      <div className="panel-head">
        <div><small>FINANCIAL-D3V · PRIVATE VAULT</small><h2>🔒 Your financial workspace is locked</h2></div>
      </div>
      <p>Your financial data is opened only after you provide the encrypted vault file and its password. The decrypted workspace stays in memory.</p>
      <div className="actions vault-tabs">
        <button type="button" className={mode === "open" ? "active" : ""} onClick={() => { setMode("open"); setError(""); }}>Open vault</button>
        <button type="button" className={mode === "create" ? "active" : ""} onClick={() => { setMode("create"); setError(""); setSelectedFile(null); setSelectedFileName(""); setFileHandle(null); }}>Create vault</button>
      </div>
      <form onSubmit={submit} className="form-grid">
        {mode === "open" && <div className="field"><span>Archivo de bóveda cifrada</span><button className="button" type="button" onClick={chooseVaultFile}>Elegir archivo .fdv</button><input ref={fileRef} type="file" required onChange={(event) => { const file = event.target.files?.[0] || null; setFileHandle(null); setSelectedFile(file); setSelectedFileName(file?.name || ""); }} /><small>{selectedFileName || "En el teléfono, abre Archivos/Descargas y selecciona tu bóveda .fdv. Si no aparece, cambia el filtro del selector a todos los archivos."}</small><small>Se permite elegir el archivo sin filtro de extensión porque algunos selectores móviles ocultan archivos .fdv. La aplicación intentará validarlo al desbloquear.</small></div>}
        <Field label="Vault password" type="password" autoComplete={mode === "create" ? "new-password" : "current-password"} required value={password} onChange={(event) => setPassword(event.target.value)} />
        {mode === "create" && <Field label="Confirm password" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} />}
        {error && <div className="notice error"><b>Vault unavailable.</b><span>{error}</span></div>}
        <div className="form-actions"><button className="button primary" disabled={busy} type="submit">{busy ? "Working…" : mode === "create" ? "Create encrypted vault" : "Unlock vault"}</button></div>
      </form>
      <div className="notice"><b>Privacy boundary</b><span>No plaintext financial data is intentionally persisted by this application.</span><span>The encrypted .fdv file is the persistence boundary.</span></div>
    </section>
  </main>;
}
