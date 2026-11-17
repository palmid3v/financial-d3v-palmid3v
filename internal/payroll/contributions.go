package payroll

import (
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
	"time"
)

const (
	ContributionEngineVersion = "co-employee-contributions-v1"
	StandardEmployeeScope     = "dependent-full-calendar-month-general-pension-unpensioned-single-employer"
	healthEmployeeSource      = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=22600"
	pensionEmployeeSource     = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=7223"
	contributionBaseSource    = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=85319"
	pilaRoundingSource        = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=78396"
	pensionTransitionSource   = "https://www.corteconstitucional.gov.co/relatoria/2026/C-264-26.htm"
)

// EmployeeContributionRequest is deliberately limited to a confirmed, full
// calendar month for an ordinary dependent employee. IBC must be reviewed by
// the user because non-salary payments, absences, multiple employers, special
// regimes and individual pension status can change the applicable base/rules.
type EmployeeContributionRequest struct {
	ContractVersionID string `json:"contractVersionId"`
	PeriodStart       string `json:"periodStart"`
	PeriodEnd         string `json:"periodEnd"`
	GrossCOP          int64  `json:"grossCOP"`
	IBCCOP            int64  `json:"ibcCOP"`
	RuleSetVersion    string `json:"ruleSetVersion"`
	Applicability     string `json:"applicability"`
	IBCConfirmed      bool   `json:"ibcConfirmed"`
}

type EmployeeContributionResult struct {
	EngineVersion      string   `json:"engineVersion"`
	ContractVersionID  string   `json:"contractVersionId"`
	PeriodStart        string   `json:"periodStart"`
	PeriodEnd          string   `json:"periodEnd"`
	RuleSetVersion     string   `json:"ruleSetVersion"`
	Currency           string   `json:"currency"`
	GrossCOP           int64    `json:"grossCOP"`
	IBCCOP             int64    `json:"ibcCOP"`
	HealthEmployeeCOP  int64    `json:"healthEmployeeCOP"`
	PensionEmployeeCOP int64    `json:"pensionEmployeeCOP"`
	SolidarityCOP      int64    `json:"solidarityCOP"`
	TotalDeductionsCOP int64    `json:"totalDeductionsCOP"`
	EstimatedNetCOP    int64    `json:"estimatedNetCOP"`
	RoundingPolicy     string   `json:"roundingPolicy"`
	Scope              string   `json:"scope"`
	Verification       string   `json:"verification"`
	PensionTransition  string   `json:"pensionTransition"`
	Sources            []string `json:"sources"`
}

// EstimateEmployeeContributions computes employee-side health, pension, and
// solidarity contributions for a narrowly bounded standard case. It never
// computes employer costs, prestaciones, overtime, or legal compliance.
func EstimateEmployeeContributions(request EmployeeContributionRequest) (EmployeeContributionResult, error) {
	if strings.TrimSpace(request.ContractVersionID) == "" || !request.IBCConfirmed || request.Applicability != StandardEmployeeScope {
		return EmployeeContributionResult{}, fmt.Errorf("%w: confirm the IBC and supported dependent-employee scope", ErrInvalidRequest)
	}
	start, err := time.Parse("2006-01-02", request.PeriodStart)
	if err != nil {
		return EmployeeContributionResult{}, fmt.Errorf("%w: invalid contribution period start", ErrInvalidRequest)
	}
	end, err := time.Parse("2006-01-02", request.PeriodEnd)
	if err != nil || start.Day() != 1 || end.Before(start) || end.Year() != start.Year() || end.Month() != start.Month() || end.Day() != time.Date(end.Year(), end.Month()+1, 0, 0, 0, 0, 0, time.UTC).Day() {
		return EmployeeContributionResult{}, fmt.Errorf("%w: contributions are supported only for a complete calendar month", ErrInvalidRequest)
	}
	startRules, err := RulesForDate(start.Format("2006-01-02"))
	if err != nil {
		return EmployeeContributionResult{}, err
	}
	if request.RuleSetVersion != startRules.Version {
		return EmployeeContributionResult{}, fmt.Errorf("%w: selected rule snapshot does not match the first day of the period", ErrInvalidRequest)
	}
	for day := start; !day.After(end); day = day.AddDate(0, 0, 1) {
		dayRules, rulesErr := RulesForDate(day.Format("2006-01-02"))
		if rulesErr != nil || dayRules.MinimumMonthlyCOP != startRules.MinimumMonthlyCOP || dayRules.MinimumWageSource != startRules.MinimumWageSource {
			return EmployeeContributionResult{}, fmt.Errorf("%w: minimum-wage parameters change or are unsupported within this month; split/review this period", ErrInvalidRequest)
		}
	}
	if request.GrossCOP <= 0 || request.IBCCOP <= 0 || request.IBCCOP > request.GrossCOP {
		return EmployeeContributionResult{}, fmt.Errorf("%w: confirmed gross and IBC must be positive whole COP pesos, with IBC no greater than gross", ErrInvalidRequest)
	}
	minimum := startRules.MinimumMonthlyCOP
	if minimum <= 0 || request.IBCCOP < minimum || request.IBCCOP > minimum*25 {
		return EmployeeContributionResult{}, fmt.Errorf("%w: IBC must be between one and 25 published minimum monthly wages for this snapshot", ErrInvalidRequest)
	}

	health, err := basisPointAmount(request.IBCCOP, 400)
	if err != nil {
		return EmployeeContributionResult{}, err
	}
	pension, err := basisPointAmount(request.IBCCOP, 400)
	if err != nil {
		return EmployeeContributionResult{}, err
	}
	solidarityBasisPoints := solidarityBasisPoints(request.IBCCOP, minimum)
	solidarity, err := basisPointAmount(request.IBCCOP, solidarityBasisPoints)
	if err != nil {
		return EmployeeContributionResult{}, err
	}
	total := health + pension
	if total < health || total > int64(^uint64(0)>>1)-solidarity {
		return EmployeeContributionResult{}, ErrOverflow
	}
	total += solidarity
	if total > request.GrossCOP {
		return EmployeeContributionResult{}, fmt.Errorf("%w: supported contributions exceed the supplied gross amount", ErrInvalidRequest)
	}
	return EmployeeContributionResult{
		EngineVersion: ContributionEngineVersion, ContractVersionID: request.ContractVersionID,
		PeriodStart: start.Format("2006-01-02"), PeriodEnd: end.Format("2006-01-02"), RuleSetVersion: startRules.Version,
		Currency: "COP", GrossCOP: request.GrossCOP, IBCCOP: request.IBCCOP,
		HealthEmployeeCOP: health, PensionEmployeeCOP: pension, SolidarityCOP: solidarity,
		TotalDeductionsCOP: total, EstimatedNetCOP: request.GrossCOP - total,
		RoundingPolicy:    "pila-contribution-ceiling-to-next-100-COP-per-line",
		Scope:             "employee-side-contributions-only; excludes employer costs, benefits, overtime, absences, special regimes and legal compliance determination",
		Verification:      "informational-estimate-user-confirmed-IBC-professional-review-required",
		PensionTransition: "uses pre-2027 contribution parameters for the selected period; individual transition/affiliation eligibility is not determined",
		Sources:           []string{healthEmployeeSource, pensionEmployeeSource, contributionBaseSource, pilaRoundingSource, startRules.MinimumWageSource, pensionTransitionSource},
	}, nil
}

func solidarityBasisPoints(ibc, minimum int64) int64 {
	if ibc < minimum*4 {
		return 0
	}
	if ibc < minimum*16 {
		return 100
	}
	switch {
	case ibc < minimum*17:
		return 120
	case ibc < minimum*18:
		return 140
	case ibc < minimum*19:
		return 160
	case ibc <= minimum*20:
		return 180
	default:
		return 200
	}
}

func basisPointAmount(amountCOP, basisPoints int64) (int64, error) {
	numerator := new(big.Int).Mul(big.NewInt(amountCOP), big.NewInt(basisPoints))
	// Decree 780/2016, art. 3.2.1.5 (as amended by Decree 1990/2016):
	// IBC is rounded up to a peso and each PILA contribution is rounded up
	// to the next COP 100. Divide the exact percentage by COP 100, ceil,
	// then restore the 100-peso unit.
	quotient, remainder := new(big.Int), new(big.Int)
	quotient.QuoRem(numerator, big.NewInt(1_000_000), remainder)
	if remainder.Sign() > 0 {
		quotient.Add(quotient, big.NewInt(1))
	}
	value := quotient.Mul(quotient, big.NewInt(100))
	if !value.IsInt64() {
		return 0, ErrOverflow
	}
	return value.Int64(), nil
}

func EstimateEmployeeContributionsJSON(input []byte) ([]byte, error) {
	var request EmployeeContributionRequest
	if err := json.Unmarshal(input, &request); err != nil {
		return nil, fmt.Errorf("%w: malformed employee contribution request", ErrInvalidRequest)
	}
	result, err := EstimateEmployeeContributions(request)
	if err != nil {
		return nil, err
	}
	return json.Marshal(result)
}
