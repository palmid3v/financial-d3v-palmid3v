# Deployment

Financial-D3v is intentionally designed as a private application that the owner runs when needed.

## Initial operating model

- Run the Go API locally.
- Run the React/Vite frontend locally.
- Connect to the private Firebase project.
- Use Firebase Firestore for persistence.
- Introduce Firebase Authentication later.
- Do not expose the application publicly unless that becomes an explicit future decision.

## Components

- Go API;
- React/Vite frontend;
- Tailwind CSS;
- Vite PWA;
- Firebase Firestore;
- Firebase Authentication later;
- GitHub Actions for CI.

## Environment

Firebase configuration and credentials must be supplied through local environment/configuration mechanisms.

Secrets must never be committed.

## Backups

Before production-like use, document:
- Firestore backup/export strategy;
- recovery procedure;
- data verification;
- credential rotation;
- account recovery.

Deployment is not production-ready until recovery is tested.
