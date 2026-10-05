# Security — New Baseline

**Status: FASE 26 IMPLEMENTED / VALIDATION PENDING**

Financial-D3v is private by design.

The current security baseline covers:
- Firebase Authentication;
- server-side authorization;
- ownership boundaries;
- explicit production CORS allowlisting;
- API security headers;
- audit events;
- safe logging;
- secret management boundaries.

Backup and recovery remain part of FASE 28.

The frontend is never a security boundary.

No credentials or private Firebase service-account material may be committed.
