# Financial-D3v Design System Reference

**Status:** REDESIGN IN PROGRESS — Obsidian Emerald  
**Last updated:** 2026-10-18  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Visual language

Financial-D3v adopts a premium Obsidian-dark interface with emerald accents, aligned with the PalmiD3v product family while retaining its own finance-first identity.

- deep charcoal/green-black application background;
- layered dark surfaces with subtle green-tinted borders;
- emerald = primary action, income, savings and selected navigation;
- rose = expenses and debt;
- sky blue = informational/secondary data;
- amber = warnings;
- violet = secondary/payroll category;
- high-contrast numeric hierarchy with tabular financial values;
- desktop sidebar and compact mobile bottom navigation;
- restrained glow, gradients and shadows; no decorative noise;
- responsive cards, charts, forms and long monetary values.

## Accessibility and interaction

- visible keyboard focus using the emerald accent;
- color is not the only indicator of financial meaning;
- semantic controls and legible muted text;
- reduced-motion support remains enabled;
- mobile layouts must avoid horizontal overflow and preserve readable amounts;
- save/dirty state and vault lock affordances remain visible.

## Financial integrity boundary

This redesign is presentation-only. It must not change:
- minor-unit money representation or currency handling;
- transfer classification;
- authoritative transaction-derived budget actuals;
- savings contributions as goal-progress records;
- debt payment allocation or principal-only debt reduction;
- net worth = assets minus all liabilities;
- encrypted vault behavior, save/lock flows, or Go/WASM calculation authority.

The interface explains financial state but never becomes the source of truth for financial rules.

## Tokens

`frontend/src/styles/design-system.css` centralizes surfaces, borders, semantic colors, spacing, radii and motion. `frontend/src/index.css` maps application components to the same palette and handles responsive presentation.

## PWA

Existing PWA behavior is preserved: generated manifest, standalone display, Spanish-Colombia locale, portrait-first orientation, install icon metadata, automatic service-worker update and stale-cache cleanup.

**Validation note:** visual changes must pass the existing frontend build and test/validation workflows before being marked complete.
