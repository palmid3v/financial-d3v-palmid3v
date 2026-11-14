# Seguridad y privacidad

## Activos sensibles

Estado financiero, transacciones, cuenta/saldos, contratos, identidad, salario, horario, ausencias/incapacidades, desprendibles, deducciones y fuente/documentos. Los datos laborales elevan el impacto de acceso indebido y pueden contener identificadores de terceros.

## Controles actuales

- Vault cifrado FDV1; contraseña no es token Firebase.
- Descifrado client-side; solo estado activo en memoria; cifrado antes de export/guardar.
- Security source audit busca almacenamiento/navegación prohibidos únicamente bajo `frontend/src/vault`.
- Importación de extractos se procesa localmente y no guarda archivo fuente en la bóveda, según UI y `docs/32-BANK-STATEMENT-IMPORT.md`.
- Código/API Firestore legado tiene ownership por UID y reglas Firestore, pero el servidor Admin puede omitir reglas; no debe asumirse apropiado para Payroll local.

## Riesgos

| Riesgo | Severidad | Evidencia / tratamiento |
|---|---:|---|
| Auto-lock se difiere mientras `dirty` | Alta | `VaultContext.jsx`; definir límite duro y tratamiento de cambios no guardados. |
| AutoUpdate reinicia app con plaintext en memoria no guardado | Alta | Vite `registerType:autoUpdate`; coordinar activación y estado dirty. |
| Validación payload superficial | Alta | `crypto.js` solo valida schemaVersion superior; validar estructura, tamaños y rangos. |
| Originales OCR/contrato en memoria o logs | Alta | No hay implementación; diseñar vida temporal, manejo de errores y limpieza. |
| Envío a proveedor AI/OCR remoto | Crítica | Prohibido sin aprobación explícita; mantener procesadores locales. |
| Uso accidental de Firestore/REST Payroll | Crítica | CRUD legado persiste salario; aislarlo documental/técnicamente de aplicación activa. |
| Token de autenticación en sessionStorage | Media | `auth.js` legado, actualmente desconectado; evitar incorporar sin threat model. |
| Pérdida/corrupción de archivo/contraseña | Alta | Recuperación depende de ambas; guía de backups y restauración cifrada. |
| Dependencias de parsing de documentos | Alta | PDF.js existe; DOCX/OCR no. Revisar supply chain, licencias, vulnerabilidades y tamaño antes de añadir. |

## Requisitos documentales/OCR

Validar tipo real del archivo, tamaño, cantidad de páginas, memoria y contenido malformado; no ejecutar macros; parsers actualizados y limitados; no cargar documentos a CDN/servicio; revocar Blob URLs; limpiar buffers temporales donde sea posible; no registrar texto sensible; usuario confirma campos. Retención de original debe ser opción explícita cifrada, no default.

## Límites

No es auditoría externa, penetración ni revisión formal criptográfica. La revisión estática no demuestra ausencia absoluta de filtraciones runtime. El histórico de CI no equivale a seguridad certificada.
