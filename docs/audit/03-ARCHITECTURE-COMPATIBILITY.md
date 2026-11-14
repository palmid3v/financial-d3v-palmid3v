# Compatibilidad para Payroll y rediseño

## Respuesta explícita

**La arquitectura puede soportar el Payroll propuesto si se extiende con límites claros; el estado actual no está listo para implementarlo de forma segura y reproducible.** Mantener la PWA local-first y el archivo cifrado es compatible con el objetivo. La persistencia Payroll Firestore heredada no lo es bajo la política documentada.

## Evaluación

| Tema | Estado | Evidencia / brecha | Acción recomendada |
|---|---|---|---|
| Organización frontend | **MEJORAR** | `App.jsx` integra shell, navegación y páginas; render condicional local. | Extraer módulos de UI/payroll y navegación aprobada sin reescritura completa. |
| Límites de dominio | **EXTENDER** | `finance.js` contiene funciones y normalización Vault; no hay dominio local Payroll. | Dominio Payroll separado con datos de entrada/salida explícitos. |
| Go/WASM | **MEJORAR** | Motor local existe, pero UI usa JS para algunas cifras; sin Payroll. | Contrato JSON tipado, versionado, deterministicidad, errores y pruebas de golden vectors. |
| Vault contratos/nóminas | **EXTENDER** | FDV1 cifra payload completo, pero schema 1 es rígido y validación de payload somera. | Migración de schema, compatibilidad y recuperación antes de importar registros reales. |
| Documentos localmente | **INVESTIGAR** | PDF.js se usa para texto bancario; OCR y contratos ausentes. | Extracción local, referencias por página/campo y borrado de temporales. |
| Reglas legales versionadas | **REFACTORIZAR** | Ningún modelo de reglas laborales. | Datos efectivos por fecha, aplicabilidad, fuente y verificación. |
| Históricos | **EXTENDER** | `PayrollPeriod` conserva totales/fechas solamente. | Snapshot inmutable de contrato/reglas/turnos/método/versión motor. |
| Ledger | **EXTENDER** | Transacciones son fuente autoritativa; Payroll no está en Vault. | estados separados y enlace idempotente al ingreso recibido. |
| Modelos | **EXTENDER** | No existen contrato laboral, turnos o reconciliación de desprendibles locales. | Modelos Payroll en esquema Vault aprobado. |
| Límites | **MEJORAR** | UI, finanzas JS, Go y backend legado coexistentes. | Mantener monolito modular; no introducir microservicios ni base nueva. |

## Alternativa recomendada si la estructura no basta

Adoptar un **monolito modular local**: React por espacios de trabajo; dominio financiero existente preservado; paquete Payroll en Go puro que compila también a WASM; adaptador de persistencia exclusivamente hacia el estado Vault; reglas legales separadas como datos versionados; adaptador documental local sin servicios remotos. No mover el backend legado durante esta fase.

## Qué queda intacto

Archivo `.fdv`, cifrado, ciclo de apertura/guardado, libro de transacciones, categorías, presupuestos, ahorros, deudas, activos/pasivos y reglas financieras ya existentes. El nuevo módulo no debe reescribir movimientos históricos ni convertir ingresos previstos en dinero recibido.

## Funcionalidad afectable y orden seguro

Riesgos: incompatibilidad de bóvedas, discrepancias JS/Go, duplicación salarial en flujo de caja, pérdida de cambios no guardados por actualización/lock y tratamiento erróneo de montos COP. Orden: decisiones → contrato de datos/migración → pruebas de lectura/escritura sintéticas → motor legal → turnos → integración idempotente → UI/rediseño → QA.

## Necesidad

La migración versionada, snapshot reproducible y separación esperado/recibido son **esenciales**. La reorganización gradual de `App.jsx`, rutas y sistema visual es importante para mantener el producto; la selección de bibliotecas de animación u OCR es **opcional** y requiere autorización de dependencias.
