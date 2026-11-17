package payroll

import (
	"math/big"
	"testing"
)

func TestProjectContractEquivalentsUsesExactHalfUpCOPRounding(t *testing.T) {
	projection, err := ProjectContractEquivalents(CompensationProjectionRequest{ContractVersionID: "contract-v2", MonthlySalaryCOP: 2_400_000, WeeklyHours: 48})
	if err != nil {
		t.Fatal(err)
	}
	if projection.HourlyEquivalent == nil || *projection.HourlyEquivalent != 11_538 || projection.DailyEquivalent != 80_000 || projection.WeeklyEquivalent != 553_846 || projection.BiweeklyEquivalent != 1_200_000 || projection.MonthlySalary != 2_400_000 {
		t.Fatalf("unexpected projected equivalents: %+v", projection)
	}
	if projection.EngineVersion != ProjectionVersion || projection.RoundingPolicy != "nearest-whole-COP-half-up" || projection.Verification != "budgeting-equivalents-only-not-a-statutory-wage-or-payroll-settlement" {
		t.Fatalf("projection must preserve method/version and non-legal scope: %+v", projection)
	}
}

func TestProjectContractEquivalentsRoundsHalfUpAndRejectsInvalidInputs(t *testing.T) {
	projection, err := ProjectContractEquivalents(CompensationProjectionRequest{ContractVersionID: "contract-v1", MonthlySalaryCOP: 2_500_001, WeeklyHours: 40})
	if err != nil {
		t.Fatal(err)
	}
	if projection.BiweeklyEquivalent != 1_250_001 {
		t.Fatalf("half COP must round up: %+v", projection)
	}
	withoutHours, err := ProjectContractEquivalents(CompensationProjectionRequest{ContractVersionID: "contract-v1", MonthlySalaryCOP: 2_500_001})
	if err != nil || withoutHours.HourlyEquivalent != nil || withoutHours.DailyEquivalent != 83_333 || withoutHours.BiweeklyEquivalent != 1_250_001 {
		t.Fatalf("known equivalents should remain available when weekly hours are unknown: %+v, %v", withoutHours, err)
	}
	for _, request := range []CompensationProjectionRequest{
		{},
		{ContractVersionID: "v1", MonthlySalaryCOP: 0, WeeklyHours: 40},
		{ContractVersionID: "v1", MonthlySalaryCOP: 1, WeeklyHours: -1},
		{ContractVersionID: "v1", MonthlySalaryCOP: 1, WeeklyHours: 169},
	} {
		if _, err := ProjectContractEquivalents(request); err == nil {
			t.Errorf("expected invalid projection request to fail: %+v", request)
		}
	}
	if _, err := roundedCOP(new(big.Int).Lsh(big.NewInt(1), 63), big.NewInt(1)); err != ErrOverflow {
		t.Fatalf("out-of-range COP ratio should be rejected, got %v", err)
	}
}

func TestProjectContractEquivalentsJSONRejectsMalformedInput(t *testing.T) {
	if _, err := ProjectContractEquivalentsJSON([]byte("not-json")); err == nil {
		t.Fatal("expected malformed JSON to be rejected")
	}
}
