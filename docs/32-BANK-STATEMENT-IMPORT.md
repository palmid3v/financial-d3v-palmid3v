# FASE 32.1 — Importación bancaria: base multi-cuenta

**Estado:** 32.1 IMPLEMENTADA EN RAMA / 32.2 IMPLEMENTACIÓN INICIAL EN RAMA / VALIDACIÓN LOCAL PENDIENTE  
**Rama:** `feat/bank-statement-import-nequi`  
**Alcance inicial:** Nequi, con motor preparado para Bancolombia y cuenta Efectivo manual.

## Objetivo

Permitir importar extractos en lotes, vincularlos a una cuenta existente y revisar cada movimiento antes de incorporarlo al ledger de la Financial Vault.

## Decisiones de arquitectura

- La cuenta de destino siempre se selecciona desde `vault.accounts`; el importador no crea cuentas.
- Nequi es el primer adaptador objetivo.
- Bancolombia usará el mismo motor y un adaptador de formato independiente.
- Efectivo continúa con registro manual.
- El contenido del archivo se procesa localmente en el navegador.
- No se almacena el PDF/CSV original en la bóveda.
- Se conserva metadata de auditoría dentro del vault: cuenta, proveedor, archivo de origen, periodo, fecha de importación y cantidad de movimientos.
- Los movimientos incorporan fingerprint, archivo de origen, proveedor, periodo y saldo del extracto cuando existe.
- Los duplicados exactos identificados por fingerprint se excluyen de la selección inicial; la persona puede revisar el resto antes de importar.
- La importación agrega movimientos a la bóveda en memoria. El usuario debe guardar el archivo `.fdv` para cifrar y persistir los cambios.

## Implementación de esta entrega

- Nueva pantalla **Importar y conciliar** en navegación de escritorio y móvil.
- Selección de múltiples archivos CSV.
- Parser CSV local con delimitadores coma, punto y coma o tabulación.
- Reconocimiento de encabezados Fecha, Descripción, Valor y Saldo.
- Normalización de fechas y valores con formatos decimales comunes.
- Vista previa editable de tipo de movimiento: abono, cargo o transferencia.
- Selección de cuenta destino para transferencias.
- Resumen de abonos, cargos y flujo neto.
- Fingerprint determinista para detectar reimportaciones exactas.
- Registro de lotes en `vault.statementImports`.
- Tests unitarios para parser, importes, fechas y duplicados.

## Limitaciones explícitas

Esta entrega **no implementa todavía lectura PDF ni OCR**. La carga PDF no se presenta como soportada; el lector PDF.js/OCR requiere su propia integración y validación local. El extracto Nequi PDF de enero 2026 sigue siendo el documento de referencia para construir el adaptador PDF específico.

Tampoco se hace todavía:
- extracción de resumen bancario de saldo inicial/final, abonos y cargos desde PDF;
- conciliación de continuidad entre enero y noviembre;
- matching automático de transferencias entre Nequi, Bancolombia y Efectivo;
- clasificación semántica automática de pagos, reembolsos, intereses, retiros y recargas;
- asociación automática de pagos con deudas o cuentas por cobrar.

## FASE 32.2 — Parser PDF local y adaptador Nequi

**Estado:** IMPLEMENTACIÓN INICIAL EN RAMA / VALIDACIÓN CON EL EXTRACTO REAL PENDIENTE

- Se incorpora `pdfjs-dist` como dependencia empaquetada; no se usa CDN ni se transmite el documento.
- Extracción de texto de cada página en el navegador.
- Adaptador inicial para el formato de extracto Nequi con fechas DD/MM/YYYY, valores con separador de miles por coma y decimales por punto.
- Lectura del periodo, saldo anterior, total de abonos, total de cargos y saldo actual.
- Vista previa compartida con el importador CSV.
- Gate de importación: si el resumen o los saldos no coinciden, se bloquea el lote completo.
- PDF cifrado, escaneado, sin capa de texto o con formato no reconocido se rechaza; OCR no está incluido.
- No se conserva el archivo original ni se extraen datos de identidad/cuenta para auditoría.
- Se añaden pruebas unitarias del parser de texto y montos; aún deben ejecutarse en Windows con `npm install`, `npm test` y `npm run build`.

**Limitación importante:** el parser está construido sobre el formato de referencia de enero de 2026. Hasta pasar las pruebas de integridad del documento real en el entorno local, 32.2 no debe considerarse validada ni usarse para importar al vault principal.

## Próximas subfases

1. 32.3 — Importación por lotes enero–noviembre y control de periodos.
2. 32.4 — Conciliación de saldos y continuidad mensual.
3. 32.5 — Matching de transferencias entre cuentas.
4. 32.6 — Reglas de clasificación y vinculación con deudas/cuentas por cobrar.
5. 32.7 — Idempotencia, recuperación, auditoría y pruebas de seguridad.

## Validación requerida en el entorno local

Desde `frontend/`:

```powershell
npm test
npm run build
```

Después ejecutar el runner de raíz y la auditoría de seguridad. Esta rama aún no tiene evidencia de ejecución local, build, runtime ni validación de la bóveda. No importar todavía los extractos reales ni guardar cambios en el vault principal hasta superar esas pruebas.

## Invariantes financieros

- Los importes se convierten a unidades menores enteras.
- Transferencias no se contabilizan como ingreso o gasto.
- Una recarga entre cuentas propias no se presume ingreso.
- Un movimiento de persona/comercio sin contexto queda sujeto a revisión.
- El saldo del extracto es una referencia de conciliación, no un movimiento.
- No se modifica el saldo inicial de la cuenta automáticamente.
- Ningún dato financiero descifrado se envía a servicios remotos.
