package domain

import "fmt"

// Money stores an amount in integer minor units with an explicit currency.
type Money struct {
	AmountMinor int64
	Currency    string
}

func NewMoney(amountMinor int64, currency string) (Money, error) {
	if currency == "" {
		return Money{}, fmt.Errorf("currency is required")
	}
	return Money{AmountMinor: amountMinor, Currency: currency}, nil
}

func (m Money) Add(other Money) (Money, error) {
	if m.Currency != other.Currency {
		return Money{}, fmt.Errorf("currency mismatch: %s != %s", m.Currency, other.Currency)
	}
	return Money{AmountMinor: m.AmountMinor + other.AmountMinor, Currency: m.Currency}, nil
}

func (m Money) Negate() Money {
	return Money{AmountMinor: -m.AmountMinor, Currency: m.Currency}
}
