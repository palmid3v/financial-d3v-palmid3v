# Estrategia de pruebas y validación propuesta

## Evidencia disponible al auditar

El repositorio contiene pruebas Node para Vault/finance/importación y pruebas Go en dominio, motor, API, aplicaciones y adaptadores. `QUALITY-CHECKPOINT-2026-11-12.md` afirma que CI más reciente de su contexto pasó 32/32 frontend y Go test/build, mientras deja pendiente verificación manual de guardado/bloqueo/reapertura y conciliación cuenta/ledger. Es evidencia documental histórica, no se ejecutó ni se confirmó para este checkout.

El runner `scripts/validate.ps1` no es solo lectura: ejecuta `npm ci`, build, `build:wasm`, Go tests/build. El script WASM sobrescribe artefactos bajo `frontend/public/wasm`. Por esa razón no se ejecutó dentro de esta auditoría de solo lectura.

## Plan de pruebas Payroll

### Unidad

- Exactitud Money, overflow y fracciones; límites/monedas incompatibles.
- Vigencia y aplicabilidad de reglas; regla correcta antes/después de cada fecha de cambio.
- Turnos de día/noche, cruce de medianoche, descansos pactados, festivos fijos y móviles.
- Exclusión/combinación de recargos validada por asesores.
- Bases, topes y redondeos por concepto, ausencias/licencias/auxilios.
- Reproducibilidad byte/valor de snapshots y versiones.

### Golden cases

Conjunto firmado/aprobado por experto: salario fijo ordinario; quincena cruzando cambio de regla; turno con tramo nocturno; domingo distinto del descanso pactado; festivo; extra día/noche; turno nocturno-extra-descanso combinado; salario variable; cambio de salario; vacaciones/incapacidad/licencia; auxilio elegible/no elegible; pagos parciales/anticipos; redondeo COP.

### Integración

- Request/response Go/WASM schema y errores estables.
- Ingesta → revisión → confirmación de contrato → cálculo → guardar/cerrar/reabrir.
- Migración de Vault antiguo con datos conocidos/desconocidos y rollback.
- Payslip reconciliation contra valores estimados.
- Confirmación de pago recibido crea una transacción una sola vez; esperados no crean movimiento.
- Verificar que crash, error de escritura y doble-click no marcan dirty/guardado incorrectamente.

### Seguridad y privacidad

- Mutación ciphertext/password errónea, versiones, payload grande/malformado y schema inválido.
- Verificar ausencia de plaintext financiero/laboral en storage, requests, consola/logs y errores.
- Confirmar procesamiento local documental sin destinos remotos y cleanup de temporales.
- Timeout con y sin dirty, actualización PWA y restauración desde copia cifrada.
- Revisión de permisos y dependencias tras aprobación de OCR.

### UI/accessibilidad/runtime

- Desktop/móvil, navegación teclado, lectores de pantalla, contraste, zoom y reduced motion.
- Estados loading/error/empty/dirty/saved y confirmaciones de cambios.
- PWA instalada, offline app shell, selección local de archivo y disponibilidad WASM.
- Revisión manual con bóveda sintética y copia recuperable; no usar archivos reales hasta pasar gates.

## Gate de liberación

No considerar Payroll completo por compilar. Requiere reglas verificadas, exactitud numérica, historial reproducible, cobertura de conflictos/recargos, revisión de contrato, calendario, conciliación, privacidad, pruebas regresivas financieras y accesibilidad. Registrar cada comando, commit, salida, plataforma y fecha. Despliegue queda bajo control del propietario.
