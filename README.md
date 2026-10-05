# Financial-D3v

Financial-D3v is a **private personal-finance application and financial learning workspace**.

It helps its owner understand, organize and improve personal finances while also serving as a practical project for learning software engineering.

## Product vision

The application is built around one real user workflow.

Its purpose is to help answer:

- What money do I have?
- What came in?
- What went out?
- What am I planning?
- What am I saving?
- How am I progressing?
- What changed?
- Why did it change?
- What can I learn from it?

The product is not currently a payroll application. Payroll is a later specialized domain.

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

## Current checkpoint

### FASES 1–12 — APPROVED / BUILT

The backend foundation now covers:

`Account → Transaction → Balance → Budget → Planned vs Actual → Savings Goal → Contributions → Progress → Financial Education → Debt → Assets/Liabilities → Net Worth → Reports → Auth/Audit`

FASE 11 provides explainable reports and dashboard data.

FASE 12 provides Firebase Auth integration, owner authorization and owner-scoped auditability.

Local validation after the latest FASE 11/12 implementation:

```text
go test ./...  → PASS
go build ./... → PASS
```

### Remaining phases

**5 phases remain: FASE 13–17.**

| Fase | Focus | Status |
| --- | --- | --- |
| **13** | Frontend product — React + Vite + Tailwind + PWA + Dark Mode | PENDING |
| **14** | Testing hardening — broader coverage, integration and reliability | PENDING |
| **15** | Payroll — specialized later domain | PENDING |
| **16** | Private deployment & operations | PENDING |
| **17** | Production readiness | PENDING |

### Next

**FASE 13 — Frontend product**

The next implementation step is to turn the validated backend into the actual mobile-first product experience while preserving the financial-domain and privacy boundaries already established.

## Documentation

Start with:

1. `CONTEXT.md`
2. `README.md`
3. `STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md`
4. `docs/PHASE-1-PRODUCT-SPEC.md`
5. `docs/13-ROADMAP.md`
6. `docs/PHASE-11-REPORTS-DASHBOARD.md`
7. `docs/PHASE-12-AUTH-PRIVACY-AUDIT.md`

The repository is the source of truth.

---

**Financial-D3v · PALMI-D3V · Personal Finance + Financial Education**
