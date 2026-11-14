# Registro de decisiones para aprobación del propietario

**Estado de todas las decisiones:** PROPUESTAS — no aprobadas en Phase 0.

## DEC-001 — Persistencia Payroll personal

**Problema:** backend legado escribe Payroll a Firestore.  
**Situación:** la PWA activa usa `.fdv`; el CRUD Go existe pero no está conectado.  
**Propuesta:** mantener nómina personal dentro de la bóveda local cifrada.  
**Alternativas:** reactivar Firestore o servicio remoto; ambas requieren cambiar explícitamente la privacidad.  
**Justificación:** conserva propiedad local y frontera ya documentada.  
**Afectados:** `frontend/src/vault/*`, modelos y el legado `internal/persistence/firestore/payroll.go`.  
**Impacto financiero/seguridad:** alto; define dónde residen salarios y contratos.  
**Migración/rollback:** no migrar registros Firestore automáticamente; si se aprueba servicio futuro, export/import cifrado y plan de retiro.  
**Aprobación requerida:** SÍ.

## DEC-002 — Motor de cálculo

**Problema:** elegir dueño del cálculo legal Payroll.  
**Situación:** Go/WASM existe, sin reglas de nómina; dashboard también usa JS.  
**Propuesta:** Go puro como dominio determinista, Go/WASM en navegador.  
**Alternativas:** JavaScript puro o API remota.  
**Justificación:** reutiliza motor local y separa cálculo de UI, sujeto a corrección de precisión/paridad.  
**Afectados:** `internal/engine`, `cmd/financial-engine-wasm`, frontend DTO.  
**Impacto:** crítico en exactitud; reduce exposición si se mantiene local.  
**Migración/rollback:** introducir versión nueva paralela a cálculos existentes hasta paridad; rollback por versión.  
**Aprobación requerida:** SÍ.

## DEC-003 — Extensión de esquema Vault

**Problema:** schema 1 no incluye Payroll ni migraciones.  
**Propuesta:** versionar contrato/turnos/liquidaciones y migrar desde v1 sin pérdida.  
**Alternativas:** archivo Payroll separado o base de datos; aumentan complejidad/dispersión.  
**Afectados:** `crypto.js`, `finance.js`, `VaultContext.jsx`.  
**Impacto:** afecta datos financieros y recuperación.  
**Migración/rollback:** copia cifrada previa, migración idempotente y posibilidad de abrir versión anterior.  
**Aprobación requerida:** SÍ.

## DEC-004 — Extracción/OCR documental

**Problema:** contrato PDF/DOCX/escaneado requiere parser y OCR.  
**Propuesta:** procesamiento local; extracción como propuesta, confirmación por campo y no persistir originales por defecto.  
**Alternativas:** OCR/AI remoto o solo entrada manual.  
**Justificación:** privacidad; IA externa implica transferencia sensible.  
**Afectados:** UI/importador, dependencias, payload Vault.  
**Impacto:** alto en PII; costos/peso si nueva dependencia.  
**Migración/rollback:** manual siempre disponible; OCR aislado y opcional.  
**Aprobación requerida:** SÍ.

## DEC-005 — Identidad visual

**Problema:** dueño insatisfecho con la experiencia actual.  
**Propuesta:** Graphite Aurora oscuro con violeta/cian y verde semántico.  
**Alternativas:** Midnight Finance, Obsidian Spectrum.  
**Afectados:** tokens, tipografía, navegación, dashboard y componentes.  
**Impacto:** sin efecto financiero; alto efecto de producto/accesibilidad.  
**Rollback:** mantener tokens actuales en rama de diseño antes del despliegue.  
**Aprobación requerida:** SÍ.

## DEC-006 — Navegación y organización UI

**Problema:** `App.jsx` concentra módulos y navegación no tiene URL.  
**Propuesta:** extracción gradual y rutas para Inicio, Movimientos, Planificación, Patrimonio y Trabajo.  
**Alternativas:** conservar navegación local y extraer solo componentes.  
**Impacto:** puede afectar accesos y mobile workflows.  
**Migración/rollback:** rutas con compatibilidad/redirect internos y verificación de cada pantalla.  
**Aprobación requerida:** SÍ.

## DEC-007 — Precisión y unidad COP

**Problema:** frontend escala cantidades por 100 aunque formatea COP sin decimales.  
**Propuesta:** usar pesos enteros y fórmulas racionales con redondeo explícito por regla.  
**Alternativas:** mantener escala 100 universal con política explícita.  
**Impacto:** crítico en pagos históricos y nómina.  
**Migración/rollback:** no transformar registros existentes hasta definir si la escala actual es representación canónica.  
**Aprobación requerida:** SÍ.

## DEC-008 — Revisión legal

**Problema:** interpretación laboral compleja y transitoria.  
**Propuesta:** aprobación de reglas y casos por profesional laboral/contable antes de mostrar liquidación como confiable.  
**Alternativas:** calculadora orientativa claramente limitada; no publicitar cumplimiento.  
**Afectados:** ruleset, textos, QA.  
**Impacto:** crítico en exactitud y confianza.  
**Aprobación requerida:** SÍ.
