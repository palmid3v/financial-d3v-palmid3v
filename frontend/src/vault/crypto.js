const FORMAT = "FDV1";
const VERSION = 1;
const KDF_ITERATIONS = 600000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BITS = 256;
const TAG_BITS = 128;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function assertCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API is unavailable. Use a secure browser context.");
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function metadataForAad(envelope) {
  return JSON.stringify({
    format: envelope.format,
    version: envelope.version,
    kdf: envelope.kdf,
    cipher: {
      name: envelope.cipher.name,
      keyBits: envelope.cipher.keyBits,
      tagBits: envelope.cipher.tagBits,
    },
  });
}

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: KDF_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: KEY_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}

function validateEnvelope(envelope) {
  if (!envelope || envelope.format !== FORMAT || envelope.version !== VERSION) {
    throw new Error("Unsupported or invalid Financial Vault format.");
  }

  if (
    envelope.kdf?.name !== "PBKDF2" ||
    envelope.kdf?.hash !== "SHA-256" ||
    envelope.kdf?.iterations !== KDF_ITERATIONS
  ) {
    throw new Error("Unsupported Financial Vault key-derivation parameters.");
  }

  if (
    envelope.cipher?.name !== "AES-GCM" ||
    envelope.cipher?.keyBits !== KEY_BITS ||
    envelope.cipher?.tagBits !== TAG_BITS
  ) {
    throw new Error("Unsupported Financial Vault cipher parameters.");
  }

  if (!envelope.kdf.salt || !envelope.cipher.iv || !envelope.payload) {
    throw new Error("Financial Vault is incomplete.");
  }
}

export function createEmptyVault() {
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accounts: [],
    categories: [],
    transactions: [],
    budgets: [],
    savingsGoals: [],
    savingsContributions: [],
    debts: [],
    debtPayments: [],
    assets: [],
    liabilities: [],
    education: [],
  };
}

export async function sealVault(data, password) {
  assertCrypto();

  if (!password) throw new Error("A vault password is required.");
  if (data === undefined) throw new Error("Vault data is required.");

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

  const envelope = {
    format: FORMAT,
    version: VERSION,
    kdf: {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: KDF_ITERATIONS,
      salt: bytesToBase64(salt),
    },
    cipher: {
      name: "AES-GCM",
      keyBits: KEY_BITS,
      iv: bytesToBase64(iv),
      tagBits: TAG_BITS,
    },
    payload: "",
  };

  const key = await deriveKey(password, salt);
  const plaintext = encoder.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: TAG_BITS,
      additionalData: encoder.encode(metadataForAad(envelope)),
    },
    key,
    plaintext,
  );

  envelope.payload = bytesToBase64(new Uint8Array(ciphertext));
  return JSON.stringify(envelope, null, 2);
}

export async function openVault(serializedVault, password) {
  assertCrypto();

  if (!password) throw new Error("A vault password is required.");

  let envelope;
  try {
    envelope = JSON.parse(serializedVault);
  } catch {
    throw new Error("The selected file is not a valid Financial Vault.");
  }

  validateEnvelope(envelope);

  const salt = base64ToBytes(envelope.kdf.salt);
  const iv = base64ToBytes(envelope.cipher.iv);
  const ciphertext = base64ToBytes(envelope.payload);
  const key = await deriveKey(password, salt);

  try {
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: envelope.cipher.tagBits,
        additionalData: encoder.encode(metadataForAad(envelope)),
      },
      key,
      ciphertext,
    );

    const data = JSON.parse(decoder.decode(plaintext));

    if (!data || typeof data !== "object" || data.schemaVersion !== 1) {
      throw new Error("Financial Vault payload schema is invalid.");
    }

    return data;
  } catch {
    throw new Error("Unable to open the Financial Vault. Check the password or file integrity.");
  }
}

export function downloadVault(serializedVault, filename = "financial-d3v.fdv") {
  const blob = new Blob([serializedVault], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export { FORMAT, VERSION, KDF_ITERATIONS };
