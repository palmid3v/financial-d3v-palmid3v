import { useEffect, useMemo, useState } from "react";
import { calculatePayrollWithGoEngine, classifyPayrollShiftWithGoEngine, estimateEmployeeContributionsWithGoEngine, payrollHolidaysWithGoEngine, payrollRulesWithGoEngine, projectPayrollCompensationWithGoEngine } from "../vault/goEngine";
import { addReceiptToLedger, appendContractVersion, assertNoOverlappingWorkRecord, contractVersionForPeriod, contractVersionForShift, contractVersionOn, expectedPaymentDates, makeEmploymentContract, makeEmploymentProfile, makePayrollReceipt, makePayrollReconciliation, makePayrollSettlement, makeWorkRecord, reviseWorkRecord, workRecordsForPeriod, PAYROLL_RULESET_VERSION } from "./model";
import { extractContractFields, extractEmploymentDocument, extractPayslipFields } from "./documents";

const dateNow = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const money = (pesos) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(pesos) || 0);
const toBogotaTime = (value) => value ? `${value}:00-05:00` : "";
const toDateTimeInput = (value) => value ? String(value).slice(0, 16) : "";

function Card({ title, eyebrow, children }) {
  return <section className="payroll-card"><div className="payroll-card-head"><div>{eyebrow && <small>{eyebrow}</small>}<h3>{title}</h3></div></div>{children}</section>;
}

function Field({ label, ...props }) {
  return <label className="field"><span>{label}</span><input {...props} /></label>;
}

export default function PayrollWorkspace({ vault, updateVault }) {
  const [section, setSection] = useState("overview");
  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employeeId, setEmployeeId] = useState(vault.employmentProfiles[0]?.id || "");
  const [contractType, setContractType] = useState("indefinite");
  const [salaryCOP, setSalaryCOP] = useState("");
  const [revisionSalary, setRevisionSalary] = useState("");
  const [revisionDate, setRevisionDate] = useState(dateNow());
  const [allowanceCOP, setAllowanceCOP] = useState("0");
  const [startDate, setStartDate] = useState(dateNow());
  const [payDaysText, setPayDaysText] = useState("5, 20");
  const [payFrequency, setPayFrequency] = useState("biweekly");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [extracted, setExtracted] = useState({});
  const [confirmed, setConfirmed] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(vault.employmentContracts[0]?.id || "");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [actualStart, setActualStart] = useState("");
  const [actualEnd, setActualEnd] = useState("");
  const [breaks, setBreaks] = useState([{ start: "", end: "" }]);
  const [restDay, setRestDay] = useState(false);
  const [shiftNote, setShiftNote] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [selectedWorkRecordId, setSelectedWorkRecordId] = useState("");
  const [shiftResult, setShiftResult] = useState(null);
  const [periodStart, setPeriodStart] = useState(`${dateNow().slice(0, 7)}-01`);
  const [periodEnd, setPeriodEnd] = useState(dateNow());
  const [payrollCutoffDate, setPayrollCutoffDate] = useState(dateNow());
  const [expectedPayrollPaymentDate, setExpectedPayrollPaymentDate] = useState("");
  const [grossInput, setGrossInput] = useState("");
  const [deductionInput, setDeductionInput] = useState("0");
  const [amountsConfirmed, setAmountsConfirmed] = useState(false);
  const [receiptAmounts, setReceiptAmounts] = useState({});
  const [receiptDates, setReceiptDates] = useState({});
  const [receiptAccounts, setReceiptAccounts] = useState({});
  const [receiptReferences, setReceiptReferences] = useState({});
  const [payslipFields, setPayslipFields] = useState(null);
  const [payslipAmounts, setPayslipAmounts] = useState({});
  const [payslipConfirmed, setPayslipConfirmed] = useState({});
  const [payslipName, setPayslipName] = useState("");
  const [payslipSettlementId, setPayslipSettlementId] = useState("");
  const [rulesSnapshot, setRulesSnapshot] = useState(null);
  const [holidayCalendar, setHolidayCalendar] = useState(null);
  const [calendarYear, setCalendarYear] = useState(dateNow().slice(0, 4));
  const [compensationProjection, setCompensationProjection] = useState(null);
  const [contributionMonth, setContributionMonth] = useState(dateNow().slice(0, 7));
  const [contributionGross, setContributionGross] = useState("");
  const [contributionIBC, setContributionIBC] = useState("");
  const [contributionScopeConfirmed, setContributionScopeConfirmed] = useState(false);
  const [contributionEstimate, setContributionEstimate] = useState(null);

  const selectedContract = vault.employmentContracts.find((item) => item.id === selectedContractId) || vault.employmentContracts[0] || null;
  const currentVersion = contractVersionOn(selectedContract, dateNow());
  const latestVersion = selectedContract?.versions.slice().sort((left, right) => Number(right.version || 0) - Number(left.version || 0))[0] || null;
  const accounts = vault.accounts.filter((account) => account.currency === "COP" && account.type !== "credit");
  const activeProfile = vault.employmentProfiles.find((item) => item.id === selectedContract?.employeeId);
  const missingConfirmations = Object.entries(extracted).filter(([, field]) => field.value && !confirmed[field.key]).length;
  const expectedDates = useMemo(() => { const [year, month] = dateNow().split("-").map(Number); return selectedContract ? expectedPaymentDates(selectedContract, year, month - 1) : []; }, [selectedContract]);

  useEffect(() => {
    let active = true;
    payrollRulesWithGoEngine(dateNow()).then((snapshot) => { if (active) setRulesSnapshot(snapshot); }).catch((cause) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const year = Number(calendarYear);
    if (!/^\d{4}$/.test(calendarYear) || year < 1900 || year > 9999) { setHolidayCalendar(null); return undefined; }
    let active = true;
    payrollHolidaysWithGoEngine(year).then((calendar) => { if (active) setHolidayCalendar(calendar); }).catch((cause) => { if (active) { setHolidayCalendar(null); setError(cause.message); } });
    return () => { active = false; };
  }, [calendarYear]);

  useEffect(() => {
    if (!currentVersion) { setCompensationProjection(null); return undefined; }
    let active = true;
    projectPayrollCompensationWithGoEngine({ contractVersionId: currentVersion.id, monthlySalaryCOP: currentVersion.salaryCOP, weeklyHours: currentVersion.weeklyHours || 0 })
      .then((projection) => { if (active) setCompensationProjection(projection); })
      .catch((cause) => { if (active) { setCompensationProjection(null); setError(cause.message); } });
    return () => { active = false; };
  }, [currentVersion?.id, currentVersion?.salaryCOP, currentVersion?.weeklyHours]);

  const createEmployee = (event) => {
    event.preventDefault();
    setError("");
    try {
      const profile = makeEmploymentProfile({ fullName: employeeName, employerName });
      updateVault((current) => ({ ...current, employmentProfiles: [...current.employmentProfiles, profile] }));
      setEmployeeId(profile.id);
      setEmployeeName("");
      setNotice("Perfil laboral guardado en la bóveda en memoria. Guarda el archivo .fdv para cifrarlo.");
    } catch (cause) { setError(cause.message); }
  };

  const importDocument = async (file) => {
    setError(""); setNotice(""); setBusy(true); setExtracted({}); setConfirmed({});
    try {
      const text = await extractEmploymentDocument(file);
      const fields = extractContractFields(text);
      const rows = Object.entries(fields).map(([key, value]) => ({ key, ...value }));
      setExtracted(Object.fromEntries(rows.map((item) => [item.key, item])));
      setDocumentName(file.name);
      if (fields.employeeName.value) setEmployeeName(fields.employeeName.value);
      const extractedSalary = fields.salaryCOP.value.replace(/[^\d]/g, "");
      if (extractedSalary) setSalaryCOP(extractedSalary);
      const extractedAllowance = fields.transportAllowanceCOP.value.replace(/[^\d]/g, "");
      if (extractedAllowance) setAllowanceCOP(extractedAllowance);
      if (fields.employerName.value) setEmployerName(fields.employerName.value);
      if (fields.startDate.value) {
        const dateMatch = fields.startDate.value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        setStartDate(dateMatch ? `${dateMatch[3]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[1].padStart(2, "0")}` : fields.startDate.value);
      }
      if (fields.contractType.value) setContractType(fields.contractType.value);
      if (fields.payFrequency.value) setPayFrequency(fields.payFrequency.value);
      if (fields.weeklyHours.value) setWeeklyHours(fields.weeklyHours.value);
      setNotice("Extracción local terminada. Cada valor detectado necesita confirmación antes de activar el contrato; el documento original no se guarda.");
    } catch (cause) { setError(cause.message || "No se pudo leer el documento."); }
    finally { setBusy(false); }
  };

  const createContract = (event) => {
    event.preventDefault(); setError("");
    if (missingConfirmations) { setError("Confirma o corrige cada campo que se extrajo del documento."); return; }
    try {
      const payDays = payDaysText.split(",").map((item) => Number(item.trim())).filter(Boolean);
      const evidence = documentName ? [{ id: `evidence-${Date.now()}`, fileName: documentName, extractedAt: new Date().toISOString(), fields: extracted, originalRetained: false }] : [];
      const profile = employeeId ? null : makeEmploymentProfile({ fullName: employeeName, employerName });
      const contract = makeEmploymentContract({ employeeId: employeeId || profile.id, employerName, contractType, salaryCOP, transportAllowanceCOP: Number(allowanceCOP) || 0, startDate, payDays, payFrequency, weeklyHours: weeklyHours === "" ? null : Number(weeklyHours), evidence, confirmedFields: ["employeeId", "salaryCOP", "startDate", "contractType", "employerName", "payFrequency", ...Object.keys(confirmed).filter((key) => confirmed[key])] });
      updateVault((current) => ({ ...current, employmentProfiles: profile ? [...current.employmentProfiles, profile] : current.employmentProfiles, employmentContracts: [...current.employmentContracts, contract], payrollEvidence: [...current.payrollEvidence, ...evidence] }));
      if (profile) setEmployeeId(profile.id);
      setSelectedContractId(contract.id);
      setSalaryCOP(""); setDocumentName(""); setExtracted({}); setConfirmed({});
      setNotice("Contrato guardado como una versión confirmada por ti. No se han aplicado reglas de liquidación legal.");
    } catch (cause) { setError(cause.message); }
  };

  const reviseContract = (event) => {
    event.preventDefault(); setError("");
    try {
      if (!selectedContract) throw new Error("Selecciona el contrato que vas a actualizar.");
      const revised = appendContractVersion(selectedContract, { salaryCOP: revisionSalary, effectiveFrom: revisionDate });
      updateVault((current) => ({ ...current, employmentContracts: current.employmentContracts.map((contract) => contract.id === revised.id ? revised : contract) }));
      setRevisionSalary(""); setNotice("Nueva versión contractual guardada. Las liquidaciones históricas conservan su versión de origen.");
    } catch (cause) { setError(cause.message); }
  };

  const clearWorkRecordForm = () => {
    setSelectedWorkRecordId(""); setCorrectionReason(""); setShiftNote(""); setScheduledStart(""); setScheduledEnd(""); setActualStart(""); setActualEnd(""); setBreaks([{ start: "", end: "" }]); setRestDay(false);
  };

  const editWorkRecord = (work) => {
    const owner = vault.employmentContracts.find((contract) => contract.versions.some((version) => version.id === work.contractVersionId));
    setSelectedContractId(owner?.id || ""); setSelectedWorkRecordId(work.id); setCorrectionReason(""); setShiftNote(work.note || "");
    setScheduledStart(toDateTimeInput(work.scheduledStart)); setScheduledEnd(toDateTimeInput(work.scheduledEnd)); setActualStart(toDateTimeInput(work.actualStart)); setActualEnd(toDateTimeInput(work.actualEnd));
    const savedBreaks = Array.isArray(work.breaks) ? work.breaks : work.breakStart && work.breakEnd ? [{ start: work.breakStart, end: work.breakEnd }] : [];
    setBreaks(savedBreaks.length ? savedBreaks.map((interval) => ({ start: toDateTimeInput(interval.start), end: toDateTimeInput(interval.end) })) : [{ start: "", end: "" }]); setRestDay(Boolean(work.restDay)); setShiftResult(null); setError(""); setSection("schedule");
  };

  const recordShift = async (event) => {
    event.preventDefault(); setError(""); setShiftResult(null);
    if (!selectedContract) { setError("Crea o selecciona un contrato."); return; }
    setBusy(true);
    try {
      const scheduledFrom = toBogotaTime(scheduledStart);
      const scheduledTo = toBogotaTime(scheduledEnd);
      const actualFrom = toBogotaTime(actualStart);
      const actualTo = toBogotaTime(actualEnd);
      const workStart = actualFrom || scheduledFrom;
      const workEnd = actualTo || scheduledTo;
      const version = contractVersionForShift(selectedContract, workStart, workEnd);
      const pauseIntervals = breaks.map((interval) => ({ start: toBogotaTime(interval.start), end: toBogotaTime(interval.end) })).filter((interval) => interval.start || interval.end);
      const input = { contractVersionId: version.id, scheduledStart: scheduledFrom, scheduledEnd: scheduledTo, actualStart: actualFrom, actualEnd: actualTo, breaks: pauseIntervals, restDay, publicHoliday: false, note: shiftNote };
      const existing = selectedWorkRecordId ? vault.payrollWorkRecords.find((row) => row.id === selectedWorkRecordId) : null;
      if (selectedWorkRecordId && !existing) throw new Error("El turno seleccionado ya no está disponible.");
      const workRecord = existing ? reviseWorkRecord(existing, input, correctionReason) : makeWorkRecord(input);
      assertNoOverlappingWorkRecord(vault.payrollWorkRecords, workRecord, selectedContract.employeeId, vault.employmentContracts, workRecord.id);
      const start = workRecord.actualStart || workRecord.scheduledStart;
      const end = workRecord.actualEnd || workRecord.scheduledEnd;
      const classifiedBreaks = workRecord.breaks || (workRecord.breakStart ? [{ start: workRecord.breakStart, end: workRecord.breakEnd }] : []);
      const classified = await classifyPayrollShiftWithGoEngine({ start, end, breaks: classifiedBreaks, timeZone: workRecord.timeZone, usePublishedClockRules: true, restDay: workRecord.restDay });
      const savedWork = { ...workRecord, publicHoliday: classified.publicHolidayMinutes > 0, holidayCalendarSource: classified.holidayCalendarSource, classification: classified, classificationEngineVersion: "payroll-cop-v1" };
      updateVault((current) => ({ ...current, payrollWorkRecords: existing ? current.payrollWorkRecords.map((row) => row.id === existing.id ? savedWork : row) : [...current.payrollWorkRecords, savedWork] }));
      setShiftResult(classified); setNotice(existing ? "Corrección guardada con el turno anterior y su clasificación en el historial." : "Turno registrado. La clasificación es informativa y no calcula recargos ni declara cumplimiento legal.");
      clearWorkRecordForm();
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const calculateSettlement = async (event) => {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      if (!selectedContract) throw new Error("Selecciona un contrato.");
      const periodVersion = contractVersionForPeriod(selectedContract, periodStart, periodEnd);
      if (!amountsConfirmed) throw new Error("Confirma que los importes fueron ingresados y revisados por ti.");
      const gross = Number(grossInput);
      const deductions = Number(deductionInput || 0);
      if (!Number.isSafeInteger(gross) || gross <= 0) throw new Error("Ingresa un total bruto positivo en pesos enteros.");
      if (!Number.isSafeInteger(deductions) || deductions < 0) throw new Error("Las deducciones deben ser pesos enteros no negativos.");
      const earnings = [{ id: "user-entered-gross", label: "Total bruto ingresado por la persona", pesos: gross, source: "user-confirmed", confirmed: true }];
      const deductionsList = deductions > 0 ? [{ id: "user-entered-deductions", label: "Deducciones ingresadas por la persona", pesos: deductions, source: "user-confirmed", confirmed: true }] : [];
      const periodWorkRecords = workRecordsForPeriod(vault.payrollWorkRecords, periodVersion.id, periodStart, periodEnd);
      for (const workRecord of periodWorkRecords) assertNoOverlappingWorkRecord(vault.payrollWorkRecords, workRecord, selectedContract.employeeId, vault.employmentContracts, workRecord.id);
      const calculation = await calculatePayrollWithGoEngine({ contractVersionId: periodVersion.id, ruleSetVersion: PAYROLL_RULESET_VERSION, periodStart, periodEnd, earnings, deductions: deductionsList });
      const settlement = makePayrollSettlement({ contractVersion: periodVersion, periodStart, periodEnd, cutoffDate: payrollCutoffDate, expectedPaymentDate: expectedPayrollPaymentDate, earnings, deductions: deductionsList, calculation, workRecords: periodWorkRecords });
      updateVault((current) => ({ ...current, payrollSettlements: [...current.payrollSettlements, settlement] }));
      setGrossInput(""); setDeductionInput("0"); setAmountsConfirmed(false);
      setNotice("Resumen reproducible guardado. Solo suma importes que confirmaste; no es una liquidación legal automática.");
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const estimateContributions = async () => {
    setError(""); setNotice(""); setContributionEstimate(null); setBusy(true);
    try {
      if (!selectedContract) throw new Error("Selecciona un contrato laboral.");
      if (!contributionScopeConfirmed) throw new Error("Confirma que se cumplen todos los supuestos del estimador antes de continuar.");
      if (!/^\d{4}-\d{2}$/.test(contributionMonth)) throw new Error("Selecciona un mes calendario válido.");
      const periodStart = `${contributionMonth}-01`;
      const [year, month] = contributionMonth.split("-").map(Number);
      const periodEnd = `${contributionMonth}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
      const version = contractVersionForPeriod(selectedContract, periodStart, periodEnd);
      const rules = await payrollRulesWithGoEngine(periodStart);
      const result = await estimateEmployeeContributionsWithGoEngine({
        contractVersionId: version.id, periodStart, periodEnd,
        grossCOP: Number(contributionGross), ibcCOP: Number(contributionIBC),
        ruleSetVersion: rules.version,
        applicability: "dependent-full-calendar-month-general-pension-unpensioned-single-employer",
        ibcConfirmed: true,
      });
      setContributionEstimate(result);
      setNotice("Estimación informativa calculada en Go/WASM. Revísala antes de ingresarla manualmente en una liquidación.");
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const recordReceipt = (settlement) => {
    setError("");
    try {
      const receipt = makePayrollReceipt({ settlement: { ...settlement, receipts: (settlement.receipts || []).map((id) => vault.payrollReceipts.find((item) => item.id === id)).filter(Boolean) }, pesos: receiptAmounts[settlement.id] || settlement.calculation.netCOP - settlement.totalReceivedCOP, receivedAt: receiptDates[settlement.id] || dateNow(), accountId: receiptAccounts[settlement.id] || accounts[0]?.id, bankReference: receiptReferences[settlement.id] });
      updateVault((current) => addReceiptToLedger(current, receipt));
      setNotice("Pago confirmado y vinculado al ledger. La referencia evita que la misma recepción se registre dos veces.");
      setReceiptReferences((current) => ({ ...current, [settlement.id]: "" }));
    } catch (cause) { setError(cause.message); }
  };

  const importPayslip = async (file) => {
    if (!file) return;
    setError(""); setNotice(""); setBusy(true); setPayslipFields(null); setPayslipConfirmed({}); setPayslipAmounts({});
    try {
      const text = await extractEmploymentDocument(file);
      const fields = extractPayslipFields(text);
      const amounts = Object.fromEntries(Object.entries(fields).map(([key, row]) => [key, row.value.replace(/[^\d]/g, "")]));
      setPayslipFields(fields); setPayslipAmounts(amounts); setPayslipName(file.name);
      setPayslipSettlementId(vault.payrollSettlements.find((item) => item.periodStart === fields.period.value.slice(0, 10))?.id || vault.payrollSettlements[0]?.id || "");
      setNotice("El desprendible se procesó localmente. Revisa y confirma cada importe antes de guardar la comparación.");
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const confirmPayslip = () => {
    setError("");
    try {
      const settlement = vault.payrollSettlements.find((item) => item.id === payslipSettlementId);
      if (!settlement) throw new Error("Selecciona la liquidación de referencia.");
      const actuals = Object.fromEntries(["grossCOP", "deductionsCOP", "netCOP"].map((key) => [key, { pesos: payslipAmounts[key], confirmed: Boolean(payslipConfirmed[key]) }]));
      const reviewedFields = Object.fromEntries(Object.entries(payslipFields).filter(([key]) => payslipConfirmed[key]).map(([key, row]) => [key, { ...row, confirmed: true, validationStatus: "user-confirmed" }]));
      const payslip = { id: `payslip-${Date.now()}`, settlementId: settlement.id, sourceName: payslipName, extractedAt: new Date().toISOString(), originalRetained: false, extractedFields: reviewedFields, actualsCOP: Object.fromEntries(Object.entries(actuals).filter(([, row]) => row.confirmed).map(([key, row]) => [key, Number(row.pesos)])), reviewStatus: "user-confirmed" };
      const reconciliation = makePayrollReconciliation({ settlement, payslip, actuals });
      updateVault((current) => ({ ...current, payrollPayslips: [...current.payrollPayslips, payslip], payrollReconciliations: [...current.payrollReconciliations, reconciliation] }));
      setPayslipFields(null); setPayslipAmounts({}); setPayslipConfirmed({});
      setNotice("Comparación de importes guardada. Las diferencias requieren revisión; no determinan por sí solas un incumplimiento.");
    } catch (cause) { setError(cause.message); }
  };

  const sections = [["overview", "Resumen"], ["contracts", "Contratos"], ["schedule", "Jornadas"], ["settlements", "Liquidaciones"], ["calendar", "Calendario"], ["reconcile", "Desprendibles"]];

  return <div className="workspace payroll-workspace">
    <header className="payroll-hero">
      <div><span className="eyebrow">TRABAJO · ESPACIO LOCAL CIFRADO</span><h2>Tu ingreso laboral, claro y trazable.</h2><p>Contratos y pagos viven en esta bóveda. Las estimaciones no se registran como dinero recibido.</p></div>
      <div className="payroll-rule-status"><span className="status-dot" /> Reglas legales en revisión profesional</div>
    </header>
    <nav className="payroll-tabs" aria-label="Secciones de nómina">{sections.map(([key, label]) => <button key={key} className={section === key ? "active" : ""} onClick={() => setSection(key)}>{label}</button>)}</nav>
    {error && <div className="notice error" role="alert">{error}</div>}
    {notice && <div className="notice success" role="status">{notice}</div>}

    {section === "overview" && <>
      <div className="payroll-metrics">
        <article><small>Perfil activo</small><strong>{activeProfile?.fullName || "Sin perfil"}</strong><span>{activeProfile?.employerName || "Agrega tu información laboral"}</span></article>
        <article><small>Contrato vigente</small><strong>{currentVersion ? money(currentVersion.salaryCOP) : "—"}</strong><span>{currentVersion ? `${currentVersion.contractType === "indefinite" ? "Indefinido" : currentVersion.contractType} · COP / mes` : "Aún no hay contrato"}</span></article>
        <article><small>Próximas fechas previstas</small><strong>{expectedDates.length ? expectedDates.join(" · ") : "—"}</strong><span>Fechas configuradas por empleador</span></article>
        <article><small>Saldo recibido registrado</small><strong>{money(vault.payrollReceipts.reduce((sum, item) => sum + item.pesos, 0))}</strong><span>Ya vinculado a movimientos del ledger</span></article>
      </div>
      {compensationProjection && <Card title="Equivalentes del salario contractual" eyebrow={`${compensationProjection.engineVersion} · ${compensationProjection.weeklyHours ? `${compensationProjection.weeklyHours} h / semana` : "horas semanales no confirmadas"}`}>
        <div className="payroll-history"><span>Por hora equivalente <b>{compensationProjection.hourlyEquivalentCOP == null ? "Confirma horas semanales" : money(compensationProjection.hourlyEquivalentCOP)}</b></span><span>Por día <b>{money(compensationProjection.dailyEquivalentCOP)}</b></span><span>Por semana <b>{money(compensationProjection.weeklyEquivalentCOP)}</b></span><span>Por quincena <b>{money(compensationProjection.biweeklyEquivalentCOP)}</b></span><span>Por mes <b>{money(compensationProjection.monthlySalaryCOP)}</b></span></div>
        <p className="payroll-disclaimer">Proyección para planificar caja: salario mensual ÷ 30 para el día; equivalente semanal anualizado a 12 meses y 52 semanas. El equivalente por hora solo aparece si confirmaste las horas semanales. Redondeo al peso más cercano, mitad hacia arriba. No es tarifa legal, liquidación ni determina tiempo extra, recargos o prestaciones.</p>
      </Card>}
      <Card title="Empieza con tus datos de trabajo" eyebrow="CONFIGURACIÓN">
        {vault.employmentProfiles.length === 0 ? <form className="form-grid payroll-form" onSubmit={createEmployee}><Field label="Nombre de la persona trabajadora" value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} required/><Field label="Empleador (opcional)" value={employerName} onChange={(event) => setEmployerName(event.target.value)}/><div className="form-actions"><button className="button primary" type="submit">Crear perfil</button></div></form> : <div className="payroll-empty-actions"><p>Elige una sección para gestionar el perfil, contrato, jornada, liquidaciones y pagos.</p><button className="button primary" onClick={() => setSection("contracts")}>Configurar contrato</button></div>}
      </Card>
      <Card title="Resumen de periodos" eyebrow="HISTORIAL"><div className="payroll-history"><span>{vault.payrollSettlements.length} resúmenes guardados</span><span>{vault.payrollWorkRecords.length} turnos registrados</span><span>{vault.payrollPayslips.length} desprendibles en revisión</span></div><p className="payroll-disclaimer">La clasificación de jornada no calcula recargos. Los montos de liquidación son conceptos ingresados y confirmados por ti; revisa cada resultado con un profesional antes de usarlo para una decisión laboral.</p></Card>
      <Card title="Parámetros laborales publicados" eyebrow={rulesSnapshot?.version || "CARGANDO CATÁLOGO LOCAL"}>
        {rulesSnapshot ? <div className="payroll-history"><span>SMMLV: {money(rulesSnapshot.minimumMonthlyCOP)}</span><span>Auxilio de transporte publicado: {money(rulesSnapshot.transportAllowanceCOP)}</span><span>Jornada máxima semanal de referencia: {rulesSnapshot.maxWeeklyHours} h</span><span>Horario diurno de referencia: 06:00–{String(Math.floor(rulesSnapshot.nighttimeStartMinute / 60)).padStart(2, "0")}:00</span><span>Recargo transitorio de descanso obligatorio: {rulesSnapshot.restDayPremiumPercent}%</span><span>Vigencia de jornada nocturna: desde {rulesSnapshot.nightWindowEffectiveFrom}</span></div> : <p className="payroll-hint">El catálogo local no está disponible.</p>}
        {rulesSnapshot?.employerMayApplyFullRateEarly && <p className="payroll-hint">La norma permite que el empleador adopte anticipadamente el recargo pleno del 100%; el catálogo no conoce cuál política aplica a tu contrato.</p>}
        <p className="payroll-disclaimer">Catálogo informativo con fuentes oficiales. No determina elegibilidad, alcance contractual, recargos combinados, aportes ni valores de liquidación; valida su aplicación profesionalmente.</p>
        {rulesSnapshot && <div className="payroll-history"><a href={rulesSnapshot.minimumWageSource.split("; ")[0]} target="_blank" rel="noreferrer">Fuente del SMMLV</a><a href={rulesSnapshot.transportSource} target="_blank" rel="noreferrer">Fuente del auxilio</a><a href={rulesSnapshot.weeklyHoursSource} target="_blank" rel="noreferrer">Fuente de jornada</a><a href={rulesSnapshot.clockRulesSource} target="_blank" rel="noreferrer">Fuente de horario nocturno</a><a href={rulesSnapshot.restDayPremiumSource} target="_blank" rel="noreferrer">Fuente de recargo de descanso</a></div>}
      </Card>
    </>}

    {section === "contracts" && <div className="payroll-columns">
      <Card title="Perfil laboral" eyebrow="PERSONA">
        {vault.employmentProfiles.map((profile) => <div key={profile.id} className="payroll-list-row"><div><strong>{profile.fullName}</strong><span>{profile.employerName || "Empleador pendiente"}</span></div><button className="button" onClick={() => { setEmployeeId(profile.id); setEmployerName(profile.employerName); }}>Seleccionar</button></div>)}
        <form className="form-grid payroll-form" onSubmit={createEmployee}><Field label="Nombre" value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} required/><Field label="Empleador" value={employerName} onChange={(event) => setEmployerName(event.target.value)}/><div className="form-actions"><button className="button" type="submit">Guardar perfil</button></div></form>
      </Card>
      <Card title="Importar o registrar contrato" eyebrow="PDF · DOCX · TXT · MANUAL">
        <label className="document-drop"><strong>{busy ? "Procesando localmente…" : "Seleccionar documento de contrato"}</strong><span>Hasta 10 MiB. PDF con texto, DOCX o TXT; el original no se conserva.</span><input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) importDocument(file); event.target.value = ""; }}/></label>
        {Object.values(extracted).filter((item) => item.value).map((field) => <label className="evidence-row" key={field.key}><input type="checkbox" checked={Boolean(confirmed[field.key])} onChange={(event) => setConfirmed((current) => ({ ...current, [field.key]: event.target.checked }))}/><span><b>{field.key}</b> · {field.value}<small>Fuente: línea {field.source?.line || "no detectada"} · confianza heurística {Math.round(field.confidence * 100)}% · requiere tu confirmación</small></span></label>)}
        <form className="form-grid payroll-form" onSubmit={createContract}>
          <label className="field"><span>Perfil existente (opcional si creas uno con el nombre)</span><select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} required={!employeeName.trim()}><option value="">Crear perfil con el nombre indicado</option>{vault.employmentProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.fullName}</option>)}</select></label>
          <label className="field"><span>Tipo de contrato</span><select value={contractType} onChange={(event) => setContractType(event.target.value)}><option value="indefinite">Indefinido</option><option value="fixed-term">Término fijo</option><option value="work-or-labor">Obra o labor</option><option value="occasional">Ocasional</option><option value="other">Otro</option></select></label>
          <Field label="Empleador" value={employerName} onChange={(event) => setEmployerName(event.target.value)}/><Field label="Salario mensual (COP enteros)" inputMode="numeric" value={salaryCOP} onChange={(event) => setSalaryCOP(event.target.value.replace(/[^\d]/g, ""))} required/>
          <Field label="Auxilio mensual indicado en contrato (COP)" inputMode="numeric" value={allowanceCOP} onChange={(event) => setAllowanceCOP(event.target.value.replace(/[^\d]/g, ""))}/><Field label="Vigente desde" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required/>
          <Field label="Días de pago previstos" value={payDaysText} onChange={(event) => setPayDaysText(event.target.value)} placeholder="5, 20"/>
          <label className="field"><span>Frecuencia pactada</span><select value={payFrequency} onChange={(event) => setPayFrequency(event.target.value)}><option value="weekly">Semanal</option><option value="biweekly">Quincenal</option><option value="monthly">Mensual</option><option value="custom">Otra / personalizada</option></select></label>
          <Field label="Horas ordinarias semanales pactadas (opcional)" type="number" min="1" max="168" value={weeklyHours} onChange={(event) => setWeeklyHours(event.target.value)}/>
          <div className="form-actions"><button className="button primary" type="submit" disabled={!vault.employmentProfiles.length || missingConfirmations > 0}>Guardar versión confirmada</button></div>
        </form>
        {!Object.keys(extracted).length && <p className="payroll-hint">La detección automática es heurística; puedes completar el formulario manualmente. Un campo no detectado nunca se inventa.</p>}
      </Card>
      <Card title="Versiones de contrato" eyebrow="HISTORIAL INMUTABLE">
        {vault.employmentContracts.map((contract) => <div className="payroll-contract" key={contract.id}><div><strong>{vault.employmentProfiles.find((profile) => profile.id === contract.employeeId)?.fullName || "Perfil"} · {contract.employerName || "Empleador"}</strong><span>{contract.versions.length} versión(es) · estado {contract.status}</span></div>{contract.versions.map((version) => <div className="payroll-version" key={version.id}><b>{money(version.salaryCOP)} / mes</b><span>Desde {version.effectiveFrom} · pago {version.payDays.join(" y ")}</span></div>)}<button className="button" onClick={() => { setSelectedContractId(contract.id); setSection("schedule"); }}>Usar contrato</button></div>)}
        {!vault.employmentContracts.length && <p className="payroll-hint">Aún no hay contratos. Los documentos originales no se guardan.</p>}
      </Card>
      {selectedContract && <Card title="Registrar cambio contractual" eyebrow="NUEVA VERSIÓN"><form className="form-grid payroll-form" onSubmit={reviseContract}><Field label="Nuevo salario mensual (COP enteros)" inputMode="numeric" value={revisionSalary} onChange={(event) => setRevisionSalary(event.target.value.replace(/[^\d]/g, ""))} required/><Field label="Vigente desde" type="date" min={latestVersion?.effectiveFrom} value={revisionDate} onChange={(event) => setRevisionDate(event.target.value)} required/><div className="form-actions"><button className="button" type="submit">Guardar nueva versión</button></div></form><p className="payroll-hint">El cambio no modifica liquidaciones anteriores. La fecha final de la versión anterior es exclusiva.</p></Card>}
    </div>}

    {section === "schedule" && <div className="payroll-columns">
      <Card title="Registrar jornada" eyebrow="PLANIFICADO ≠ TRABAJADO">
        <label className="field"><span>Contrato</span><select value={selectedContractId} onChange={(event) => setSelectedContractId(event.target.value)}><option value="">Selecciona</option>{vault.employmentContracts.map((contract) => <option key={contract.id} value={contract.id}>{vault.employmentProfiles.find((profile) => profile.id === contract.employeeId)?.fullName} · {contract.employerName || "Contrato"}</option>)}</select></label>
        <form className="form-grid payroll-form" onSubmit={recordShift}>
          <Field label="Inicio programado" type="datetime-local" value={scheduledStart} onChange={(event) => setScheduledStart(event.target.value)} required/><Field label="Fin programado" type="datetime-local" value={scheduledEnd} onChange={(event) => setScheduledEnd(event.target.value)} required/>
          <Field label="Inicio real (opcional)" type="datetime-local" value={actualStart} onChange={(event) => setActualStart(event.target.value)}/><Field label="Fin real (opcional)" type="datetime-local" value={actualEnd} onChange={(event) => setActualEnd(event.target.value)}/>
          <div className="payroll-breaks full">{breaks.map((interval, index) => <div className="payroll-break-row" key={`break-${index}`}><Field label={`Inicio de pausa ${index + 1}`} type="datetime-local" value={interval.start} onChange={(event) => setBreaks((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, start: event.target.value } : row))}/><Field label={`Fin de pausa ${index + 1}`} type="datetime-local" value={interval.end} onChange={(event) => setBreaks((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, end: event.target.value } : row))}/><button className="button" type="button" aria-label={`Eliminar pausa ${index + 1}`} onClick={() => setBreaks((current) => current.filter((_, rowIndex) => rowIndex !== index))}>Quitar</button></div>)}<button className="button" type="button" onClick={() => setBreaks((current) => [...current, { start: "", end: "" }])}>Agregar pausa</button></div>
          <label className="payroll-check"><input type="checkbox" checked={restDay} onChange={(event) => setRestDay(event.target.checked)}/> Era mi día de descanso pactado</label>
          <Field label="Nota del turno (opcional)" value={shiftNote} onChange={(event) => setShiftNote(event.target.value)} maxLength="500"/>
          {selectedWorkRecordId && <><Field label="Razón de la corrección" value={correctionReason} onChange={(event) => setCorrectionReason(event.target.value)} maxLength="500" required/><div className="payroll-hint">La versión anterior y su clasificación se conservarán en el historial del turno.</div></>}
          <div className="form-actions"><button className="button primary" disabled={busy || !selectedContract} type="submit">{busy ? "Clasificando…" : selectedWorkRecordId ? "Guardar corrección" : "Guardar jornada"}</button>{selectedWorkRecordId && <button className="button" type="button" disabled={busy} onClick={clearWorkRecordForm}>Cancelar corrección</button>}</div>
        </form>
        {shiftResult && <div className="shift-classification"><b>Clasificación horaria informativa · America/Bogota</b><span>{shiftResult.daytimeMinutes} min diurnos · {shiftResult.nighttimeMinutes} min nocturnos</span><span>{shiftResult.sundayMinutes} min domingo · {shiftResult.restDayMinutes} min descanso · {shiftResult.publicHolidayMinutes} min festivo</span><small>{shiftResult.classification}. Reglas: {(shiftResult.ruleSetVersions || []).join(", ")}. Excluye todos los intervalos de pausa; no liquida recargos ni horas extra.</small></div>}
      </Card>
      <Card title="Historial de turnos" eyebrow="REGISTROS GUARDADOS">
        {vault.payrollWorkRecords.slice().reverse().map((work) => <div className="payroll-list-row payroll-work-row" key={work.id}><div><strong>{new Date(work.actualStart || work.scheduledStart).toLocaleString("es-CO")} · revisión {work.revision || 1}</strong><span>Programado: {work.scheduledStart} — {work.scheduledEnd}</span><span>Real: {work.actualStart || "pendiente"} — {work.actualEnd || "pendiente"}</span>{work.classification && <span>{work.classification.daytimeMinutes} min día · {work.classification.nighttimeMinutes} min noche · {work.classification.sundayMinutes} min domingo · {work.classification.publicHolidayMinutes} min festivo</span>}{work.correctionReason && <small>Última corrección: {work.correctionReason}</small>}{Array.isArray(work.revisionHistory) && work.revisionHistory.length > 0 && <details className="payroll-revision-history"><summary>Ver {work.revisionHistory.length} versión(es) anterior(es)</summary>{work.revisionHistory.map((revision, index) => <article key={`${work.id}-${revision.revision || index}`}><b>Revisión {revision.revision || index + 1} · {revision.changedAt ? new Date(revision.changedAt).toLocaleString("es-CO") : "Fecha desconocida"}</b><p>{revision.reason || "Sin motivo registrado"}</p><span>Horario real anterior: {revision.record?.actualStart || "pendiente"} — {revision.record?.actualEnd || "pendiente"}</span><span>Clasificación anterior: {revision.record?.classification?.daytimeMinutes || 0} min día · {revision.record?.classification?.nighttimeMinutes || 0} min noche</span></article>)}</details>}</div><button className="button" type="button" onClick={() => editWorkRecord(work)}>Corregir turno</button></div>)}
        {!vault.payrollWorkRecords.length && <p className="payroll-hint">Los turnos programados y reales se guardan por separado.</p>}
      </Card>
    </div>}

    {section === "settlements" && <div className="payroll-columns">
      <Card title="Estimar aportes del trabajador" eyebrow="CASO MENSUAL ACOTADO">
        <p className="payroll-hint">Calcula salud, pensión y solidaridad con tasas laborales versionadas para un mes completo. Ingresa el IBC que verificaste; no se infiere del salario ni del auxilio.</p>
        <div className="form-grid payroll-form">
          <Field label="Mes calendario" type="month" value={contributionMonth} onChange={(event) => { setContributionMonth(event.target.value); setContributionEstimate(null); }}/>
          <Field label="Total bruto del mes (COP)" inputMode="numeric" value={contributionGross} onChange={(event) => { setContributionGross(event.target.value.replace(/[^\d]/g, "")); setContributionEstimate(null); }}/>
          <Field label="IBC mensual confirmado (COP)" inputMode="numeric" value={contributionIBC} onChange={(event) => { setContributionIBC(event.target.value.replace(/[^\d]/g, "")); setContributionEstimate(null); }}/>
          <label className="payroll-check full"><input type="checkbox" checked={contributionScopeConfirmed} onChange={(event) => { setContributionScopeConfirmed(event.target.checked); setContributionEstimate(null); }}/> Confirmo: trabajador dependiente no pensionado, un empleador, mes completo, sistema general y sin régimen o excepción especial; revisé el IBC.</label>
          <div className="form-actions"><button className="button primary" type="button" disabled={busy || !selectedContract} onClick={estimateContributions}>{busy ? "Calculando en Go/WASM…" : "Estimar aportes"}</button></div>
        </div>
        {contributionEstimate && <div className="shift-classification"><b>Estimación informativa · {contributionEstimate.periodStart} — {contributionEstimate.periodEnd}</b><span>Salud trabajador: {money(contributionEstimate.healthEmployeeCOP)}</span><span>Pensión trabajador: {money(contributionEstimate.pensionEmployeeCOP)}</span><span>Fondo de solidaridad: {money(contributionEstimate.solidarityCOP)}</span><span>Deducciones estimadas: {money(contributionEstimate.totalDeductionsCOP)} · neto estimado: {money(contributionEstimate.estimatedNetCOP)}</span><small>{contributionEstimate.verification}. {contributionEstimate.pensionTransition}. Motor {contributionEstimate.engineVersion} · reglas {contributionEstimate.ruleSetVersion}. Este resultado no se agrega a la liquidación ni al ledger.</small><details><summary>Fuentes oficiales</summary>{contributionEstimate.sources.flatMap((source) => source.split("; ")).map((source, index) => <a key={`${index}-${source}`} href={source} target="_blank" rel="noreferrer">Fuente {index + 1}</a>)}</details></div>}
        <p className="payroll-disclaimer">Solo mes calendario completo, IBC entre 1 y 25 SMMLV y parámetros de mínimo estables durante el periodo. Los aportes se aproximan al múltiplo de $100 superior según el artículo 3.2.1.5 del Decreto 780/2016, modificado por el Decreto 1990/2016. Excluye prestaciones, horas extra, ausencias, empleadores múltiples, regímenes especiales, pensionados y determinación legal definitiva. Requiere revisión profesional.</p>
      </Card>
      <Card title="Crear resumen reproducible" eyebrow="SOLO IMPORTES CONFIRMADOS">
        <label className="field"><span>Contrato versionado</span><select value={selectedContractId} onChange={(event) => setSelectedContractId(event.target.value)}><option value="">Selecciona</option>{vault.employmentContracts.map((contract) => <option key={contract.id} value={contract.id}>{vault.employmentProfiles.find((profile) => profile.id === contract.employeeId)?.fullName} · {contract.employerName || "Contrato"}</option>)}</select></label>
        <form className="form-grid payroll-form" onSubmit={calculateSettlement}>
          <Field label="Inicio del periodo laborado" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} required/><Field label="Fin del periodo laborado" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} required/>
          <Field label="Fecha de corte" type="date" min={periodEnd} value={payrollCutoffDate} onChange={(event) => setPayrollCutoffDate(event.target.value)} required/><Field label="Fecha prevista de pago (opcional)" type="date" min={payrollCutoffDate} value={expectedPayrollPaymentDate} onChange={(event) => setExpectedPayrollPaymentDate(event.target.value)}/>
          <Field label="Total bruto que revisaste (COP)" inputMode="numeric" value={grossInput} onChange={(event) => setGrossInput(event.target.value.replace(/[^\d]/g, ""))} required/><Field label="Deducciones que revisaste (COP)" inputMode="numeric" value={deductionInput} onChange={(event) => setDeductionInput(event.target.value.replace(/[^\d]/g, ""))}/>
          <label className="payroll-check full"><input type="checkbox" checked={amountsConfirmed} onChange={(event) => setAmountsConfirmed(event.target.checked)}/> Confirmo que estos importes los ingresé y revisé. Este resumen no determina cumplimiento legal.</label>
          <div className="form-actions"><button className="button primary" disabled={busy || !selectedContract} type="submit">{busy ? "Calculando en Go/WASM…" : "Calcular y guardar"}</button></div>
        </form>
        <p className="payroll-hint">El motor Go suma conceptos en pesos enteros y calcula neto = bruto − deducciones. No deriva recargos, aportes ni prestaciones legales.</p>
      </Card>
      <Card title="Historial de liquidaciones" eyebrow="NO SE MODIFICA AL RECALCULAR">
        {vault.payrollSettlements.slice().reverse().map((settlement) => <div className="payroll-settlement" key={settlement.id}>
          <div className="payroll-settlement-head"><div><strong>{settlement.periodStart} — {settlement.periodEnd}</strong><span>Corte {settlement.cutoffDate} · pago previsto {settlement.expectedPaymentDate || "sin fecha"}</span><span>Resumen creado {settlement.settledAt ? new Date(settlement.settledAt).toLocaleString("es-CO") : "fecha no registrada"} · {settlement.contractSnapshot.contractType} · {settlement.status} · {settlement.calculation.engineVersion}</span></div><span className="payroll-status-tag">{money(settlement.calculation.netCOP)}</span></div>
          <div className="payroll-breakdown"><span>Bruto ingresado <b>{money(settlement.calculation.grossCOP)}</b></span><span>Deducciones ingresadas <b>{money(settlement.calculation.deductionsCOP)}</b></span><span>Recibido <b>{money(settlement.totalReceivedCOP)}</b></span></div>
          <details className="payroll-revision-history"><summary>Evidencia de jornada: {settlement.workRecordSnapshots?.length || 0} turno(s) del periodo</summary>{(settlement.workRecordSnapshots || []).map((work) => <article key={`${settlement.id}-${work.id}`}><b>{work.actualStart || work.scheduledStart} — {work.actualEnd || work.scheduledEnd} · revisión {work.revision || 1}</b><span>{work.classification?.daytimeMinutes || 0} min día · {work.classification?.nighttimeMinutes || 0} min noche · {work.classification?.sundayMinutes || 0} min domingo · {work.classification?.publicHolidayMinutes || 0} min festivo</span><small>Contrato versión {work.contractVersionId} · reglas {(work.classification?.ruleSetVersions || []).join(", ") || "sin clasificación histórica"}</small></article>)}<p>Estos turnos quedan congelados como evidencia histórica. El resumen monetario sigue limitado a los conceptos ingresados y confirmados por ti.</p></details>
          <small className="payroll-disclaimer">{settlement.calculation.verification} · reglas pendientes de revisión profesional.</small>
          {settlement.status !== "received" && <div className="receipt-form"><Field label="Monto recibido (COP)" inputMode="numeric" value={receiptAmounts[settlement.id] ?? Math.max(0, settlement.calculation.netCOP - settlement.totalReceivedCOP)} onChange={(event) => setReceiptAmounts((current) => ({ ...current, [settlement.id]: event.target.value.replace(/[^\d]/g, "") }))}/><Field label="Fecha real de recepción" type="date" value={receiptDates[settlement.id] || dateNow()} onChange={(event) => setReceiptDates((current) => ({ ...current, [settlement.id]: event.target.value }))}/><label className="field"><span>Cuenta COP</span><select value={receiptAccounts[settlement.id] || accounts[0]?.id || ""} onChange={(event) => setReceiptAccounts((current) => ({ ...current, [settlement.id]: event.target.value }))}><option value="">Selecciona cuenta</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><Field label="Referencia única del pago" value={receiptReferences[settlement.id] || ""} onChange={(event) => setReceiptReferences((current) => ({ ...current, [settlement.id]: event.target.value }))}/><button className="button" disabled={!accounts.length} onClick={() => recordReceipt(settlement)}>Confirmar recepción y registrar ingreso</button></div>}
        </div>)}
        {!vault.payrollSettlements.length && <p className="payroll-hint">Aún no hay resúmenes guardados.</p>}
      </Card>
    </div>}

    {section === "calendar" && <div className="payroll-columns">
      <Card title="Fechas previstas" eyebrow="NO MUEVE DINERO">
        {vault.employmentContracts.map((contract) => <div className="payroll-calendar-contract" key={contract.id}><strong>{vault.employmentProfiles.find((profile) => profile.id === contract.employeeId)?.fullName} · {contract.employerName || "Empleador"}</strong><span>Periodo: configurable por empleador</span>{expectedPaymentDates(contract, new Date().getFullYear(), new Date().getMonth()).map((date) => <div className="payroll-calendar-date" key={date}><b>{new Date(`${date}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "long" })}</b><span>Pago esperado · pendiente de confirmación</span></div>)}</div>)}
        {!vault.employmentContracts.length && <p className="payroll-hint">Agrega un contrato para ver las fechas configuradas. Los días 5 y 20 son una preferencia editable, no una regla legal universal.</p>}
      </Card>
      <Card title="Estados financieros separados" eyebrow="CONTROL DE CAJA"><div className="payroll-state-list"><span><i>01</i><b>Esperado</b> Fecha prevista; no afecta saldo.</span><span><i>02</i><b>Ingresado</b> Resumen de importes confirmado.</span><span><i>03</i><b>Recibido</b> Pago confirmado y transacción de ledger.</span></div><p className="payroll-disclaimer">No se desplazan fechas por festivos automáticamente. La fecha real se registra al recibir el dinero.</p></Card>
      <Card title={`Festivos nacionales ${holidayCalendar?.year || ""}`} eyebrow="LEY 51 DE 1983">
        <Field label="Año del calendario" type="number" min="1900" max="9999" value={calendarYear} onChange={(event) => setCalendarYear(event.target.value)}/>
        {holidayCalendar ? <div className="payroll-calendar-holidays">{holidayCalendar.entries.map((holiday) => <div className="payroll-calendar-date" key={holiday.date}><b>{new Date(`${holiday.date}T12:00:00Z`).toLocaleDateString("es-CO", { timeZone: "UTC", day: "numeric", month: "long" })}</b><span>{holiday.names.join(" · ")}{holiday.transferred ? ` · trasladado desde ${holiday.legalDate}` : ""}</span></div>)}</div> : <p className="payroll-hint">El calendario oficial local no está disponible.</p>}
        <p className="payroll-disclaimer">Los festivos remunerados y el día de descanso pactado se conservan como conceptos separados. Este calendario no cambia el pago esperado configurado por el empleador.</p>
        {holidayCalendar && <a href={holidayCalendar.source} target="_blank" rel="noreferrer">Consultar Ley 51 de 1983</a>}
      </Card>
    </div>}

    {section === "reconcile" && <div className="payroll-columns">
      <Card title="Importar desprendible local" eyebrow="PDF · DOCX · TXT">
        <label className="document-drop"><strong>{busy ? "Procesando localmente…" : "Seleccionar archivo de desprendible"}</strong><span>El archivo se procesa en este dispositivo y no se guarda como original.</span><input type="file" accept=".pdf,.docx,.txt" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) importPayslip(file); event.target.value = ""; }}/></label>
        {payslipFields && <div className="payslip-review">
          <label className="field"><span>Liquidación estimada a comparar</span><select value={payslipSettlementId} onChange={(event) => setPayslipSettlementId(event.target.value)}><option value="">Selecciona periodo</option>{vault.payrollSettlements.map((settlement) => <option key={settlement.id} value={settlement.id}>{settlement.periodStart} — {settlement.periodEnd} · {money(settlement.calculation.netCOP)}</option>)}</select></label>
          <p className="payroll-hint">Documento: {payslipName} · Periodo extraído: {payslipFields.period.value || "sin detectar; selecciona la liquidación manualmente"}</p>
          {["grossCOP", "deductionsCOP", "netCOP"].map((key) => <label className="evidence-row" key={key}><input type="checkbox" checked={Boolean(payslipConfirmed[key])} onChange={(event) => setPayslipConfirmed((current) => ({ ...current, [key]: event.target.checked }))}/><span><b>{{ grossCOP: "Total devengado (COP)", deductionsCOP: "Total deducciones (COP)", netCOP: "Neto pagado (COP)" }[key]}</b><small>Fuente: línea {payslipFields[key].source?.line || "entrada manual"} · confianza heurística {Math.round(payslipFields[key].confidence * 100)}% · verifica el valor</small><input type="text" inputMode="numeric" value={payslipAmounts[key] || ""} onChange={(event) => setPayslipAmounts((current) => ({ ...current, [key]: event.target.value.replace(/[^\d]/g, "") }))} aria-label={{ grossCOP: "Total devengado en pesos", deductionsCOP: "Total deducciones en pesos", netCOP: "Neto pagado en pesos" }[key]}/></span></label>)}
          <button className="button primary" onClick={confirmPayslip} disabled={!payslipSettlementId}>Confirmar valores y comparar</button>
        </div>}
        <p className="payroll-hint">La extracción propone valores. Solo los importes que marques como revisados se guardan; una diferencia es una señal para revisión y no un dictamen de ilegalidad.</p>
      </Card>
      <Card title="Comparar montos revisados" eyebrow="NO ES DICTAMEN LEGAL">
        {vault.payrollReconciliations.slice().reverse().map((item) => <div className="payroll-list-row" key={item.id}><div><strong>{vault.payrollPayslips.find((row) => row.id === item.payslipId)?.sourceName || "Desprendible"} · {item.expectedSnapshot.periodStart} — {item.expectedSnapshot.periodEnd}</strong><span>Estado: {item.status === "amounts-match" ? "Los importes comparados coinciden" : "Hay diferencias de importes para revisar"}</span>{Object.entries(item.differencesCOP).map(([key, difference]) => <span key={key}>{({ grossCOP: "Devengado", deductionsCOP: "Deducciones", netCOP: "Neto" })[key]} · diferencia: {difference > 0 ? "+" : ""}{money(difference)}</span>)}<small>{item.interpretation}</small></div></div>)}
        {!vault.payrollReconciliations.length && <p className="payroll-hint">Importa un desprendible, revisa importes y vincúlalo a un resumen para comparar.</p>}
      </Card>
    </div>}
    <footer className="payroll-footer">La clasificación horaria y los resúmenes son informativos. Verifica reglas, desprendibles y derechos aplicables con un profesional laboral o contable.</footer>
  </div>;
}

