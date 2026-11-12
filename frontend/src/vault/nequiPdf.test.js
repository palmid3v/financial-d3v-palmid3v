import test from "node:test";
import assert from "node:assert/strict";
import { parseNequiAmount, parseNequiStatementText } from "./nequiPdf.js";

const sample = `Extracto de cuenta de ahorro de:
NEQUI S.A. Compañía de Financiamiento
Estado de cuenta para el período de: 2026/01/01 a 2026/01/31
Saldo anterior $674,163.48
Total abonos $3,034,951.04
Total cargos $3,217,077.44
Saldo actual $492,037.08
31/01/2026 Pago en FRANK MANUEL $-25,000.00 $492,037.08
30/01/2026 Dev Google Play Youtube D $100.00 $531,137.08`;

test("parses Nequi US-style currency amounts as COP decimals", () => {
  assert.equal(parseNequiAmount("$-25,000.00"), -25000);
  assert.equal(parseNequiAmount("$3,034,951.04"), 3034951.04);
});

test("extracts Nequi period, transactions, balances and summary without identity data", () => {
  const result = parseNequiStatementText(sample);
  assert.equal(result.period, "2026-01");
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].date, "2026-01-31");
  assert.equal(result.rows[0].amount, -25000);
  assert.equal(result.rows[0].balance, 492037.08);
  assert.equal(result.summary.openingBalance, 674163.48);
  assert.equal(result.summary.closingBalance, 492037.08);
});

test("rejects unrelated PDFs and does not silently accept OCR-only documents", () => {
  assert.throws(() => parseNequiStatementText("PDF sin texto"), /no coincide/i);
});
