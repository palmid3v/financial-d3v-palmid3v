# Arquitectura técnica propuesta para Payroll

## Diagrama lógico

```text
React Payroll workspace
  ├─ Import UI → extracción local → propuestas con referencias/confianza
  ├─ CRUD de perfil/contrato/horarios/calendario/reconciliación
  └─ adaptador JSON versionado
          ↓
Go domain/payroll + rule evaluator (sin I/O, determinista)
          ↓
Go/WASM como runtime local de navegador
          ↓
resultado explicable + snapshot de entradas y versiones
          ↓
VaultContext → FDV cifrado al guardar explícitamente
```

No agregar base de datos, microservicio ni proveedor externo. El API/Firestore legado no debe almacenar Payroll personal.

## Paquetes lógicos (propuesta, no estructura aprobada)

```text
frontend/src/payroll/{profile,contracts,schedules,calendar,settlements,reconciliation,documents,reports}/
internal/payroll/{model,classification,calculation,rules,calendar}/
```

Mantener separados los modelos de presentación, DTO JS/WASM, dominio y representación Vault; conversión explícita en límites, evitando compartir entidades Firestore.

## Contrato Go/WASM

Request incluye `apiVersion`, `engineVersion`, `contractSnapshot`, `workRecords`, `payPeriod`, `timezone`, `ruleSetId` y `roundingPolicy`. Response incluye desglose por intervalo y concepto, valores enteros y moneda, advertencias, reglas/fuentes aplicadas, errores estructurados y hash/referencia de inputs si la estrategia lo aprueba. No usar `float64` para importes; porcentajes pueden representarse como racionales/enteros escalados exactos. Rechazar campos faltantes, fechas inválidas, rangos contradictorios, moneda incorrecta y versión de regla no aplicable.

## Determinismo e historial

Una liquidación confirmada conserva snapshots inmutables: versión de contrato y salario, jornadas/novedades, regla legal y vigencia, metodología, precisión/rounding, código de motor, instante de cálculo y resultado. Recalcular una historia puede ofrecer comparación nueva, pero no reescribir el resultado pasado.

## Documentos locales

Separar parser por tipo y formato; validar MIME/firma y tamaño; ejecutar extracción dentro del navegador/Web Worker si la biblioteca lo permite; evitar URLs externas y cargas remotas. DOCX y OCR exigen evaluación de dependencias, licencias, peso PWA, calidad de español y memoria. Temporal files/blob URL deben liberarse. Conservar referencias de fuente (documento/página/fragmento mínimo) cifradas; nunca contenido en logs. No usar IA externa sin autorización explícita.

## Calendario

Representar festivos como dataset versionado y respaldado por fuente oficial. Computar fecha local en `America/Bogota`, separando el concepto del festivo del descanso obligatorio semanal. Mantener empleador configurable para corte, fecha esperada y política de días no hábiles.

## Límites de fase

El repositorio no tiene parsers de contratos, OCR, reglas de nómina ni modelo Payroll local. Esta sección propone los límites; no certifica factibilidad de una biblioteca concreta ni autoriza dependencias.
