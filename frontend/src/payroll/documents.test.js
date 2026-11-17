import test from "node:test";
import assert from "node:assert/strict";
import { extractContractFields, extractEmploymentDocument, extractPayslipFields, MAX_DOCX_XML_BYTES, MAX_EMPLOYMENT_DOCUMENT_BYTES, readStreamLimited } from "./documents.js";

test("Local contract extraction returns evidence-backed suggestions that require confirmation", () => {
  const fields = extractContractFields([
    "Trabajador: Ana Torres",
    "Empresa: Ejemplo SAS",
    "Salario básico mensual: $ 2.500.000",
    "Auxilio de transporte: $ 200.000",
    "Fecha de ingreso: 2026-01-15",
    "Pago quincenal",
    "Jornada semanal: 42 horas",
    "Contrato a término indefinido",
  ].join("\n"));
  assert.equal(fields.employeeName.value, "Ana Torres");
  assert.equal(fields.salaryCOP.value, "2.500.000");
  assert.equal(fields.transportAllowanceCOP.value, "200.000");
  assert.equal(fields.employerName.value, "Ejemplo SAS");
  assert.equal(fields.startDate.value, "2026-01-15");
  assert.equal(fields.payFrequency.value, "biweekly");
  assert.equal(fields.weeklyHours.value, "42");
  assert.equal(fields.contractType.value, "indefinite");
  for (const field of Object.values(fields)) {
    assert.equal(field.confirmed, false);
    assert.equal(field.validationStatus, "needs-user-review");
    assert.ok(field.source?.line > 0);
  }
});

test("Manual text document extraction is local, size-limited and rejects empty text", async () => {
  const text = new File(["Contrato de trabajo"], "contrato.txt", { type: "text/plain" });
  assert.equal(await extractEmploymentDocument(text), "Contrato de trabajo");
  assert.equal(MAX_EMPLOYMENT_DOCUMENT_BYTES, 10 * 1024 * 1024);
  await assert.rejects(() => extractEmploymentDocument(new File([""], "empty.txt")), /hasta 10 MiB/);
});

test("DOCX decompression reads only up to its output limit", async () => {
  assert.equal(MAX_DOCX_XML_BYTES, 20 * 1024 * 1024);
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(5)); controller.enqueue(new Uint8Array(6)); controller.close(); },
  });
  await assert.rejects(() => readStreamLimited(stream, 10), /excede el límite admitido/);
});

test("Payslip amount suggestions retain source lines and require explicit confirmation", () => {
  const fields = extractPayslipFields([
    "Periodo liquidado: 01/11/2026 al 15/11/2026",
    "Total devengado: $ 2.500.000",
    "Total deducciones: $ 200.000",
    "Neto a pagar: $ 2.300.000",
  ].join("\n"));
  assert.equal(fields.period.value, "01/11/2026 a 15/11/2026");
  assert.equal(fields.grossCOP.value, "2.500.000");
  assert.equal(fields.deductionsCOP.value, "200.000");
  assert.equal(fields.netCOP.value, "2.300.000");
  for (const key of ["period", "grossCOP", "deductionsCOP", "netCOP"]) {
    assert.equal(fields[key].confirmed, false);
    assert.ok(fields[key].source?.line > 0);
  }
});
