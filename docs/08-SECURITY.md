# Security — New Baseline

**Status: FASE 12 PENDING**

Financial-D3v is private by design.

Security must eventually cover:
- Firebase Authentication;
- server-side authorization;
- ownership boundaries;
- Firestore security rules;
- secret management;
- audit events;
- safe logging;
- backup and recovery.

The frontend is never a security boundary.

No credentials or private Firebase service-account material may be committed.
