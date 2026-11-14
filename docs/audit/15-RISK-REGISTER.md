# Registro de riesgos

| ID | Riesgo | Prob. | Impacto | Prioridad | Mitigación / evidencia |
|---|---|---:|---:|---:|---|
| R-01 | Regla laboral mal interpretada produce neto/recargo incorrecto. | Media | Crítico | P0 | Fuente oficial, revisión laboral, fechas efectivas, golden cases. |
| R-02 | Mezcla de Firestore legado con bóveda local filtra salarios/contratos. | Media | Crítico | P0 | Mantener Payroll personal solo local y verificar red sin plaintext. |
| R-03 | Salario esperado se duplica o se registra como recibido antes de tiempo. | Alta | Alto | P0 | Estados separados; asiento idempotente sólo en recepción confirmada. |
| R-04 | Auto-lock queda aplazado por dirty indefinidamente. | Alta | Alto | P0 | Diseñar límite duro y política explícita de cambio pendiente. |
| R-05 | Auto-update descarta estado sensible aún no guardado. | Media | Alto | P1 | Gate de update mientras dirty o aviso/guardado explícito. |
| R-06 | Migración de Vault pierde datos desconocidos/históricos. | Media | Crítico | P0 | Versionado, backups, migración idempotente y round-trip con fixtures. |
| R-07 | Unidades COP/decimales y redondeo causan diferencia de pesos. | Alta | Alto | P0 | Definir unidad, racionales y rounding por concepto. |
| R-08 | Motor Go/WASM divergente de JS da informes inconsistentes. | Alta | Alto | P1 | Una ruta de cálculo y pruebas parity/golden. |
| R-09 | Overflow/valores fuera de rango en cálculos enteros. | Media | Alto | P1 | Comprobaciones de overflow, límites e inputs inválidos. |
| R-10 | OCR/contrato externo expone PII o nómina. | Media | Crítico | P0 | Todo local por defecto; autorización explícita para proveedor externo. |
| R-11 | Parser documental malicioso o pesado afecta app/dispositivo. | Media | Alto | P1 | Límites de archivo/página, workers, validación y revisión de dependencias. |
| R-12 | PDF escaneado o formato inesperado produce campos inventados. | Media | Alto | P1 | Confidence/evidence y confirmación; OCR no auto-aprueba. |
| R-13 | Datos de festivos/calendario equivocados alteran liquidación. | Media | Alto | P1 | Dataset oficial por año y pruebas de festivos móviles. |
| R-14 | Rediseño degrada legibilidad, accesibilidad o flujos existentes. | Media | Medio | P1 | Prototipo, test con propietario, WCAG y regresiones. |
| R-15 | CI/checkpoint histórico se confunde con estado actual. | Alta | Medio | P1 | Evidencia por commit y fecha; no afirmar ejecución no observada. |
| R-16 | Archivo perdido o contraseña olvidada deja finanzas irrecuperables. | Baja | Crítico | P1 | Backups cifrados y procedimiento de restauración probado. |

Riesgos 1–3, 4 y 6–10 bloquean uso de Payroll con datos reales hasta mitigarse. Esta tabla no representa una evaluación de probabilidad cuantitativa ni auditoría externa.
