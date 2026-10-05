# Architecture

Financial-D3v is a private application with a Go API and Firebase Firestore persistence.

Target flow:

React + Vite + Tailwind
  ↓
Go REST API
  ↓
Application Services
  ↓
Domain
  ↙      ↘
Repositories  Domain Services
  ↓
Firebase Firestore

Supporting concerns:
- Firebase Authentication, introduced later.
- Configuration.
- Logging.
- Validation.
- Audit.
- Observability.

## Responsibilities

### Frontend
Owns presentation, navigation, form interaction, responsive behavior, educational explanations and visualization. It does not own authoritative financial rules.

### Go API
Owns use-case orchestration, validation, authorization, financial operations, domain coordination, repository access and API contracts.

### Domain
Owns financial invariants, money behavior, account/transaction semantics, budget rules, savings rules, debt calculations, net-worth calculations and payroll rules.

### Repository layer
Owns Firestore reads/writes, document mapping, query implementation and persistence-specific concerns.

### Firestore
Stores private application data in collections/documents designed around domain and query access patterns.

## Private-runtime principle

The application is not required to run continuously. When the owner starts the application, the Go API and frontend become available and can access the private Firebase project using configured credentials. Stopping the local application stops the local runtime.

## Architecture rules

- Handlers coordinate; they do not own business rules.
- Domain owns financial invariants.
- Repositories own persistence.
- UI consumes API contracts.
- Financial calculations must be deterministic.
- Educational explanations should be generated from explicit domain facts and documented rules.
- No secret Firebase credentials in source control.
