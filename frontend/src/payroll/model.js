import { makeTransaction } from "../vault/finance.js";

const now = () => new Date().toISOString();
const id = (kind) => `${kind}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`}`;
const validISODate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const validDateTime = (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00(?:\.000)?[+-]\d{2}:\d{2}$/.test(value) && validISODate(value.slice(0, 10)) && !Number.isNaN(Date.parse(value));
const positiveCOP = (value, label) => {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error(`${label}: ingresa un valor entero positivo en pesos colombianos.`);
  return amount;
};

export const PAYROLL_RULESET_VERSION = "co-labor-rules-2026-pending-professional-review";
export const PAYROLL_RULES_VERIFICATION = "official-text-reviewed-professional-review-pending";

export function makeEmploymentProfile({ fullName, employerName = "" }) {
  if (!String(fullName || "").trim()) throw new Error("Ingresa el nombre de la persona trabajadora.");
  return { id: id("employee"), fullName: fullName.trim(), employerName: employerName.trim(), createdAt: now(), updatedAt: now() };
}

export function makeEmploymentContract({ employeeId, employerName = "", contractType = "indefinite", salaryCOP, startDate, endDate = "", payDays = [5, 20], payFrequency = "biweekly", scheduleType = "variable", restDay = "sunday", transportAllowanceCOP = 0, weeklyHours = null, evidence = [], confirmedFields = [] }) {
  if (!employeeId) throw new Error("Selecciona un perfil de trabajo.");
  const salary = positiveCOP(salaryCOP, "Salario base");
  if (!validISODate(startDate) || (endDate && (!validISODate(endDate) || endDate < startDate))) throw new Error("Revisa las fechas de vigencia del contrato.");
  if (!["indefinite", "fixed-term", "work-or-labor", "occasional", "other"].includes(contractType)) throw new Error("El tipo de contrato no es valido.");
  if (!Array.isArray(payDays) || !payDays.length || payDays.some((day) => !Number.isInteger(day) || day < 1 || day > 31)) throw new Error("Configura fechas de pago entre los dias 1 y 31.");
  if (!["weekly", "biweekly", "monthly", "custom"].includes(payFrequency)) throw new Error("Selecciona una frecuencia de pago valida.");
  if (weeklyHours !== null && (!Number.isSafeInteger(Number(weeklyHours)) || Number(weeklyHours) <= 0 || Number(weeklyHours) > 168)) throw new Error("Las horas semanales deben ser un entero entre 1 y 168.");
  const contractId = id("contract");
  const version = {
    id: id("contract-version"), contractId, version: 1, currency: "COP", salaryCOP: salary,
    transportAllowanceCOP: Number.isSafeInteger(Number(transportAllowanceCOP)) && Number(transportAllowanceCOP) >= 0 ? Number(transportAllowanceCOP) : 0,
    effectiveFrom: startDate, effectiveTo: endDate || null, contractType, payFrequency,
    payDays: [...new Set(payDays)].sort((a, b) => a - b), weeklyHours: weeklyHours == null ? null : Number(weeklyHours), scheduleType, restDay,
    evidence: structuredClone(evidence), confirmedFields: [...new Set(confirmedFields)], createdAt: now(),
  };
  return { id: contractId, employeeId, employerName: employerName.trim(), status: "active", currentVersionId: version.id, versions: [version], createdAt: now() };
}

export function appendContractVersion(contract, { salaryCOP, effectiveFrom, transportAllowanceCOP, weeklyHours }) {
  const latest = contract.versions.at(-1);
  if (!latest || !validISODate(effectiveFrom) || effectiveFrom <= latest.effectiveFrom) throw new Error("La nueva version debe empezar despues de la version vigente.");
  if (latest.effectiveTo && effectiveFrom > latest.effectiveTo) throw new Error("La nueva version no puede extender la vigencia del contrato terminado.");
  const next = makeEmploymentContract({ employeeId: contract.employeeId, employerName: contract.employerName, contractType: latest.contractType, salaryCOP, startDate: effectiveFrom, endDate: latest.effectiveTo || "", payDays: latest.payDays, payFrequency: latest.payFrequency, scheduleType: latest.scheduleType, restDay: latest.restDay, transportAllowanceCOP: transportAllowanceCOP ?? latest.transportAllowanceCOP, weeklyHours: weeklyHours ?? latest.weeklyHours, confirmedFields: ["salaryCOP", "effectiveFrom"] });
  const prior = { ...latest, effectiveTo: effectiveFrom, effectiveToExclusive: true, supersededBy: next.versions[0].id };
  const version = { ...next.versions[0], contractId: contract.id, version: latest.version + 1 };
  return { ...contract, currentVersionId: version.id, updatedAt: now(), versions: [...contract.versions.slice(0, -1), prior, version] };
}

export function contractVersionOn(contract, date) {
  if (!validISODate(date)) return null;
  return (contract?.versions || [])
    .filter((version) => version.effectiveFrom <= date && (!version.effectiveTo || (version.effectiveToExclusive ? date < version.effectiveTo : date <= version.effectiveTo)))
    .sort((left, right) => Number(right.version || 0) - Number(left.version || 0))[0] || null;
}

export function contractVersionForPeriod(contract, startDate, endDate) {
  if (!validISODate(startDate) || !validISODate(endDate) || endDate < startDate) throw new Error("Revisa las fechas del periodo.");
  const startVersion = contractVersionOn(contract, startDate);
  const endVersion = contractVersionOn(contract, endDate);
  if (!startVersion || !endVersion) throw new Error("El periodo está fuera de la vigencia del contrato.");
  if (startVersion.id !== endVersion.id) throw new Error("El periodo cruza un cambio de contrato. Divídelo en liquidaciones por versión contractual.");
  return startVersion;
}

export function contractVersionForShift(contract, start, end) {
  const startDate = String(start || "").slice(0, 10);
  let lastWorkedDate = String(end || "").slice(0, 10);
  if (/T00:00(?::00)?(?:\.000)?(?:[+-]\d{2}:\d{2}|Z)?$/.test(end || "")) {
    const prior = new Date(`${lastWorkedDate}T12:00:00Z`);
    prior.setUTCDate(prior.getUTCDate() - 1);
    lastWorkedDate = prior.toISOString().slice(0, 10);
  }
  return contractVersionForPeriod(contract, startDate, lastWorkedDate);
}

export function makeWorkRecord({ contractVersionId, scheduledStart, scheduledEnd, actualStart = "", actualEnd = "", breaks = [], breakStart = "", breakEnd = "", restDay = false, publicHoliday = false, note = "", timeZone = "America/Bogota" }) {
  if (!contractVersionId || !validDateTime(scheduledStart) || !validDateTime(scheduledEnd) || Date.parse(scheduledEnd) <= Date.parse(scheduledStart) || !validDateTime(actualStart || scheduledStart) || !validDateTime(actualEnd || scheduledEnd)) throw new Error("Revisa el contrato y las fechas del turno.");
  if (Boolean(actualStart) !== Boolean(actualEnd)) throw new Error("Completa ambos extremos del horario real.");
  const shiftStart = actualStart || scheduledStart;
  const shiftEnd = actualEnd || scheduledEnd;
  if (Date.parse(shiftEnd) <= Date.parse(shiftStart) || Date.parse(shiftEnd) - Date.parse(shiftStart) > 24 * 60 * 60 * 1000) throw new Error("El horario efectivo debe ser positivo y no superar 24 horas.");
  if (!Array.isArray(breaks)) throw new Error("Las pausas deben ser una lista de intervalos.");
  if (Boolean(breakStart) !== Boolean(breakEnd)) throw new Error("Completa inicio y fin de la pausa.");
  const intervals = breaks.map((row) => ({ start: String(row?.start || ""), end: String(row?.end || "") }));
  if (breakStart) intervals.push({ start: breakStart, end: breakEnd });
  if (intervals.some((row) => Boolean(row.start) !== Boolean(row.end))) throw new Error("Completa inicio y fin de cada pausa.");
  const completeIntervals = intervals.filter((row) => row.start && row.end).sort((left, right) => Date.parse(left.start) - Date.parse(right.start));
  let pause = 0;
  for (let index = 0; index < completeIntervals.length; index += 1) {
    const interval = completeIntervals[index];
    if (!validDateTime(interval.start) || !validDateTime(interval.end) || Date.parse(interval.start) < Date.parse(shiftStart) || Date.parse(interval.end) <= Date.parse(interval.start) || Date.parse(interval.end) > Date.parse(shiftEnd)) throw new Error("Cada pausa debe ser un intervalo válido dentro del horario efectivo.");
    if (index > 0 && Date.parse(interval.start) < Date.parse(completeIntervals[index - 1].end)) throw new Error("Las pausas no pueden superponerse.");
    const duration = (Date.parse(interval.end) - Date.parse(interval.start)) / 60000;
    if (!Number.isInteger(duration)) throw new Error("Las pausas deben usar minutos completos.");
    pause += duration;
  }
  if (pause > 720) throw new Error("Las pausas no pueden superar 720 minutos acumulados.");
  const firstPause = completeIntervals[0] || null;
  return { id: id("work"), revision: 1, revisionHistory: [], contractVersionId, scheduledStart, scheduledEnd, actualStart: actualStart || null, actualEnd: actualEnd || null, timeZone, breaks: completeIntervals, breakStart: firstPause?.start || null, breakEnd: firstPause?.end || null, breakMinutes: pause, restDay: Boolean(restDay), publicHoliday: Boolean(publicHoliday), note: note.trim(), createdAt: now(), updatedAt: now() };
}

export function reviseWorkRecord(existing, input, reason) {
  const explanation = String(reason || "").trim();
  if (!existing?.id || !explanation || explanation.length > 500) throw new Error("La corrección requiere un turno guardado y una razón de hasta 500 caracteres.");
  const revised = makeWorkRecord(input);
  const previous = structuredClone(existing);
  delete previous.revisionHistory;
  return {
    ...revised,
    id: existing.id,
    revision: (Number.isSafeInteger(existing.revision) && existing.revision > 0 ? existing.revision : 1) + 1,
    revisionHistory: [...(Array.isArray(existing.revisionHistory) ? existing.revisionHistory : []), { revision: Number.isSafeInteger(existing.revision) && existing.revision > 0 ? existing.revision : 1, record: previous, changedAt: now(), reason: explanation }],
    createdAt: existing.createdAt || revised.createdAt,
    updatedAt: now(),
    correctionReason: explanation,
  };
}

export function assertNoOverlappingWorkRecord(records, candidate, employeeId, contracts, ignoreId = candidate?.id) {
  if (!Array.isArray(records) || !candidate?.id || !employeeId || !Array.isArray(contracts)) throw new Error("No se pudieron validar los turnos de la persona trabajadora.");
  const owners = new Map(contracts.flatMap((contract) => (contract.versions || []).map((version) => [version.id, contract.employeeId])));
  const candidateStart = Date.parse(candidate.actualStart || candidate.scheduledStart);
  const candidateEnd = Date.parse(candidate.actualEnd || candidate.scheduledEnd);
  if (!Number.isFinite(candidateStart) || !Number.isFinite(candidateEnd) || candidateEnd <= candidateStart) throw new Error("El intervalo del turno que intentas guardar no es válido.");
  for (const row of records) {
    if (row.id === ignoreId || (owners.get(row.contractVersionId) !== employeeId && row.contractVersionId !== candidate.contractVersionId)) continue;
    const start = Date.parse(row.actualStart || row.scheduledStart);
    const end = Date.parse(row.actualEnd || row.scheduledEnd);
    if (Number.isFinite(start) && Number.isFinite(end) && start < candidateEnd && end > candidateStart) {
      throw new Error("Este turno se superpone con otro registro de la misma persona. Corrige los horarios antes de guardar para evitar contar tiempo dos veces.");
    }
  }
}

export function workRecordsForPeriod(records, contractVersionId, periodStart, periodEnd) {
  if (!Array.isArray(records) || !contractVersionId || !validISODate(periodStart) || !validISODate(periodEnd) || periodEnd < periodStart) throw new Error("Revisa los turnos y las fechas del periodo.");
  const periodStartMs = Date.parse(`${periodStart}T00:00:00-05:00`);
  const periodEndExclusiveMs = Date.parse(`${periodEnd}T00:00:00-05:00`) + 24 * 60 * 60 * 1000;
  const relevant = records.filter((record) => {
    if (record.contractVersionId !== contractVersionId) return false;
    const start = Date.parse(record.actualStart || record.scheduledStart);
    const end = Date.parse(record.actualEnd || record.scheduledEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return false;
    return start < periodEndExclusiveMs && end > periodStartMs;
  });
  const intervals = relevant.map((record) => ({ record, start: Date.parse(record.actualStart || record.scheduledStart), end: Date.parse(record.actualEnd || record.scheduledEnd) })).sort((left, right) => left.start - right.start);
  for (let index = 1; index < intervals.length; index += 1) {
    if (intervals[index].start < intervals[index - 1].end) throw new Error("Hay turnos superpuestos en el periodo. Corrígelos antes de crear el resumen para no duplicar tiempo.");
  }
  return relevant.map((record) => structuredClone(record));
}

export function makePayrollSettlement({ contractVersion, periodStart, periodEnd, cutoffDate = periodEnd, expectedPaymentDate = "", earnings, deductions, calculation, workRecords = [] }) {
  if (!contractVersion?.id || !validISODate(periodStart) || !validISODate(periodEnd) || periodEnd < periodStart) throw new Error("La liquidacion requiere contrato versionado y periodo valido.");
  if (!validISODate(cutoffDate) || cutoffDate < periodEnd || (expectedPaymentDate && (!validISODate(expectedPaymentDate) || expectedPaymentDate < cutoffDate))) throw new Error("La fecha de corte debe ser igual o posterior al periodo trabajado y el pago previsto no puede ser anterior al corte.");
  const entries = (list, kind) => {
    if (!Array.isArray(list)) throw new Error("Agrega conceptos de ingreso y deduccion como listas.");
    return list.map((entry, index) => ({ id: entry.id || `${kind}-${index + 1}`, label: String(entry.label || "").trim(), pesos: positiveCOP(entry.pesos, entry.label || "Concepto"), source: String(entry.source || "user-confirmed"), confirmed: entry.confirmed === true }));
  };
  const earningRows = entries(earnings, "earning");
  const deductionRows = entries(deductions, "deduction");
  const workRecordSnapshots = workRecordsForPeriod(workRecords, contractVersion.id, periodStart, periodEnd);
  if (workRecordSnapshots.length !== workRecords.length || new Set(workRecordSnapshots.map((record) => record.id)).size !== workRecordSnapshots.length) throw new Error("Los turnos de evidencia deben pertenecer al periodo y versión contractual, sin duplicados.");
  if (earningRows.some((entry) => !entry.confirmed) || deductionRows.some((entry) => !entry.confirmed)) throw new Error("Confirma cada importe antes de calcular.");
  if (!calculation || calculation.currency !== "COP" || calculation.contractVersionId !== contractVersion.id || calculation.periodStart !== periodStart || calculation.periodEnd !== periodEnd) throw new Error("El resultado del motor no coincide con el periodo y contrato seleccionados.");
  const createdAt = now();
  return { id: id("payroll-run"), contractId: contractVersion.contractId, contractVersionId: contractVersion.id, contractSnapshot: structuredClone(contractVersion), periodStart, periodEnd, cutoffDate, expectedPaymentDate: expectedPaymentDate || null, settledAt: createdAt, receivedAt: null, earnings: earningRows, deductions: deductionRows, workRecordSnapshots, calculation: structuredClone(calculation), calculationScope: "user-confirmed-concepts-attendance-is-audit-evidence-only", status: "estimated", receipts: [], totalReceivedCOP: 0, createdAt };
}

export function makePayrollReceipt({ settlement, pesos, receivedAt, accountId, bankReference }) {
  const amount = positiveCOP(pesos, "Pago recibido");
  const reference = String(bankReference || "").trim();
  if (!settlement?.id || !Number.isSafeInteger(settlement.calculation?.netCOP) || settlement.calculation.netCOP < 0 || !accountId || !validISODate(receivedAt) || !reference) throw new Error("El pago requiere liquidación válida, cuenta, fecha y referencia de recibo.");
  const alreadyReceived = (settlement.receipts || []).reduce((sum, receipt) => sum + Number(receipt.pesos || 0), 0);
  if (amount + alreadyReceived > settlement.calculation.netCOP) throw new Error("Los pagos recibidos superan el neto de la liquidacion.");
  return { id: id("receipt"), settlementId: settlement.id, accountId, pesos: amount, currency: "COP", receivedAt, bankReference: reference, idempotencyKey: `${settlement.id}:${reference.toLocaleLowerCase("es-CO")}`, createdAt: now() };
}

export function makePayrollReconciliation({ settlement, payslip, actuals }) {
  if (!settlement?.id || !payslip?.id || payslip.settlementId !== settlement.id || !actuals || typeof actuals !== "object") throw new Error("La conciliación requiere una liquidación y un desprendible vinculados.");
  const fields = ["grossCOP", "deductionsCOP", "netCOP"];
  const confirmed = {};
  const differences = {};
  for (const key of fields) {
    const row = actuals[key];
    if (!row?.confirmed) continue;
    const value = Number(row.pesos);
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("Confirma importes en pesos COP enteros no negativos.");
    confirmed[key] = value;
    const expected = Number(settlement.calculation?.[key]);
    if (!Number.isSafeInteger(expected) || expected < 0) throw new Error("La liquidación no contiene importes comparables válidos.");
    differences[key] = value - expected;
  }
  if (!Object.keys(confirmed).length) throw new Error("Confirma al menos un importe extraído o ingresado del desprendible.");
  const hasDifference = Object.values(differences).some((amount) => amount !== 0);
  return {
    id: id("reconciliation"), settlementId: settlement.id, payslipId: payslip.id,
    expectedSnapshot: { calculation: structuredClone(settlement.calculation), contractVersionId: settlement.contractVersionId, periodStart: settlement.periodStart, periodEnd: settlement.periodEnd },
    actualsCOP: confirmed, differencesCOP: differences, status: hasDifference ? "difference-for-review" : "amounts-match",
    interpretation: "amount-comparison-only-not-a-legal-opinion", createdAt: now(),
  };
}

export function addReceiptToLedger(vault, receipt) {
  const reference = String(receipt?.bankReference || "").trim();
  const expectedIdempotencyKey = `${receipt?.settlementId}:${reference.toLocaleLowerCase("es-CO")}`;
  if (!receipt || typeof receipt !== "object" || !receipt.id || !receipt.settlementId || !receipt.accountId || !validISODate(receipt.receivedAt) || receipt.currency !== "COP" || !Number.isSafeInteger(receipt.pesos) || receipt.pesos <= 0 || !reference || receipt.idempotencyKey !== expectedIdempotencyKey) {
    throw new Error("El recibo contiene datos incompletos o inconsistentes; revisa la referencia, fecha e importe COP.");
  }
  const receipts = Array.isArray(vault.payrollReceipts) ? vault.payrollReceipts : [];
  const duplicate = receipts.find((item) => item.idempotencyKey === receipt.idempotencyKey || item.id === receipt.id);
  if (duplicate) {
    if (duplicate.settlementId === receipt.settlementId && duplicate.accountId === receipt.accountId && duplicate.pesos === receipt.pesos && duplicate.receivedAt === receipt.receivedAt) return vault;
    throw new Error("La referencia de pago ya existe con datos distintos; revisa la recepción antes de continuar.");
  }
  const account = vault.accounts?.find((item) => item.id === receipt.accountId);
  if (!account || account.currency !== "COP" || account.type === "credit") throw new Error("Selecciona una cuenta de activo denominada en COP.");
  const settlement = vault.payrollSettlements?.find((item) => item.id === receipt.settlementId);
  if (!settlement || !Number.isSafeInteger(settlement.calculation?.netCOP) || settlement.calculation.netCOP < 0) throw new Error("El recibo debe corresponder a una liquidación guardada en esta bóveda.");
  if ((vault.transactions || []).some((item) => item.payrollReceiptId === receipt.id || (item.payrollSettlementId === receipt.settlementId && item.payrollReceiptReference === receipt.idempotencyKey))) {
    throw new Error("Ya existe un movimiento vinculado a este recibo; se bloqueó un posible ingreso duplicado.");
  }
  const receivedBefore = (settlement.receipts || []).reduce((sum, item) => {
    const amount = typeof item === "string" ? receipts.find((saved) => saved.id === item)?.pesos : item?.pesos;
    if (!Number.isSafeInteger(amount) || amount < 0 || !Number.isSafeInteger(sum + amount)) throw new Error("El historial de pagos de la liquidación no es válido; revisa la bóveda antes de continuar.");
    return sum + amount;
  }, 0);
  if (!Number.isSafeInteger(receivedBefore + receipt.pesos) || receivedBefore + receipt.pesos > settlement.calculation.netCOP) throw new Error("El pago acumulado superaría el neto de la liquidación.");
  const minorUnits = receipt.pesos * 100;
  if (!Number.isSafeInteger(minorUnits)) throw new Error("El valor excede el rango de importes admitido por el ledger financiero.");
  const transaction = makeTransaction({ accountId: receipt.accountId, type: "income", minorUnits, currency: "COP", categoryId: "cat-salary", description: "Pago de nomina confirmado", occurredAt: new Date(`${receipt.receivedAt}T12:00:00-05:00`).toISOString(), payrollReceiptId: receipt.id, payrollReceiptReference: receipt.idempotencyKey, payrollSettlementId: receipt.settlementId });
  const payrollSettlements = vault.payrollSettlements.map((item) => {
    if (item.id !== receipt.settlementId) return item;
    const settlementReceipts = [...(item.receipts || []), receipt];
    const totalReceivedCOP = settlementReceipts.reduce((sum, row) => sum + (typeof row === "string" ? receipts.find((saved) => saved.id === row)?.pesos || 0 : row.pesos), 0);
    return { ...item, receipts: settlementReceipts.map((row) => row.id), totalReceivedCOP, status: totalReceivedCOP >= item.calculation.netCOP ? "received" : "partially_received", receivedAt: receipt.receivedAt };
  });
  return { ...vault, payrollReceipts: [...receipts, receipt], payrollSettlements, transactions: [...vault.transactions, transaction] };
}

export function expectedPaymentDates(contract, year, monthIndex) {
  if (!Number.isInteger(year) || year < 1900 || year > 9999 || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) throw new Error("Selecciona un mes y año válidos.");
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const month = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const candidates = (contract?.versions || []).flatMap((version) => (version.payDays || [5, 20]).map((day) => `${month}-${String(Math.min(day, lastDay)).padStart(2, "0")}`));
  return [...new Set(candidates.filter((date) => contractVersionOn(contract, date)))].sort();
}

export function payrollDashboardSummary(vault, today) {
  if (!validISODate(today)) throw new Error("La fecha del resumen laboral no es válida.");
  const contracts = (vault?.employmentContracts || []).filter((contract) => contract.status === "active");
  const effectiveContracts = contracts.flatMap((contract) => {
    const version = contractVersionOn(contract, today);
    return version ? [{ contract, version }] : [];
  });
  let monthlySalaryCOP = 0;
  let validSalaries = true;
  for (const { version } of effectiveContracts) {
    const value = Number(version.salaryCOP);
    if (!Number.isSafeInteger(value) || value <= 0 || !Number.isSafeInteger(monthlySalaryCOP + value)) {
      validSalaries = false;
      break;
    }
    monthlySalaryCOP += value;
  }
  if (!validSalaries) monthlySalaryCOP = null;
  const firstMonth = new Date(`${today}T12:00:00Z`);
  const payDates = new Set();
  for (let offset = 0; offset < 2; offset += 1) {
    const month = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + offset, 1));
    for (const { contract } of effectiveContracts) {
      for (const date of expectedPaymentDates(contract, month.getUTCFullYear(), month.getUTCMonth())) {
        if (date >= today) payDates.add(date);
      }
    }
  }
  return {
    activeContractCount: effectiveContracts.length,
    monthlySalaryCOP,
    nextExpectedPaymentDate: [...payDates].sort()[0] || null,
    settlementsCount: Array.isArray(vault?.payrollSettlements) ? vault.payrollSettlements.length : 0,
  };
}
