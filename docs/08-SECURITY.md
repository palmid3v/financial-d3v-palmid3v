# Security — Financial-D3v

**Status: FASE 26 APPROVED / FASE 27–28 BUILT / VALIDATION PENDING**

Financial-D3v is private by design.

## Security boundary
Firebase Authentication → Firebase ID token → Go API verification → Firebase UID ownership → application services → Firestore.

The frontend is never the authorization boundary.

## Production security
- Dedicated Cloud Run API runtime identity.
- GitHub OIDC/WIF for CI/CD.
- No service-account JSON in source control.
- No long-lived CI Firebase credential.
- Explicit HTTPS CORS allowlist.
- Firebase Hosting over HTTPS.
- Protected API requests without authentication return `401`.

## Backup security
Backup storage is outside source control. Recovery starts in an isolated project. Backup permissions are separated from the API runtime identity.

## Credential handling
Do not commit private keys, passwords, refresh tokens, user credentials or CI credential files.
