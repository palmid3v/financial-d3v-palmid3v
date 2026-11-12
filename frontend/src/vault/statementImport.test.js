import test from "node:test";
import assert from "node:assert/strict";
import { parseStatementCsv, reconcileStatementRows, statementFingerprint } from "./statementImport.js";

test("parses Nequi-style CSV values, dates and running balances", () => {
  const result = parseStatementCsv([
    "Fecha del movimiento,Descripción,Valor,Saldo",
    "31/01/2026,Pago en FRANK MANUEL,-25000.00,492037.08",
    "30/01/2026,Dev Google Play Youtube D,100.00,531137.08",
  ].join("\n"));
  assert.equal(result.invalid.length, 0);
  assert.equal(result.rows[0].date, "2026-01-31");
  assert.equal(result.rows[0].amount, -25000);
  assert.equal(result.rows[0].balance, 49203708);
});

test("supports semicolon-delimited files and decimal comma", () => {
  const result = parseStatementCsv([
    "Fecha;Descripción;Valor;Saldo",
    "31/01/2026;Compra; -25.000,50 ; 492.037,08",
  ].join("\n"));
  assert.equal(result.invalid.length, 0);
  assert.equal(result.rows[0].amount, -25000.5);
});

test("flags exact previously imported rows without silently importing them twice", () => {
  const row = { date: "2026-01-31", description: "Pago FRANK", amount: -25000, balance: 49203708 };
  const fingerprint = statementFingerprint("nequi-1", row);
  const result = reconcileStatementRows([row], "nequi-1", [{ importFingerprint: fingerprint }]);
  assert.equal(result[0].exactDuplicate, true);
  assert.equal(result[0].selected, false);
});

test("requires recognizable date, description and amount columns", () => {
  assert.throws(() => parseStatementCsv("Nombre,Total\nA,10"), /No se reconocieron las columnas/);
});
