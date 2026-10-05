# Private and Personal Use

**Status:** ACTIVE PRODUCT SCOPE  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Product status

Financial-D3v is a private personal application.

It is not initially intended to be:
- a public SaaS;
- a multi-customer financial platform;
- a financial institution;
- an automatic payment system;
- a public financial-advice service.

## Current runtime model

The active architecture is local-first:

`text
GitHub → Vercel Hobby → React/Vite PWA
                         ↓
                 encrypted Financial Vault
                         ↓
                 local Go/WASM
`

The encrypted .fdv file is the financial source of truth.

## Data ownership

The user controls:
- the encrypted vault file;
- the vault password;
- recovery backups.

Financial plaintext is decrypted only for the active application session.

## Privacy

The active design intentionally avoids:
- plaintext financial browser persistence;
- remote financial-data persistence;
- automatic upload of the vault;
- automatic financial actions.

## Access and identity

Firebase Auth remains an optional future identity mechanism. It is not the financial-data encryption boundary.

## No automatic financial actions

Financial-D3v is a system for recording, organizing, understanding, planning and learning.

It does not automatically move money, execute payments or perform external financial transactions.

## Privacy-first review

For every feature ask:
1. Does it need personal financial data?
2. Does it store more data than necessary?
3. Who can read it?
4. Who can modify it?
5. Can the operation be audited?
6. Can the data be recovered?
7. Can the user understand what the system is doing?

Privacy is part of the product architecture.
