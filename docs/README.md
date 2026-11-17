# Financial-D3V Documentation Index

**Reviewed:** 2026-11-17  
**Timezone:** America/Bogota  
**Source of truth:** GitHub `main`

## Current product architecture

<<<<<<< HEAD
The local checkout has subsequent Payroll foundation work in progress. Its verified scope and current release gates are recorded in [`audit/18-EXECUTION-STATUS.md`](audit/18-EXECUTION-STATUS.md); that report takes precedence over the older phase status below for this checkout.

FASES 1–31 are complete through the first-release local-first foundation.
=======
Financial-D3V is a local-first personal finance application. Its active data path is a user-controlled FDV1 encrypted `.fdv` vault, with decrypted state held in memory while unlocked and local Go/WebAssembly financial calculations. Historical Go REST, Firestore and cloud-persistence designs are retained for traceability; they are not the active financial vault path.
>>>>>>> c5fe74c285d151c9ba2ba2d607363679edacab76

## Current product status

Phases 1–31 are documented as the local-first foundation. Phase 32 bank-statement import and historical financial intelligence are under development/validation; verify the selected branch before treating any specific parser or workflow as released. ADR-034 records an accepted future Business Finance design, but its integration is not implemented.

The quality checkpoint dated 2026-11-12 records successful maintenance-PR CI on 2026-11-13: 32/32 frontend tests and Go test/build passed. Manual HTTPS save → lock → reopen, account/ledger reconciliation and independent security review remained open. These are historical results, not a new test run on 2026-11-17.

## Canonical documents

| Document | Purpose |
|---|---|
| `../README.md` | Public product overview |
| `../CONTEXT.md` | Current architecture, privacy boundary and continuation context |
| `../QUALITY-CHECKPOINT-2026-11-12.md` | Dated CI findings and remaining gates |
| `../STEP-BY-STEP-FINANCIAL-D3V-2026-10-05.md` | Historical step-by-step project record |
| `01-PRODUCT-VISION.md` | Product direction |
| `02-REQUIREMENTS.md` | Product requirements |
| `03-ARCHITECTURE.md` | Architecture history and current design |
| `04-DOMAIN-MODEL.md` | Domain model |
| `05-DATABASE-DESIGN.md` | Persistence history and vault boundary |
| `06-API-DESIGN.md` | Legacy API design |
| `07-FINANCIAL-RULES.md` | Financial invariants |
| `08-SECURITY.md` | Active vault security model |
| `09-TESTING.md` | Test strategy |
| `10-DEPLOYMENT.md` | Deployment history/current hosting |
| `11-AI-DEVELOPMENT-WORKFLOW.md` | AI-assisted workflow |
| `12-LEARNING-GO.md` | Go learning notes |
| `13-ROADMAP.md` | Product phases and planned work |
| `14-UI-UX-DESIGN.md` | UX direction |
| `15-FINANCIAL-EDUCATION.md` | Financial education content |
| `16-PRIVATE-PERSONAL-USE.md` | Private-use scope |
| `34-PALMI-ECOSYSTEM-BUSINESS-FINANCE-ADR.md` | Accepted but unimplemented Business Finance architecture |
| `contracts/palmi-business-financial-event.schema.json` | Minimized commercial event schema |
| `OPERATIONS-RUNBOOK.md` | Operations and recovery |
| `VALIDATION-RUNNER.md` | Validation workflow |
| `DESIGN-SYSTEM-REFERENCE.md` | Design system reference |

## Documentation rules

- Treat the encrypted `.fdv` file as the financial persistence source of truth.
- Never document plaintext financial data as being synchronized to cloud services.
- Keep Personal and future Business vaults fully separate, with independent keys and lifecycle.
- Preserve historical checkpoints as dated evidence. Append a new checkpoint for new validation; do not rewrite old test results to appear current.
- Distinguish built, tested, CI-passed, manually verified and production-approved states.

---
**Financial-D3V · PALMI-D3V**
