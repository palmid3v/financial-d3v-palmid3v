# FASE 10 — Assets, Liabilities and Net Worth

**Status: APPROVED / BUILT**

FASE 10 adds financial-position tracking.

## Assets

Assets represent owned value outside the account ledger when a separate valuation is useful.

Supported kinds:

- cash
- investment
- property
- vehicle
- other

Tracked cash/bank/investment account balances are also incorporated automatically into net worth.

## Liabilities

Generic liabilities represent obligations that are not modeled as a specialized debt.

Supported kinds:

- other
- tax
- legal
- other-debt

Debt balances from FASE 9 are included separately as specialized liabilities.

Negative account balances are also treated as liabilities in the financial-position calculation.

## Net worth

The authoritative calculation is:

**Net worth = assets − liabilities − debt balances**

The API returns:

- total assets;
- total liabilities;
- debt liabilities;
- net worth;
- currency;
- valuation timestamp.

## API

Assets:

- `POST /api/v1/assets`
- `GET /api/v1/assets`
- `GET /api/v1/assets/{assetID}`

Liabilities:

- `POST /api/v1/liabilities`
- `GET /api/v1/liabilities`
- `GET /api/v1/liabilities/{liabilityID}`

Position:

- `GET /api/v1/net-worth?currency=COP`

## Double-counting rule

A debt is already a specialized liability and is **not** also stored as a generic liability.

Tracked account balances are automatically incorporated into net worth. Users should not create a duplicate asset record for the same tracked account.

## Boundaries

FASE 10 does not:

- estimate market values automatically;
- connect external investment providers;
- provide investment performance guarantees;
- invent Colombian tax or legal rules;
- replace professional financial, accounting or tax advice.
