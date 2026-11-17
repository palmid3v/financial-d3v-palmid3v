package payroll

import "testing"

func TestColombianPublicHolidaysTransfersAndKeepsRestDayDistinct(t *testing.T) {
	holidayDates, err := ColombianPublicHolidays(2026)
	if err != nil {
		t.Fatal(err)
	}
	byDate := make(map[string]PublicHoliday, len(holidayDates))
	for _, holiday := range holidayDates {
		byDate[holiday.Date] = holiday
		if holiday.Source != colombianHolidaySource || len(holiday.Names) == 0 {
			t.Fatalf("holiday must include its source and name: %+v", holiday)
		}
	}
	for date, name := range map[string]string{
		"2026-01-12": "Epifanía",
		"2026-04-02": "Jueves Santo",
		"2026-04-03": "Viernes Santo",
		"2026-05-18": "Ascensión del Señor",
		"2026-06-08": "Corpus Christi",
		"2026-06-15": "Sagrado Corazón de Jesús",
		"2026-07-20": "Independencia",
	} {
		holiday, ok := byDate[date]
		if !ok || !contains(holiday.Names, name) {
			t.Errorf("expected %s on %s, got %+v", name, date, holiday)
		}
	}
	if !byDate["2026-01-12"].Transferred || byDate["2026-01-12"].LegalDate != "2026-01-06" {
		t.Fatalf("transferred holiday must retain its original legal date: %+v", byDate["2026-01-12"])
	}
	if byDate["2026-07-20"].Transferred {
		t.Fatalf("fixed July 20 holiday must not be transferred: %+v", byDate["2026-07-20"])
	}
	if len(holidayDates) != 18 {
		t.Fatalf("expected 18 unique national paid holiday dates in 2026, got %d", len(holidayDates))
	}
}

func TestPublishedShiftCalendarCountsFestivoSeparatelyFromRestDay(t *testing.T) {
	result, err := ClassifyShift(ShiftClassificationRequest{
		Start: "2026-05-18T12:00:00-05:00", End: "2026-05-18T13:00:00-05:00", TimeZone: "America/Bogota", UsePublishedClockRules: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if result.PublicHolidayMinutes != 60 || result.RestDayMinutes != 0 || result.HolidayCalendarSource != colombianHolidaySource {
		t.Fatalf("national holiday minutes and contractual rest day must remain distinct: %+v", result)
	}
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
