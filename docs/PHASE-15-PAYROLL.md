# FASE 15 — Payroll

**APPROVED / BUILT**

Payroll is implemented as a later specialized domain inside Financial-D3v. It does not redefine the product as a payroll-first application.

## MVP

- Private owner-scoped payroll employees.
- Base salary and currency.
- Active/inactive employee state.
- Payroll periods.
- Gross pay.
- Deductions.
- Net pay = gross pay − deductions.
- Employee payroll history.

## API

- `POST /api/v1/payroll/employees`
- `GET /api/v1/payroll/employees`
- `POST /api/v1/payroll/periods`
- `GET /api/v1/payroll/periods?employeeId=...`

## Boundaries

This implementation is a generic payroll calculation/storage foundation. It does not claim Colombian legal, tax, social-security or employment-law compliance. Regulatory payroll rules require a separately verified future domain phase.

It does not automatically move money or create external payment instructions.

## Persistence

Owner-scoped Firestore collections:

- `users/{ownerId}/payrollEmployees/{employeeId}`
- `users/{ownerId}/payrollPeriods/{periodId}`
