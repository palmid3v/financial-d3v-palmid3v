# FASE 1 — Product Specification

Status: APPROVED / BUILT

Financial-D3v is a private personal-finance application and financial learning workspace for its owner.

## Purpose

The product helps the user understand:
- money available;
- money received;
- money spent;
- planned spending;
- savings progress;
- obligations;
- assets and liabilities;
- financial progress over time.

It also teaches financial concepts through the user's own records and is a practical software-engineering project.

## Primary user

The first target user is the owner. The product is intentionally designed around one real personal workflow rather than a generic SaaS audience.

## Core jobs

Daily: record money movement and understand its effect.

Weekly: review movement and identify items needing attention.

Monthly: review income, expenses, plans and savings progress.

Long term: become more capable at managing money by understanding the numbers.

## MVP

### Foundation
- Accounts
- Transactions
- Income
- Expenses
- Transfers
- Categories
- Balances
- History

### Planning
- Monthly budgets
- Category limits
- Planned vs actual
- Savings goals
- Contributions
- Goal progress

### Understanding
- Cash flow
- Income vs expenses
- Spending by category
- Savings progress
- Contextual education

Debts, assets, liabilities, net worth history, payroll and advanced reporting come later.

## Core loop

Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust

## Education model

FACT: what the records contain.

CALCULATION: what the application derives mathematically.

INTERPRETATION: what the result may indicate.

ACTION: a possible next step to consider.

The application must never present an interpretation as a fact.

## Savings

Savings is a first-class product outcome. Goals can contain a target amount, optional target date, contributions, progress, remaining amount, required pace and plan-versus-actual comparison.

The application should explain the mechanics behind these numbers.

## Initial learning areas

- income and expenses;
- cash flow;
- budgets;
- planned vs actual;
- savings goals and consistency;
- debt concepts;
- assets, liabilities and net worth.

## Initial metrics

- available balance;
- period income;
- period expenses;
- net cash flow;
- budget utilization;
- savings contributions;
- savings goal progress;
- debt outstanding;
- assets;
- liabilities;
- net worth.

Every derived metric must have a documented formula.

## Boundaries

The first product version does not execute external money movement, automatically connect to financial institutions, provide guaranteed investment results, invent legal/tax rules, expose personal financial data publicly, or operate as a public SaaS.

## Privacy

The owner decides when the application runs. Personal financial data belongs in the private Firebase project used by the application. Data collection must remain minimal and intentional.

## UX principles

1. Dark Mode first.
2. Fast entry.
3. Dashboard before administration.
4. Numbers have context.
5. Education appears where it is useful.
6. Color is not the only state indicator.
7. Mobile is first-class.
8. Important numbers are explainable.
9. The interface should reduce unnecessary anxiety.
10. Complexity is introduced progressively.

## Acceptance

- [x] Product purpose defined.
- [x] Primary user defined.
- [x] Financial goals defined.
- [x] Educational goals defined.
- [x] MVP defined.
- [x] Savings objective defined.
- [x] Initial metrics defined.
- [x] Privacy boundaries defined.
- [x] Product boundaries defined.
- [x] New vision is the basis for all future phases.

Next: FASE 2 — Financial Domain Model v2.
