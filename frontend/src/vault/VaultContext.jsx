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
  const [fileHandle, setFileHandle] = useState(null);
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
    setFileHandle(null);
    passwordRef.current = null;
  }, []);

  const resetAutoLockTimer = useCallback(() => {
    if (!vault) return;

    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
    }

    autoLockTimerRef.current = setTimeout(() => {
      // Never discard unsaved work silently. Defer auto-lock while dirty.
      if (dirty) {
        autoLockTimerRef.current = setTimeout(() => resetAutoLockTimer(), 60 * 1000);
        return;
      }
      lock();
    }, VAULT_AUTO_LOCK_MS);
  }, [dirty, lock, vault]);

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
    setFileHandle(null);

    passwordRef.current = password;
    setVault(normalizeVault(data));
    setFileName("financial-d3v.fdv");
    setDirty(false);
    return data;
  }, []);

  const unlockFile = useCallback(async (file, password, handle = null) => {
    const serialized = await readFile(file);
    const data = await openVault(serialized, password);
    passwordRef.current = password;
    setVault(normalizeVault(data));
    setFileName(file.name || "financial-d3v.fdv");
    setFileHandle(handle);
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
    if (fileHandle && typeof fileHandle.createWritable === "function") {
      const writable = await fileHandle.createWritable();
      try {
        await writable.write(serialized);
        await writable.close();
      } catch (error) {
        try { await writable.abort(); } catch { /* preserve original error */ }
        throw error;
      }
    } else {
      downloadVault(serialized, fileName || "financial-d3v.fdv");
    }
    setDirty(false);
    resetAutoLockTimer();
    return serialized;
  }, [fileHandle, fileName, resetAutoLockTimer, vault]);

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
