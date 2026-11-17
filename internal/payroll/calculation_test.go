package payroll

import (
	"math"
	"testing"
)

func validRequest() CalculationRequest {
	return CalculationRequest{
		ContractVersionID: "contract-v1", RuleSetVersion: "co-labor-config-2026-01",
		PeriodStart: "2026-11-01", PeriodEnd: "2026-11-16",
		Earnings:   []ConceptAmount{{ID: "base", Label: "Salario confirmado", Pesos: 2400000, Source: "contract", Confirmed: true}},
		Deductions: []ConceptAmount{{ID: "manual-deduction", Label: "Descuento confirmado", Pesos: 100000, Source: "user", Confirmed: true}},
	}
}

func TestCalculateEnteredConceptsUsesWholeCOPPesos(t *testing.T) {
	result, err := CalculateEnteredConcepts(validRequest())
	if err != nil {
		t.Fatal(err)
	}
	if result.Currency != "COP" || result.GrossCOP != 2400000 || result.DeductionsCOP != 100000 || result.NetCOP != 2300000 {
		t.Fatalf("unexpected result: %+v", result)
	}
	if result.Verification == "" || result.EngineVersion != EngineVersion {
		t.Fatalf("missing reproducibility metadata: %+v", result)
	}
}

func TestCalculateEnteredConceptsRejectsUnconfirmedAndDuplicateConcepts(t *testing.T) {
	request := validRequest()
	request.Earnings[0].Confirmed = false
	if _, err := CalculateEnteredConcepts(request); err == nil {
		t.Fatal("expected unconfirmed concept rejection")
	}
	request = validRequest()
	request.Earnings = append(request.Earnings, request.Earnings[0])
	if _, err := CalculateEnteredConcepts(request); err == nil {
		t.Fatal("expected duplicate concept rejection")
	}
}

func TestCalculateEnteredConceptsSupportsSingleDayAndRejectsReversedRanges(t *testing.T) {
	request := validRequest()
	request.PeriodEnd = request.PeriodStart
	if _, err := CalculateEnteredConcepts(request); err != nil {
		t.Fatalf("a one-day inclusive period should be valid: %v", err)
	}
	request.PeriodStart, request.PeriodEnd = "2026-11-17", "2026-11-16"
	if _, err := CalculateEnteredConcepts(request); err == nil {
		t.Fatal("expected reversed range rejection")
	}
	request = validRequest()
	request.Deductions[0].Pesos = 2400001
	if _, err := CalculateEnteredConcepts(request); err == nil {
		t.Fatal("expected excessive deductions rejection")
	}
}

func TestClassifyShiftRejectsSubMinutePrecision(t *testing.T) {
	request := ShiftClassificationRequest{Start: "2026-11-15T10:00:00.001-05:00", End: "2026-11-15T11:00:00-05:00", TimeZone: "America/Bogota", DaytimeStartMinute: 360, NighttimeStartMinute: 1140}
	if _, err := ClassifyShift(request); err == nil {
		t.Fatal("expected sub-minute precision to be rejected")
	}
}

func TestCalculateEnteredConceptsProtectsOverflow(t *testing.T) {
	request := validRequest()
	request.Earnings = []ConceptAmount{
		{ID: "a", Label: "A", Pesos: math.MaxInt64, Confirmed: true},
		{ID: "b", Label: "B", Pesos: 1, Confirmed: true},
	}
	if _, err := CalculateEnteredConcepts(request); err != ErrOverflow {
		t.Fatalf("expected overflow, got %v", err)
	}
}

func TestCalculateJSON(t *testing.T) {
	if _, err := CalculateJSON([]byte(`{"contractVersionId":"c","periodStart":"2026-01-01","periodEnd":"2026-02-01","ruleSetVersion":"r","earnings":[],"deductions":[]}`)); err != nil {
		t.Fatal(err)
	}
	if _, err := CalculateJSON([]byte("not-json")); err == nil {
		t.Fatal("expected malformed JSON rejection")
	}
}

func TestClassifyShiftSplitsNightHoursAndSundayWithoutCalculatingPremiums(t *testing.T) {
	result, err := ClassifyShift(ShiftClassificationRequest{
		Start: "2026-11-15T18:00:00-05:00", End: "2026-11-15T20:00:00-05:00", TimeZone: "America/Bogota", DaytimeStartMinute: 360, NighttimeStartMinute: 1140, RestDay: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if result.TotalMinutes != 120 || result.DaytimeMinutes != 60 || result.NighttimeMinutes != 60 || result.SundayMinutes != 120 || result.RestDayMinutes != 120 {
		t.Fatalf("unexpected classification: %+v", result)
	}
	if result.PremiumsCalculated {
		t.Fatal("time classification must not imply premium calculations")
	}
	if result.DaytimeStartMinute != 360 || result.NighttimeStartMinute != 1140 || result.Classification != "user-configured-clock-bands-not-a-legal-determination" {
		t.Fatalf("the configured non-legal bands must be reproducible: %+v", result)
	}
}

func TestPublishedClockRulesUseEffectiveDateWithinOvernightShift(t *testing.T) {
	result, err := ClassifyShift(ShiftClassificationRequest{
		Start: "2025-12-24T20:00:00-05:00", End: "2025-12-25T02:00:00-05:00", TimeZone: "America/Bogota", UsePublishedClockRules: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if result.TotalMinutes != 360 || result.DaytimeMinutes != 60 || result.NighttimeMinutes != 300 {
		t.Fatalf("published bands must change at their effective local date: %+v", result)
	}
	if len(result.RuleSetVersions) != 2 || result.RuleSetVersions[0] != "co-private-labor-2025-07-15-v1" || result.RuleSetVersions[1] != "co-private-labor-2025-12-25-v1" || result.PremiumsCalculated {
		t.Fatalf("historical rules must be traceable without asserting a settlement: %+v", result)
	}
}

func TestClassifyShiftExcludesRecordedBreakInterval(t *testing.T) {
	result, err := ClassifyShift(ShiftClassificationRequest{
		Start: "2026-11-15T18:00:00-05:00", End: "2026-11-15T20:00:00-05:00", TimeZone: "America/Bogota", DaytimeStartMinute: 360, NighttimeStartMinute: 1140,
		Breaks: []TimeInterval{{Start: "2026-11-15T18:30:00-05:00", End: "2026-11-15T18:45:00-05:00"}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if result.TotalMinutes != 105 || result.DaytimeMinutes != 45 || result.NighttimeMinutes != 60 {
		t.Fatalf("break interval must be excluded from classification: %+v", result)
	}
}

func TestClassifyShiftRejectsInvalidOrOverlappingBreaks(t *testing.T) {
	request := ShiftClassificationRequest{Start: "2026-11-15T08:00:00-05:00", End: "2026-11-15T12:00:00-05:00", TimeZone: "America/Bogota", DaytimeStartMinute: 360, NighttimeStartMinute: 1140, Breaks: []TimeInterval{
		{Start: "2026-11-15T09:00:00-05:00", End: "2026-11-15T10:30:00-05:00"},
		{Start: "2026-11-15T10:00:00-05:00", End: "2026-11-15T11:00:00-05:00"},
	}}
	if _, err := ClassifyShift(request); err == nil {
		t.Fatal("expected overlapping breaks to fail")
	}
	request.Breaks = []TimeInterval{{Start: "2026-11-15T07:00:00-05:00", End: "2026-11-15T07:30:00-05:00"}}
	if _, err := ClassifyShift(request); err == nil {
		t.Fatal("expected break outside the shift to fail")
	}
}

func TestClassifyShiftRejectsUnknownTimezoneAndLongShifts(t *testing.T) {
	base := ShiftClassificationRequest{Start: "2026-11-15T00:00:00-05:00", End: "2026-11-16T01:00:00-05:00", TimeZone: "America/Bogota", DaytimeStartMinute: 360, NighttimeStartMinute: 1140}
	if _, err := ClassifyShift(base); err == nil {
		t.Fatal("expected shift longer than one day to fail")
	}
	base.End = "2026-11-15T01:00:00-05:00"
	base.TimeZone = "Unknown/Place"
	if _, err := ClassifyShift(base); err == nil {
		t.Fatal("expected unknown timezone to fail")
	}
	base.TimeZone = "America/Bogota"
	base.Start = "2026-11-15T00:00:00-04:00"
	if _, err := ClassifyShift(base); err == nil {
		t.Fatal("expected non-Colombia UTC offset to fail")
	}
}
