package domain

import "testing"

func TestMoneyAdd(t *testing.T) {
	left, _ := NewMoney(1250, "COP")
	right, _ := NewMoney(750, "COP")
	got, err := left.Add(right)
	if err != nil {
		t.Fatal(err)
	}
	if got.AmountMinor != 2000 || got.Currency != "COP" {
		t.Fatalf("unexpected money: %+v", got)
	}
}

func TestMoneyRejectsCurrencyMismatch(t *testing.T) {
	left, _ := NewMoney(100, "COP")
	right, _ := NewMoney(100, "USD")
	if _, err := left.Add(right); err == nil {
		t.Fatal("expected currency mismatch")
	}
}
