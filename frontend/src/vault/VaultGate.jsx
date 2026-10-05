import { useRef, useState } from "react";
import { useVault } from "./VaultContext";

function Field({ label, ...props }) {
  return <label className="field"><span>{label}</span><input {...props}/></label>;
}

export default function VaultGate({ children }) {
  const { locked, fileName, createVault, unlockFile, saveVault, lock } = useVault();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mode, setMode] = useState("open");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  if (!locked) {
    return <div className="vault-session">
      <div className="vault-session-bar">
        <span>🔓 {fileName || "Financial Vault"}</span>
        <div>
          <button className="button" onClick={() => saveVault()}>Save encrypted vault</button>
          <button className="button" onClick={lock}>Lock</button>
        </div>
      </div>
      {children}
    </div>;
  }

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
        const file = fileRef.current?.files?.[0];
        if (!file) throw new Error("Select your Financial Vault file.");
        await unlockFile(file, password);
      }

      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || "Unable to open the Financial Vault.");
    } finally {
      setBusy(false);
    }
  };

  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}>
    <section className="panel" style={{width:"min(520px,100%)"}}>
      <div className="panel-head">
        <div>
          <small>Financial-D3v · Private Vault</small>
          <h2>🔒 Your financial workspace is locked</h2>
        </div>
      </div>

      <p>
        Your financial data is opened only after you provide the encrypted vault
        file and its password. The decrypted workspace stays in memory.
      </p>

      <div className="actions" style={{marginBottom:20}}>
        <button className={mode === "open" ? "active" : ""} onClick={() => setMode("open")}>Open vault</button>
        <button className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}>Create vault</button>
      </div>

      <form onSubmit={submit} className="form-grid">
        {mode === "open" && <label className="field">
          <span>Encrypted vault file</span>
          <input ref={fileRef} type="file" accept=".fdv,application/json" required />
        </label>}

        <Field
          label="Vault password"
          type="password"
          autoComplete={mode === "create" ? "new-password" : "current-password"}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {mode === "create" && <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />}

        {error && <div className="notice error"><b>Vault unavailable.</b><span>{error}</span></div>}

        <div className="form-actions">
          <button className="button primary" disabled={busy} type="submit">
            {busy ? "Working…" : mode === "create" ? "Create encrypted vault" : "Unlock vault"}
          </button>
        </div>
      </form>

      <div className="notice">
        <b>Privacy boundary</b>
        <span>No plaintext financial data is intentionally persisted by this gate.</span>
        <span>Keep a secure backup of your encrypted vault file. If the password is lost, the vault cannot be recovered by the application.</span>
      </div>
    </section>
  </main>;
}
