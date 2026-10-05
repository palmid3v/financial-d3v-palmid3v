# Financial-D3v

Financial-D3v is a private, personal financial application and learning workspace built to help its owner understand, organize and improve the way money is managed.

It is also a real engineering project for learning Go, backend architecture, databases, software design and disciplined AI-assisted development.

## Product direction

Financial-D3v is not only a payroll application. Payroll is one specialized domain inside a broader personal financial platform.

The application has two complementary goals:

1. Financial control: understand income, expenses, accounts, budgets, savings, debts, assets, liabilities and net worth.
2. Financial education: explain financial concepts, surface useful insights, encourage intentional saving, and turn the user's own financial activity into practical learning.

The educational layer explains and supports decisions; it does not replace qualified financial, legal or tax professionals.

## Private-by-design operating model

Financial-D3v is a private application that runs when the owner chooses to run it. It is not designed as a public SaaS product.

The initial model is:
- local application runtime;
- private Firebase project;
- Firebase Firestore as persistence;
- Firebase Authentication later;
- no public financial data;
- no unnecessary always-on application process;
- explicit ownership and access boundaries.

Firebase is the approved database direction. PostgreSQL is no longer the active persistence target.

## Approved technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite |
| UI | Tailwind CSS |
| Visual | Dark Mode |
| PWA | Vite PWA |
| Backend | Go 1.27 |
| API | REST/HTTP |
| Database | Firebase Firestore |
| Auth | Firebase Auth (later) |
| CI | GitHub Actions |
| Docs | Markdown |

## Product modules

### Personal finance
- Dashboard
- Accounts
- Transactions
- Income
- Expenses
- Categories
- Budgets
- Savings goals
- Debts
- Assets
- Liabilities
- Net worth

### Financial education
- Financial concepts explained in context
- Spending and saving insights
- Budget education
- Savings habit guidance
- Debt education
- Net-worth education
- Personal financial goals
- Progress reflections
- Glossary and learning notes

### Specialized finance
- Payroll
- Employees
- Contracts
- Earnings
- Deductions
- Payroll rules and reports

## UI direction

Dark Mode is the primary experience on desktop and mobile, with dashboard-first navigation, responsive navigation, quick transaction actions, financial KPI cards, charts and contextual educational explanations.

See docs/14-UI-UX-DESIGN.md.

## Documentation

The repository is the source of truth.

Start with:
1. CONTEXT.md
2. README.md
3. STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md
4. docs/README.md
5. Current implementation and tests

Key documents include product vision, requirements, architecture, domain model, Firebase database design, API design, financial rules, security, testing, deployment, AI workflow, Go learning, roadmap, UI/UX, financial education and private/personal use.

## Development philosophy

Build the platform in small, validated phases.

Financial calculations must be deterministic. Business rules must be explicit. Educational explanations must be understandable and traceable to the underlying financial state. Generated code must always be reviewed and tested.

The product should help its owner learn by using it, not merely store numbers.

---

Financial-D3v · PALMI-D3V · Personal Finance + Financial Education
