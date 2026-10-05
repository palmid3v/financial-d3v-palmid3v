# Architecture — New Product Baseline

**Status: FASE 3 PENDING**

## Approved direction

React + Vite + Tailwind + PWA
↓
Go REST/HTTP API
↓
Application layer
↓
Financial domain
↓
Repository layer
↓
Firebase Firestore

## Reset rule

The previous architecture was created before the personal-finance-first and educational vision was fully defined. It is not treated as a completed architecture baseline.

The new architecture must be derived from product jobs, user flows, financial invariants, privacy requirements, persistence needs and educational requirements.

No abstraction should exist only for architectural appearance.

## Runtime

The owner starts the application when needed. The local runtime can contain the Go API and React/Vite application while Firestore provides persistence.

The exact package boundaries are defined after FASE 2 and FASE 3.
