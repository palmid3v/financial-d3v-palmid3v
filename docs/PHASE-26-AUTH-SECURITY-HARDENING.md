# 🔐 FASE 26 — Authentication / Production Security Hardening

**Status:** IMPLEMENTED / VALIDATION PENDING  
**Last updated:** 2026-10-04  
**Timezone:** America/Bogota (COT, UTC-05:00)

## 🎯 Objective

Close the gap between the existing backend authentication foundation and the private production security boundary.

The product remains private-first. Firebase Authentication establishes identity; the API remains the authorization boundary.

## ✅ Implemented

### Backend

- Firebase ID-token verification remains enforced when `AUTH_REQUIRED=true`.
- Firebase UID becomes the authoritative owner identity.
- `X-Owner-ID` is only accepted when authentication is disabled.
- Production configuration requires Firebase to be enabled.
- Production configuration requires authentication to be required.
- Production configuration requires an explicit CORS allowlist.
- API security response headers are applied globally:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Cache-Control: no-store`
- Existing request IDs, audit boundaries and owner scoping are preserved.
- Security-header regression coverage was added.

### Frontend

- Added an explicit authentication gate.
- Added Firebase Authentication email/password sign-in through the Firebase Auth REST endpoints.
- API requests automatically use the current Firebase ID token when auth mode is enabled.
- Access-token refresh is handled before expiry.
- Authentication session state is kept in `sessionStorage`, avoiding long-lived browser persistence.
- Added sign-out.
- Local development continues to work without Firebase authentication when `VITE_FIREBASE_AUTH_ENABLED=false`.

## 🔒 Security boundary

The frontend is **not** the security boundary.

The authoritative flow is:

```text
Firebase account
      ↓
Firebase ID token
      ↓
Go API verification
      ↓
Firebase UID
      ↓
owner-scoped application services
      ↓
Firestore
```

A client-provided owner ID must never override the authenticated UID.

## ⚙️ Frontend configuration

Use:

```env
VITE_API_BASE_URL=https://<private-api>
VITE_FIREBASE_AUTH_ENABLED=true
VITE_FIREBASE_API_KEY=<firebase-web-api-key>
VITE_FIREBASE_PROJECT_ID=<firebase-project-id>
```

The Firebase Web API key is client configuration, not a service-account secret. Service-account credentials must remain server-side and must never be committed.


## 🔥 Firebase infrastructure under version control

The Firebase project is now pinned to the repository and Firestore configuration is versioned locally:

- `.firebaserc` → `financial-d3v-palmid3v`
- `firebase.json` → Firestore rules and index configuration
- `firebase/firestore.rules` → owner-scoped rules based on Firebase Auth UID
- `firebase/firestore.indexes.json` → composite indexes required by the current Firestore repository queries

The application data model is:

`/users/{firebaseUid}/{collection}/{documentId}`

The Go API uses Firebase Admin credentials and therefore bypasses Firestore Security Rules; the rules remain the direct-client protection boundary. Firebase documents that server client libraries bypass Firestore Security Rules and rely on server credentials/IAM instead. The repository keeps the rules and indexes versioned so the Firebase environment is reproducible rather than console-only.

## 🧪 Local Firebase validation checkpoint

The first local runtime reached Firestore successfully after enabling Firebase and creating the database. Firestore then reported a missing composite index for the transaction period query. That index, plus the other composite indexes required by the current repository queries, is now versioned in `firebase/firestore.indexes.json`.

The next local validation should deploy the versioned Firestore rules/indexes and then repeat the authenticated frontend runtime check.

## 🧪 Validation required

Before marking this phase **APPROVED / BUILT**:

1. `go test ./...`
2. `go build ./...`
3. `cd frontend && npm ci`
4. `npm run build`
5. Local mode still works with authentication disabled.
6. Production configuration rejects:
   - Firebase disabled;
   - authentication disabled;
   - missing production CORS origins.
7. Authenticated frontend receives API access using a Firebase ID token.
8. Unauthenticated protected API requests return `401`.
9. A different `X-Owner-ID` cannot override the authenticated Firebase UID.
10. Sign-out removes the browser authentication session.
11. No credentials, tokens or private service-account material are committed.
12. Firebase Rules and indexes are deployed from the repository configuration.

## ⏭️ Next phase

After local validation and explicit approval:

**FASE 27 — Private Production Deployment 🚀**
