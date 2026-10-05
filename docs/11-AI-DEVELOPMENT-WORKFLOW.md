# AI Development Workflow — Financial-D3v

**Status:** ACTIVE  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

AI is an engineering accelerator, not the authority.

## Workflow

**Palmi → Nexsy → GitHub → Palmi pulls → Palmi runs validation → Palmi reports exact output → Nexsy fixes**

## Rules

1. Define the phase and acceptance criteria.
2. Inspect the current GitHub `main` state.
3. Design the change.
4. Implement the change.
5. Commit implementation to GitHub.
6. Palmi pulls the current `main`.
7. Palmi runs **Validación del Proyecto**.
8. Palmi reports exact output.
9. Runtime/security/functional validation is performed when required.
10. Documentation is updated with observed evidence.
11. The phase is marked APPROVED / BUILT / VALIDATED only after explicit approval.

## Human authority

Financial calculations, financial education claims, privacy boundaries, security decisions and architecture decisions require human review.

Never claim:
- a test passed without observing it;
- CI passed without observing it;
- production deployed without observing it;
- security is formally audited without an external audit.

## Documentation

The repository is the source of truth. `CONTEXT.md`, the Step-by-Step document and the roadmap must reflect the current architecture after completed phases.
