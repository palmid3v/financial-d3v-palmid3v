// Package domain will be rebuilt from the approved Phase 1 product model.
// The previous domain entities belonged to the superseded product definition.
// Phase 2 will define the new financial domain from the approved product requirements.
package domain

func ValidateTransferPair(outgoing, incoming Transaction) error {
	if !outgoing.IsTransfer() || !incoming.IsTransfer() {
		return fmt.Errorf("%w: both transactions must be transfers", ErrInvalidTransaction)
	}
	if outgoing.TransferID == "" || incoming.TransferID == "" || outgoing.TransferID != incoming.TransferID {
		return fmt.Errorf("%w: transfer identifier must match", ErrInvalidTransaction)
	}
	if outgoing.OwnerID != incoming.OwnerID || outgoing.AccountID == incoming.AccountID {
		return fmt.Errorf("%w: transfer must stay within one owner and use distinct accounts", ErrInvalidTransaction)
	}
	if outgoing.Amount.Currency != incoming.Amount.Currency || outgoing.Amount.MinorUnits != incoming.Amount.MinorUnits {
		return fmt.Errorf("%w: transfer amounts must match", ErrInvalidTransaction)
	}
	return nil
}
