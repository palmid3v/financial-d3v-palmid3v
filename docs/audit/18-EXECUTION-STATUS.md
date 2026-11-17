# Financial-D3v — ejecución autónoma y estado verificado

**Fecha:** 2026-11-14 (America/Bogota)  
**Base de referencia:** `6a4ccddb16235474c8f7fb9459a08fc1ed6177cb`  
**Alcance:** implementación local de fundamentos seguros de Payroll, UX y validación. Este informe separa funcionalidad comprobada de trabajo pendiente.

## Resumen

El repositorio combina una PWA React/Vite local-first con Go/WASM para cálculos, además de una API Go/Firestore histórica. Se añadió un dominio local de Payroll para perfiles, contratos versionados, turnos, resúmenes ingresados por la persona y pagos recibidos. La información nueva se incorpora al archivo `.fdv` cifrado mediante una migración determinista de schema 1 a schema 2. No se añadió almacenamiento remoto.

El Payroll disponible es una base de registro y cálculo aritmético de conceptos confirmados. **No calcula ni certifica una nómina conforme a la legislación colombiana.** Las reglas requieren verificación legal y contable antes de producir cálculos estatutarios.

## Estado de las 10 fases

| Fase | Estado | Evidencia / límite |
|---|---|---|
| 0. Descubrimiento | Parcial, auditado previamente | El inventario base está en `docs/audit/00..17`. El checkout actual se modificó después del baseline; el documento de estado local se amplió, pero falta una reconciliación integral de todos los hallazgos contra el HEAD actual. |
| 1. Fundamentos | Parcialmente implementada | Go es autoridad para sumar conceptos Payroll; se conectó nueva ruta `/trabajo`; se aplicó Graphite Aurora en CSS. `App.jsx` sigue concentrando buena parte de Personal Finance y no se migró a un router de terceros. |
| 2. Dominio y Vault | Parcialmente implementada | Tipos en `frontend/src/payroll/model.js`; arrays Payroll en Vault schema 2; migración v1 idempotente probada. Faltan migraciones futuras, validación profunda de todo el esquema y restauración automatizada desde copia. |
| 3. Documentos | Parcialmente implementada | TXT, PDF con texto (máximo 50 páginas) y DOCX se procesan localmente; entrada límite 10 MiB y descompresión XML DOCX limitada durante lectura a 20 MiB; propuestas con referencia de línea, confianza y confirmación humana. OCR no está habilitado; no se retienen originales; la extracción es heurística. |
| 4. Reglas laborales | Parcial: catálogo y estimador de aportes limitado; liquidación completa no implementada | `rules.go` versiona parámetros publicados 2025–2026. `contributions.go` estima salud, pensión y solidaridad en un caso mensual acotado, con IBC confirmado, fuentes y redondeo PILA al centenar superior. No resuelve aplicabilidad individual, excepciones, beneficios, recargos ni liquidación completa; revisión profesional pendiente. |
| 5. Horarios | Parcialmente implementada | Go/WASM clasifica tiempos programados/reales, festivos nacionales, descanso contractual y múltiples pausas no superpuestas; las correcciones conservan historial y se impiden solapes entre turnos. No calcula horas extra/recargos y faltan calendarios de empleador, novedades/licencias y validación con casos laborales completos. |
| 6. Cálculo financiero/Payroll | Parcialmente implementada | Go usa enteros COP, validación, protección de overflow, equivalentes presupuestarios y estimación de aportes acotada; WASM se prueba desde Node. Los conceptos de liquidación aún se ingresan y confirman manualmente. No hay liquidación estatutaria integral ni paridad completa con cálculos JavaScript históricos. |
| 7. Integración financiera | Parcialmente implementada | Recibos confirmados, pagos parciales, referencias idempotentes, detección de movimientos duplicados y destino COP se validan. Hay comparación de desprendible contra snapshots. Faltan reversos/rectificaciones de recibos y una integración completa con presupuestos, ahorro, deudas y reportes de flujo. |
| 8. Rediseño visual | Parcialmente implementada | Graphite Aurora, navegación a Trabajo, resumen de Payroll, formularios responsivos, historial de turnos/liquidaciones y estados reduced-motion. Falta recorrido manual completo, lector de pantalla, pruebas de teclado/contraste y revisión visual en móviles/dispositivos. |
| 9. Calidad y seguridad | Parcialmente verificada | Última validación observada: Node 51/51, Go `test`, `vet` y `build`, WASM y Vite/PWA producción pasan. Persisten 6 hallazgos de auditoría en dependencias de desarrollo PWA (2 bajos, 4 moderados); no hay prueba manual completa de Vault, evaluación externa ni aprobación legal. |
| 10. Release | No lista para release | Se conserva deployment local; faltan reglas legales aprobadas, integración Payslip y turnos, endurecimiento final, documentación operativa final y pruebas de runtime/móviles. No se desplegó. |

## Cambios locales relevantes

- `internal/payroll/calculation.go`: suma determinista de conceptos ingresados y clasificación temporal de turnos.
- `internal/payroll/rules.go`, `holidays.go`: catálogo de parámetros publicados Colombia 2025–2026 y calendario nacional calculado según la Ley 51 de 1983, con fuentes y tramos de vigencia; no son un motor de liquidación.
- `internal/payroll/projection.go`: equivalentes horario (cuando hay horas semanales confirmadas), diario, semanal, quincenal y mensual de salario contractual para planeación, enteros COP y política de redondeo versionada; la fórmula se etiqueta como no estatutaria.
- `cmd/financial-engine-wasm/main.go`, `frontend/src/vault/goEngine.js` y `frontend/src/payroll/PayrollWorkspace.jsx`: exponen reglas y calendario festivo desde Go/WASM; la vista muestra el snapshot, fuentes oficiales y festivos sin desplazar automáticamente el pago esperado.
- `cmd/financial-engine-wasm/main.go`: API WASM `calculatePayroll` y `classifyPayrollShift`.
- `frontend/src/payroll/`: dominio, importación local documental, workspace y pruebas.
- `frontend/src/vault/finance.js`, `crypto.js`, `VaultContext.jsx`: schema 2 y migración desde schema 1.
- `frontend/src/vault/goEngine.js`: clientes Go/WASM Payroll.
- `frontend/src/App.jsx`, `index.css`: ruta de Trabajo, acceso desde Inicio y dirección Graphite Aurora.
- `frontend/src/vault/nequiPdf.js`: límite configurable de páginas PDF.
- `frontend/src/PWAUpdatePrompt.jsx`, `frontend/vite.config.js`: actualización PWA solicitada por la persona y bloqueada mientras el Vault tenga cambios pendientes.

## Validación ejecutada

Comandos y resultados observados en este checkout:

- `go test ./...` — PASS. Se aisló `GOCACHE` dentro del workspace después de que la caché compartida del usuario devolviera acceso denegado.
- `npm.cmd test` desde `frontend/` — PASS, 44/44, incluyendo Payroll, migración Vault, finanzas y smoke test del WASM compilado.
- `npm.cmd run build` desde `frontend/` — PASS, Vite + PWA/service worker.
- `npm.cmd run build:wasm` desde `frontend/` — PASS; genera `frontend/public/wasm/financial-engine.wasm` con endpoints Payroll.
- `go vet ./...` y `go build ./...` — PASS. Go imprime un aviso no fatal al escribir el stat cache del módulo global, que no está habilitado para escritura en este entorno.
- `go test ./...` — PASS, incluye snapshots de transición/versionado, 3 fechas no soportadas, un turno que cruza una vigencia, traslado de festivos 2026 y separación entre festivo y descanso pactado.
- `go test -race ./internal/payroll` — NO EJECUTADO: Go rechazó `-race` porque CGO está deshabilitado. No se marca como aprobado.
- Revisión visual automatizada — NO EJECUTADA: el host nativo y el de navegador de Computer Use no estaban disponibles al reintentar; el servidor local se cerró sin interactuar con datos.
- `npm.cmd audit --omit=dev` — NO PASS: 6 avisos transitivos reportados (2 low, 4 moderate; `deepmerge`, `glob`, `minimatch` en la cadena `vite-plugin-pwa`/Workbox). El arreglo compatible actualizó Vite a 8.3.8 y otras 8 entradas del lockfile; `npm audit fix --force` recomendaría bajar `vite-plugin-pwa` 2.0.0 a 1.1.0. No apliqué ese downgrade mayor porque el cambio puede romper integración PWA; el build sigue pasando y el riesgo de toolchain queda abierto.
- `git diff --check` — PASS con advertencia de normalización de fin de línea CRLF para el archivo Go modificado.

No se ejecutó `npm ci`, sincronización remota ni deploy. `npm audit fix` sí modificó de forma intencional el lockfile para aplicar actualizaciones compatibles; el diff se conserva localmente y está descrito arriba.

## Seguridad y privacidad verificadas / límites

- El procesamiento documental invoca parsers locales; no contiene envío a servicios externos.
- El original de contrato/desprendible no se conserva; se guarda una referencia y campos extraídos en la bóveda.
- Los recibos no crean ingreso hasta la acción explícita de confirmar recepción.
- La conversión a `minorUnits` multiplica COP enteros por 100 para representar la escala del ledger existente. Esta frontera se prueba, pero la semántica histórica de escala 100 continúa siendo una deuda del modelo financiero, no una regla legal COP.
- El auto-lock continúa posponiéndose mientras la bóveda tenga cambios sin guardar. Esto evita descartar trabajo sin aviso, pero no ofrece un plazo de bloqueo duro mientras está dirty.
- La actualización PWA ahora requiere acción explícita y queda bloqueada mientras el Vault está dirty. Falta probar el flujo instalado/offline con un service worker previo y revisar el botón de actualización en dispositivos.
- La cadena de build PWA conserva avisos transitivos moderados/bajos; no se forzó un downgrade mayor del plugin para silenciarlos.
- La eliminación de plaintext en memoria depende de referencias/GC del navegador; no puede garantizarse sobreescritura física de memoria JavaScript.

## Trabajo necesario antes de afirmar que Payroll está completo

1. Verificación laboral y contable profesional de fuentes, applicability, fórmulas, solapes y redondeos.
2. Reglas oficiales versionadas con vigencias, festivos anuales, cambios dentro de periodo y casos golden aprobados.
3. Importación OCR local opcional, endurecimiento adicional del parser DOCX/PDF ante archivos hostiles y validación completa de estructura ZIP/recursos. El flujo descomprimido de XML ya se corta al superar 20 MiB.
4. Edición auditable de turnos, excepciones de calendarios de empleador y clasificación de overtime integrada con reglas aprobadas.
5. Motor determinista de liquidación y deducciones, snapshot histórico completo y tratamiento de cambios de salario dentro de periodo.
6. Ampliar extracción de desprendibles a conceptos confiables por línea, más pruebas con formatos reales sintéticos; hoy solo sugiere devengado, deducciones, neto y periodo, con confirmación humana.
7. Reversos y correcciones idempotentes del ledger con cadena de evidencia.
8. Asegurar actualizaciones PWA frente al estado dirty y revisar política de auto-lock.
9. Prueba manual de crear/abrir/guardar/bloquear/restaurar Vault con fixtures sintéticos; revisión desktop/móvil y accesibilidad.
10. Validación final de build, WASM, PWA y límites de privacidad antes de release.

## Decisiones que ya se aplicaron en esta implementación local

- DEC-001: Payroll personal se almacena dentro del `.fdv` cifrado.
- DEC-002: Go es autoridad aritmética y WASM ejecuta localmente.
- DEC-003: schema 2 aditivo, conserva propiedades desconocidas y abre schema 1.
- DEC-004: parsers locales y confirmación explícita; OCR queda pendiente.
- DEC-005: se aplicó Graphite Aurora en la superficie modificada.
- DEC-006: ruta interna `/trabajo` sin dependencia nueva de routing.
- DEC-007: COP Payroll se ingresa como pesos enteros; la integración convierte de forma explícita a escala del ledger existente.
- DEC-008: ningún cálculo estatutario se etiqueta como verificado; falta revisión profesional.

Estas decisiones describen código local en curso, no certificación de producto ni release.

## Fuentes oficiales nuevas revisadas

- Ley 2101 de 2021, artículo 3 (reducción gradual de jornada): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=166506
- Ley 2466 de 2025, artículos 10, 11 y 14 (franja nocturna, transición de jornada y recargo de descanso): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676
- Ley 51 de 1983, artículo 1 (festivos nacionales y traslados al lunes): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4954
- Decreto 1572 de 2024 (auxilio de transporte 2025): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=256836
- Decreto 1573 de 2024 (SMMLV 2025): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=257156
- Decreto 1469 de 2025 y Decreto 0159 de 2026 (SMMLV 2026, con transición cautelar): https://cancilleria.gov.co/normograma/compilacion/docs/decreto_1469_2025.htm y https://cancilleria.gov.co/normograma/compilacion/docs/decreto_0159_2026.htm
- Decreto 1470 de 2025 (auxilio de transporte 2026): https://cancilleria.gov.co/normograma/compilacion/docs/decreto_1470_2025.htm
- Consejo de Estado, boletín del 17 de julio de 2026 sobre revocatoria de la suspensión del Decreto 1469: https://www.consejodeestado.gov.co/noticias/

La jornada máxima se mantiene en 44 horas hasta el 14 de julio de 2026 y baja a 42 desde el 15 de julio por el cronograma de Ley 2101. El auto del Consejo de Estado del 9 de julio revocó la suspensión del Decreto 1469, mientras el Decreto 0159 indica que agotó su objeto por ese levantamiento. El catálogo registra los importes de mínimo y transporte, pero no reconcilia liquidaciones del periodo transitorio ni determina derechos concretos; requiere una revisión de la providencia y del impacto temporal por asesor laboral.

El catálogo conserva cifras publicadas y referencias; una fuente oficial revisada no equivale a concepto jurídico profesional ni acredita aplicación a contratos concretos. La situación litigiosa puede cambiar y exige actualizar el catálogo antes de calcular 2026 o años posteriores.

## Contract version effective-date correction

- The interface resolves the contract version effective today for current salary and planning equivalents; a future version is not used early.
- Settlements resolve the version across both period endpoints. Periods crossing a contract change must be split by version to preserve reproducible salary snapshots.
- Work records link to the version effective during the worked shift. A shift crossing a version change must be split; a shift ending exactly at midnight on the change date remains linked to the prior version.
- Expected payment dates are filtered by contract validity on each date, including contract start and inclusive end dates.
- Verification executed: `npm.cmd test` (45/45 PASS) and `npm.cmd run build` (PASS, PWA `generateSW`).
- A contract revision cannot extend a contract that already has an end date; the final version preserves the original inclusive end date. One-day effective versions are supported.
- Final rerun after that validation: frontend tests 45/45 PASS and production/PWA build PASS.

## Financial home dashboard Payroll integration

- The home dashboard now shows the aggregate monthly base salary for active contracts effective on today's America/Bogota date, the next employer-configured payment date within the next two months, and saved settlement count.
- The display is explicitly a gross contractual reference. It does not estimate net pay and does not add projected income to the ledger, cash flow, available balance, or transaction totals.
- Contracts outside their effective dates and archived contracts are excluded from the active summary. Invalid salary values are displayed for correction instead of silently included as zero.
- The Payroll summary helper has a test confirming a future contract is not treated as active and that generating the summary does not append a ledger transaction.
- Verification executed after dashboard integration: frontend tests 46/46 PASS and production/PWA build PASS.
- Visual browser validation remains unavailable in this environment (computer-use browser host returned unavailable); layout was only statically reviewed.

## Frontend dependency boundary and audit

- Pinned the already-installed build toolchain versions and moved Vite, React's Vite plugin, Tailwind, and vite-plugin-pwa to `devDependencies`. Runtime dependencies remain React, React DOM, and PDF.js.
- `npm audit --omit=dev`: PASS, 0 vulnerabilities after correcting the dependency classification.
- Full `npm audit`: 6 findings (2 low, 4 moderate) remain under the PWA build chain: `deepmerge`, `glob`, and `minimatch` through Workbox. npm offers only a forced PWA downgrade that would replace the current major; it was not applied. The current findings are documented as build-tool supply-chain risk, not reported as eliminated.
- The first lockfile-only attempt failed in offline mode before changing dependency state; the approved registry-enabled lockfile-only operation then completed. It did not install or run dependency lifecycle scripts.
- Verification after dependency boundary change and dashboard integration: frontend tests 46/46 PASS; production/PWA build PASS.
- Final clean-install verification: `npm.cmd ci --ignore-scripts` PASS from the exact-version lockfile; tests 46/46 PASS; production/PWA build PASS; `npm.cmd audit --omit=dev` reports 0 vulnerabilities. Full audit still reports the six development-toolchain findings above.

## Auditable work-record corrections

- Jornada records can now be corrected from their history. Saving a correction requires a reason, revalidates the effective contract version and shift times, and reruns the local Go/WASM classification.
- The record keeps its stable ID, increments its revision, and appends the prior record snapshot (including the previous classification) and reason. The UI exposes the prior revision history in an expandable section.
- Legacy records without revision metadata remain editable and start at revision 2 on their first correction.
- Verification executed: frontend tests 47/47 PASS; production/PWA build PASS; `git diff --check` PASS (existing LF/CRLF notice only).
- Interactive browser validation remains unavailable in the current CUA environment.

## Vault save/lock concurrency protection

- Vault state is mirrored in refs for asynchronous save operations. Saves are serialized so overlapping encryption and file writes cannot complete out of order.
- Each Vault mutation increments a revision. A save only clears the dirty indicator if no edit or lock/unlock transition occurred while it was sealing and writing the snapshot; an edit during save remains marked unsaved.
- A save captures the active Vault, password reference, destination file handle and filename together before asynchronous encryption, preventing a mid-save lock/unlock from redirecting an older encrypted snapshot into a different Vault file.
- The serial queue continues after failed saves, allowing a later retry. Utility tests cover queue order, failure recovery and revision comparison.
- Verification executed: frontend tests 49/49 PASS; production/PWA build PASS; `git diff --check` PASS (existing Go line-ending warning).
- Existing policy remains: inactivity auto-lock is deferred while changes are unsaved to avoid silent data loss. This still means there is no hard lock deadline when the Vault stays dirty and should be revisited with a user-visible recovery/save flow.

## Payroll attendance-to-settlement evidence

- Creating a Payroll summary now selects work records whose actual interval (or scheduled interval when actual times are absent) overlaps the inclusive period and whose contract-version ID matches the selected version.
- The settlement stores deep snapshots of those records, their revision numbers and Go/WASM classification metadata. The history view exposes this evidence for later review.
- Validation rejects evidence records outside the period, from another contract version, or duplicated by ID. Existing settlements without the new evidence array still render with zero attached shifts.
- Attendance remains evidence-only: the gross and deduction totals continue to come exclusively from user-confirmed COP concepts. The UI states this boundary; no overtime or surcharge amount is implied.
- Verification executed: frontend tests 50/50 PASS; production/PWA build PASS; `git diff --check` PASS (existing Go line-ending notice).

## Payroll work-time overlap protection

- New shift records and corrections are checked against all contracts belonging to the same employee. Any overlap of the effective interval (actual times when present, otherwise scheduled times) is rejected; touching endpoints are permitted.
- Settlement creation rechecks overlap conflicts in the period, including conflicting records linked to another contract version. This prevents legacy overlapping records from being treated as clean evidence.
- The overlap rule is intentionally conservative and compares full shift intervals, including recorded breaks. It is a duplicate-time integrity check only; it does not determine overtime or legal payment.
- Verification executed: frontend tests 51/51 PASS; production/PWA build PASS; `git diff --check` PASS (existing Go line-ending notice).

## Receipt ledger integrity and Colombian pension-rule boundary

- Receipt posting now validates the complete COP receipt shape and recomputes its settlement-scoped idempotency key from the confirmed bank reference. A malformed or altered key cannot reach the ledger.
- Posting checks for a pre-existing ledger transaction linked to the same receipt before creating income, which prevents a second transaction if Vault receipt metadata is missing or inconsistent. Payment-history totals must be safe integers and cannot exceed the settlement net; sequential partial receipts remain supported.
- Test coverage confirms two partial receipts complete one settlement, preserve exactly one income transaction per receipt, and reject inconsistent keys and orphaned ledger transactions. Verification executed: `npm.cmd test` — 51/51 PASS.
- Additional verification after the change: `npm.cmd run build` — PASS (Vite production build and PWA `generateSW`); `go test ./...` — PASS when run with a temporary workspace-local `GOCACHE` after the user-global cache returned access denied; `git diff --check` — PASS with the existing LF/CRLF notice.
- Legal research reviewed official `Ley 1122 de 2007`, article 10 (employee health contribution) and `Ley 797 de 2003`, article 7 (pension contribution and solidarity contribution), alongside `Ley 2381 de 2024` and `Corte Constitucional C-264-26`. The Court restored the law's force on 25 August 2026, set most approved provisions to take effect 1 April 2027, and left particular transition provisions and returned articles on a distinct path. Consequently, a generic automatic pension deduction is still out of scope; contract affiliation/transition facts and the deferred/returned rules require precise modeling and expert review.
- Sources: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=22600 ; https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=7223 ; https://www.corteconstitucional.gov.co/relatoria/2026/C-264-26.htm ; https://jurinfo.jep.gov.co/Normograma/Compilacion/docs/ley_2381_2024.htm

## Employee contribution estimate, Go/WASM

- Added `internal/payroll/contributions.go`: a bounded informational estimate for a confirmed complete calendar month, dependent employee, one employer, general pension system, unpensioned status, and confirmed IBC. It calculates 4% employee health, 4% employee pension and the researched solidarity contribution tiers; employer costs, benefits, variable periods, exceptions and individual pension-transition eligibility remain excluded.
- The user supplies gross COP and IBC COP separately; the calculator validates IBC between the applicable published minimum wage and 25 times that value, and not above the supplied gross. It refuses a month if the minimum-wage parameter/source changes within that month, and refuses dates beyond the supported legal catalog.
- Contribution amounts use the PILA upward-to-next-COP-100 rule of Decreto 780/2016 art. 3.2.1.5, modified by Decreto 1990/2016. Each result carries calculation version, effective rule snapshot, assumptions, verification status and official source URLs. No estimate is automatically written into a settlement or ledger transaction.
- Added Go/WASM endpoint, frontend adapter, and Payroll workspace estimate card. User confirmation of all narrow-case assumptions is required. The result is explicitly marked informational and not a legal determination.
- Added threshold, rounding, rejection and effective-date tests in `internal/payroll/contributions_test.go`; compiled-WASM smoke coverage includes a COP 2,800,000 example with COP 224,000 estimated deductions and COP 2,576,000 estimated net.
- Documentation updated: `docs/audit/09-COLOMBIAN-LEGAL-RULES-RESEARCH.md`, `docs/audit/10-PAYROLL-CALCULATION-METHODOLOGY.md`.
- Verification executed after this change: `go test ./...` — PASS; `go vet ./...` — PASS with non-fatal global Go stat-cache access warning; `go build ./...` — PASS; `npm.cmd run build:wasm` — PASS with the same warning; `npm.cmd test` — 51/51 PASS including compiled Go/WASM smoke test; `npm.cmd run build` — PASS including PWA `generateSW`.

## Multiple recorded breaks per work shift

- Work records now support an ordered list of non-overlapping break intervals, validate each interval against actual/effective shift bounds, and cap total recorded breaks at 720 minutes. They keep `breakStart`/`breakEnd` aliases for the first interval so existing records and consumers remain readable. Old records that only have one break are loaded into the editor without a migration.
- Schedule entry and correction forms can add/remove multiple break rows. Go/WASM excludes all intervals from its informational minute classification; no overtime or premium amount is inferred.
- Tests cover two persisted breaks, overlap rejection, and a compiled-WASM shift with separate daytime and nighttime pauses. Verification executed: `npm.cmd test` — 51/51 PASS; `npm.cmd run build` — PASS (Vite + PWA); `git diff --check` — PASS with existing LF/CRLF notices. Interactive visual review remains pending because browser automation is unavailable.

## Payroll period and payment-date separation

- A settlement now records the worked period, cutoff date, summary/settlement creation timestamp, optional expected payment date, and actual receipt date separately. The form validates that cutoff is not before the worked period and expected payment is not before cutoff.
- Existing saved settlements keep their original fields and remain readable. Actual payment still requires a separate receipt confirmation and ledger posting; an expected date or saved summary does not affect balances.
- Verification executed: `npm.cmd test` — 51/51 PASS, including independent cutoff/expected-date checks; `npm.cmd run build` — PASS (Vite + PWA); `git diff --check` — PASS with existing line-ending notices.
