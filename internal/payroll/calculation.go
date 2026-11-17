// Package payroll contains deterministic, local Payroll calculations.
// This first calculator only totals user-entered COP concepts. It deliberately
// does not invent statutory rates or represent an unreviewed result as legal.
package payroll

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"
)

const EngineVersion = "payroll-cop-v1"

var (
	ErrInvalidRequest = errors.New("invalid payroll calculation request")
	ErrOverflow       = errors.New("payroll amount overflow")
)

type ConceptAmount struct {
	ID        string `json:"id"`
	Label     string `json:"label"`
	Pesos     int64  `json:"pesos"`
	Source    string `json:"source"`
	Confirmed bool   `json:"confirmed"`
}

type CalculationRequest struct {
	ContractVersionID string          `json:"contractVersionId"`
	PeriodStart       string          `json:"periodStart"`
	PeriodEnd         string          `json:"periodEnd"`
	Earnings          []ConceptAmount `json:"earnings"`
	Deductions        []ConceptAmount `json:"deductions"`
	RuleSetVersion    string          `json:"ruleSetVersion"`
}

type CalculationResult struct {
	EngineVersion     string `json:"engineVersion"`
	ContractVersionID string `json:"contractVersionId"`
	RuleSetVersion    string `json:"ruleSetVersion"`
	PeriodStart       string `json:"periodStart"`
	PeriodEnd         string `json:"periodEnd"`
	Currency          string `json:"currency"`
	GrossCOP          int64  `json:"grossCOP"`
	DeductionsCOP     int64  `json:"deductionsCOP"`
	NetCOP            int64  `json:"netCOP"`
	Verification      string `json:"verification"`
}

func CalculateEnteredConcepts(request CalculationRequest) (CalculationResult, error) {
	if strings.TrimSpace(request.ContractVersionID) == "" || strings.TrimSpace(request.RuleSetVersion) == "" {
		return CalculationResult{}, fmt.Errorf("%w: contract and rule-set versions are required", ErrInvalidRequest)
	}
	start, err := time.Parse("2006-01-02", request.PeriodStart)
	if err != nil {
		return CalculationResult{}, fmt.Errorf("%w: invalid period start", ErrInvalidRequest)
	}
	end, err := time.Parse("2006-01-02", request.PeriodEnd)
	if err != nil || start.After(end) {
		return CalculationResult{}, fmt.Errorf("%w: period end must be on or after start", ErrInvalidRequest)
	}

	gross, err := total(request.Earnings, false)
	if err != nil {
		return CalculationResult{}, err
	}
	deductions, err := total(request.Deductions, true)
	if err != nil {
		return CalculationResult{}, err
	}
	if deductions > gross {
		return CalculationResult{}, fmt.Errorf("%w: deductions exceed earnings", ErrInvalidRequest)
	}

	return CalculationResult{
		EngineVersion: EngineVersion, ContractVersionID: request.ContractVersionID,
		RuleSetVersion: request.RuleSetVersion, PeriodStart: start.Format("2006-01-02"),
		PeriodEnd: end.Format("2006-01-02"), Currency: "COP", GrossCOP: gross,
		DeductionsCOP: deductions, NetCOP: gross - deductions,
		Verification: "user-entered-concepts-not-a-legal-payroll-determination",
	}, nil
}

func total(concepts []ConceptAmount, deduction bool) (int64, error) {
	var sum int64
	seen := make(map[string]struct{}, len(concepts))
	for _, concept := range concepts {
		if strings.TrimSpace(concept.ID) == "" || strings.TrimSpace(concept.Label) == "" || !concept.Confirmed || concept.Pesos < 0 {
			return 0, fmt.Errorf("%w: each concept requires an id, label, confirmed non-negative whole COP pesos", ErrInvalidRequest)
		}
		if _, ok := seen[concept.ID]; ok {
			return 0, fmt.Errorf("%w: duplicate concept id", ErrInvalidRequest)
		}
		seen[concept.ID] = struct{}{}
		if concept.Pesos > math.MaxInt64-sum {
			return 0, ErrOverflow
		}
		sum += concept.Pesos
	}
	return sum, nil
}

func CalculateJSON(input []byte) ([]byte, error) {
	var request CalculationRequest
	if err := json.Unmarshal(input, &request); err != nil {
		return nil, fmt.Errorf("%w: malformed JSON", ErrInvalidRequest)
	}
	result, err := CalculateEnteredConcepts(request)
	if err != nil {
		return nil, err
	}
	return json.Marshal(result)
}

type ShiftClassificationRequest struct {
	Start                  string         `json:"start"`
	End                    string         `json:"end"`
	TimeZone               string         `json:"timeZone"`
	DaytimeStartMinute     int            `json:"daytimeStartMinute"`
	NighttimeStartMinute   int            `json:"nighttimeStartMinute"`
	Breaks                 []TimeInterval `json:"breaks"`
	RestDay                bool           `json:"restDay"`
	PublicHoliday          bool           `json:"publicHoliday"`
	UsePublishedClockRules bool           `json:"usePublishedClockRules"`
}

type TimeInterval struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

type ShiftClassification struct {
	TimeZone              string   `json:"timeZone"`
	DaytimeStartMinute    int      `json:"daytimeStartMinute"`
	NighttimeStartMinute  int      `json:"nighttimeStartMinute"`
	Classification        string   `json:"classification"`
	TotalMinutes          int64    `json:"totalMinutes"`
	DaytimeMinutes        int64    `json:"daytimeMinutes"`
	NighttimeMinutes      int64    `json:"nighttimeMinutes"`
	SundayMinutes         int64    `json:"sundayMinutes"`
	RestDayMinutes        int64    `json:"restDayMinutes"`
	PublicHolidayMinutes  int64    `json:"publicHolidayMinutes"`
	RuleSetVersions       []string `json:"ruleSetVersions,omitempty"`
	ClockRulesSource      string   `json:"clockRulesSource,omitempty"`
	HolidayCalendarSource string   `json:"holidayCalendarSource,omitempty"`
	PremiumsCalculated    bool     `json:"premiumsCalculated"`
}

func ClassifyShift(request ShiftClassificationRequest) (ShiftClassification, error) {
	if strings.TrimSpace(request.TimeZone) != "America/Bogota" {
		return ShiftClassification{}, fmt.Errorf("%w: only America/Bogota is currently supported", ErrInvalidRequest)
	}
	location := time.FixedZone("America/Bogota", -5*60*60)
	if !request.UsePublishedClockRules && (request.DaytimeStartMinute < 0 || request.DaytimeStartMinute >= 1440 || request.NighttimeStartMinute < 0 || request.NighttimeStartMinute >= 1440 || request.DaytimeStartMinute == request.NighttimeStartMinute) {
		return ShiftClassification{}, fmt.Errorf("%w: clock-band starts must be distinct minutes within one day", ErrInvalidRequest)
	}
	start, err := time.Parse(time.RFC3339, request.Start)
	if err != nil {
		return ShiftClassification{}, fmt.Errorf("%w: invalid shift start", ErrInvalidRequest)
	}
	if _, offset := start.Zone(); offset != -5*60*60 {
		return ShiftClassification{}, fmt.Errorf("%w: shift start must use Colombia's UTC-05:00 offset", ErrInvalidRequest)
	}
	end, err := time.Parse(time.RFC3339, request.End)
	if err != nil || !start.Before(end) {
		return ShiftClassification{}, fmt.Errorf("%w: shift end must follow start", ErrInvalidRequest)
	}
	if _, offset := end.Zone(); offset != -5*60*60 {
		return ShiftClassification{}, fmt.Errorf("%w: shift end must use Colombia's UTC-05:00 offset", ErrInvalidRequest)
	}
	if start.Second() != 0 || end.Second() != 0 || start.Nanosecond() != 0 || end.Nanosecond() != 0 || end.Sub(start) > 24*time.Hour {
		return ShiftClassification{}, fmt.Errorf("%w: shifts must use whole minutes and be no longer than 24 hours", ErrInvalidRequest)
	}
	breaks := make([][2]time.Time, 0, len(request.Breaks))
	for _, interval := range request.Breaks {
		breakStart, breakErr := time.Parse(time.RFC3339, interval.Start)
		breakEnd, endErr := time.Parse(time.RFC3339, interval.End)
		if breakErr != nil || endErr != nil || breakStart.Before(start) || !breakStart.Before(breakEnd) || breakEnd.After(end) || breakStart.Second() != 0 || breakEnd.Second() != 0 || breakStart.Nanosecond() != 0 || breakEnd.Nanosecond() != 0 {
			return ShiftClassification{}, fmt.Errorf("%w: each break must be a whole-minute interval inside the shift", ErrInvalidRequest)
		}
		if _, offset := breakStart.Zone(); offset != -5*60*60 {
			return ShiftClassification{}, fmt.Errorf("%w: break start must use Colombia's UTC-05:00 offset", ErrInvalidRequest)
		}
		if _, offset := breakEnd.Zone(); offset != -5*60*60 {
			return ShiftClassification{}, fmt.Errorf("%w: break end must use Colombia's UTC-05:00 offset", ErrInvalidRequest)
		}
		if len(breaks) > 0 && breakStart.Before(breaks[len(breaks)-1][1]) {
			return ShiftClassification{}, fmt.Errorf("%w: break intervals must be ordered and cannot overlap", ErrInvalidRequest)
		}
		breaks = append(breaks, [2]time.Time{breakStart, breakEnd})
	}
	result := ShiftClassification{TimeZone: request.TimeZone, DaytimeStartMinute: request.DaytimeStartMinute, NighttimeStartMinute: request.NighttimeStartMinute, Classification: "user-configured-clock-bands-not-a-legal-determination"}
	if request.UsePublishedClockRules {
		result.Classification = "published-ruleset-clock-band-classification-informational-only"
	}
	rulesByDate := make(map[string]RuleSet)
	holidaysByDate := make(map[string]bool)
	breakIndex := 0
	for cursor := start; cursor.Before(end); cursor = cursor.Add(time.Minute) {
		for breakIndex < len(breaks) && !cursor.Before(breaks[breakIndex][1]) {
			breakIndex++
		}
		if breakIndex < len(breaks) && !cursor.Before(breaks[breakIndex][0]) {
			continue
		}
		local := cursor.In(location)
		daytimeStartMinute := request.DaytimeStartMinute
		nighttimeStartMinute := request.NighttimeStartMinute
		if request.UsePublishedClockRules {
			localDate := local.Format("2006-01-02")
			rules, exists := rulesByDate[localDate]
			if !exists {
				rules, err = RulesForDate(localDate)
				if err != nil {
					return ShiftClassification{}, err
				}
				rulesByDate[localDate] = rules
				if len(result.RuleSetVersions) == 0 || result.RuleSetVersions[len(result.RuleSetVersions)-1] != rules.Version {
					result.RuleSetVersions = append(result.RuleSetVersions, rules.Version)
				}
			}
			daytimeStartMinute = rules.DaytimeStartMinute
			nighttimeStartMinute = rules.NighttimeStartMinute
			result.ClockRulesSource = rules.ClockRulesSource
			result.HolidayCalendarSource = rules.HolidayCalendarSource
			if result.TotalMinutes == 0 {
				result.DaytimeStartMinute = daytimeStartMinute
				result.NighttimeStartMinute = nighttimeStartMinute
			}
		}
		result.TotalMinutes++
		minuteOfDay := local.Hour()*60 + local.Minute()
		isDaytime := false
		if daytimeStartMinute < nighttimeStartMinute {
			isDaytime = minuteOfDay >= daytimeStartMinute && minuteOfDay < nighttimeStartMinute
		} else {
			isDaytime = minuteOfDay >= daytimeStartMinute || minuteOfDay < nighttimeStartMinute
		}
		if isDaytime {
			result.DaytimeMinutes++
		} else {
			result.NighttimeMinutes++
		}
		if local.Weekday() == time.Sunday {
			result.SundayMinutes++
		}
		if request.RestDay {
			result.RestDayMinutes++
		}
		isPublicHoliday := request.PublicHoliday
		if request.UsePublishedClockRules {
			localDate := local.Format("2006-01-02")
			var exists bool
			isPublicHoliday, exists = holidaysByDate[localDate]
			if !exists {
				isPublicHoliday, err = IsColombianPublicHoliday(localDate)
				if err != nil {
					return ShiftClassification{}, err
				}
				holidaysByDate[localDate] = isPublicHoliday
			}
		}
		if isPublicHoliday {
			result.PublicHolidayMinutes++
		}
	}
	return result, nil
}

func ClassifyShiftJSON(input []byte) ([]byte, error) {
	var request ShiftClassificationRequest
	if err := json.Unmarshal(input, &request); err != nil {
		return nil, fmt.Errorf("%w: malformed JSON", ErrInvalidRequest)
	}
	result, err := ClassifyShift(request)
	if err != nil {
		return nil, err
	}
	return json.Marshal(result)
}
