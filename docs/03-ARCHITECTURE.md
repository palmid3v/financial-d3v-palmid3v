# Architecture

Target:

Web / Mobile UI
↓
Go HTTP API
↓
Application Services
↓
Domain
↙ ↘
Repositories  Domain Services
↓
PostgreSQL

## Rules

- Handlers coordinate; they do not own business rules.
- Domain owns financial invariants.
- Repositories own persistence.
- UI consumes API contracts.
- Financial calculations must be deterministic.
