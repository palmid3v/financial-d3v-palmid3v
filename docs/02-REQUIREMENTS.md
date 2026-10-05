# Requirements

## Functional foundation

### Personal finance
- Manage financial accounts.
- Record income, expenses and transfers.
- Categorize transactions.
- Define budgets.
- Track savings goals and contributions.
- Track debts and payments.
- Track assets and liabilities.
- Calculate net worth.
- Produce cash-flow and financial summaries.

### Financial education
- Explain relevant financial concepts.
- Connect explanations to the user's own records.
- Show why a metric changed.
- Explain budget utilization.
- Explain savings progress.
- Explain debt balances and payments.
- Explain net-worth movement.
- Maintain a financial glossary and learning area.
- Provide educational prompts without presenting them as guaranteed financial advice.

### Payroll
- Represent employees.
- Represent contracts.
- Represent payroll periods and runs.
- Represent earnings and deductions.
- Version payroll rules before authoritative calculations.

## Private application requirements

- The application is private and personal.
- Runtime is intentionally controlled by the owner.
- Financial records are not public.
- Database access must be restricted.
- Authentication is planned through Firebase Auth.
- Authorization and ownership checks remain server-side.
- Secrets and Firebase credentials must never be committed.

## Non-functional

- Go 1.27 backend.
- React + Vite frontend.
- Tailwind CSS.
- Dark Mode as primary visual theme.
- Vite PWA.
- Firebase Firestore persistence.
- REST/HTTP API.
- Deterministic monetary representation.
- Testable domain behavior.
- Responsive desktop and mobile UX.
- Clear error handling.
- Traceable financial calculations.

## Explicit exclusions

- No invented Colombian payroll/tax rules.
- No public SaaS assumptions in the initial product.
- No financial data sharing by default.
- No automatic execution of financial transactions.
- No frontend duplication of authoritative business rules.
- No educational content presented as individualized professional financial advice.
