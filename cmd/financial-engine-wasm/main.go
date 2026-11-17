//go:build js && wasm

package main

import (
	"syscall/js"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/engine"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/payroll"
)

func calculate(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{"error": "expected one JSON request argument"}
	}
	result, err := engine.AnalyzeJSON([]byte(args[0].String()))
	if err != nil {
		return map[string]interface{}{"error": err.Error()}
	}
	return string(result)
}

func calculatePayroll(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{"error": "expected one JSON Payroll request argument"}
	}
	result, err := payroll.CalculateJSON([]byte(args[0].String()))
	if err != nil {
		return map[string]interface{}{"error": err.Error()}
	}
	return string(result)
}

func estimateEmployeeContributions(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{"error": "expected one JSON employee contribution request argument"}
	}
	result, err := payroll.EstimateEmployeeContributionsJSON([]byte(args[0].String()))
	if err != nil {
		return map[string]interface{}{"error": err.Error()}
	}
	return string(result)
}

func classifyPayrollShift(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{"error": "expected one JSON shift request argument"}
	}
	result, err := payroll.ClassifyShiftJSON([]byte(args[0].String()))
	if err != nil {
		return map[string]interface{}{"error": err.Error()}
	}
	return string(result)
}

func payrollRules(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{"error": "expected one JSON rules request argument"}
	}
	result, err := payroll.RulesForDateJSON([]byte(args[0].String()))
	if err != nil {
		return map[string]interface{}{"error": err.Error()}
	}
	return string(result)
}

func payrollHolidays(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{"error": "expected one JSON holiday calendar argument"}
	}
	result, err := payroll.ColombianPublicHolidaysJSON([]byte(args[0].String()))
	if err != nil {
		return map[string]interface{}{"error": err.Error()}
	}
	return string(result)
}

func projectPayrollCompensation(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return map[string]interface{}{"error": "expected one JSON compensation projection argument"}
	}
	result, err := payroll.ProjectContractEquivalentsJSON([]byte(args[0].String()))
	if err != nil {
		return map[string]interface{}{"error": err.Error()}
	}
	return string(result)
}

func register() {
	js.Global().Set("FinancialEngine", js.ValueOf(map[string]interface{}{
		"calculate":                     js.FuncOf(calculate),
		"calculatePayroll":              js.FuncOf(calculatePayroll),
		"estimateEmployeeContributions": js.FuncOf(estimateEmployeeContributions),
		"classifyPayrollShift":          js.FuncOf(classifyPayrollShift),
		"payrollRules":                  js.FuncOf(payrollRules),
		"payrollHolidays":               js.FuncOf(payrollHolidays),
		"projectPayrollCompensation":    js.FuncOf(projectPayrollCompensation),
	}))
}

func main() {
	register()
	select {}
}
