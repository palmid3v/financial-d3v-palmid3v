import test from "node:test";
import assert from "node:assert/strict";
import { migrateVault } from "../vault/finance.js";
import { addReceiptToLedger, appendContractVersion, assertNoOverlappingWorkRecord, contractVersionForPeriod, contractVersionForShift, contractVersionOn, expectedPaymentDates, makeEmploymentContract, makeEmploymentProfile, makePayrollReceipt, makePayrollReconciliation, makePayrollSettlement, makeWorkRecord, payrollDashboardSummary, reviseWorkRecord, workRecordsForPeriod } from "./model.js";

test("Vault schema migration from v1 is deterministic, idempotent, and preserves unknown fields", () => {
  const old = { schemaVersion: 1, accounts: [{ id: "a" }], legacyCustom: { keep: true } };
  const migrated = migrateVault(old);
  assert.equal(migrated.schemaVersion, 2);
  assert.deepEqual(migrated.accounts, old.accounts);
  assert.deepEqual(migrated.legacyCustom, old.legacyCustom);
  assert.deepEqual(migrateVault(migrated), migrated);
  assert.deepEqual(migrated.employmentContracts, []);
});

test("Contract versions require whole COP pesos and valid effective dates", () => {
  const profile = makeEmploymentProfile({ fullName: "Ana Torres" });
  const contract = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-01-01" });
  assert.equal(contract.versions[0].currency, "COP");
  assert.throws(() => makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000.5, startDate: "2026-01-01" }));
  assert.throws(() => makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "bad" }));
  assert.throws(() => makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-02-30" }));
  const revised = appendContractVersion(contract, { salaryCOP: 2800000, effectiveFrom: "2026-07-01" });
  assert.equal(revised.versions.length, 2);
  assert.equal(revised.versions[0].effectiveTo, "2026-07-01");
  assert.equal(revised.versions[0].effectiveToExclusive, true);
  assert.equal(revised.versions[0].salaryCOP, 2500000);
  assert.equal(revised.versions[1].salaryCOP, 2800000);
  assert.throws(() => appendContractVersion(revised, { salaryCOP: 3000000, effectiveFrom: "2026-07-01" }));
});

test("Effective contract version selection respects inclusive and exclusive dates", () => {
  const profile = makeEmploymentProfile({ fullName: "Ana Torres" });
  const contract = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-01-01", payDays: [5, 20] });
  const revised = appendContractVersion(contract, { salaryCOP: 2800000, effectiveFrom: "2026-07-01" });
  assert.equal(contractVersionOn(revised, "2026-06-30").salaryCOP, 2500000);
  assert.equal(contractVersionOn(revised, "2026-07-01").salaryCOP, 2800000);
  assert.equal(contractVersionOn(revised, "2025-12-31"), null);
  assert.equal(contractVersionForPeriod(revised, "2026-06-01", "2026-06-30").salaryCOP, 2500000);
  assert.throws(() => contractVersionForPeriod(revised, "2026-06-16", "2026-07-15"), /Divídelo en liquidaciones/);
  assert.equal(contractVersionForShift(revised, "2026-06-30T22:00:00-05:00", "2026-07-01T00:00:00-05:00").salaryCOP, 2500000);
  assert.throws(() => contractVersionForShift(revised, "2026-06-30T22:00:00-05:00", "2026-07-01T01:00:00-05:00"), /Divídelo en liquidaciones/);
  const fixedTerm = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-01-01", endDate: "2026-07-15" });
  assert.throws(() => appendContractVersion(fixedTerm, { salaryCOP: 2800000, effectiveFrom: "2026-07-16" }), /no puede extender/);
  const finalDayRevision = appendContractVersion(fixedTerm, { salaryCOP: 2800000, effectiveFrom: "2026-07-15" });
  assert.equal(finalDayRevision.versions[1].effectiveTo, "2026-07-15");
  assert.equal(contractVersionOn(finalDayRevision, "2026-07-15").salaryCOP, 2800000);
  assert.equal(contractVersionOn(finalDayRevision, "2026-07-16"), null);
});

test("Work records preserve scheduled and actual times separately", () => {
  const row = makeWorkRecord({ contractVersionId: "v1", scheduledStart: "2026-11-01T22:00:00-05:00", scheduledEnd: "2026-11-02T06:00:00-05:00", actualStart: "2026-11-01T22:05:00-05:00", actualEnd: "2026-11-02T06:00:00-05:00", breakStart: "2026-11-02T02:00:00-05:00", breakEnd: "2026-11-02T02:45:00-05:00", restDay: true });
  assert.equal(row.scheduledStart, "2026-11-01T22:00:00-05:00");
  assert.equal(row.actualStart, "2026-11-01T22:05:00-05:00");
  assert.equal(row.restDay, true);
  assert.equal(row.breakMinutes, 45);
  assert.equal(row.breaks.length, 1);
  const multiPause = makeWorkRecord({ contractVersionId: "v1", scheduledStart: "2026-11-01T22:00:00-05:00", scheduledEnd: "2026-11-02T06:00:00-05:00", breaks: [{ start: "2026-11-01T23:00:00-05:00", end: "2026-11-01T23:15:00-05:00" }, { start: "2026-11-02T04:00:00-05:00", end: "2026-11-02T04:30:00-05:00" }] });
  assert.equal(multiPause.breaks.length, 2);
  assert.equal(multiPause.breakMinutes, 45);
  assert.equal(multiPause.breakStart, multiPause.breaks[0].start);
  assert.throws(() => makeWorkRecord({ contractVersionId: "v1", scheduledStart: "2026-11-01T22:00:00-05:00", scheduledEnd: "2026-11-02T06:00:00-05:00", breaks: [{ start: "2026-11-02T02:00:00-05:00", end: "2026-11-02T03:00:00-05:00" }, { start: "2026-11-02T02:30:00-05:00", end: "2026-11-02T03:30:00-05:00" }] }), /no pueden superponerse/);
  assert.throws(() => makeWorkRecord({ contractVersionId: "v1", scheduledStart: "2026-11-01T22:00:00-05:00", scheduledEnd: "2026-11-02T06:00:00-05:00", breakStart: "2026-11-02T02:00:00-05:00" }));
  assert.throws(() => makeWorkRecord({ contractVersionId: "v1", scheduledStart: "2026-11-01T22:00:00-05:00", scheduledEnd: "2026-11-02T06:00:00-05:00", actualStart: "2026-11-01T22:00:00-05:00" }));
});

test("Work record corrections append the prior snapshot and require an explanation", () => {
  const original = makeWorkRecord({ contractVersionId: "v1", scheduledStart: "2026-11-01T08:00:00-05:00", scheduledEnd: "2026-11-01T16:00:00-05:00", actualStart: "2026-11-01T08:05:00-05:00", actualEnd: "2026-11-01T16:00:00-05:00", breaks: [{ start: "2026-11-01T12:00:00-05:00", end: "2026-11-01T12:30:00-05:00" }], note: "Turno inicial" });
  const corrected = reviseWorkRecord(original, { contractVersionId: "v1", scheduledStart: original.scheduledStart, scheduledEnd: original.scheduledEnd, actualStart: "2026-11-01T08:00:00-05:00", actualEnd: original.actualEnd, note: "Registro de reloj corregido" }, "El comprobante del reloj indica 08:00.");
  assert.equal(corrected.id, original.id);
  assert.equal(corrected.revision, 2);
  assert.equal(corrected.revisionHistory.length, 1);
  assert.equal(corrected.revisionHistory[0].record.actualStart, original.actualStart);
  assert.equal(corrected.revisionHistory[0].record.breaks.length, 1);
  assert.equal(corrected.actualStart, "2026-11-01T08:00:00-05:00");
  assert.equal(original.actualStart, "2026-11-01T08:05:00-05:00");
  assert.throws(() => reviseWorkRecord(original, { contractVersionId: "v1", scheduledStart: original.scheduledStart, scheduledEnd: original.scheduledEnd }, ""), /razón/);
});

test("Overlapping planned or actual shifts for the same employee are rejected across contracts", () => {
  const profile = makeEmploymentProfile({ fullName: "Ana Torres" });
  const firstContract = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-01-01" });
  const secondContract = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 1000000, startDate: "2026-01-01" });
  const otherEmployee = makeEmploymentContract({ employeeId: "different-employee", salaryCOP: 1000000, startDate: "2026-01-01" });
  const firstShift = makeWorkRecord({ contractVersionId: firstContract.versions[0].id, scheduledStart: "2026-11-14T08:00:00-05:00", scheduledEnd: "2026-11-14T12:00:00-05:00" });
  const overlap = makeWorkRecord({ contractVersionId: secondContract.versions[0].id, scheduledStart: "2026-11-14T11:00:00-05:00", scheduledEnd: "2026-11-14T13:00:00-05:00" });
  assert.throws(() => assertNoOverlappingWorkRecord([firstShift], overlap, profile.id, [firstContract, secondContract]), /superpone/);
  const independent = makeWorkRecord({ contractVersionId: otherEmployee.versions[0].id, scheduledStart: overlap.scheduledStart, scheduledEnd: overlap.scheduledEnd });
  assert.doesNotThrow(() => assertNoOverlappingWorkRecord([firstShift], independent, "different-employee", [firstContract, otherEmployee]));
  assert.doesNotThrow(() => assertNoOverlappingWorkRecord([firstShift], firstShift, profile.id, [firstContract], firstShift.id));
});

test("Payroll period selects overlapping same-version shifts and preserves them as evidence snapshots", () => {
  const profile = makeEmploymentProfile({ fullName: "Ana Torres" });
  const contract = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-01-01" });
  const overnight = makeWorkRecord({ contractVersionId: contract.versions[0].id, scheduledStart: "2026-08-01T00:00:00-05:00", scheduledEnd: "2026-08-01T02:00:00-05:00" });
  const wrongVersion = { ...overnight, id: "other-version-shift", contractVersionId: "other-version" };
  const relevant = workRecordsForPeriod([overnight, wrongVersion], contract.versions[0].id, "2026-08-01", "2026-08-15");
  assert.deepEqual(relevant.map((record) => record.id), [overnight.id]);
  const settlement = makePayrollSettlement({ contractVersion: contract.versions[0], periodStart: "2026-08-01", periodEnd: "2026-08-15", earnings: [{ label: "Bruto confirmado", pesos: 1000000, confirmed: true }], deductions: [], calculation: { currency: "COP", contractVersionId: contract.versions[0].id, periodStart: "2026-08-01", periodEnd: "2026-08-15", grossCOP: 1000000, deductionsCOP: 0, netCOP: 1000000 }, workRecords: relevant });
  overnight.note = "changed after settlement";
  assert.equal(settlement.workRecordSnapshots[0].note, "");
  assert.equal(settlement.calculationScope, "user-confirmed-concepts-attendance-is-audit-evidence-only");
  assert.equal(settlement.cutoffDate, "2026-08-15");
  assert.equal(settlement.expectedPaymentDate, null);
  assert.ok(!Number.isNaN(Date.parse(settlement.settledAt)));
  const scheduled = makePayrollSettlement({ contractVersion: contract.versions[0], periodStart: "2026-08-01", periodEnd: "2026-08-15", cutoffDate: "2026-08-16", expectedPaymentDate: "2026-08-20", earnings: [{ label: "Bruto confirmado", pesos: 1000000, confirmed: true }], deductions: [], calculation: { currency: "COP", contractVersionId: contract.versions[0].id, periodStart: "2026-08-01", periodEnd: "2026-08-15", grossCOP: 1000000, deductionsCOP: 0, netCOP: 1000000 } });
  assert.equal(scheduled.cutoffDate, "2026-08-16");
  assert.equal(scheduled.expectedPaymentDate, "2026-08-20");
  assert.throws(() => makePayrollSettlement({ contractVersion: contract.versions[0], periodStart: "2026-08-01", periodEnd: "2026-08-15", cutoffDate: "2026-08-14", expectedPaymentDate: "2026-08-20", earnings: [{ label: "Bruto confirmado", pesos: 1000000, confirmed: true }], deductions: [], calculation: { currency: "COP", contractVersionId: contract.versions[0].id, periodStart: "2026-08-01", periodEnd: "2026-08-15" } }), /fecha de corte/);
  assert.throws(() => makePayrollSettlement({ contractVersion: contract.versions[0], periodStart: "2026-08-01", periodEnd: "2026-08-15", earnings: [{ label: "Bruto confirmado", pesos: 1000000, confirmed: true }], deductions: [], calculation: { currency: "COP", contractVersionId: contract.versions[0].id, periodStart: "2026-08-01", periodEnd: "2026-08-15" }, workRecords: [wrongVersion] }), /periodo y versi/);
  const outsidePeriod = makeWorkRecord({ contractVersionId: contract.versions[0].id, scheduledStart: "2026-07-31T20:00:00-05:00", scheduledEnd: "2026-07-31T21:00:00-05:00" });
  assert.throws(() => makePayrollSettlement({ contractVersion: contract.versions[0], periodStart: "2026-08-01", periodEnd: "2026-08-15", earnings: [{ label: "Bruto confirmado", pesos: 1000000, confirmed: true }], deductions: [], calculation: { currency: "COP", contractVersionId: contract.versions[0].id, periodStart: "2026-08-01", periodEnd: "2026-08-15" }, workRecords: [outsidePeriod] }), /periodo y versi/);
  const overlapping = makeWorkRecord({ contractVersionId: contract.versions[0].id, scheduledStart: "2026-08-01T01:00:00-05:00", scheduledEnd: "2026-08-01T03:00:00-05:00" });
  assert.throws(() => workRecordsForPeriod([overnight, overlapping], contract.versions[0].id, "2026-08-01", "2026-08-15"), /turnos superpuestos/);
});

test("Receipt posting is idempotent and converts whole COP pesos to the current ledger scale", () => {
  const profile = makeEmploymentProfile({ fullName: "Ana Torres" });
  const contract = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-01-01" });
  const settlement = { id: "run-1", calculation: { netCOP: 100000 }, receipts: [] };
  const receipt = makePayrollReceipt({ settlement, pesos: 50000, receivedAt: "2026-11-14", accountId: "acct-1", bankReference: "transfer-123" });
  const vault = { accounts: [{ id: "acct-1", currency: "COP", type: "bank" }], payrollReceipts: [], payrollSettlements: [settlement], transactions: [] };
  const posted = addReceiptToLedger(vault, receipt);
  assert.equal(posted.transactions[0].minorUnits, 5000000);
  assert.equal(posted.transactions[0].payrollReceiptId, receipt.id);
  assert.equal(addReceiptToLedger(posted, receipt).transactions.length, 1);
  assert.throws(() => addReceiptToLedger(posted, { ...receipt, pesos: 40000 }), /referencia de pago ya existe/);
  assert.equal(posted.payrollSettlements[0].status, "partially_received");
  const second = makePayrollReceipt({ settlement: { ...posted.payrollSettlements[0], receipts: posted.payrollSettlements[0].receipts.map((id) => posted.payrollReceipts.find((row) => row.id === id)) }, pesos: 50000, receivedAt: "2026-11-15", accountId: "acct-1", bankReference: "transfer-124" });
  const completed = addReceiptToLedger(posted, second);
  assert.equal(completed.payrollSettlements[0].totalReceivedCOP, 100000);
  assert.equal(completed.payrollSettlements[0].status, "received");
  assert.equal(completed.transactions.length, 2);
  assert.throws(() => addReceiptToLedger(vault, { ...receipt, idempotencyKey: "run-1:other-reference" }), /datos incompletos o inconsistentes/);
  const orphanedLedger = { ...vault, transactions: [{ payrollReceiptId: receipt.id, payrollSettlementId: settlement.id }] };
  assert.throws(() => addReceiptToLedger(orphanedLedger, receipt), /posible ingreso duplicado/);
  assert.throws(() => addReceiptToLedger({ ...vault, accounts: [{ id: "acct-1", currency: "USD", type: "bank" }] }, receipt));
  assert.throws(() => makePayrollReceipt({ settlement: { ...settlement, receipts: [{ pesos: 75000 }] }, pesos: 50000, receivedAt: "2026-11-14", accountId: "acct-1", bankReference: "transfer-456" }));
  assert.ok(contract.id);
});

test("Expected employer payment dates remain configured dates and cap at month end", () => {
  const profile = makeEmploymentProfile({ fullName: "Ana Torres" });
  const contract = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-01-01", payDays: [5, 20, 31] });
  assert.deepEqual(expectedPaymentDates(contract, 2026, 1), ["2026-02-05", "2026-02-20", "2026-02-28"]);
  const revised = appendContractVersion(contract, { salaryCOP: 2800000, effectiveFrom: "2026-02-10" });
  assert.deepEqual(expectedPaymentDates(revised, 2026, 1), ["2026-02-05", "2026-02-20", "2026-02-28"]);
  assert.deepEqual(expectedPaymentDates(revised, 2026, 0), ["2026-01-05", "2026-01-20", "2026-01-31"]);
  const midMonthStart = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2500000, startDate: "2026-02-10", payDays: [5, 20, 31] });
  assert.deepEqual(expectedPaymentDates(midMonthStart, 2026, 1), ["2026-02-20", "2026-02-28"]);
});

test("Payroll dashboard summary includes only active contracts effective today and never posts projected income", () => {
  const profile = makeEmploymentProfile({ fullName: "Ana Torres" });
  const active = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 2800000, startDate: "2026-10-01", payDays: [5, 20] });
  const future = makeEmploymentContract({ employeeId: profile.id, salaryCOP: 3500000, startDate: "2026-12-01", payDays: [10] });
  const inactive = { ...makeEmploymentContract({ employeeId: profile.id, salaryCOP: 900000, startDate: "2026-01-01" }), status: "archived" };
  const vault = { employmentContracts: [active, future, inactive], payrollSettlements: [], transactions: [] };
  assert.deepEqual(payrollDashboardSummary(vault, "2026-11-14"), { activeContractCount: 1, monthlySalaryCOP: 2800000, nextExpectedPaymentDate: "2026-11-20", settlementsCount: 0 });
  assert.equal(vault.transactions.length, 0);
  assert.deepEqual(payrollDashboardSummary(vault, "2026-11-21").nextExpectedPaymentDate, "2026-12-05");
  assert.throws(() => payrollDashboardSummary(vault, "invalid"));
});

test("Payslip reconciliation compares confirmed amounts without interpreting legality", () => {
  const settlement = { id: "run-2", contractVersionId: "v1", periodStart: "2026-11-01", periodEnd: "2026-11-15", calculation: { grossCOP: 100000, deductionsCOP: 10000, netCOP: 90000 } };
  const payslip = { id: "slip-1", settlementId: settlement.id };
  const result = makePayrollReconciliation({ settlement, payslip, actuals: { netCOP: { pesos: 88000, confirmed: true } } });
  assert.equal(result.status, "difference-for-review");
  assert.equal(result.differencesCOP.netCOP, -2000);
  assert.equal(result.interpretation, "amount-comparison-only-not-a-legal-opinion");
  assert.throws(() => makePayrollReconciliation({ settlement, payslip, actuals: { netCOP: { pesos: 88000, confirmed: false } } }));
});
