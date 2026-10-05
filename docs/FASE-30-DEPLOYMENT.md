# FASE 30 — $0 Deployment + Design System / Motion / PWA

**Status:** BUILT / VALIDATION PENDING  
**Repository:** `palmid3v/financial-d3v-palmid3v`  
**Target:** GitHub → Vercel Hobby → React/Vite PWA → local encrypted Financial Vault

## Scope

FASE 30 turns the Vault-backed application into the intended $0 deployment shape and refines the approved product visual system.

### Deployment

- Vercel Hobby is the target frontend host.
- The repository root now contains `vercel.json`.
- Vercel builds from `frontend/` and publishes `frontend/dist`.
- No Cloud Run, Artifact Registry or Cloud Scheduler dependency is introduced.
- The encrypted Financial Vault remains the financial persistence boundary.
- Financial plaintext is not moved into a hosted database.

### PWA

- Vite PWA generates the manifest and service worker.
- The application uses standalone display mode.
- Install icons are provided at 192px and 512px.
- Apple touch icon metadata is included.
- Automatic service-worker updates are enabled.
- Outdated caches are cleaned up.

### Design system

Reusable tokens live in `frontend/src/styles/design-system.css`.

The token layer covers:

- color semantics;
- surfaces;
- borders;
- spacing;
- radii;
- motion durations/easing;
- reduced-motion fallbacks.

The existing UI components remain the product-facing component layer: metrics, panels, progress bars, notices, forms, navigation and mobile navigation.

### Motion

Motion remains state-oriented:

- reveal on entry;
- progress growth;
- chart bar growth;
- donut reveal;
- short surface/button transitions;
- subtle dirty-state pulse;
- reduced-motion fallback.

No continuous decorative animation is introduced.

## Validation gate

Run locally after pulling `main`:

```powershell
cd D:\PALMI-D3V\projects\financial-d3v-palmid3v\frontend
npm ci
npm test
npm run build
npm run build:wasm
```

Then verify:

1. Vercel can build the repository from the root configuration.
2. The generated PWA manifest contains the expected app metadata/icons.
3. The app installs as a standalone PWA.
4. Vault create/open/lock/auto-lock still works.
5. Financial data remains inside the encrypted vault boundary.
6. Desktop sidebar and mobile bottom navigation remain usable.
7. Reduced-motion mode removes continuous/repeated animation.
8. No Cloud Run / Artifact Registry / Cloud Scheduler dependency is required.

FASE 30 must remain **VALIDATION PENDING** until these runtime checks are observed.
