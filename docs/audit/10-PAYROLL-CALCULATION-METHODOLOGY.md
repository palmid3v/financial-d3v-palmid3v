# Metodología propuesta para cálculos Payroll

**No hay metodología Payroll implementada en la ruta activa.** Este documento define qué debe diseñarse y comprobarse antes de escribir código de cálculo.

## Pipeline determinista

1. Validar contrato confirmado y vigente para cada fecha del periodo.
2. Validar entradas de jornada, pausas y novedades con zona `America/Bogota`.
3. Dividir turnos en segmentos de clasificación (fecha local, día/noche, descanso pactado/festivo, ordinario/extra), preservando origen.
4. Seleccionar regla efectiva en la fecha de cada intervalo y sus condiciones.
5. Calcular unidades monetarias con aritmética exacta y política de redondeo versionada.
6. Agregar componentes sin doble conteo y producir explicación por intervalo/concepto.
7. Guardar snapshot reproducible y distinguir devengado, liquidado, esperado y recibido.

## Entradas mínimas

Contrato/versiones salariales, tipo y condiciones; fechas y periodo/corte; turnos pactados y reales; pausas; descanso obligatorio acordado; calendario de festivos versionado; novedades; deducciones confirmadas y reglas vigentes. Falta de un dato requerido produce error/advertencia explícita, no inferencia silenciosa.

## Salidas requeridas

Equivalente horario/diario/semanal/quincenal/mensual con fórmula mostrada; ordinario; tiempo extra; nocturnidad; descanso/festivo; auxilio; otros ingresos; deducciones clasificadas; bruto; neto estimado. No todos estos valores son intercambiables: denominadores, bases y elegibilidad se seleccionan por regla y contrato, no por conversión UI.

## Exactitud numérica

- Dinero como enteros (unidad COP aprobada) con suma/producto comprobados.
- Porcentajes como fracción exacta o entero escalado; evitar `float64` monetario.
- Documentar cada división y redondeo; no redondear horas de manera implícita.
- Comprobar límites int64 y dividir de forma que no desborde antes del resultado.
- Formatear COP de forma consistente con el valor interno.

## No doble conteo

Representar cada intervalo trabajado una sola vez con atributos de clasificación. Resolver reglas de exclusividad/combinación consultando norma y revisión laboral; no apilar automáticamente recargos de hora extra, noche, domingo y festivo. Mostrar componentes incluidos/excluidos y regla que lo decidió.

## Historial reproducible

Persistir contrato/versiones, registro horario, regla(s), fuente legal, versión de motor, metodología/redondeo, timestamp, zona, entradas y desglose. Reproducir resultados con los mismos datos de entrada debe ser exacto. Nueva interpretación normativa crea comparación nueva, no sobrescribe el cálculo original.

## Condiciones para liberar un cálculo

Pruebas aprobadas por asesor laboral en casos ordinarios, jornada con cruce nocturno, descanso semanal que no coincide con domingo, festivo, horas extra, superposición, cambios salariales, ausencias, auxilio elegible/no elegible, redondeos y corte quincenal. Debe existir fuente legal y condición para cada concepto. En ausencia de verificación, mostrar incertidumbre y bloquear certificación/afirmación de cumplimiento.
