# FASE 30 — Design System, Motion, $0 Deployment & PWA

**Status:** APPROVED / BUILT / VALIDATED  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Visual direction

- dark-first;
- minimal, flat surfaces;
- subtle borders;
- strong numeric hierarchy;
- semantic financial colors;
- desktop sidebar;
- mobile bottom navigation;
- compact cards and progress bars;
- charts as financial explanations.

## Motion

Motion explains state changes rather than decorating the interface.

Implemented:
- card/metric entrance;
- progress and chart reveal;
- short button/surface transitions;
- dirty-state feedback;
- reduced-motion support.

## Design tokens

Shared tokens live in `frontend/src/styles/design-system.css⟧ and cover surfaces, borders, semantic colors, spacing, radii and motion.

## PWA

Implemented:
- Spanish-Colombia locale;
- standalone display;
- portrait-first orientation;
- scalable install icon metadata;
- Apple touch metadata;
- theme/background colors;
- generated Vite PWA manifest;
- automatic service-worker update;
- stale-cache cleanup;
- WASM precache size allowance.

## Validation

Observed:
- frontend production build: PASS;
- PWA generation: PASS;
- WASM build: PASS;
- runtime UI/PWA behavior reviewed.

**Exit:** APPROVED / BUILT / VALIDATED.
