import { useRef, useState } from "react";
import { useVault } from "./VaultContext";

function Field({ label, ...props }) {
  return <label className="field"><span>{label}</span><input {...props}/></label>;
}

function VaultWorkspace({ fileName, vault, saveVault, lock }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setBusy(true);
    setError("");

    try {
      await saveVault();
    } catch (err) {
      setError(err.message || "Unable to save the Financial Vault.");
    } finally {
      setBusy(false);
    }
  };

  const counts = Object.entries(vault || {})
    .filter(([key, value]) => key !== "schemaVersion" && key !== "createdAt" && key !== "updatedAt" && Array.isArray(value))
    .map(([key, value]) => [key, value.length]);

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}>
      <section className="panel" style={{width:"min(720px,100%)"}}>
        <div className="panel-head">
          <div>
            <small>Financial-D3v · Private Vault</small>
            <h2>🔓 Financial Vault unlocked</h2>
          </div>
        </div>

        <p>
          The encrypted vault is the persistence boundary. Financial data is
          currently available only in active application memory.
        </p>

        <div className="notice">
          <b>Vault file</b>
          <span>{fileName || "financial-d3v.fdv"}</span>
        </div>

        <div className="metrics" style={{marginTop:20}}>
          <article className="metric">
            <div><small>Vault schema</small><span>◇</span></div>
            <strong>FDV1</strong>
            <em>Version {vault?.schemaVersion || 1}</em>
          </article>
          <article className="metric">
            <div><small>Financial collections</small><span>▣</span></div>
            <strong>{counts.length}</strong>
            <em>Prepared for migration</em>
          </article>
          <article className="metric">
            <div><small>Stored records</small><span>≋</span></div>
            <strong>{counts.reduce((sum, [, count]) => sum + count, 0)}</strong>
            <em>Currently in memory</em>
          </article>
        </div>

        {error && (
          <div className="notice error" style={{marginTop:20}}>
            <b>Vault save failed.</b>
            <span>{error}</span>
          </div>
        )}

        <div className="notice" style={{marginTop:20}}>
          <b>FASE 27 boundary</b>
          <span>Legacy API-backed financial screens are intentionally not mounted during this Vault validation.</span>
          <span>FASE 28 will migrate the product modules to this in-memory Financial Vault.</span>
        </div>

        <div className="form-actions" style={{marginTop:20}}>
          <button className="button primary" disabled={busy} onClick={handleSave}>
            {busy ? "Saving…" : "Save encrypted vault"}
          </button>
          <button className="button" disabled={busy} onClick={lock}>Lock vault</button>
        </div>
      </section>
    </main>
  );
}

export default function VaultGate() {
  const { locked, fileName, vault, createVault, unlockFile, saveVault, lock } = useVault();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mode, setMode] = useState("open");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  if (!locked) {
    return <VaultWorkspace fileName={fileName} vault={vault} saveVault={saveVault} lock={lock} />;
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
        <button type="button" className={mode === "open" ? "active" : ""} onClick={() => { setMode("open"); setError(""); }}>Open vault</button>
        <button type="button" className={mode === "create" ? "active" : ""} onClick={() => { setMode("create"); setError(""); }}>Create vault</button>
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
