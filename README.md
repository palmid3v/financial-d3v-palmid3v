# Financial-D3v

Financial-D3v is a **private personal-finance application and financial learning workspace**.

It helps its owner understand, organize and improve personal finances while also serving as a practical project for learning software engineering.

## Product vision

The application helps answer:

- What money do I have?
- What came in?
- What went out?
- What am I planning?
- What am I saving?
- How am I progressing?
- What changed?
- Why did it change?
- What can I learn from it?

The product is not payroll-first. Payroll is a specialized domain inside the broader personal-finance product.

## Product loop

**Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust**

## Approved stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite |
| UI | Tailwind CSS |
| Visual | Dark Mode |
| PWA | Vite PWA |
| Backend | Go 1.27 |
| API | REST/HTTP |
| Database | Firebase Firestore |
| Auth | Firebase Auth |
| CI | GitHub Actions |
| Docs | Markdown |

## Private operation

The owner runs the application when needed.

It is not initially a public SaaS and does not automatically execute external financial operations.

## 🧭 Current checkpoint

### ✅ FASES 1–17 — APPROVED / BUILT\n\n### 🧩 FASES 18–24 — IMPLEMENTED / VALIDATION PENDING\n\n### FASE 25 — SAVINGS + DEBT UX RESTORED / VALIDATION PENDING

The platform foundation is complete through production-readiness UX.

The backend covers:

`Account → Transaction → Balance → Budget → Planned vs Actual → Savings Goal → Contributions → Progress → Financial Education → Debt → Assets/Liabilities → Net Worth → Reports → Auth/Audit`

The frontend now provides functional Transactions, Accounts, Budget, Savings, Debts, Net Worth and Education surfaces. Savings and Debt were restored on the repaired `main` without reintroducing the previous `App.jsx` corruption.

## 🗺️ Full roadmap

### PLATFORM

- [x] FASE 1 — Product definition
- [x] FASE 2 — Financial Domain Model v2
- [x] FASE 3 — Firestore persistence design
- [x] FASE 4 — Go application foundation
- [x] FASE 5 — Accounts and transactions
- [x] FASE 6 — Budgeting
- [x] FASE 7 — Savings and financial habits
- [x] FASE 8 — Financial education
- [x] FASE 9 — Debts
- [x] FASE 10 — Assets, liabilities and net worth
- [x] FASE 11 — Reports and financial dashboard
- [x] FASE 12 — Authentication, privacy and audit
- [x] FASE 13 — Frontend product
- [x] FASE 14 — Testing hardening
- [x] FASE 15 — Payroll
- [x] FASE 16 — Private deployment and operations
- [x] FASE 17 — Production readiness & product UX

### PRODUCT

- [x] FASE 18 — Transactions UX (implementation complete; validation pending)
- [x] FASE 19 — Accounts UX (implementation complete; validation pending)
- [x] FASE 20 — Budget UX (implementation complete; validation pending)
- [x] FASE 21 — Savings UX (implementation complete; validation pending)
- [x] FASE 22 — Debt UX (implementation complete; validation pending)
- [x] FASE 23 — Net Worth UX (implementation complete; validation pending)
- [x] FASE 24 — Education UX (implementation complete; validation pending)

### PRIVATE PRODUCTION

- [ ] FASE 25 — Private production deployment
- [ ] FASE 26 — Data protection and recovery
- [ ] FASE 27 — Observability and reliability
- [ ] FASE 28 — Financial data quality
- [ ] FASE 29 — Historical financial intelligence
- [ ] FASE 30+ — Continuous product evolution

See `docs/13-ROADMAP.md` for the detailed checklist and `STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md` for the operational execution guide.

## 🧪 Validation checkpoint

Previously validated baseline (FASE 17):

```text
go test ./...   → PASS
go build ./...  → PASS
npm ci          → PASS
npm run build   → PASS
PWA generation  → PASS
/health         → PASS
/ready          → PASS
runtime         → PASS
```

## Next execution target

**FASE 18 — Transactions UX**

The next work is product completion, not arbitrary infrastructure expansion. The objective is to connect the existing financial backend capabilities to a fast, understandable, mobile-first daily workflow.

## 📚 Documentation

Start with:

1. `CONTEXT.md`
2. `README.md`
3. `STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md`
4. `docs/13-ROADMAP.md`
5. `docs/PHASE-17-PRODUCTION-READINESS-UX.md`
6. `docs/OPERATIONS-RUNBOOK.md`

The repository is the source of truth.

---

**Financial-D3v · PALMI-D3V · Personal Finance + Financial Education**
