# FASE 13 — Frontend Product

**APPROVED / BUILT**

Financial-D3v now has a first product-facing React/Vite shell using Tailwind CSS, dark mode and Vite PWA.

## Scope

- Mobile-first application shell.
- Dashboard-first navigation.
- Monthly dashboard consuming `GET /api/v1/dashboard`.
- Income, expenses, net cash flow and net-worth cards.
- Navigation surfaces for transactions, budgets, savings, debts and net worth.
- Local-development owner fallback.
- API client with Firebase-token-ready Authorization support.
- PWA manifest and auto-update configuration.

## Boundary

The frontend does not invent financial calculations. Important financial numbers continue to come from the backend's authoritative application services.

The local `X-Owner-ID` input is a development fallback only. Production authentication uses Firebase Auth ID tokens.

## Run

From `frontend/`:

```bash
npm install
npm run dev
```
