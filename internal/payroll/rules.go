package payroll

import (
	"encoding/json"
	"fmt"
	"time"
)

// RuleSet is a source-traceable snapshot of published Colombian labor
// parameters. It is intentionally a catalog, not a payroll calculator:
// employment scope, exceptions, causation, proration, overlaps and legal
// interpretation still require explicit validation before settlement.
type RuleSet struct {
	Version                  string `json:"version"`
	EffectiveFrom            string `json:"effectiveFrom"`
	EffectiveThrough         string `json:"effectiveThrough,omitempty"`
	Currency                 string `json:"currency"`
	MinimumMonthlyCOP        int64  `json:"minimumMonthlyCOP"`
	TransportAllowanceCOP    int64  `json:"transportAllowanceCOP"`
	DaytimeStartMinute       int    `json:"daytimeStartMinute"`
	NighttimeStartMinute     int    `json:"nighttimeStartMinute"`
	NightWindowEffectiveFrom string `json:"nightWindowEffectiveFrom"`
	MaxWeeklyHours           int    `json:"maxWeeklyHours"`
	WeeklyHoursSource        string `json:"weeklyHoursSource"`
	ClockRulesSource         string `json:"clockRulesSource"`
	HolidayCalendarSource    string `json:"holidayCalendarSource"`
	RestDayPremiumPercent    int    `json:"restDayPremiumPercent"`
	EmployerMayApplyFullRate bool   `json:"employerMayApplyFullRateEarly"`
	RestDayPremiumSource     string `json:"restDayPremiumSource"`
	MinimumWageSource        string `json:"minimumWageSource"`
	TransportSource          string `json:"transportSource"`
	Verification             string `json:"verification"`
}

const (
	minimumWage2025Source       = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=257156"
	minimumWage2026Source       = "https://cancilleria.gov.co/normograma/compilacion/docs/decreto_1469_2025.htm"
	minimumWageTransitionSource = "https://cancilleria.gov.co/normograma/compilacion/docs/decreto_0159_2026.htm"
	transport2025Source         = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=256836"
	transport2026Source         = "https://cancilleria.gov.co/normograma/compilacion/docs/decreto_1470_2025.htm"
	workHoursSource             = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=166506"
	workNightSource             = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676"
	restDaySource               = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676"
)

// RulesForDate returns the published parameter snapshot for Colombian private
// employment as of a date. It deliberately refuses dates outside its curated
// range rather than guessing a preceding annual value.
func RulesForDate(value string) (RuleSet, error) {
	date, err := time.Parse("2006-01-02", value)
	if err != nil {
		return RuleSet{}, fmt.Errorf("%w: invalid rules date", ErrInvalidRequest)
	}
	if date.Before(time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)) || date.After(time.Date(2026, 12, 31, 0, 0, 0, 0, time.UTC)) {
		return RuleSet{}, fmt.Errorf("%w: no published parameter snapshot curated for this date", ErrInvalidRequest)
	}
	year := date.Year()
	result := RuleSet{
		Version:       fmt.Sprintf("co-private-labor-%d-v1", year),
		EffectiveFrom: fmt.Sprintf("%d-01-01", year), Currency: "COP",
		DaytimeStartMinute: 360, NighttimeStartMinute: 21 * 60,
		NightWindowEffectiveFrom: "2025-12-25",
		WeeklyHoursSource:        workHoursSource, RestDayPremiumSource: restDaySource,
		ClockRulesSource:      workNightSource,
		HolidayCalendarSource: colombianHolidaySource,
		MinimumWageSource:     minimumWage2025Source, TransportSource: transport2025Source,
		EmployerMayApplyFullRate: true,
		Verification:             "official-parameter-catalog-not-professionally-reviewed-payroll-rule",
	}
	if year == 2025 {
		result.MinimumMonthlyCOP = 1_423_500
		result.TransportAllowanceCOP = 200_000
		result.MaxWeeklyHours = 44
		result.RestDayPremiumPercent = 80
		result.EffectiveThrough = "2025-12-31"
		if date.Before(time.Date(2025, 7, 15, 0, 0, 0, 0, time.UTC)) {
			result.MaxWeeklyHours = 46
		}
		if date.Before(time.Date(2025, 7, 1, 0, 0, 0, 0, time.UTC)) {
			result.RestDayPremiumPercent = 75
		}
		if !date.Before(time.Date(2025, 12, 25, 0, 0, 0, 0, time.UTC)) {
			result.NighttimeStartMinute = 19 * 60
		}
		if date.Before(time.Date(2025, 7, 1, 0, 0, 0, 0, time.UTC)) {
			setRulePeriod(&result, "2025-01-01", "2025-06-30")
		} else if date.Before(time.Date(2025, 7, 15, 0, 0, 0, 0, time.UTC)) {
			setRulePeriod(&result, "2025-07-01", "2025-07-14")
		} else if date.Before(time.Date(2025, 12, 25, 0, 0, 0, 0, time.UTC)) {
			setRulePeriod(&result, "2025-07-15", "2025-12-24")
		} else {
			setRulePeriod(&result, "2025-12-25", "2025-12-31")
		}
		return result, nil
	}

	result.MinimumMonthlyCOP = 1_750_905
	result.TransportAllowanceCOP = 249_095
	result.MaxWeeklyHours = 44
	result.RestDayPremiumPercent = 90
	result.NighttimeStartMinute = 19 * 60
	result.MinimumWageSource = minimumWage2026Source
	result.TransportSource = transport2026Source
	if date.Before(time.Date(2026, 2, 19, 0, 0, 0, 0, time.UTC)) {
		setRulePeriod(&result, "2026-01-01", "2026-02-18")
	} else if date.Before(time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC)) {
		setRulePeriod(&result, "2026-02-19", "2026-06-30")
		result.MinimumWageSource = minimumWageTransitionSource + "; https://www.consejodeestado.gov.co/noticias/"
		result.Verification = "official-parameter-catalog-with-2026-judicial-transition-not-professionally-reviewed-payroll-rule"
	} else if date.Before(time.Date(2026, 7, 9, 0, 0, 0, 0, time.UTC)) {
		setRulePeriod(&result, "2026-07-01", "2026-07-08")
		result.MinimumWageSource = minimumWageTransitionSource + "; https://www.consejodeestado.gov.co/noticias/"
		result.Verification = "official-parameter-catalog-with-2026-judicial-transition-not-professionally-reviewed-payroll-rule"
	} else {
		if date.Before(time.Date(2026, 7, 15, 0, 0, 0, 0, time.UTC)) {
			setRulePeriod(&result, "2026-07-09", "2026-07-14")
			result.MaxWeeklyHours = 44
		} else {
			setRulePeriod(&result, "2026-07-15", "2026-12-31")
			result.MaxWeeklyHours = 42
		}
		result.MinimumWageSource += "; https://www.consejodeestado.gov.co/noticias/"
	}
	if date.Before(time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC)) {
		result.RestDayPremiumPercent = 80
	}
	return result, nil
}

func setRulePeriod(result *RuleSet, effectiveFrom, effectiveThrough string) {
	result.EffectiveFrom = effectiveFrom
	result.EffectiveThrough = effectiveThrough
	result.Version = "co-private-labor-" + effectiveFrom + "-v1"
}

func RulesForDateJSON(input []byte) ([]byte, error) {
	var request struct {
		Date string `json:"date"`
	}
	if err := json.Unmarshal(input, &request); err != nil {
		return nil, fmt.Errorf("%w: malformed rules request", ErrInvalidRequest)
	}
	rules, err := RulesForDate(request.Date)
	if err != nil {
		return nil, err
	}
	return json.Marshal(rules)
}
