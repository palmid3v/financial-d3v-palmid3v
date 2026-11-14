# Roadmap de implementación propuesto

Este es un orden para aprobación; **no autoriza ejecución**.

| Etapa | Trabajo | Dependencias | Gate de salida |
|---|---|---|---|
| 0 — Descubrimiento | Inventario, límites, discrepancias docs/código (este paquete). | Ninguna | Propietario acepta hechos y riesgos. |
| 1 — Arquitectura/UX | Aprobar modelo, privacidad, unidad COP, navegación y tema. | Etapa 0 | Decisiones DEC-001..008 resueltas o aplazadas explícitamente. |
| 2 — Fundamentos Payroll | Contratos de dominio/DTO/migración Vault, validación y persistencia local. | Etapa 1 | Bóvedas anteriores abren/guardan sin pérdida en pruebas sintéticas. |
| 3 — Inteligencia contractual | Extracción local, campo/source/confidence, revisión manual. | Etapa 2 | Sin activación con valores requeridos no confirmados; documentos temporales eliminados. |
| 4 — Reglas Colombia | Catálogo versionado, vigencia y fuentes; golden cases revisados profesionalmente. | Etapa 1; puede iniciar análisis en paralelo a etapa 2 | Regla verificable por fecha/condición y aprobación legal. |
| 5 — Jornadas variables | Turnos reales/programados, pausas, descanso, novedades, timezone. | Etapa 2 y modelo de reglas | Clasificación determinista y trazabilidad de turnos. |
| 6 — Cálculos | Motor Go puro + WASM, conceptos y redondeo. | Etapas 3–5 | Golden vectors, reproducibilidad, no doble conteo y exactitud monetaria. |
| 7 — Integración financiera | Recepción → asiento de ingreso idempotente; cashflow/budget/reportes. | Etapa 6 | Nada previsto se registra como recibido; cero duplicados. |
| 8 — Rediseño visual | Sistema aprobado y actualización incremental de módulos. | Aprobación de identidad; puede construir prototipo separado tras etapa 1 | Desktop/móvil, accesibilidad, sin regresión funcional. |
| 9 — Calidad | Seguridad, regresión, accesibilidad, runtime PWA, recovery. | Etapas 2–8 | Gates técnicos/financieros/legales aprobados. |
| 10 — Release readiness | Guía de build/operación y checklist manual. | Etapa 9 | Evidencia local reproducible; despliegue queda al propietario. |

## Paralelismo posible

Investigación legal y diseño visual pueden avanzar después de etapa 1 sin modificar producción. Modelo de datos y contrato de cálculo pueden diseñarse juntos. Document parsing depende de modelo/evidence y políticas de privacidad. Integración ledger depende de estados y cálculo recibidos. QA completo depende de todas las verticales.

## No reordenar

No iniciar liquidaciones legales antes de tener fuentes/vigencias y ejemplos revisados. No guardar Payroll personal en Firestore. No ejecutar migración real antes de tener backup/restauración y pruebas con archivos sintéticos.
