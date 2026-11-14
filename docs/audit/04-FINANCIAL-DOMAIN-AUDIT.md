# Auditoría del dominio financiero

## Dominio activo

El payload inicial de `frontend/src/vault/crypto.js` define cuentas, categorías, transacciones, presupuestos, metas/aportes, deudas/pagos, activos, pasivos y educación. `finance.js` normaliza datos y calcula balances, presupuestos, flujo, ahorro, deuda y patrimonio. `App.jsx` realiza operaciones directamente sobre el estado Vault.

El dominio Go histórico (`internal/domain/`) modela dinero, cuentas, transacciones y otros módulos API. El motor WASM tiene una representación propia JSON y no consume directamente el modelo de UI. Hay, por tanto, más de un contrato/modelo financiero.

## Fuentes de verdad

| Valor | Fuente de verdad actual | Observación |
|---|---|---|
| Movimientos de caja registrados | `vault.transactions` | La lista transaccional sustenta flujo y balances. |
| Balance de cuenta | derivado de saldo inicial + transacciones + pagos de deuda vinculados | JS incorpora pagos de deuda; WASM documentado no necesariamente refleja el esquema actual. |
| Gasto de presupuesto | transacciones `expense` y líneas/categorías del presupuesto | Transferencias no son gasto; interés/cargos de deuda aparecen como gasto en cálculo JS. |
| Progreso de ahorro | aportes de meta | Un aporte no debe confundirse con un gasto presupuestario. |
| Saldo de deuda | deuda original menos principal pagado | Interés y cargos no reducen principal. |
| Patrimonio | activos − pasivos − saldo de deuda según reglas vigentes | No suma distintas monedas como si fueran equivalentes; conversión no está implementada. |
| Persistencia | último `.fdv` cifrado guardado | Cambios posteriores viven solo en memoria hasta guardar. |
| Payroll previsto/liquidado/recibido | **No existe en Vault actual** | El CRUD Go legado no forma parte del ledger local. |

## Invariantes preservables

- `docs/CONTEXT.md`, `docs/07-FINANCIAL-RULES.md` y `finance.js` establecen dinero con unidades enteras y moneda, transferencias separadas de gastos, aportes de ahorro independientes, principal separado de interés/cargos y patrimonio derivado.
- La moneda COP se presenta sin fracciones en pantalla en vistas principales, aunque los formularios escalan montos por 100. Payroll debe elegir denominación entera en pesos y política de redondeo por concepto; no inferir que la escala actual representa centavos legales.
- No hay conversión de divisas; un total intermoneda requiere conservar cada moneda o usar tasa explícita, fecha y fuente aprobada.

## Integración salarial recomendada

Guardar dentro de Payroll: ingreso estimado, periodo trabajado, periodo de corte, liquidación estimada/final, desprendible y reconciliación. Registrar una transacción de ingreso únicamente cuando se confirma que el dinero fue recibido. Enlazarla a un `receiptId`/settlement ID único y registrar banco/cuenta/fecha real. La UI debe presentar por separado:

1. **Esperado:** proyección, no ledger.
2. **Devengado:** estimación de lo generado según horas/contrato.
3. **Liquidado:** valor consolidado, pendiente de comparación o pago.
4. **Recibido:** evidencia del dinero realmente recibido.
5. **Ledger:** movimiento confirmado, con referencia Payroll.

No crear gastos por descuentos de nómina como salida de efectivo adicional a ingreso neto; si se refleja bruto y deducciones, definir antes un modelo contable que no duplique neto recibido. Para gestión personal inicial, el ingreso efectivo puede ser neto y el detalle bruto/deducciones queda dentro de Payroll.

## Hallazgo de duplicación

El dashboard calcula ingresos por transacciones. Si se añade salario al flujo antes del recibo o además del asiento real, se sobreestimará ingreso y ahorro. Un asiento de nómina debe ser idempotente y relacionar exactamente un pago recibido con un movimiento.

## Recomendación

**EXTENDER**, sin reemplazar el ledger. Validación financiera P0 antes de usar datos reales: conciliación entre cuentas/transacciones/deuda, test de moneda y cantidades, guardado/reapertura y detección de duplicados.
