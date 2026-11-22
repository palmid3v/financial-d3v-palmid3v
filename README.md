# 💸 Financial-D3V

**Financial-D3V** es una aplicación privada de finanzas personales y aprendizaje financiero. Está diseñada para ayudarte a registrar, comprender y planificar tu vida financiera sin entregar el control de tus datos a un servicio remoto.

> 🔐 **Local-first · Privacy-first**  
> Tu archivo cifrado `.fdv` es la frontera de persistencia. Los datos financieros descifrados permanecen en memoria mientras la bóveda está desbloqueada.

<p align="center">
  <strong>Build · Create · Improve · Validate</strong><br/>
  <em>PALMI-D3V · Private Finance</em>
</p>

---

## ✨ ¿Qué puedes hacer?

- 📊 **Dashboard financiero:** consulta saldos, flujo de caja, ingresos, gastos y evolución.
- 💳 **Cuentas y movimientos:** registra ingresos, gastos y transferencias entre tus cuentas.
- 🎯 **Presupuestos y metas:** organiza límites de gasto y sigue objetivos de ahorro.
- 🧾 **Deudas y patrimonio:** controla obligaciones, activos, pasivos y patrimonio neto.
- 📥 **Importación de extractos:** herramientas locales para procesar extractos bancarios compatibles; consulta el roadmap para conocer el alcance validado de cada formato.
- 📈 **Informes:** revisa la actividad y entiende mejor tus hábitos financieros.
- 📚 **Educación financiera:** consulta explicaciones y conceptos para tomar decisiones informadas.
- 🧮 **Payroll workspace:** espacio de trabajo local para perfiles, registros de jornada, liquidaciones informativas, soportes y revisión de comprobantes. Sus cálculos tienen límites explícitos y requieren revisión profesional; no es una calculadora legal certificada.

### 🧭 Reglas financieras importantes

- Las transferencias internas no se contabilizan como ingresos ni gastos.
- Las aportaciones a metas de ahorro no se tratan como gastos ordinarios.
- Los pagos de deuda separan capital, intereses y cargos; solo el capital reduce el saldo adeudado.
- El patrimonio neto se calcula como activos menos pasivos.
- Los importes del dominio financiero utilizan unidades monetarias enteras y una moneda explícita.

---

## 🔐 Privacidad y bóveda cifrada

Financial-D3V utiliza una bóveda versionada **FDV1**:

- 🔑 Derivación de clave con **PBKDF2-SHA256 (600.000 iteraciones)**.
- 🛡️ Cifrado autenticado **AES-256-GCM**.
- 🎲 Salt e IV aleatorios por bóveda.
- 🧠 La contraseña y los datos descifrados permanecen en memoria durante la sesión desbloqueada.
- ⏱️ Bloqueo automático documentado tras 15 minutos de inactividad. Si existen cambios sin guardar, el auto-bloqueo se aplaza para no descartar trabajo silenciosamente.
- 📁 El archivo cifrado `.fdv` permanece bajo control de la persona usuaria.

### 🚪 Acceso a la bóveda

La pantalla de acceso ofrece dos rutas de selección:

1. **Browse device:** abre el selector nativo de archivos del navegador, pensado para escritorio y dispositivos móviles.
2. **System file picker:** utiliza File System Access API cuando el navegador la admite; si no está disponible o falla, recurre al selector nativo.

El selector permite explorar archivos aunque el dispositivo no filtre correctamente la extensión `.fdv`; el contenido se valida al intentar desbloquear la bóveda. La pantalla de acceso tiene diseño responsive y tipografía Comic Sans MS con alternativas del sistema.

> ⚠️ **Importante:** la recuperación requiere el archivo `.fdv` y su contraseña. La aplicación no ofrece recuperación de contraseñas. Conserva copias seguras del archivo y no compartas bóvedas ni credenciales.

Este modelo describe controles de la aplicación; no constituye una auditoría externa ni una certificación de seguridad.

---

## 🧱 Arquitectura y tecnologías

```text
Vercel HTTPS
    │
    ▼
React + Vite + Tailwind CSS + PWA
    │
    ▼
Bóveda FDV1 cifrada (.fdv)
    │
    ▼
Estado financiero descifrado en memoria
    │
    ▼
Motor financiero local Go → WebAssembly
```

| Capa | Tecnología / responsabilidad |
|---|---|
| Interfaz | ⚛️ React |
| Desarrollo y build frontend | ⚡ Vite |
| Estilos | 🎨 Tailwind CSS + CSS del proyecto |
| Experiencia instalable | 📲 PWA / Workbox |
| Cifrado de bóveda | 🔐 Web Crypto API |
| Motor de cálculos | 🐹 Go 1.27 compilado a WebAssembly |
| Hosting web | ▲ Vercel |
| Pruebas | 🧪 Node.js Test Runner y pruebas Go |

El frontend activo se encuentra en `frontend/`. El motor y sus pruebas Go están en `internal/`; los scripts de construcción y validación están en `scripts/`.

**Nota de arquitectura:** los componentes históricos Go REST, Firebase/Firestore y persistencia financiera cloud se conservan para trazabilidad, pero no son la ruta activa de persistencia de la bóveda personal.

---

## 🛠️ Desarrollo local

### Requisitos

- Node.js y npm compatibles con las versiones de Vite del proyecto.
- Go 1.27 para trabajar con el motor financiero.
- Navegador moderno con Web Crypto API.
- Un contexto seguro HTTPS para validar funcionalidades criptográficas en runtime cuando corresponda.

### Instalar dependencias

Desde la raíz del repositorio:

```bash
cd frontend
npm install
```

### Ejecutar frontend

```bash
npm run dev
```

### Pruebas y build

Desde `frontend/`:

```bash
npm test
npm run build
```

### Construir el motor WebAssembly

Desde `frontend/`:

```bash
npm run build:wasm
```

Scripts disponibles en `frontend/package.json`:

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción frontend |
| `npm run preview` | Vista previa del build |
| `npm test` | Pruebas de bóveda, finanzas y Payroll |
| `npm run test:vault` | Pruebas de cifrado y bóveda |
| `npm run test:finance` | Pruebas de reglas financieras |
| `npm run test:payroll` | Pruebas del workspace Payroll |
| `npm run build:wasm` | Construcción del motor financiero WASM |

No uses datos financieros reales en pruebas automatizadas. Para pruebas de apertura, guardado y recuperación utiliza bóvedas de prueba.

---

## 🧾 Payroll: alcance y límites

El workspace Payroll amplía el modelo local de la bóveda y conserva compatibilidad con los datos anteriores mediante migración de esquema.

Incluye herramientas para perfiles/contratos, jornadas, liquidaciones informativas, recibos, referencias de comprobantes y soportes. La extracción local de documentos puede sugerir datos, pero las sugerencias requieren confirmación humana. Solo un recibo confirmado crea un movimiento de ingreso.

Los cálculos informativos de aportes tienen un alcance limitado a los supuestos documentados. No cubren todos los regímenes, novedades, horas extra, prestaciones o transiciones individuales. Las liquidaciones guardadas son estimaciones ingresadas/revisadas por el usuario y no sustituyen asesoría profesional ni validación normativa.

Consulta el [estado de ejecución y validación](docs/audit/18-EXECUTION-STATUS.md) para conocer el alcance, las pruebas y los pendientes documentados.

---

## 🧩 Separación del ecosistema PALMI-D3V

Financial-D3V mantiene la autoridad sobre las finanzas personales privadas.

- 🥪 **Sandwichies:** pedidos, pagos y operación comercial.
- 📦 **Cupboard:** inventario y movimientos de existencias.
- 🗓️ **DayFlow:** tareas, recordatorios y planificación.
- 💸 **Financial-D3V:** finanzas personales privadas.

Las aplicaciones no deben compartir bóvedas, contraseñas, claves, extractos ni libros financieros descifrados. La futura modalidad Business contempla bóvedas Personal y Business independientes y eventos comerciales minimizados; su arquitectura está documentada, pero no debe considerarse una funcionalidad disponible hasta completar implementación y validación.

---

## 📚 Documentación del proyecto

- 🗂️ [Índice de documentación](docs/README.md)
- 🧠 [Contexto y arquitectura vigente](CONTEXT.md)
- 🔐 [Seguridad y modelo de bóveda](docs/08-SECURITY.md)
- 🧮 [Reglas financieras](docs/07-FINANCIAL-RULES.md)
- 🗺️ [Roadmap](docs/13-ROADMAP.md)
- 🧰 [Runbook de operación y recuperación](docs/OPERATIONS-RUNBOOK.md)
- 🧪 [Estado de ejecución y validación](docs/audit/18-EXECUTION-STATUS.md)
- 🏗️ [ADR-034 · Business Finance](docs/34-PALMI-ECOSYSTEM-BUSINESS-FINANCE-ADR.md)
- 📌 [Checkpoint de calidad](QUALITY-CHECKPOINT-2026-11-12.md)

Los checkpoints son evidencia fechada: sus resultados no deben interpretarse como una ejecución nueva de pruebas.

---

## 🌐 Repositorio y despliegue

- 💻 **GitHub:** [palmid3v/financial-d3v-palmid3v](https://github.com/palmid3v/financial-d3v-palmid3v)
- 🚀 **Aplicación web:** [financiald3v.vercel.app](https://financiald3v.vercel.app)
- 🌿 **Rama de trabajo solicitada:** `main`

La disponibilidad del sitio no sustituye la validación de los flujos de crear bóveda, abrir, guardar, bloquear, reabrir y reconciliar datos.

---

<p align="center">
  🔐 <strong>Financial-D3V · PALMI-D3V</strong><br/>
  <sub>Build · Create · Improve · Validate.</sub>
</p>
