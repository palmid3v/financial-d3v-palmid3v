package payroll

import (
	"strings"
	"testing"
)

func TestRulesForDateVersionedTransitions(t *testing.T) {
	tests := []struct {
		date        string
		version     string
		transition  bool
		minimum     int64
		transport   int64
		dayEnd      int
		weeklyHours int
		restPremium int
	}{
		{"2025-06-30", "2025-01-01", false, 1_423_500, 200_000, 1260, 46, 75},
		{"2025-07-01", "2025-07-01", false, 1_423_500, 200_000, 1260, 46, 80},
		{"2025-07-15", "2025-07-15", false, 1_423_500, 200_000, 1260, 44, 80},
		{"2025-12-24", "2025-07-15", false, 1_423_500, 200_000, 1260, 44, 80},
		{"2025-12-25", "2025-12-25", false, 1_423_500, 200_000, 1140, 44, 80},
		{"2026-01-01", "2026-01-01", false, 1_750_905, 249_095, 1140, 44, 80},
		{"2026-02-19", "2026-02-19", true, 1_750_905, 249_095, 1140, 44, 80},
		{"2026-07-01", "2026-07-01", true, 1_750_905, 249_095, 1140, 44, 90},
		{"2026-07-09", "2026-07-09", false, 1_750_905, 249_095, 1140, 44, 90},
		{"2026-07-15", "2026-07-15", false, 1_750_905, 249_095, 1140, 42, 90},
		{"2026-11-14", "2026-07-15", false, 1_750_905, 249_095, 1140, 42, 90},
	}
	for _, test := range tests {
		t.Run(test.date, func(t *testing.T) {
			result, err := RulesForDate(test.date)
			if err != nil {
				t.Fatal(err)
			}
			if result.EffectiveFrom != test.version || result.Version != "co-private-labor-"+test.version+"-v1" || result.MinimumMonthlyCOP != test.minimum || result.TransportAllowanceCOP != test.transport || result.NighttimeStartMinute != test.dayEnd || result.MaxWeeklyHours != test.weeklyHours || result.RestDayPremiumPercent != test.restPremium || !result.EmployerMayApplyFullRate {
				t.Fatalf("unexpected rules snapshot: %+v", result)
			}
			if result.Version == "" || result.MinimumWageSource == "" || result.TransportSource == "" || result.WeeklyHoursSource == "" || result.ClockRulesSource == "" || result.HolidayCalendarSource != colombianHolidaySource || result.RestDayPremiumSource == "" || result.Verification == "" {
				t.Fatalf("rule snapshot must include traceability and verification state: %+v", result)
			}
			if test.transition && (!strings.Contains(result.Verification, "judicial-transition") || !strings.Contains(result.MinimumWageSource, "consejodeestado.gov.co")) {
				t.Fatalf("transition period must preserve its judicial source and verification state: %+v", result)
			}
		})
	}
}

func TestRulesForDateRejectsUncuratedAndMalformedDates(t *testing.T) {
	for _, date := range []string{"bad", "2024-12-31", "2027-01-01"} {
		if _, err := RulesForDate(date); err == nil {
			t.Errorf("expected date %q to be rejected", date)
		}
	}
}
