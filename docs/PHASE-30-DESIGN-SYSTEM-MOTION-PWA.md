# Financial-D3v Visual Direction

## Reference

This document records the approved visual direction for the Vault-backed Financial-D3v workspace.

The supplied reference mockups establish:

- dark-first interface;
- minimal, flat surfaces;
- subtle borders instead of heavy shadows;
- strong numeric hierarchy;
- green as income/savings/primary action;
- red as expense/debt;
- blue as informational;
- amber as warning;
- violet as payroll/secondary category;
- desktop sidebar;
- mobile bottom navigation;
- compact cards and progress bars;
- charts as first-class financial explanations.

## Motion principle

Motion must explain a state change, not decorate the interface.

Approved behaviors:

- cards enter with a short, subtle reveal;
- numeric/progress values can animate into their final state;
- chart bars grow from their baseline;
- charts and visual summaries reveal once;
- button/surface transitions remain short;
- dirty state can pulse subtly;
- reduced-motion users receive the same information without continuous animation.

## Design tokens

FASE 30 introduces a shared token layer at `frontend/src/styles/design-system.css`.

The token layer centralizes:

- surfaces and borders;
- semantic financial colors;
- spacing;
- radii;
- motion durations/easing;
- reduced-motion fallbacks.

Existing feature styles continue to use the same semantic values so the visual language remains stable while the implementation becomes easier to extend.

## PWA refinement

FASE 30 standardizes the install/runtime metadata:

- Spanish-Colombia document locale;
- standalone display;
- portrait-first mobile orientation;
- 192px and 512px install icons;
- Apple touch icon;
- theme/background colors;
- generated Vite PWA manifest;
- automatic service-worker update;
- stale-cache cleanup.

## Current implementation

FASE 30 is **BUILT / VALIDATION PENDING**.

Runtime validation still belongs to the phase gate: production Vercel deployment, PWA installation, offline/runtime behavior, responsive review, reduced-motion behavior and final $0 deployment verification.
