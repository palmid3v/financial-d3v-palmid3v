package domain

import "errors"

var ErrBalanceCurrencyMismatch = errors.New("balance currency mismatch")

func CalculateAccountBalance(account Account, transactions []Transaction) (Money, error) {
	balance := account.OpeningBalance
	for _, transaction := range transactions {
		if transaction.AccountID != account.ID { continue }
		if transaction.Amount.Currency != account.Currency { return Money{}, ErrBalanceCurrencyMismatch }
		var delta Money
		switch transaction.Type {
		case TransactionIncome:
			delta = transaction.Amount
		case TransactionExpense, TransactionTransfer:
			var err error
			delta, err = transaction.Amount.Negate()
			if err != nil { return Money{}, err }
		default:
			return Money{}, ErrInvalidTransaction
		}
		var err error
		balance, err = balance.Add(delta)
		if err != nil { return Money{}, err }
	}
	return balance, nil
}
