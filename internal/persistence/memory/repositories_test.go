package memory

import (
	"context"
	"testing"
	"time"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

func TestStoreAccountAndTransactions(t *testing.T) {
	s := NewStore()
	ctx := context.Background()
	a, err := domain.NewAccount("a1", "owner-1", "Cash", domain.AccountTypeCash, domain.MustMoney(100000, "COP"), time.Now())
	if err != nil { t.Fatal(err) }
	if err := s.Accounts().Create(ctx, a); err != nil { t.Fatal(err) }
	tx, err := domain.NewTransaction("t1", "owner-1", "a1", domain.TransactionIncome, domain.MustMoney(50000, "COP"), time.Now())
	if err != nil { t.Fatal(err) }
	if err := s.Transactions().Create(ctx, tx); err != nil { t.Fatal(err) }
	items, err := s.Transactions().ListByAccount(ctx, "owner-1", "a1")
	if err != nil || len(items) != 1 { t.Fatalf("transactions=%d err=%v", len(items), err) }
}
