let enginePromise;

export async function loadGoFinancialEngine() {
  if (enginePromise) return enginePromise;

  enginePromise = (async () => {
    if (globalThis.FinancialEngine?.calculate) return globalThis.FinancialEngine;

    if (!globalThis.Go) {
      await loadScript("/wasm/wasm_exec.js");
    }

    const response = await fetch("/wasm/financial-engine.wasm");
    if (!response.ok) throw new Error("Financial engine WASM is unavailable.");
    const bytes = await response.arrayBuffer();

    const go = new globalThis.Go();
    const result = await WebAssembly.instantiate(bytes, go.importObject);
    go.run(result.instance);
    return globalThis.FinancialEngine;
  })();

  try {
    return await enginePromise;
  } catch (error) {
    enginePromise = undefined;
    throw error;
  }
}

export async function calculateWithGoEngine(request) {
  const engine = await loadGoFinancialEngine();
  const result = engine?.calculate?.(JSON.stringify(request));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  if (!parsed || parsed.error) {
    throw new Error(parsed?.error || "Financial engine calculation failed.");
  }
  return parsed;
}

export async function calculatePayrollWithGoEngine(request) {
  const engine = await loadGoFinancialEngine();
  if (typeof engine?.calculatePayroll !== "function") throw new Error("El motor local no incluye el calculador Payroll solicitado.");
  const result = engine.calculatePayroll(JSON.stringify(request));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  if (!parsed || parsed.error) throw new Error(parsed?.error || "No se pudo calcular el resumen Payroll.");
  return parsed;
}

export async function estimateEmployeeContributionsWithGoEngine(request) {
  const engine = await loadGoFinancialEngine();
  if (typeof engine?.estimateEmployeeContributions !== "function") throw new Error("El motor local no incluye la estimación de aportes del trabajador.");
  const result = engine.estimateEmployeeContributions(JSON.stringify(request));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  if (!parsed || parsed.error) throw new Error(parsed?.error || "No se pudieron estimar los aportes del trabajador.");
  return parsed;
}

export async function classifyPayrollShiftWithGoEngine(request) {
  const engine = await loadGoFinancialEngine();
  if (typeof engine?.classifyPayrollShift !== "function") throw new Error("El motor local no incluye la clasificacion de turnos.");
  const result = engine.classifyPayrollShift(JSON.stringify(request));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  if (!parsed || parsed.error) throw new Error(parsed?.error || "No se pudo clasificar el turno.");
  return parsed;
}

export async function payrollRulesWithGoEngine(date) {
  const engine = await loadGoFinancialEngine();
  if (typeof engine?.payrollRules !== "function") throw new Error("El motor local no incluye el catálogo laboral.");
  const result = engine.payrollRules(JSON.stringify({ date }));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  if (!parsed || parsed.error) throw new Error(parsed?.error || "No se pudo cargar el catálogo laboral.");
  return parsed;
}

export async function payrollHolidaysWithGoEngine(year) {
  const engine = await loadGoFinancialEngine();
  if (typeof engine?.payrollHolidays !== "function") throw new Error("El motor local no incluye el calendario festivo.");
  const result = engine.payrollHolidays(JSON.stringify({ year }));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  if (!parsed || parsed.error) throw new Error(parsed?.error || "No se pudo cargar el calendario festivo.");
  return parsed;
}

export async function projectPayrollCompensationWithGoEngine(request) {
  const engine = await loadGoFinancialEngine();
  if (typeof engine?.projectPayrollCompensation !== "function") throw new Error("El motor local no incluye las equivalencias presupuestarias del contrato.");
  const result = engine.projectPayrollCompensation(JSON.stringify(request));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  if (!parsed || parsed.error) throw new Error(parsed?.error || "No se pudieron calcular las equivalencias del contrato.");
  return parsed;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });
}
