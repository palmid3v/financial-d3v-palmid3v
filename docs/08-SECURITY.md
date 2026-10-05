# Security

Financial-D3v is a private application. Security focuses on protecting the owner's financial information and preventing unauthorized access or mutation.

## Requirements

- Authenticate protected resources.
- Authorize every protected mutation.
- Enforce user ownership boundaries.
- Use Firebase Authentication when authentication is introduced.
- Keep Firestore access private.
- Validate all inputs.
- Never commit Firebase service-account credentials or secrets.
- Audit sensitive mutations.
- Avoid exposing financial data in logs.
- Document backup and recovery procedures.
- Keep educational content separate from authoritative financial records.

## Firebase security model

Security will use multiple layers:

User
  ↓
Firebase Authentication
  ↓
Go API authorization
  ↓
Domain ownership checks
  ↓
Firestore

Firestore security rules provide an additional database-level boundary.

The frontend is never a security boundary.

## Privacy

The application should minimize data collection.

Only data required for the personal financial workflow should be stored.

No public sharing is part of the initial product scope.
