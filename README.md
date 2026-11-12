# 💰 𝐅𝐢𝐧𝐚𝐧𝐜𝐢𝐚𝐥-𝐃𝟑𝐕 — Finanzas personales privadas

> **PALMI-D3V** · Finanzas personales y aprendizaje financiero con bóveda cifrada local.

## 🎯 Producto
Financial-D3v permite registrar, comprender y planificar finanzas personales bajo control de la persona usuaria. Su fuente persistente es un archivo de bóveda `.fdv` cifrado; no es el libro contable de Sandwichies ni un backend financiero compartido.

## ✨ Capacidades y base técnica
- Dashboard, flujo de caja, cuentas, movimientos y transferencias.
- Importación bancaria local por lotes (primera entrega CSV; parser PDF/OCR pendiente de Fase 32.2).
- Presupuestos, metas de ahorro, deudas, activos, pasivos y patrimonio neto.
- Educación e informes financieros.
- Bóveda FDV1 cifrada con PBKDF2-SHA256 y AES-256-GCM.
- Datos descifrados solo en memoria mientras la bóveda está abierta.
- Cálculos locales mediante Go/WebAssembly.
- React, Vite, Tailwind CSS, PWA/Workbox y despliegue web HTTPS.
- Stack/versiones exactas: consultar `frontend/package.json` y scripts de `scripts/`.

## 📊 Estado del proyecto
**Fases documentadas: 31 de 31 fases aprobadas/implementadas; Fase 32 planificada.** Esto representa el cierre de la línea fundacional documentada, no el 100% del producto ni la validación de todos los flujos manuales.

**Checkpoint histórico:** 10/10 pruebas frontend, build, WASM, auditoría fuente de seguridad, tests/build Go aprobados; desbloqueo móvil HTTPS probado el 2026-10-18. El ciclo manual guardar → bloquear → reabrir y reconciliación de cambios de cuentas/ledger seguían pendientes en el último contexto. No son pruebas recién ejecutadas.

## 🧭 Evolución de producto
1. Fases 1–31: base local-first, bóveda, cálculos y fundamentos de privacidad.
2. Fase 32 planificada: Historical Financial Intelligence.
3. Cualquier integración con otras aplicaciones debe intercambiar únicamente datos comerciales agregados/no personales y solo mediante contrato explícito; nunca transferir plaintext financiero de la bóveda.

## 🔒 Seguridad y límite de release
- FDV1 usa PBKDF2-SHA256 (600.000 iteraciones) y AES-256-GCM (tag de 128 bits), con salt e IV aleatorios.
- La contraseña y el estado financiero descifrado permanecen en memoria; bloqueo/auto-lock limpia el estado activo.
- Auto-lock documentado: 15 minutos de inactividad.
- No persistir intencionalmente plaintext financiero en localStorage, sessionStorage, IndexedDB, Firebase/Firestore, Vercel, GitHub ni API Go remota.
- Firebase Auth, si se usa, es identidad no financiera; nunca es clave de cifrado.
- Dinero en unidades menores enteras + moneda; transferencias no son gastos; solo principal reduce saldo de deuda; patrimonio = activos − pasivos.
- Este diseño es seguridad a nivel de aplicación, no auditoría externa formal.
- La recuperación depende del archivo cifrado y su contraseña. No existe recuperación de contraseña.

## 🧪 Desarrollo local
Desde `frontend/`:

```powershell
npm install
npm run dev
npm test
npm run build:wasm
npm run build
```

Validación ampliada desde la raíz:

```powershell
.\scripts\validate.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\security-audit.ps1
```

Web Crypto requiere contexto seguro HTTPS en escenarios móviles; revisar runtime y despliegue antes de validar dispositivos.

## 📚 Documentación clave
- `CONTEXT.md` — arquitectura, invariantes y continuidad.
- `docs/README.md` — índice documental.
- `docs/13-ROADMAP.md` — fases.
- `docs/08-SECURITY.md` — privacidad y bóveda.
- `docs/OPERATIONS-RUNBOOK.md` — operación y recuperación.
- `STEP-BY-STEP-FINANCIAL-D3V-2026-10-05.md` — historial de ejecución.

## 🤝 Identidad
**Financial-D3v · PALMI-D3V** — *Build · Create · Improve · Validate.*

Financial-D3v es dueño de las finanzas personales privadas. La bóveda cifrada local es la fuente de verdad; otras aplicaciones no reciben sus datos financieros descifrados.
