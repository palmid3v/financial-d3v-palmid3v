# Database Design

PostgreSQL is the persistence target.

Migration 001 creates the foundation for identity, accounts, transactions, planning, obligations, wealth, payroll and audit.

## Ownership

User-owned records carry an owner reference directly or through an owned parent entity.

## Monetary persistence

Financial amounts use BIGINT minor units with a three-character currency code.

## Integrity

Foreign keys, checks, uniqueness constraints and indexes enforce basic domain invariants at the database boundary.

## Migration policy

Every schema change receives a forward migration. Destructive changes require an explicit migration strategy and documented recovery considerations.
