import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const smokeProgram = `
  const fs = await import("node:fs/promises");
  const { createRequire } = await import("node:module");
  const require = createRequire(process.cwd() + "/wasm-test.cjs");
  require("./public/wasm/wasm_exec.js");
  const wasm = await fs.readFile("./public/wasm/financial-engine.wasm");
  const go = new Go();
  const { instance } = await WebAssembly.instantiate(wasm, go.importObject);
  void go.run(instance);
  await new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = () => {
      if (globalThis.FinancialEngine) return resolve();
      if (Date.now() - started > 5000) return reject(new Error("WASM engine registration timed out"));
      setTimeout(poll, 5);
    };
    poll();
  });
  const calculation = JSON.parse(FinancialEngine.calculatePayroll(JSON.stringify({
    contractVersionId: "fixture-v1", ruleSetVersion: "fixture-unverified",
    periodStart: "2026-11-15", periodEnd: "2026-11-15",
    earnings: [{ id: "gross", label: "Gross fixture", pesos: 1000, confirmed: true }],
    deductions: [{ id: "deduction", label: "Deduction fixture", pesos: 100, confirmed: true }],
  })));
  const shift = JSON.parse(FinancialEngine.classifyPayrollShift(JSON.stringify({
    start: "2026-11-15T18:00:00-05:00", end: "2026-11-15T20:00:00-05:00", timeZone: "America/Bogota",
    usePublishedClockRules: true,
    breaks: [
      { start: "2026-11-15T18:30:00-05:00", end: "2026-11-15T18:45:00-05:00" },
      { start: "2026-11-15T19:30:00-05:00", end: "2026-11-15T19:45:00-05:00" },
    ],
    restDay: true, publicHoliday: false,
  })));
  const rules = JSON.parse(FinancialEngine.payrollRules(JSON.stringify({ date: "2026-11-14" })));
  const holidayShift = JSON.parse(FinancialEngine.classifyPayrollShift(JSON.stringify({
    start: "2026-05-18T12:00:00-05:00", end: "2026-05-18T13:00:00-05:00", timeZone: "America/Bogota",
    usePublishedClockRules: true,
  })));
  const holidays = JSON.parse(FinancialEngine.payrollHolidays(JSON.stringify({ year: 2026 })));
  const projection = JSON.parse(FinancialEngine.projectPayrollCompensation(JSON.stringify({ contractVersionId: "contract-v2", monthlySalaryCOP: 2400000, weeklyHours: 48 })));
  const projectionWithoutHours = JSON.parse(FinancialEngine.projectPayrollCompensation(JSON.stringify({ contractVersionId: "contract-v2", monthlySalaryCOP: 2500001 })));
  const contributions = JSON.parse(FinancialEngine.estimateEmployeeContributions(JSON.stringify({
    contractVersionId: "contract-v3", periodStart: "2026-11-01", periodEnd: "2026-11-30",
    grossCOP: 2800000, ibcCOP: 2800000, ruleSetVersion: rules.version,
    applicability: "dependent-full-calendar-month-general-pension-unpensioned-single-employer", ibcConfirmed: true,
  })));
  console.log(JSON.stringify({ calculation, shift, rules, holidayShift, holidays, projection, projectionWithoutHours, contributions }));
  process.exit(0);
`;

test("Compiled Go/WASM Payroll endpoints calculate COP and classify break-aware shifts", () => {
  const run = spawnSync(process.execPath, ["--input-type=module", "-e", smokeProgram], { cwd: frontendRoot, encoding: "utf8", timeout: 20000 });
  assert.equal(run.error, undefined, run.error?.message);
  assert.equal(run.status, 0, run.stderr || "WASM smoke process failed");
  const output = JSON.parse(run.stdout.trim());
  assert.equal(output.calculation.grossCOP, 1000);
  assert.equal(output.calculation.netCOP, 900);
  assert.equal(output.calculation.verification, "user-entered-concepts-not-a-legal-payroll-determination");
  assert.equal(output.shift.totalMinutes, 90);
  assert.equal(output.shift.daytimeMinutes, 45);
  assert.equal(output.shift.nighttimeMinutes, 45);
  assert.equal(output.shift.restDayMinutes, 90);
  assert.equal(output.shift.premiumsCalculated, false);
  assert.equal(output.shift.classification, "published-ruleset-clock-band-classification-informational-only");
  assert.deepEqual(output.shift.ruleSetVersions, ["co-private-labor-2026-07-15-v1"]);
  assert.equal(output.rules.minimumMonthlyCOP, 1750905);
  assert.equal(output.rules.transportAllowanceCOP, 249095);
  assert.equal(output.rules.nighttimeStartMinute, 1140);
  assert.equal(output.rules.maxWeeklyHours, 42);
  assert.equal(output.rules.restDayPremiumPercent, 90);
  assert.equal(output.rules.employerMayApplyFullRateEarly, true);
  assert.equal(output.rules.verification, "official-parameter-catalog-not-professionally-reviewed-payroll-rule");
  assert.equal(output.holidayShift.publicHolidayMinutes, 60);
  assert.equal(output.holidayShift.restDayMinutes, 0);
  assert.equal(output.holidayShift.holidayCalendarSource, "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4954");
  assert.equal(output.holidays.entries.find((item) => item.date === "2026-05-18").names.includes("Ascensión del Señor"), true);
  assert.equal(output.projection.hourlyEquivalentCOP, 11538);
  assert.equal(output.projection.dailyEquivalentCOP, 80000);
  assert.equal(output.projection.weeklyEquivalentCOP, 553846);
  assert.equal(output.projection.biweeklyEquivalentCOP, 1200000);
  assert.equal(output.projection.verification, "budgeting-equivalents-only-not-a-statutory-wage-or-payroll-settlement");
  assert.equal(output.projectionWithoutHours.hourlyEquivalentCOP, null);
  assert.equal(output.projectionWithoutHours.dailyEquivalentCOP, 83333);
  assert.equal(output.projectionWithoutHours.biweeklyEquivalentCOP, 1250001);
  assert.equal(output.contributions.healthEmployeeCOP, 112000);
  assert.equal(output.contributions.pensionEmployeeCOP, 112000);
  assert.equal(output.contributions.totalDeductionsCOP, 224000);
  assert.equal(output.contributions.estimatedNetCOP, 2576000);
  assert.equal(output.contributions.roundingPolicy, "pila-contribution-ceiling-to-next-100-COP-per-line");
  assert.ok(output.contributions.sources.includes("https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=78396"));
  assert.equal(output.contributions.verification, "informational-estimate-user-confirmed-IBC-professional-review-required");
});
