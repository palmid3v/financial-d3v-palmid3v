import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";

if (!globalThis.crypto) globalThis.crypto = webcrypto;
import { createEmptyVault, openVault, sealVault } from "./crypto.js";

const password = "correct-horse-battery-staple";
const sampleVault = {
  ...createEmptyVault(),
  accounts: [{ id: "account-1", name: "Checking", currency: "COP" }],
  transactions: [{ id: "tx-1", minorUnits: 125000, currency: "COP" }],
  savingsProducts: [{ id: "product-1", goalId: "goal-home", name: "Nevera LG", url: "https://www.exito.com/producto", priceMinorUnits: 336500000, currency: "COP", imageDataUrl: "data:image/png;base64,c2FtcGxlLWltYWdl" }],
};

test("Financial Vault round trip preserves domain data", async () => {
  const serialized = await sealVault(sampleVault, password);
  const opened = await openVault(serialized, password);

  assert.deepEqual(opened, sampleVault);
  assert.equal(serialized.includes("Nevera LG"), false);
  assert.equal(serialized.includes("c2FtcGxlLWltYWdl"), false);
});

test("Schema 1 Financial Vault remains decryptable for the additive Payroll migration", async () => {
  const legacy = { schemaVersion: 1, accounts: [{ id: "legacy-account" }], transactions: [], unknownLegacyData: { keep: true } };
  const serialized = await sealVault(legacy, password);
  const opened = await openVault(serialized, password);
  assert.deepEqual(opened, legacy);
});

test("Financial Vault rejects an incorrect password", async () => {
  const serialized = await sealVault(sampleVault, password);

  await assert.rejects(
    () => openVault(serialized, "wrong-password"),
    /Unable to open the Financial Vault/,
  );
});

test("Financial Vault rejects modified ciphertext", async () => {
  const serialized = await sealVault(sampleVault, password);
  const envelope = JSON.parse(serialized);
  const payload = envelope.payload.split("");
  const index = Math.floor(payload.length / 2);
  payload[index] = payload[index] === "A" ? "B" : "A";
  envelope.payload = payload.join("");

  await assert.rejects(
    () => openVault(JSON.stringify(envelope), password),
    /Unable to open the Financial Vault/,
  );
});

test("Financial Vault rejects unsupported versions", async () => {
  const serialized = await sealVault(sampleVault, password);
  const envelope = JSON.parse(serialized);
  envelope.version = 99;

  await assert.rejects(
    () => openVault(JSON.stringify(envelope), password),
    /Unsupported or invalid Financial Vault format/,
  );
});

test("Financial Vault rejects malformed input", async () => {
  await assert.rejects(
    () => openVault("{not-json", password),
    /selected file is not a valid Financial Vault/,
  );
});
