# Inventario del repositorio

**Evidencia de estado:** `git status --short --branch` mostró `main...origin/main` sin cambios locales al inicio. `git log -5 --oneline` mostró commits locales recientes; no se contactó GitHub ni se sincronizó el checkout.

## Estructura observada

| Zona | Rutas | Rol y estado observado |
|---|---|---|
| Aplicación web | `frontend/src/`, `frontend/vite.config.js`, `frontend/package.json` | React/Vite, PWA, pantallas y bóveda; ruta activa. |
| Bóveda y finanzas JS | `frontend/src/vault/` | FDV1, contexto, operaciones financieras, carga WASM y pruebas Node. Persistencia activa local. |
| Importación | `frontend/src/StatementImport.jsx`, `frontend/src/vault/statementImport.js`, `nequiPdf.js` | CSV genérico y parser de PDF con texto Nequi; importación revisada localmente. OCR escaneado no está implementado. |
| Go dominio/API | `cmd/api`, `internal/domain`, `internal/application`, `internal/httpapi` | API personal y dominios Go históricos; hay pruebas unitarias de varios paquetes. |
| Persistencia Go | `internal/persistence/memory`, `internal/persistence/firestore` | Adaptadores API, incluyendo repositorios Payroll Firestore. No son el almacén activo de la PWA. |
| Go/WASM | `internal/engine`, `cmd/financial-engine-wasm`, `scripts/build-financial-engine-wasm.*` | Motor de análisis local. El build genera artefactos bajo `frontend/public/wasm`. |
| Artefactos WASM | `frontend/public/wasm/financial-engine.wasm`, `wasm_exec.js` | Binarios empaquetados; deben corresponder al código fuente y a la versión Go. |
| Firebase/despliegue histórico | `firebase/`, `firebase.json`, `deploy/`, `internal/app/firebase.go` | Configuración de Firestore, contenedores, backups y hosting Firebase; documentación los mantiene por trazabilidad. |
| Vercel | `vercel.json` | Build/publicación del frontend en `frontend/dist`; destino documentado como activo. |
| Docs | `docs/`, `CONTEXT.md`, `README.md`, `QUALITY-CHECKPOINT-2026-11-12.md` | Especificaciones, fases, handoffs, seguridad y checkpoints. Hay diferencias de fecha/estado entre documentos. |
| Archivo histórico | `archive/` | Esquema PostgreSQL inicial y modelo de dominio pre-Phase 1. Conservar mientras su función histórica no se evalúe formalmente. |
| Validación | `scripts/validate.ps1`, `scripts/security-audit.ps1` | Runner puede instalar dependencias y regenerar artefactos; auditoría fuente limitada a `frontend/src/vault`. |

## Configuración y dependencias

- `frontend/package.json` define React, Vite, Tailwind, Vite PWA y `pdfjs-dist`; las dependencias directas usan `latest` en varios casos, aunque `package-lock.json` fija la resolución concreta.
- `go.mod` declara el módulo Go y Firebase/Google Cloud para el backend heredado.
- `vercel.json` ejecuta `npm ci` y `npm run build` desde `frontend`, publica `frontend/dist`.
- `firebase.json` reescribe `/api/**` hacia Cloud Run y sirve la PWA; es configuración histórica respecto a la ruta activa Vercel.

## Pruebas y artefactos

Pruebas observadas: tests JS en `frontend/src/vault/*.test.js`; tests Go en dominio, motor, aplicación, API y repositorios. No se ejecutaron. El runner `scripts/validate.ps1` ejecuta `npm ci`, tests, build, `build:wasm`, auditoría de seguridad y Go test/build; por ello no es una comprobación estrictamente de solo lectura. El script WASM copia `wasm_exec.js` y compila un nuevo binario a `frontend/public/wasm`.

## Componentes antiguos o experimentales

- API/Firestore/Firebase y `archive/postgresql/001_initial_schema.sql`: conservar como historia/alternativa retirada; confirmar consumidores y operación antes de borrar.
- `frontend/src/AuthGate.jsx`, `auth.js`, `api.js`: helpers de identidad/API no importados por el entrypoint activo. `auth.js` guarda tokens Firebase en `sessionStorage`, no el estado financiero; su presencia requiere delimitar su uso y no confundirlo con persistencia de la bóveda.
- `frontend/src/vault/finance.js` y `internal/engine/engine.go`: hay dos motores/reglas de cálculo; no asumir paridad total.
- WASM bajo `frontend/public/wasm`: artefacto generado y potencialmente obsoleto si fuente y binario divergen.

## Prioridad

**P1:** mantener una lista explícita de arquitectura activa e histórica, artefactos generados y entrypoints reales. No se recomienda eliminación en Phase 0.
