# FASE 7 — Savings and Financial Habits

Status: **APPROVED / BUILT**

FASE 7 makes saving a first-class product outcome instead of leaving it as an informal note inside transactions.

## Objective

Help the owner answer:

- What am I saving for?
- How much is the target?
- How much have I contributed?
- How much remains?
- Am I making progress?
- What pace is required to reach the target date?
- Is there a visible contribution history?

## Domain

A savings goal contains:

- owner
- name
- target amount
- currency
- optional target date
- creation timestamp

A savings contribution contains:

- owner
- goal
- amount
- optional source account
- optional transaction reference
- contribution date
- optional note
- creation timestamp

Contributions are stored separately from ordinary expenses. Saving money is not automatically classified as spending.

## Progress

Progress is derived from the contribution ledger:

`Goal → Contributions → Total contributed → Remaining → Percentage`

The domain also derives a required daily pace when a target date exists:

`remaining / days remaining`

The required daily amount is rounded upward in minor units so the pace is sufficient to cover the remaining target.

When the target is already reached, remaining is zero and required pace is zero.

## Habit signal

The savings summary exposes:

- contribution count
- last contribution date
- total contributed
- percentage complete
- remaining amount
- required daily pace
- days remaining

This gives the future frontend enough information to make consistency visible without inventing a separate behavioral score.

## API

- `POST /api/v1/savings-goals`
- `GET /api/v1/savings-goals`
- `GET /api/v1/savings-goals/{goalID}`
- `GET /api/v1/savings-goals/{goalID}/summary`
- `POST /api/v1/savings-goals/{goalID}/contributions`

Contributions can optionally reference a source account and transaction, but the contribution record itself is the goal-progress record.

## Firestore

Savings goals:

`users/{ownerId}/savingsGoals/{goalId}`

Savings contributions:

`users/{ownerId}/savingsContributions/{contributionId}`

Contributions are queried by goal and contribution date.

## Financial learning

The future education layer can explain savings using the same four-part model:

**FACT:** target and contribution records.

**CALCULATION:** contributed, remaining, percentage and required pace.

**INTERPRETATION:** progress against the chosen target.

**ACTION:** decide what contribution pattern to use.

The application does not promise that a savings plan will be achieved automatically.

## Boundaries

FASE 7 does not connect to banks, move money automatically, or make investment recommendations.

Debt remains FASE 9. Assets, liabilities and net worth remain FASE 10.
