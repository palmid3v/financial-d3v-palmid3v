# Propuesta de modelo de datos Payroll

**No implementado.** Debe revisarse junto con migración de Vault, asesoría legal y precisión monetaria.

| Entidad | Campos centrales sugeridos | Invariante |
|---|---|---|
| `EmploymentProfile` | id, nombre/identificadores mínimos, employerId activo | minimizar PII; dueño es bóveda local. |
| `Employer` | nombre, zona, frecuencia/cortes, fechas esperadas, política ajuste | fechas esperadas no son pago recibido. |
| `ContractVersion` | id, vigencia, tipo, salario, moneda, allowance, frecuencia, jornada, descanso, compensación, beneficios, fuente de cada campo | version inmutable; cambios crean enmienda/nueva versión. |
| `ContractFieldEvidence` | campo, valor, documento/página/ancla, confianza, revisión/confirmación | valor no confirmado no se usa en cálculo. |
| `WorkRecord` | fecha, horario programado, tramos reales, pausas, novedades, descanso esperado/real, fuente | horario pactado y asistencia real separados. |
| `RuleSetVersion` | jurisdicción, regla, referencia, URL oficial, artículo, effectiveFrom/To, condiciones, fórmula, estado/verificador | regla no aplica fuera de vigencia/alcance. |
| `PayrollRun` | periodo laboral, corte, fecha liquidada/esperada/real, contractVersion, ruleSet, engine, método, rounding, entradas snapshot, desglose y total | cálculo reproducible e inmutable. |
| `Payslip` | archivo opcional, campos extraídos, evidencia por campo, estado de retención | guardar original solo con decisión explícita. |
| `Reconciliation` | payrollRun, payslip, conceptos, diferencias, explicaciones, revisión | discrepancia no equivale a ilegalidad. |
| `ReceiptLink` | payrollRun, transactionId, fecha/importe recibido, fuente, idempotencyKey | una recepción registrada una vez. |

## Extensión de Vault

Agregar un incremento versionado de esquema, por ejemplo `schemaVersion` nuevo con migración determinista desde v1, preservación de los arrays/campos actuales y pruebas round-trip. La versión exacta se decide en implementación. No guardar contratos en un documento separado sin cifrar ni usar Firestore. Determinar tratamiento de entradas desconocidas para no borrar datos de una versión posterior al abrir archivo antiguo.

## Dinero y exactitud

Representar COP en unidades acordadas por el propietario, presumiblemente pesos enteros, y tasas como racionales/enteros escalados. Definir redondeo legal por concepto y por periodo con ejemplos revisados. No confiar en coma flotante para montos. Toda suma/resta debe detectar overflow. Valores de sueldo, unidades, moneda y fracciones deben tener reglas de validación explícitas.

## Estados temporales

```text
EXPECTED → ACCRUED/ESTIMATED → SETTLED → RECEIVED → LINKED_TO_LEDGER
```

Los estados no tienen que formar una cadena lineal rígida (pago parcial, anticipo, corrección); deben modelar eventos y transiciones auditables. Sólo el evento `RECEIVED` confirmado habilita asiento de ingreso.

## Datos de documento

Guardar sólo lo necesario para auditar el dato extraído. Recomendación inicial: archivo fuente efímero; campos extraídos + puntero lógico a página/sección + estado de confirmación dentro del Vault. Si se conserva original, cifrado solo dentro del archivo Vault y con consentimiento informado; nunca URL/blob persistente.
