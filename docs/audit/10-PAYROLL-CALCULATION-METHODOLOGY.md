# Metodología propuesta para cálculos Payroll

**Estado actualizado:** existe cálculo determinista de conceptos confirmados, equivalentes presupuestarios y una estimación acotada de aportes del trabajador para un mes calendario completo. No existe aún una liquidación estatutaria integral. Esta metodología conserva el objetivo de producto y delimita el alcance que sí ejecuta el código.

## Cálculo activo verificado

- Go es la autoridad aritmética; el frontend invoca Go/WASM localmente.
- `CalculateEnteredConcepts` suma conceptos confirmados en pesos enteros y valida que las deducciones no superen el bruto. No deriva recargos ni prestaciones.
- `ProjectContractEquivalents` muestra equivalentes de planeación con su fórmula y redondeo versionado; no son salario horario legal.
- `EstimateEmployeeContributions` estima salud y pensión del trabajador al 4% cada una, más aportes de solidaridad conforme a los umbrales investigados de Ley 797/2003. Exige IBC confirmado y limita el alcance a una persona dependiente, no pensionada, un empleador, sistema general, mes completo y una regla de salario mínimo estable durante el mes.
- La aproximación de cada aporte sigue el múltiplo superior de COP 100 de PILA (Decreto 780/2016, art. 3.2.1.5, modificado por Decreto 1990/2016). El IBC recibido ya debe ser un entero COP y confirmado.
- El resultado es informativo y requiere revisión profesional; no se integra automáticamente a una liquidación ni al ledger. No calcula aportes del empleador, prestaciones, recargos, ausencias, novedad parcial, regímenes especiales ni cumplimiento legal.
- La reforma pensional y su transición no se resuelven para personas concretas. Las fechas de vigencia de la Sentencia C-264-26 se reflejan como límite de catálogo, y el estimador no trata periodos desde 2027.
- Evidencia: `internal/payroll/contributions.go`, `internal/payroll/contributions_test.go`, `cmd/financial-engine-wasm/main.go`, `frontend/src/vault/goEngine.js`, `frontend/src/payroll/PayrollWorkspace.jsx`.

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
