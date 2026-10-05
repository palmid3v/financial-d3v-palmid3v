import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createEmptyVault, downloadVault, openVault, sealVault } from "./crypto";
import { normalizeVault } from "./finance";

const VaultContext = createContext(null);
export const VAULT_AUTO_LOCK_MS = 15 * 60 * 1000;

function readFile(file) {
  if (!file) throw new Error("Select a Financial Vault file.");
  return file.text();
}

export function VaultProvider({ children }) {
  const [vault, setVault] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dirty, setDirty] = useState(false);
  const passwordRef = useRef(null);
  const autoLockTimerRef = useRef(null);

  const lock = useCallback(() => {
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = null;
    }

    setVault(null);
    setFileName("");
    setDirty(false);
    passwordRef.current = null;
  }, []);

  const resetAutoLockTimer = useCallback(() => {
    if (!vault) return;

    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
    }

    autoLockTimerRef.current = setTimeout(() => {
      lock();
    }, VAULT_AUTO_LOCK_MS);
  }, [lock, vault]);

  useEffect(() => {
    if (!vault) return undefined;

    const events = ["pointerdown", "keydown", "touchstart", "mousemove", "scroll"];
    const handleActivity = () => resetAutoLockTimer();

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    resetAutoLockTimer();

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });

      if (autoLockTimerRef.current) {
        clearTimeout(autoLockTimerRef.current);
        autoLockTimerRef.current = null;
      }
    };
  }, [resetAutoLockTimer, vault]);

  const createVault = useCallback(async (password) => {
    const data = createEmptyVault();
    const serialized = await sealVault(data, password);

    downloadVault(serialized, "financial-d3v.fdv");

    passwordRef.current = password;
    setVault(normalizeVault(data));
    setFileName("financial-d3v.fdv");
    setDirty(false);
    return data;
  }, []);

  const unlockFile = useCallback(async (file, password) => {
    const serialized = await readFile(file);
    const data = await openVault(serialized, password);
    passwordRef.current = password;
    setVault(normalizeVault(data));
    setFileName(file.name || "financial-d3v.fdv");
    setDirty(false);
    return data;
  }, []);

  const updateVault = useCallback((updater) => {
    setVault((current) => {
      if (!current) return current;
      const next = typeof updater === "function" ? updater(current) : updater;
      return normalizeVault({ ...next, updatedAt: new Date().toISOString() });
    });
    setDirty(true);
  }, []);

  const saveVault = useCallback(async (nextVault = vault) => {
    if (!nextVault) throw new Error("The Financial Vault is locked.");
    if (!passwordRef.current) throw new Error("The vault password is unavailable.");

    const serialized = await sealVault(
      { ...nextVault, updatedAt: new Date().toISOString() },
      passwordRef.current,
    );
    downloadVault(serialized, fileName || "financial-d3v.fdv");
    setDirty(false);
    resetAutoLockTimer();
    return serialized;
  }, [fileName, resetAutoLockTimer, vault]);

  const value = useMemo(() => ({
    vault,
    locked: !vault,
    fileName,
    createVault,
    unlockFile,
    saveVault,
    updateVault,
    dirty,
    lock,
    autoLockMs: VAULT_AUTO_LOCK_MS,
  }), [createVault, dirty, fileName, lock, saveVault, unlockFile, updateVault, vault]);

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used inside VaultProvider.");
  return context;
}
