import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createEmptyVault, downloadVault, openVault, sealVault } from "./crypto";
import { normalizeVault } from "./finance";
import { createSerialQueue, isRevisionCurrent } from "./saveCoordinator";

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
  const vaultRef = useRef(null);
  const fileNameRef = useRef("");
  const fileHandleRef = useRef(null);
  const revisionRef = useRef(0);
  const enqueueSaveRef = useRef(null);
  if (!enqueueSaveRef.current) enqueueSaveRef.current = createSerialQueue();

  const lock = useCallback(() => {
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = null;
    }

    vaultRef.current = null;
    revisionRef.current += 1;
    setVault(null);
    setFileName("");
    setDirty(false);
    setFileHandle(null);
    fileNameRef.current = "";
    fileHandleRef.current = null;
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

  useEffect(() => {
    if (!dirty) return undefined;
    const preventUnsavedExit = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventUnsavedExit);
    return () => window.removeEventListener("beforeunload", preventUnsavedExit);
  }, [dirty]);

  const createVault = useCallback(async (password) => {
    const data = createEmptyVault();
    const serialized = await sealVault(data, password);

    downloadVault(serialized, "financial-d3v.fdv");
    vaultRef.current = normalizeVault(data);
    setFileHandle(null);
    fileHandleRef.current = null;

    passwordRef.current = password;
    setVault(vaultRef.current);
    setFileName("financial-d3v.fdv");
    fileNameRef.current = "financial-d3v.fdv";
    revisionRef.current += 1;
    setDirty(false);
    return data;
  }, []);

  const unlockFile = useCallback(async (file, password, handle = null) => {
    const serialized = await readFile(file);
    const data = await openVault(serialized, password);
    const normalized = normalizeVault(data);
    vaultRef.current = normalized;
    passwordRef.current = password;
    setVault(normalized);
    setFileName(file.name || "financial-d3v.fdv");
    fileNameRef.current = file.name || "financial-d3v.fdv";
    setFileHandle(handle);
    fileHandleRef.current = handle;
    revisionRef.current += 1;
    setDirty(data.schemaVersion !== normalized.schemaVersion);
    return normalized;
  }, []);

  const updateVault = useCallback((updater) => {
    setVault((current) => {
      if (!current) return current;
      const next = typeof updater === "function" ? updater(current) : updater;
      const normalized = normalizeVault({ ...next, updatedAt: new Date().toISOString() });
      vaultRef.current = normalized;
      revisionRef.current += 1;
      return normalized;
    });
    setDirty(true);
  }, []);

  const saveVault = useCallback(() => enqueueSaveRef.current(async () => {
    const snapshot = vaultRef.current;
    const password = passwordRef.current;
    const handle = fileHandleRef.current;
    const fileNameSnapshot = fileNameRef.current;
    if (!snapshot) throw new Error("The Financial Vault is locked.");
    if (!password) throw new Error("The vault password is unavailable.");
    const saveRevision = revisionRef.current;
    const serialized = await sealVault({ ...snapshot, updatedAt: new Date().toISOString() }, password);
    if (handle && typeof handle.createWritable === "function") {
      const writable = await handle.createWritable();
      try {
        await writable.write(serialized);
        await writable.close();
      } catch (error) {
        try { await writable.abort(); } catch { /* preserve original error */ }
        throw error;
      }
    } else {
      downloadVault(serialized, fileNameSnapshot || "financial-d3v.fdv");
    }
    if (isRevisionCurrent(saveRevision, revisionRef.current)) setDirty(false);
    resetAutoLockTimer();
    return serialized;
  }), [resetAutoLockTimer]);

  const value = useMemo(() => ({
    vault,
    locked: !vault,
    fileName,
    saveMode: fileHandle && typeof fileHandle.createWritable === "function" ? "same-file" : "download",
    createVault,
    unlockFile,
    saveVault,
    updateVault,
    dirty,
    lock,
    autoLockMs: VAULT_AUTO_LOCK_MS,
  }), [createVault, dirty, fileHandle, fileName, lock, saveVault, unlockFile, updateVault, vault]);

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used inside VaultProvider.");
  return context;
}
