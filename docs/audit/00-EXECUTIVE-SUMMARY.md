# Phase 0 — Resumen ejecutivo

**Proyecto:** Financial-D3v / Financial Debt  
**Checkout auditado:** local `main`, árbol limpio al inicio de la auditoría  
**Fecha de auditoría:** 2026-11-14 (America/Bogota)  
**Alcance:** lectura de archivos, Git local y fuentes legales oficiales. No se modificó código, configuración ni datos. No se ejecutaron pruebas en esta auditoría.

## Qué es Financial-D3v hoy

La aplicación activa es una PWA React/Vite que abre un archivo local `.fdv`, descifra el estado financiero en memoria y guarda mediante cifrado/exportación. Incluye dashboard, cuentas, transacciones, importación bancaria, presupuestos, metas, deudas, patrimonio y educación. Go/WASM está empaquetado localmente como motor de análisis, aunque el dashboard actualmente conserva cálculos JavaScript como autoridad para parte de sus cifras.

Coexiste una API Go con autenticación Firebase, persistencia Firestore y un Payroll genérico. La arquitectura y documentación actuales clasifican ese backend como histórico/retirado de la ruta de finanzas personales local. El frontend activo no conecta con el API y no presenta Payroll.

## Dictamen

La base es **adaptable, pero requiere aprobaciones y fundamentos antes de implementar Payroll**. La arquitectura local-first protege la privacidad y ofrece una frontera adecuada para documentos y cálculos locales. La integración segura necesita extender el esquema versionado de la bóveda, crear un dominio Payroll separado y definir el contrato de cálculo Go/WASM. El Payroll Firestore existente no debe reutilizarse para datos personales mientras se mantenga la política local-first.

La interfaz cumple una base funcional, pero no ofrece aún experiencia de producto cohesiva: la aplicación está concentrada en un archivo grande, la navegación no usa rutas, el dashboard no destaca disponibilidad ni pagos próximos, y varios textos auxiliares son pequeños. El rediseño visual merece aprobación como trabajo de producto.

## Hallazgos prioritarios

| ID | Hallazgo | Prioridad | Evidencia |
|---|---|---:|---|
| F-01 | PWA local-first y Firestore/API legado coexisten en el mismo repositorio; el límite está documentado, pero exige disciplina para evitar reactivación accidental. | P0 | `docs/03-ARCHITECTURE.md`; `frontend/src/main.jsx`; `internal/app/server.go` |
| F-02 | Existe un Payroll CRUD mínimo, no un motor laboral colombiano, y guarda en Firestore. | P0 | `docs/PHASE-15-PAYROLL.md`; `internal/domain/payroll.go`; `internal/persistence/firestore/payroll.go` |
| F-03 | Auto-lock se pospone mientras haya cambios sin guardar, potencialmente sin límite. | P0 | `frontend/src/vault/VaultContext.jsx` |
| F-04 | Actualización PWA automática puede interrumpir estado en memoria no guardado; no se halló coordinación con `dirty`. | P1 | `frontend/vite.config.js`; `frontend/src/vault/VaultContext.jsx` |
| F-05 | El dashboard usa reglas JS mientras carga WASM para disponibilidad/paridad, por discrepancias de modelo. | P1 | `frontend/src/App.jsx`; `frontend/src/vault/goEngine.js` |
| F-06 | Las reglas y liquidaciones Payroll no están versionadas ni son reproducibles. | P0 | `internal/domain/payroll.go`; `docs/PHASE-15-PAYROLL.md` |
| F-07 | UX y arquitectura visual necesitan una revisión mayor aprobada, no solo agregar una página Payroll. | P1 | `frontend/src/App.jsx`; `frontend/src/index.css`; `frontend/src/styles/design-system.css` |

## Límites de esta auditoría

No se inició la app para inspección visual de runtime ni se ejecutaron pruebas. El estado de CI en `QUALITY-CHECKPOINT-2026-11-12.md` es histórico y no prueba este checkout. La investigación legal es de fuentes primarias/oficiales y sirve como orientación de diseño; no sustituye una revisión laboral y contable especializada.

## Siguiente paso

Que el propietario revise y apruebe decisiones de arquitectura, privacidad, dinero/precisión, esquema de bóveda y dirección visual antes de implementación. El primer hito después de autorización puede ser un perfil laboral confirmado y calendario de pagos esperados, sin liquidar recargos ni registrar dinero no recibido.

Ver también: [compatibilidad](03-ARCHITECTURE-COMPATIBILITY.md), [registro de decisiones](16-DECISION-REGISTER.md) y [roadmap](14-IMPLEMENTATION-ROADMAP.md).
