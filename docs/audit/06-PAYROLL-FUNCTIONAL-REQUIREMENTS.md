# Requisitos funcionales propuestos para Payroll

**Estado:** propuesta de análisis, no implementación ni aprobación de cálculo legal.

## Perfil inicial

Colombia; COP; contrato indefinido; horario variable; pagos esperados los días 5 y 20, configurables por empleador; vistas diaria, semanal, quincenal y mensual. La frecuencia de visualización no altera el periodo efectivamente laborado ni las reglas legales. Deben admitirse futuros tipos contractuales sin imponerlos al contrato inicial.

## Espacios de trabajo

1. **Resumen Payroll:** contrato activo, próximo corte/pago esperado, estimación identificada como tal, últimas liquidaciones y alertas pendientes.
2. **Perfil laboral:** persona y empleador con minimización de datos personales.
3. **Contratos:** crear manualmente o importar PDF/DOCX/PDF escaneado, mostrar valores extraídos con página/ubicación, confianza y validación; toda activación exige confirmación explícita del usuario.
4. **Turnos y novedades:** horario programado, turno real, pausa, cruce de medianoche, descanso ordinario/pactado, horas trabajadas, extras, ausencias, incapacidad, permiso/licencia y cambio de turno.
5. **Liquidación:** seleccionar contrato/periodo/corte; explicar cada concepto y su fuente; nunca dejar que IA determine importes.
6. **Calendario:** periodo trabajado, cutoff, settlement, fecha esperada y fecha real independientes; 5/20 predeterminados pero configurables. Calendario de festivos con país/año/fuente y regla de ajuste configurable; no desplazar automáticamente a día hábil.
7. **Desprendibles:** carga local, extracción supervisada y comparación contra valor esperado. Diferencias son alertas a revisar, no una conclusión automática de ilegalidad.
8. **Reglas e informes:** regla aplicada, fuente oficial, vigencia, excepciones conocidas, estado de revisión y export/reproducción local.

## Contratos y extracción

Cada campo extraído tiene `value`, `sourceDocumentId`, `page/anchor`, `confidence`, `validationStatus`, `confirmedByUserAt`. Valores ausentes permanecen ausentes y bloquean cálculos que dependan de ellos. AI/OCR propone campos; no inventa ni sustituye confirmación. El original no se conserva por defecto. PDF.js cubre sólo PDF con texto; DOCX requerirá parser local aprobado; OCR local debe evaluarse por idioma/calidad/privacidad.

## Variable de jornada

Separar horario planificado de asistencia real. Cada tramo conserva inicio/fin y zona horaria `America/Bogota`; permitir más de un tramo por día y cruces de fecha. Pausas remuneradas/no remuneradas deben declararse, no inferirse. La clasificación nocturna, dominical, festiva, extra o de descanso es resultado del motor de reglas versionadas y condiciones contractuales/laborales confirmadas.

## Reconciliación

Comparar por concepto, permitir asignación manual cuando el desprendible tenga etiquetas diferentes, mostrar fuente y redondeo, reconocer ajustes/anticipos/descuentos no modelados y dejar estado «sin resolver». No acusar incumplimiento. Toda corrección genera revisión/historial, no modifica silenciosamente la liquidación original.

## Requisitos de aceptación funcional

- No se activa un contrato con campos requeridos extraídos sin confirmar.
- Proyección, devengado, liquidado y recibido nunca se confunden.
- Cada liquidación puede repetirse con los mismos snapshots y produce el mismo resultado.
- Fechas de periodo, corte, liquidación y pago se ven por separado.
- Reconciliación conserva tanto el resultado calculado como los valores del desprendible.
- Una transacción de ingreso sólo se crea tras confirmar recepción; un settlement no puede originar dos transacciones.
- Formularios accesibles, escritorio/móvil y estados claros de error/carga/vacío.

## Prioridad

P0: perfil/contrato confirmado, reglas trazables, historial reproducible, segregación de estados y precisión monetaria. P1: importación local y conciliación. P2: OCR, formatos múltiples y automatizaciones posteriores.
