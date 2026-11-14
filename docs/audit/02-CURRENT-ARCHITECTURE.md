# Arquitectura actual verificada en código

## Ruta activa observada

```text
Usuario
  → React/Vite PWA (`frontend/src/main.jsx`)
  → VaultGate selecciona/crea archivo .fdv
  → Web Crypto descifra FDV1 en memoria (`vault/crypto.js`)
  → VaultContext mantiene estado React y contraseña en referencia
  → React/JS presenta y muta estado; Go/WASM se carga localmente para análisis
  → guardar vuelve a cifrar y descarga/actualiza el archivo
  → lock limpia estado activo y referencia de contraseña
```

La configuración Vite produce manifiesto y service worker Workbox; `vercel.json` publica la salida del frontend. El repositorio no contiene un servicio de sincronización de la bóveda.

## Entrada y navegación

`frontend/src/main.jsx` instancia `VaultProvider` y `VaultGate`. La variable `VITE_FINANCIAL_VAULT_ENABLED` no cambia el comportamiento: ambas ramas retornan los mismos componentes. El `App` usa estado local `active` y una cadena de condiciones para renderizar secciones. No se observó router ni deep linking.

## Persistencia

La fuente de datos de la UI activa es el objeto normalizado que vive en estado React. Crear/abrir/guardar pasa por `VaultContext`. No se halló persistencia financiera en localStorage, sessionStorage o IndexedDB en `frontend/src/vault`; sí se observa sessionStorage para tokens de autenticación en helper legado `frontend/src/auth.js`, actualmente no conectado desde el entrypoint.

## Motor local Go/WASM

`frontend/src/vault/goEngine.js` carga `/wasm/wasm_exec.js` y `/wasm/financial-engine.wasm`; pasa JSON a `FinancialEngine.calculate`. `cmd/financial-engine-wasm/main.go` expone `calculate` a JS. `internal/engine` analiza cuentas, transacciones, presupuestos, metas, deudas, activos y pasivos. No implementa Payroll. El dashboard recoge el resultado para informar estado de WASM, pero según comentario explícito usa funciones JS para totales y patrimonio porque el esquema Go es anterior a integraciones de deuda/cuentas.

## Backend legado

`cmd/api` y `internal/app` configuran HTTP, Firebase Admin, autenticador y repositorios Firestore; con Firebase desactivado existe memoria volátil. Endpoints API incluyen Payroll. Sus datos se guardan bajo `users/{ownerId}/...`. Esta ruta no forma parte del flujo de `main.jsx` y contradice la persistencia local-first si se reutiliza para salarios/contratos personales.

## PWA / offline

`frontend/vite.config.js` usa `VitePWA`, `registerType: autoUpdate`, manifest `es-CO`, cachés Workbox y límite de tamaño de precache de 10 MiB. No hay código de sincronización offline ni base de datos local. El shell puede precargarse según el build, pero la bóveda requiere seleccionar el archivo. La actualización automática debe revisarse frente a estado `dirty`.

## Evidencia y limitaciones

- Fuente activa y lifecycle: `frontend/src/main.jsx`, `frontend/src/vault/VaultGate.jsx`, `VaultContext.jsx`, `crypto.js`.
- Frontend: `frontend/src/App.jsx`, `frontend/src/vault/finance.js`.
- Motor: `internal/engine/engine.go`, `cmd/financial-engine-wasm/main.go`, `goEngine.js`.
- Backend antiguo: `internal/app/server.go`, `internal/persistence/firestore/`, `firebase/`.
- Documentación de ruta activa: `docs/03-ARCHITECTURE.md`, `docs/08-SECURITY.md`.

El análisis fue estático; no se verificó una sesión de navegador, service worker instalado o configuración de producción.
