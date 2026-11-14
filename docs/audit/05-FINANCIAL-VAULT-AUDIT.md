# Auditoría de Financial Vault

## Implementación FDV1

`frontend/src/vault/crypto.js` cifra JSON serializado con Web Crypto: PBKDF2-SHA256, 600.000 iteraciones, sal aleatoria de 16 bytes, AES-256-GCM, IV de 12 bytes y tag de 128 bits. Metadatos criptográficos relevantes se usan como AAD. El envelope incluye formato/versión, KDF, cipher y payload Base64.

## Ciclo implementado

```text
LOCKED
 → seleccionar/crear archivo + contraseña
 → parsear envelope, validar parámetros, derivar key y autenticar/descifrar
 → normalizar en memoria React; contraseña en passwordRef
 → updateVault marca dirty
 → sealVault y descarga o escritura del mismo archivo
 → lock/timeout limpia estado y passwordRef
```

`VaultGate.jsx` admite selector tradicional y `showOpenFilePicker`. `VaultContext.jsx` no persiste datos financieros en almacenamiento del navegador. El archivo original no se sube. Crear archivo también descarga la versión vacía cifrada.

## Controles observados

- Rechaza formato/versión, parámetros criptográficos no soportados, payload inválido y autenticación incorrecta/manipulada.
- Guardado re-cifra con sal/IV nuevos.
- Bloqueo manual consulta si hay cambios sin guardar; bloquear limpia el estado.
- Auto-lock nominal de 15 minutos y eventos de actividad.
- La actualización requiere permiso de escritura si se usa File System Access API; si no, se descarga copia.
- La recuperación depende del archivo y contraseña; no hay recuperación de contraseña.

## Brechas y riesgos

1. **Auto-lock diferido con dirty:** una sesión modificada nunca se bloquea automáticamente hasta que se limpia `dirty`; el timer se posterga un minuto repetidamente. Incompatible con un límite duro de sesión si se interpreta como requisito de seguridad.
2. **Actualización PWA:** `registerType: autoUpdate` no coordina con dirty; posible pérdida de estado en memoria.
3. **Validación del payload:** `openVault` verifica objeto y `schemaVersion === 1`, no campos completos, tamaños o invariantes dominio. Payroll requiere validación detallada y límites para archivos grandes.
4. **Migraciones:** actualmente solo schema 1 y no hay marco general de migración versionada para nuevas entidades Payroll.
5. **Memoria JS:** poner React state a null y passwordRef a null no garantiza borrado seguro de copias, strings, closures o memoria del runtime.
6. **Integridad:** AES-GCM autentica ciphertext y AAD; no existe una firma externa, backup versionado o reparación parcial. Daño/perdida de archivo más contraseña perdida implica pérdida de datos.
7. **Backup y conflicto:** export manual y overwrite del File System Access pueden producir archivos paralelos o reemplazar el original; el flujo de recuperación necesita validación continua.

## Integración Payroll requerida

- Reusar cifrado envelope, no Firestore/API ni almacenamiento web para contratos o nóminas personales.
- Agregar migración explícita de payload con conservación de campos desconocidos o estrategia de round-trip probada.
- Guardar sólo metadatos/documentos necesarios; por defecto eliminar original temporal tras extracción/confirmación.
- Guardar snapshot de contrato, rule set, work records, redondeo, versión de engine y resultados para reproducibilidad.
- Evitar updates silenciosos en app con datos sucios; acordar política de bloqueo/guardado.

## Estado

**KEEP** cifrado y persistencia local. **MEJORAR** auto-lock/update y validación de schema. **EXTENDER** migraciones antes de agregar Payroll. No se hicieron cambios ni se ejecutó auditoría criptográfica externa.
