package domain

import (
	"errors"
	"fmt"
	"math"
)

var (
	ErrInvalidMoney = errors.New("invalid money")
	ErrCurrencyMismatch = errors.New("currency mismatch")
	ErrMoneyOverflow = errors.New("money overflow")
)

type Money struct {
	MinorUnits int64
	Currency string
}

func NewMoney(minorUnits int64, currency string) (Money, error) {
	if currency == "" {
		return Money{}, fmt.Errorf("%w: currency is required", ErrInvalidMoney)
	}
	return Money{MinorUnits: minorUnits, Currency: currency}, nil
}

func MustMoney(minorUnits int64, currency string) Money {
	money, err := NewMoney(minorUnits, currency)
	if err != nil { panic(err) }
	return money
}

func (m Money) Add(other Money) (Money, error) {
	if err := m.ensureSameCurrency(other); err != nil { return Money{}, err }
	if (other.MinorUnits > 0 && m.MinorUnits > math.MaxInt64-other.MinorUnits) ||
		(other.MinorUnits < 0 && m.MinorUnits < math.MinInt64-other.MinorUnits) {
		return Money{}, ErrMoneyOverflow
	}
	return Money{MinorUnits: m.MinorUnits + other.MinorUnits, Currency: m.Currency}, nil
}

func (m Money) Subtract(other Money) (Money, error) {
	if err := m.ensureSameCurrency(other); err != nil { return Money{}, err }
	if other.MinorUnits > 0 && m.MinorUnits < math.MinInt64+other.MinorUnits {
		return Money{}, ErrMoneyOverflow
	}
	if other.MinorUnits < 0 && m.MinorUnits > math.MaxInt64+other.MinorUnits {
		return Money{}, ErrMoneyOverflow
	}
	return Money{MinorUnits: m.MinorUnits - other.MinorUnits, Currency: m.Currency}, nil
}

func (m Money) Negate() (Money, error) {
	if m.MinorUnits == math.MinInt64 { return Money{}, ErrMoneyOverflow }
	return Money{MinorUnits: -m.MinorUnits, Currency: m.Currency}, nil
}

func (m Money) IsZero() bool { return m.MinorUnits == 0 }
func (m Money) IsPositive() bool { return m.MinorUnits > 0 }

func (m Money) ensureSameCurrency(other Money) error {
	if m.Currency == "" || other.Currency == "" {
		return fmt.Errorf("%w: currency is required", ErrInvalidMoney)
	}
	if m.Currency != other.Currency { return ErrCurrencyMismatch }
	return nil
}
