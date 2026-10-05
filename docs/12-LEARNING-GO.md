# Learning Go Through Financial-D3v

**Status:** CONTINUOUS / SUPPORTING PRACTICE  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

Financial-D3v is the real application. The separate Go learning lab remains the experimentation space.

## Learning loop

**Learn → experiment → design → implement → test → validate → document → review**

## Current Go role

Go 1.27 is part of the active product through the local Financial Engine / WebAssembly boundary.

The engine demonstrates:
- domain modeling;
- deterministic financial calculations;
- testing;
- build tooling;
- WebAssembly;
- browser integration.

## Privacy constraint

Go must not become a reason to reintroduce remote financial-data persistence.

The active boundary is:

`text
Encrypted Vault
    ↓
in-memory data
    ↓
Go/WASM
    ↓
calculation result
    ↓
React
`

Experimental code must not define production architecture automatically.
