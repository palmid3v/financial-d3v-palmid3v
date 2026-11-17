package payroll

import (
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
)

const ProjectionVersion = "contract-equivalents-v1"

type CompensationProjectionRequest struct {
	ContractVersionID string `json:"contractVersionId"`
	MonthlySalaryCOP  int64  `json:"monthlySalaryCOP"`
	WeeklyHours       int    `json:"weeklyHours"`
}

type CompensationProjection struct {
	EngineVersion      string `json:"engineVersion"`
	ContractVersionID  string `json:"contractVersionId"`
	Currency           string `json:"currency"`
	WeeklyHours        int    `json:"weeklyHours"`
	HourlyEquivalent   *int64 `json:"hourlyEquivalentCOP"`
	DailyEquivalent    int64  `json:"dailyEquivalentCOP"`
	WeeklyEquivalent   int64  `json:"weeklyEquivalentCOP"`
	BiweeklyEquivalent int64  `json:"biweeklyEquivalentCOP"`
	MonthlySalary      int64  `json:"monthlySalaryCOP"`
	RoundingPolicy     string `json:"roundingPolicy"`
	Methodology        string `json:"methodology"`
	Verification       string `json:"verification"`
}

// ProjectContractEquivalents annualizes an agreed monthly contract salary for
// personal cash-flow planning. It is not an hourly statutory wage, payroll
// settlement, or legal interpretation.
func ProjectContractEquivalents(request CompensationProjectionRequest) (CompensationProjection, error) {
	if strings.TrimSpace(request.ContractVersionID) == "" || request.MonthlySalaryCOP <= 0 || request.WeeklyHours < 0 || request.WeeklyHours > 168 {
		return CompensationProjection{}, fmt.Errorf("%w: contract version, positive whole COP salary and optional weekly hours from 1 to 168 are required", ErrInvalidRequest)
	}
	monthly := big.NewInt(request.MonthlySalaryCOP)
	weeklyNumerator := new(big.Int).Mul(new(big.Int).Set(monthly), big.NewInt(12))
	biweeklyNumerator := new(big.Int).Set(monthly)

	daily, err := roundedCOP(new(big.Int).Set(monthly), big.NewInt(30))
	if err != nil {
		return CompensationProjection{}, err
	}
	weekly, err := roundedCOP(weeklyNumerator, big.NewInt(52))
	if err != nil {
		return CompensationProjection{}, err
	}
	biweekly, err := roundedCOP(biweeklyNumerator, big.NewInt(2))
	if err != nil {
		return CompensationProjection{}, err
	}
	var hourly *int64
	if request.WeeklyHours > 0 {
		hourlyNumerator := new(big.Int).Mul(new(big.Int).Set(monthly), big.NewInt(12))
		hourlyDenominator := big.NewInt(int64(request.WeeklyHours * 52))
		value, hourlyErr := roundedCOP(hourlyNumerator, hourlyDenominator)
		if hourlyErr != nil {
			return CompensationProjection{}, hourlyErr
		}
		hourly = &value
	}
	return CompensationProjection{
		EngineVersion: ProjectionVersion, ContractVersionID: request.ContractVersionID,
		Currency: "COP", WeeklyHours: request.WeeklyHours, HourlyEquivalent: hourly,
		DailyEquivalent: daily, WeeklyEquivalent: weekly, BiweeklyEquivalent: biweekly,
		MonthlySalary: request.MonthlySalaryCOP, RoundingPolicy: "nearest-whole-COP-half-up",
		Methodology:  "monthly-salary-divided-by-30-days; weekly-equivalent-annualized-over-12-months-and-52-weeks; hourly-equivalent-only-when-weekly-hours-are-known",
		Verification: "budgeting-equivalents-only-not-a-statutory-wage-or-payroll-settlement",
	}, nil
}

func roundedCOP(numerator, denominator *big.Int) (int64, error) {
	if numerator.Sign() < 0 || denominator.Sign() <= 0 {
		return 0, fmt.Errorf("%w: invalid non-negative COP ratio", ErrInvalidRequest)
	}
	quotient, remainder := new(big.Int), new(big.Int)
	quotient.QuoRem(numerator, denominator, remainder)
	if new(big.Int).Mul(remainder, big.NewInt(2)).Cmp(denominator) >= 0 {
		quotient.Add(quotient, big.NewInt(1))
	}
	if !quotient.IsInt64() {
		return 0, ErrOverflow
	}
	return quotient.Int64(), nil
}

func ProjectContractEquivalentsJSON(input []byte) ([]byte, error) {
	var request CompensationProjectionRequest
	if err := json.Unmarshal(input, &request); err != nil {
		return nil, fmt.Errorf("%w: malformed contract projection request", ErrInvalidRequest)
	}
	projection, err := ProjectContractEquivalents(request)
	if err != nil {
		return nil, err
	}
	return json.Marshal(projection)
}
