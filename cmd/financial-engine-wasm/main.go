//go:build js && wasm

package main

import (
	"syscall/js"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/engine"
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

func register() {
	js.Global().Set("FinancialEngine", js.ValueOf(map[string]interface{}{
		"calculate": js.FuncOf(calculate),
	}))
}

func main() {
	register()
	select {}
}
