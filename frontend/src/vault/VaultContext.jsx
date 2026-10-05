import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createEmptyVault, downloadVault, openVault, sealVault } from "./crypto";

const VaultContext = createContext(null);

function readFile(file) {
  if (!file) throw new Error("Select a Financial Vault file.");
  return file.text();
}

export function VaultProvider({ children }) {
  const [vault, setVault] = useState(null);
  const [fileName, setFileName] = useState("");
  const passwordRef = useRef(null);

  const lock = useCallback(() => {
    setVault(null);
    setFileName("");
    passwordRef.current = null;
  }, []);

  const createVault = useCallback(async (password) => {
    const data = createEmptyVault();
    const serialized = await sealVault(data, password);

    // Creating a vault establishes the encrypted file as the persistence boundary.
    downloadVault(serialized, "financial-d3v.fdv");

    passwordRef.current = password;
    setVault(data);
    setFileName("financial-d3v.fdv");
    return data;
  }, []);

  const unlockFile = useCallback(async (file, password) => {
    const serialized = await readFile(file);
    const data = await openVault(serialized, password);
    passwordRef.current = password;
    setVault(data);
    setFileName(file.name || "financial-d3v.fdv");
    return data;
  }, []);

  const saveVault = useCallback(async (nextVault = vault) => {
    if (!nextVault) throw new Error("The Financial Vault is locked.");
    if (!passwordRef.current) throw new Error("The vault password is unavailable.");

    const serialized = await sealVault(
      { ...nextVault, updatedAt: new Date().toISOString() },
      passwordRef.current,
    );
    downloadVault(serialized, fileName || "financial-d3v.fdv");
    return serialized;
  }, [fileName, vault]);

  const value = useMemo(() => ({
    vault,
    locked: !vault,
    fileName,
    createVault,
    unlockFile,
    saveVault,
    lock,
  }), [createVault, fileName, lock, saveVault, unlockFile, vault]);

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used inside VaultProvider.");
  return context;
}
