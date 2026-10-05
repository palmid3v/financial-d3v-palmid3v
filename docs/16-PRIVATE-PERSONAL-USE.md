# Private and Personal Use

## Product status

Financial-D3v is a private personal application.

It is not initially intended to be:
- a public SaaS;
- a multi-customer financial platform;
- a financial institution;
- an automatic payment system;
- a public financial-advice service.

## Runtime model

The owner starts the application when they want to use it.

Typical local flow:
Start Firebase configuration → start Go API → start React/Vite → use private application → stop local processes.

The private Firebase project remains the persistent storage service.

## Data ownership

Financial data belongs to the personal workflow represented by the application.

The design should minimize unnecessary personal data.

## Access

Access should eventually use:
- Firebase Authentication;
- server-side authorization;
- Firestore security rules;
- explicit ownership checks.

## No automatic financial actions

Financial-D3v should initially be a system for recording, organizing, understanding, planning and learning.

It should not automatically move money, execute payments or perform external financial transactions.

## Privacy-first development

Every feature should ask:
1. Does it need personal financial data?
2. Does it store more data than necessary?
3. Who can read it?
4. Who can modify it?
5. Can the operation be audited?
6. Can the data be recovered?
7. Can the user understand what the system is doing?

Privacy is part of the product design, not an afterthought.
