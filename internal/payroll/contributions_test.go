package payroll

import (
	"fmt"
	"testing"
)

func contributionRequest(date, end string, gross, ibc int64) EmployeeContributionRequest {
	rules, _ := RulesForDate(date)
	return EmployeeContributionRequest{
		ContractVersionID: "contract-v3", PeriodStart: date, PeriodEnd: end,
		GrossCOP: gross, IBCCOP: ibc, RuleSetVersion: rules.Version,
		Applicability: StandardEmployeeScope, IBCConfirmed: true,
	}
}

func TestEstimateEmployeeContributionsStandardMonthlyCase(t *testing.T) {
	request := contributionRequest("2026-11-01", "2026-11-30", 2_800_000, 2_800_000)
	result, err := EstimateEmployeeContributions(request)
	if err != nil {
		t.Fatal(err)
	}
	if result.HealthEmployeeCOP != 112_000 || result.PensionEmployeeCOP != 112_000 || result.SolidarityCOP != 0 || result.TotalDeductionsCOP != 224_000 || result.EstimatedNetCOP != 2_576_000 {
		t.Fatalf("unexpected ordinary contribution estimate: %+v", result)
	}
	if result.EngineVersion != ContributionEngineVersion || result.Verification != "informational-estimate-user-confirmed-IBC-professional-review-required" || result.RoundingPolicy != "pila-contribution-ceiling-to-next-100-COP-per-line" || len(result.Sources) < 5 {
		t.Fatalf("reproducibility/legal metadata missing: %+v", result)
	}
}

func TestEstimateEmployeeContributionsSolidarityThresholdsAndRounding(t *testing.T) {
	minimum := int64(1_750_905)
	cases := []struct {
		multiple int64
		basisPts int64
		wantCOP  int64
		offset   int64
	}{
		{4, 100, 70_100, 0},
		{16, 120, 336_200, 0},
		{17, 140, 416_800, 0},
		{18, 160, 504_300, 0},
		{19, 180, 598_900, 0},
		{20, 180, 630_400, 0},
		{20, 200, 700_400, 1},
	}
	for _, test := range cases {
		t.Run(fmt.Sprintf("%d-SMMLV-plus-%d-COP", test.multiple, test.offset), func(t *testing.T) {
			ibc := test.multiple*minimum + test.offset
			request := contributionRequest("2026-11-01", "2026-11-30", ibc, ibc)
			result, err := EstimateEmployeeContributions(request)
			if err != nil {
				t.Fatal(err)
			}
			if result.SolidarityCOP != test.wantCOP {
				t.Fatalf("multiple %d: solidarity=%d want %d at %d bp", test.multiple, result.SolidarityCOP, test.wantCOP, test.basisPts)
			}
		})
	}
	if got, err := basisPointAmount(1_000_001, 400); err != nil || got != 40_100 {
		t.Fatalf("PILA contribution should round upward to the next hundred pesos: %d, %v", got, err)
	}
}

func TestEstimateEmployeeContributionsRejectsUnsupportedCases(t *testing.T) {
	valid := contributionRequest("2026-11-01", "2026-11-30", 2_800_000, 2_800_000)
	cases := map[string]func(*EmployeeContributionRequest){
		"unconfirmed IBC":           func(r *EmployeeContributionRequest) { r.IBCConfirmed = false },
		"unsupported applicability": func(r *EmployeeContributionRequest) { r.Applicability = "variable-hours-or-special-regime" },
		"partial month":             func(r *EmployeeContributionRequest) { r.PeriodEnd = "2026-11-15" },
		"changed ruleset":           func(r *EmployeeContributionRequest) { r.RuleSetVersion = "wrong-version" },
		"IBC below minimum":         func(r *EmployeeContributionRequest) { r.IBCCOP = 1_000_000 },
		"IBC above gross":           func(r *EmployeeContributionRequest) { r.IBCCOP = 2_900_000 },
		"out of supported legal period": func(r *EmployeeContributionRequest) {
			r.PeriodStart, r.PeriodEnd, r.RuleSetVersion = "2027-01-01", "2027-01-31", "future"
		},
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			request := valid
			mutate(&request)
			if _, err := EstimateEmployeeContributions(request); err == nil {
				t.Fatal("expected unsupported contribution request to be rejected")
			}
		})
	}
}

func TestContributionEstimateAllowsUnrelatedRuleChangesButRejectsMidmonthWageTransition(t *testing.T) {
	july := contributionRequest("2025-07-01", "2025-07-31", 2_000_000, 2_000_000)
	if _, err := EstimateEmployeeContributions(july); err != nil {
		t.Fatalf("work-time/rest-day rule changes should not invalidate an unchanged contribution base: %v", err)
	}
	february := contributionRequest("2026-02-01", "2026-02-28", 2_000_000, 2_000_000)
	if _, err := EstimateEmployeeContributions(february); err == nil {
		t.Fatal("expected a month crossing a judicial minimum-wage source transition to require split/review")
	}
}
