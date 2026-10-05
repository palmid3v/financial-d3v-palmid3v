# Architecture — Financial-D3v

## Product architecture

Financial-D3v is a private personal-finance application and financial learning workspace.

React + Vite + Tailwind + PWA
↓
Go REST/HTTP API
↓
Application Services
↓
Financial Domain
↓
Repository Contracts
↓
Firestore Adapter
↓
Firebase Firestore

## FASE 2 domain boundary

The domain owns financial meaning and invariants.

Core concepts:
- Money
- Account
- Transaction
- Category
- Budget
- SavingsGoal
- FinancialPeriod
- EducationContext

The domain does not depend on Firestore, HTTP, React or UI concerns.

## FASE 3 persistence boundary

Persistence owns:
- repository contracts;
- Firestore document DTOs;
- serialization mapping;
- ownership-scoped paths;
- query/index design.

Firestore SDK wiring is intentionally deferred to FASE 4.

## Ownership

All financial records are scoped to an owner identifier.

## Ledger principle

Transactions are authoritative. Account balances and dashboard values are derived from opening balances plus authoritative transactions.

## Transfer principle

A transfer is represented as linked transaction entries: one outgoing entry and one incoming entry sharing a transfer identifier.

## Dependency rule

presentation → application → domain
persistence → domain

The domain must not depend on outer layers.

## FASE 4 boundary

HTTP handlers, configuration, Firebase initialization, logging and concrete repository wiring belong to FASE 4.
