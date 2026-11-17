# Financial-D3V

**Financial-D3V** es una aplicación privada de finanzas personales y aprendizaje financiero. Permite registrar y comprender ingresos, gastos, cuentas, transferencias, presupuestos, ahorro, deudas y patrimonio, manteniendo los datos financieros bajo control local mediante una bóveda cifrada.

Su principio central es **local-first y privacy-first**: la bóveda cifrada `.fdv` es la fuente de persistencia financiera, y los datos descifrados solo permanecen en memoria mientras la bóveda está abierta.

## Producto

- **Dashboard y flujo de caja:** consulta de saldos, entradas, salidas y evolución financiera.
- **Cuentas y movimientos:** registro de ingresos, gastos y transferencias entre cuentas.
- **Presupuestos y ahorro:** seguimiento de presupuestos y metas.
- **Deudas y patrimonio:** registro de obligaciones, activos, pasivos y patrimonio neto.
- **Importación de extractos:** herramientas locales de importación por lotes para extractos bancarios compatibles; la disponibilidad de formatos concretos depende del estado de la fase de importación documentada.
- **Informes y educación:** reportes y explicaciones para apoyar la comprensión de conceptos financieros.

Las reglas del dominio distinguen transferencias de gastos, calculan el patrimonio como activos menos pasivos y separan el abono a capital de intereses y cargos en pagos de deuda.

## Privacidad y bóveda

La bóveda FDV1 utiliza PBKDF2-SHA256 con 600.000 iteraciones y AES-256-GCM con salt e IV aleatorios. La contraseña y el estado financiero descifrado permanecen en memoria mientras la sesión está desbloqueada. El bloqueo y el auto-bloqueo documentado después de 15 minutos limpian el estado activo.

La persistencia de los registros financieros se realiza mediante archivos cifrados controlados por la persona usuaria. El diseño no contempla almacenar intencionalmente datos financieros descifrados en servicios remotos, almacenamiento web persistente o registros de telemetría. La recuperación depende del archivo `.fdv` y su contraseña: no existe un servicio de recuperación de contraseña.

Este diseño describe controles de aplicación; no equivale a una auditoría externa o certificación de seguridad.

## Arquitectura y tecnologías

La interfaz está construida con **React**, **Vite** y **Tailwind CSS**, con capacidades PWA. Los cálculos financieros locales se ejecutan mediante un motor **Go 1.27 compilado a WebAssembly**. La aplicación activa se sirve como frontend web HTTPS; la arquitectura Go REST/Firestore presente en el historial del repositorio es legado y no es la ruta activa de persistencia financiera.

Los scripts de validación, pruebas frontend, construcción WASM y pruebas Go están en el repositorio. Consulta `frontend/package.json`, `go.mod` y `scripts/` para las dependencias y herramientas exactas.

## Separación dentro de PALMI-D3V

Financial-D3V conserva la autoridad sobre las finanzas personales privadas. No comparte bóvedas, contraseñas, claves, extractos ni datos financieros descifrados con Sandwichies, Cupboard o DayFlow.

La decisión arquitectónica para una futura modalidad Business define bóvedas Personal y Business independientes y eventos comerciales minimizados. Esa integración está aceptada como arquitectura, pero su implementación no se considera disponible hasta completar desarrollo, validación y autorización explícita.

## Desarrollo

La interfaz está en `frontend/`. Desde esa carpeta instala dependencias y utiliza los scripts disponibles para ejecutar Vite, pruebas y build. La construcción del motor WebAssembly y las validaciones ampliadas se gestionan mediante los scripts de la raíz.

Para pruebas de runtime con Web Crypto, utiliza un contexto HTTPS seguro cuando corresponda. No uses datos financieros reales en pruebas automatizadas ni compartas archivos de bóveda.

## Documentación

- [Índice de documentación](docs/README.md)
- [Contexto y arquitectura vigente](CONTEXT.md)
- [Seguridad y modelo de bóveda](docs/08-SECURITY.md)
- [Roadmap](docs/13-ROADMAP.md)
- [Reglas financieras](docs/07-FINANCIAL-RULES.md)
- [Runbook de operación y recuperación](docs/OPERATIONS-RUNBOOK.md)
- [Checkpoint de calidad](QUALITY-CHECKPOINT-2026-11-12.md)
- [ADR-034: Business Finance](docs/34-PALMI-ECOSYSTEM-BUSINESS-FINANCE-ADR.md)

## Repositorio y despliegue

<<<<<<< HEAD
The existing Personal vault privacy boundary remains unchanged.

## Current engineering execution status

Payroll foundations and the local visual direction are under active implementation. Verified scope, tests, limitations and remaining release gates are tracked in [the execution status report](docs/audit/18-EXECUTION-STATUS.md). This feature is not a legally certified Colombian payroll calculator.
=======
- Repositorio: [palmid3v/financial-d3v-palmid3v](https://github.com/palmid3v/financial-d3v-palmid3v)
- Sitio web: [financiald3v.vercel.app](https://financiald3v.vercel.app)

La disponibilidad del sitio no sustituye la comprobación de los flujos locales de guardar, bloquear, reabrir y reconciliar datos.

---

**Financial-D3V · PALMI-D3V**  
*Build · Create · Improve · Validate.*
>>>>>>> c5fe74c285d151c9ba2ba2d607363679edacab76
