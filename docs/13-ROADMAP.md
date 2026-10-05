# Roadmap — Financial-D3v

**Baseline:** October 5, 2026  
**Product identity:** Private personal-finance application + financial learning workspace.

This roadmap is the authoritative execution checklist. A phase is only **BUILT** after implementation, validation and documentation are complete. Future phases are planned work and are not considered implemented merely because backend contracts already exist.

---

## Product lifecycle

- [x] **PLATFORM — FASES 1–17**
- [ ] **PRODUCT — FASES 18–24**
- [ ] **PRIVATE PRODUCTION — FASE 25+**

Core product loop:

**Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust**

---

# PLATFORM — FASES 1–17

## FASE 1 — Product definition
- [x] Private personal-finance product definition
- [x] Financial-learning model
- [x] Savings-first outcome
- [x] Privacy and product boundaries
- [x] Approved technology stack

**Status: APPROVED / BUILT**

## FASE 2 — Financial Domain Model v2
- [x] Money
- [x] Account
- [x] Transaction
- [x] Category
- [x] Budget
- [x] Savings Goal
- [x] Financial Period
- [x] Domain invariants and tests

**Status: APPROVED / BUILT**

## FASE 3 — Firestore persistence design
- [x] Owner-scoped collections
- [x] Repository contracts
- [x] Persistence DTOs
- [x] Serialization/mapping boundaries
- [x] Query patterns
- [x] Composite indexes

**Status: APPROVED / BUILT**

## FASE 4 — Go application foundation
- [x] Configuration
- [x] Firebase/Firestore initialization
- [x] Repository wiring
- [x] HTTP foundation
- [x] Health/readiness
- [x] Errors, request IDs and logging
- [x] Application-service boundaries

**Status: APPROVED / BUILT**

## FASE 5 — Accounts and transactions
- [x] Account workflow
- [x] Transaction workflow
- [x] Balance calculation
- [x] Owner scoping
- [x] Currency validation

**Status: APPROVED / BUILT**

## FASE 6 — Budgeting
- [x] Expense categories
- [x] Budget periods
- [x] Category limits
- [x] Actuals from authoritative transaction ledger
- [x] Remaining budget
- [x] Utilization
- [x] Overspending detection
- [x] Planned vs actual

**Status: APPROVED / BUILT**

## FASE 7 — Savings and financial habits
- [x] Savings goals
- [x] Contributions
- [x] Goal progress
- [x] Remaining target
- [x] Completion percentage
- [x] Required pace
- [x] Contribution history signals

**Status: APPROVED / BUILT**

## FASE 8 — Financial education
- [x] FACT
- [x] CALCULATION
- [x] INTERPRETATION
- [x] ACTION
- [x] Contextual insights
- [x] Initial education topics

**Status: APPROVED / BUILT**

## FASE 9 — Debts
- [x] Debt obligations
- [x] Balances
- [x] Principal/interest/fees
- [x] Payment history
- [x] Debt status
- [x] Debt context

**Status: APPROVED / BUILT**

## FASE 10 — Assets, liabilities and net worth
- [x] Assets
- [x] Generic liabilities
- [x] Debt liabilities
- [x] Account-position integration
- [x] Net-worth calculation
- [x] Currency validation
- [x] Double-counting boundaries

**Status: APPROVED / BUILT**

## FASE 11 — Reports and financial dashboard
- [x] Period reports
- [x] Income
- [x] Expenses
- [x] Net cash flow
- [x] Spending by category
- [x] Budget/savings/debt context
- [x] Net-worth context
- [x] Dashboard data

**Status: APPROVED / BUILT**

## FASE 12 — Authentication, privacy and audit
- [x] Firebase ID-token verification
- [x] Owner authorization
- [x] Owner-scoped audit
- [x] Request IDs
- [x] Authentication-token exclusion from audit
- [x] Request-body exclusion from audit
- [x] Local owner fallback only when auth is disabled

**Status: APPROVED / BUILT**

## FASE 13 — Frontend product
- [x] React + Vite
- [x] Tailwind
- [x] PWA
- [x] Dark Mode
- [x] Mobile-first shell
- [x] Dashboard API integration

**Status: APPROVED / BUILT**

## FASE 14 — Testing hardening
- [x] Financial/domain test coverage
- [x] Payroll/domain tests
- [x] Frontend production build validation
- [x] CI build path

**Status: APPROVED / BUILT**

## FASE 15 — Payroll
- [x] Payroll employees
- [x] Payroll periods
- [x] Gross/deductions/net calculation
- [x] Owner scoping
- [x] Specialized-domain boundary

**Status: APPROVED / BUILT**

## FASE 16 — Private deployment and operations
- [x] Production configuration gates
- [x] CORS allowlist
- [x] Container artifacts
- [x] Nginx frontend runtime
- [x] CI reproducibility
- [x] Health/readiness semantics
- [x] Secrets boundaries
- [x] Backup/recovery documentation

**Status: APPROVED / BUILT**

## FASE 17 — Production readiness & product UX
- [x] Product-wide visual direction
- [x] Responsive desktop/mobile navigation
- [x] Dashboard information hierarchy
- [x] Financial metric context
- [x] Education surface
- [x] Loading/error/retry states
- [x] Private-workspace messaging
- [x] Frontend production build
- [x] Backend tests/build
- [x] Runtime health/readiness validation
- [x] Documentation refresh

**Status: APPROVED / BUILT**

---

# PRODUCT — FASES 18–24

These phases turn the validated platform into the day-to-day personal-finance product. Existing backend capabilities are reused; frontend modules become fully functional one by one.

## FASE 18 — Transactions UX
- [ ] Transactions screen
- [ ] Fast transaction entry
- [ ] Income/expense/transfer flows
- [ ] Account selection
- [ ] Category selection
- [ ] Date and description
- [ ] Transaction list
- [ ] Search/filter
- [ ] Loading/empty/error states
- [ ] Mobile-first interaction
- [ ] API integration
- [ ] Tests/build validation
- [ ] Documentation update

**Status: IMPLEMENTED / VALIDATION PENDING**

## FASE 19 — Accounts UX
- [ ] Accounts screen
- [ ] Account list
- [ ] Account creation/edit flow
- [ ] Account type and currency
- [ ] Balance presentation
- [ ] Account detail
- [ ] Transaction relationship
- [ ] Empty/loading/error states
- [ ] Mobile-first interaction
- [ ] API integration
- [ ] Tests/build validation
- [ ] Documentation update

**Status: IMPLEMENTED / VALIDATION PENDING**

## FASE 20 — Budget UX
- [ ] Budget overview
- [ ] Budget period selection
- [ ] Category budget entry
- [ ] Planned vs actual visualization
- [ ] Utilization
- [ ] Remaining amount
- [ ] Overspending state
- [ ] Education context
- [ ] Empty/loading/error states
- [ ] API integration
- [ ] Tests/build validation
- [ ] Documentation update

**Status: IMPLEMENTED / VALIDATION PENDING**

## FASE 21 — Savings UX
- [ ] Savings goals screen
- [ ] Goal creation
- [ ] Goal detail
- [ ] Contribution entry
- [ ] Progress visualization
- [ ] Remaining amount
- [ ] Target-date context
- [ ] Required-pace context
- [ ] Contribution history
- [ ] Education context
- [ ] API integration
- [ ] Tests/build validation
- [ ] Documentation update

**Status: IMPLEMENTED / VALIDATION PENDING**

## FASE 22 — Debt UX
- [ ] Debt overview
- [ ] Debt creation
- [ ] Debt detail
- [ ] Balance visualization
- [ ] Payment entry
- [ ] Principal/interest/fees breakdown
- [ ] Payment history
- [ ] Active/paid status
- [ ] Education context
- [ ] API integration
- [ ] Tests/build validation
- [ ] Documentation update

**Status: IMPLEMENTED / VALIDATION PENDING**

## FASE 23 — Net Worth UX
- [ ] Net-worth overview
- [ ] Assets presentation
- [ ] Liabilities presentation
- [ ] Debt integration
- [ ] Account-position presentation
- [ ] Net-worth explanation
- [ ] Currency context
- [ ] Historical snapshots/series design
- [ ] API integration
- [ ] Tests/build validation
- [ ] Documentation update

**Status: PLANNED**

## FASE 24 — Education UX
- [ ] Contextual education throughout financial modules
- [ ] FACT presentation
- [ ] CALCULATION presentation
- [ ] INTERPRETATION presentation
- [ ] ACTION presentation
- [ ] Dashboard learning surfaces
- [ ] Budget learning surfaces
- [ ] Savings learning surfaces
- [ ] Debt learning surfaces
- [ ] Explainability for important metrics
- [ ] Clear separation between facts and interpretation
- [ ] Tests/build validation
- [ ] Documentation update

**Status: PLANNED**

---

# PRIVATE PRODUCTION — FASE 25+

FASE 25+ is intentionally a continuing production track rather than one artificially bounded final phase.

## FASE 25 — Private production deployment
- [ ] Production Firebase project
- [ ] Production Firestore
- [ ] Firebase Auth configuration
- [ ] Production secrets
- [ ] Production CORS origins
- [ ] HTTPS/domain
- [ ] API deployment
- [ ] Frontend deployment
- [ ] PWA installation validation
- [ ] Production smoke test
- [ ] Rollback procedure

**Status: PLANNED**

## FASE 26 — Data protection and recovery
- [ ] Automated backup strategy
- [ ] Restore procedure
- [ ] Data export
- [ ] Recovery validation
- [ ] Retention policy
- [ ] Secret rotation procedure
- [ ] Disaster-recovery checklist

**Status: PLANNED**

## FASE 27 — Observability and reliability
- [ ] Structured production logs
- [ ] Error monitoring
- [ ] API latency visibility
- [ ] Health monitoring
- [ ] Alerting
- [ ] Failure-path review
- [ ] Production incident runbook
- [ ] Reliability tests

**Status: PLANNED**

## FASE 28 — Financial data quality
- [ ] Duplicate-entry protections
- [ ] Stronger transaction consistency
- [ ] Balance reconciliation
- [ ] Currency consistency review
- [ ] Net-worth reconciliation
- [ ] Data-integrity diagnostics
- [ ] Import/export validation

**Status: PLANNED**

## FASE 29 — Historical financial intelligence
- [ ] Historical dashboard
- [ ] Net-worth history
- [ ] Spending trends
- [ ] Budget trends
- [ ] Savings trends
- [ ] Debt trends
- [ ] Period comparisons
- [ ] Explainable trend insights

**Status: PLANNED**

## FASE 30+ — Continuous product evolution
Potential future tracks:
- [ ] Better data import workflows
- [ ] Additional financial education
- [ ] More advanced reporting
- [ ] Personal financial planning tools
- [ ] UX/accessibility refinement
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Architecture improvements
- [ ] New specialized domains only when justified

**Status: CONTINUOUS / PLANNED**

---

# Master execution rule

For every phase:

1. [ ] Define scope
2. [ ] Implement
3. [ ] Test
4. [ ] Build
5. [ ] Validate runtime when applicable
6. [ ] Review UX/security boundaries
7. [ ] Update documentation
8. [ ] Mark the phase **APPROVED / BUILT**
9. [ ] Only then start the next phase

## Current checkpoint

**FASES 1–17: APPROVED / BUILT**

**FASES 18–22: IMPLEMENTED / VALIDATION PENDING**

User approval covers the scope of FASES 20–22. FASES 18–20 are included in the implementation branch as their prerequisite product foundation. Completion still requires local build/runtime validation and explicit phase approval.

**NEXT CHECKPOINT: Validate FASES 20–22, then continue to FASE 23 — Net Worth UX**

The platform is complete enough to stop expanding infrastructure and start completing the actual personal-finance product experience.

---

Financial-D3v · PALMI-D3V · October 5, 2026
