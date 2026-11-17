package payroll

import (
	"encoding/json"
	"fmt"
	"sort"
	"time"
)

const colombianHolidaySource = "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4954"

type PublicHoliday struct {
	Date        string   `json:"date"`
	LegalDate   string   `json:"legalDate"`
	Names       []string `json:"names"`
	Transferred bool     `json:"transferred"`
	Source      string   `json:"source"`
}

// ColombianPublicHolidays returns the national remunerated holiday dates in a
// Gregorian calendar year. It applies the transfer rule in Law 51 of 1983;
// it does not infer a worker's contractual rest day or calculate premiums.
func ColombianPublicHolidays(year int) ([]PublicHoliday, error) {
	if year < 1900 || year > 9999 {
		return nil, fmt.Errorf("%w: holiday year must be between 1900 and 9999", ErrInvalidRequest)
	}
	location := time.UTC
	byObservedDate := make(map[string]*PublicHoliday)
	add := func(legalDate time.Time, name string, transfer bool) {
		observed := legalDate
		if transfer {
			for observed.Weekday() != time.Monday {
				observed = observed.AddDate(0, 0, 1)
			}
		}
		key := observed.Format("2006-01-02")
		entry := byObservedDate[key]
		if entry == nil {
			entry = &PublicHoliday{Date: key, LegalDate: legalDate.Format("2006-01-02"), Transferred: !observed.Equal(legalDate), Source: colombianHolidaySource}
			byObservedDate[key] = entry
		}
		entry.Names = append(entry.Names, name)
	}
	fixed := []struct {
		month    time.Month
		day      int
		name     string
		transfer bool
	}{
		{time.January, 1, "Año Nuevo", false}, {time.January, 6, "Epifanía", true},
		{time.March, 19, "San José", true}, {time.May, 1, "Día del Trabajo", false},
		{time.June, 29, "San Pedro y San Pablo", true}, {time.July, 20, "Independencia", false},
		{time.August, 7, "Batalla de Boyacá", false}, {time.August, 15, "Asunción de la Virgen", true},
		{time.October, 12, "Día de la Raza", true}, {time.November, 1, "Todos los Santos", true},
		{time.November, 11, "Independencia de Cartagena", true}, {time.December, 8, "Inmaculada Concepción", false},
		{time.December, 25, "Navidad", false},
	}
	for _, item := range fixed {
		add(time.Date(year, item.month, item.day, 0, 0, 0, 0, location), item.name, item.transfer)
	}
	easter := gregorianEasterSunday(year)
	add(easter.AddDate(0, 0, -3), "Jueves Santo", false)
	add(easter.AddDate(0, 0, -2), "Viernes Santo", false)
	add(easter.AddDate(0, 0, 39), "Ascensión del Señor", true)
	add(easter.AddDate(0, 0, 60), "Corpus Christi", true)
	add(easter.AddDate(0, 0, 68), "Sagrado Corazón de Jesús", true)

	result := make([]PublicHoliday, 0, len(byObservedDate))
	for _, holiday := range byObservedDate {
		result = append(result, *holiday)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Date < result[j].Date })
	return result, nil
}

func IsColombianPublicHoliday(date string) (bool, error) {
	parsed, err := time.Parse("2006-01-02", date)
	if err != nil {
		return false, fmt.Errorf("%w: invalid holiday date", ErrInvalidRequest)
	}
	holidays, err := ColombianPublicHolidays(parsed.Year())
	if err != nil {
		return false, err
	}
	for _, holiday := range holidays {
		if holiday.Date == date {
			return true, nil
		}
	}
	return false, nil
}

func ColombianPublicHolidaysJSON(input []byte) ([]byte, error) {
	var request struct {
		Year int `json:"year"`
	}
	if err := json.Unmarshal(input, &request); err != nil {
		return nil, fmt.Errorf("%w: malformed holiday calendar request", ErrInvalidRequest)
	}
	holidays, err := ColombianPublicHolidays(request.Year)
	if err != nil {
		return nil, err
	}
	return json.Marshal(struct {
		Year    int             `json:"year"`
		Source  string          `json:"source"`
		Entries []PublicHoliday `json:"entries"`
	}{request.Year, colombianHolidaySource, holidays})
}

// gregorianEasterSunday implements the Gregorian computus.
func gregorianEasterSunday(year int) time.Time {
	a := year % 19
	b := year / 100
	c := year % 100
	d := b / 4
	e := b % 4
	f := (b + 8) / 25
	g := (b - f + 1) / 3
	h := (19*a + b - d - g + 15) % 30
	i := c / 4
	k := c % 4
	l := (32 + 2*e + 2*i - h - k) % 7
	m := (a + 11*h + 22*l) / 451
	month := (h + l - 7*m + 114) / 31
	day := (h+l-7*m+114)%31 + 1
	return time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
}
