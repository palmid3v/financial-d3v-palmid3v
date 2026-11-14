# Propuesta de rediseño visual

**No implementado. Requiere aprobación de identidad, navegación y alcance.** Mantener únicamente tema oscuro.

## Direcciones exploradas

| Dirección | Lenguaje | Ventajas | Riesgo |
|---|---|---|---|
| Graphite Aurora | Grafito, violeta/cian, menta; gradientes focales. | Diferencia notable del verde actual y deja color semántico a positivo/negativo. | Gradientes pueden dominar si se aplican a todas las cards. |
| Midnight Finance | Negro suave, azul refinado, teal apagado y acentos cálidos. | Sobrio y familiar en producto financiero. | Puede sentirse parecido a dashboards genéricos y poco renovado. |
| Obsidian Spectrum | Carbón, violeta/azul; verde solo para positivo. | Semántica financiera clara y aspecto tranquilo. | Cambio menos expresivo si se limita demasiado a neutrales. |

**Recomendación:** Graphite Aurora con acentos discretos; verde exclusivamente para estado favorable/ingreso, rojo para egreso/riesgo. Evitar gradientes como fondo constante. Paleta inicial propuesta: fondo `#0B0D12`, superficie `#121722`, superficie elevada `#192130`, texto `#F1F4FA`, secundario `#A4AEC0`, violeta `#9B8AFB`, cian `#68C8E8`, menta `#62D6B0`, ámbar `#F3BD6A`, rojo `#F07D8A`. Validar contraste en contexto antes de aprobar.

## Tipografía y escala

Preferir Inter o sans de sistema con cifras tabulares. Jerarquía: título página 28–32px escritorio/24 móvil; títulos de sección 18–22; cuerpo 14–16; labels/auxiliares no menores de 12px salvo información secundaria no esencial; montos con tabulares y formato COP consistente.

## Navegación

Rutas conceptuales: `/inicio`, `/movimientos`, `/planificacion` (presupuestos/ahorro/deudas), `/patrimonio`, `/trabajo` (Payroll) y `/ajustes` (bóveda). En móvil, navegación inferior para destinos frecuentes y vista secundaria completa accesible; no esconder acciones de guardar/bloquear. Mantener breadcrumb, título y acciones contextuales. Requiere decisión del dueño porque cambia navegación global.

## Dashboard propuesto

1. Resumen superior: disponible por moneda/cuenta y acción registrar.
2. Flujo real del periodo: entradas, salidas y saldo neto; filtro de periodo evidente.
3. Próximos compromisos: pagos confirmados, fecha esperada, estado pendiente/recibido; nunca inventar calendario.
4. Sección de trabajo: pago Payroll esperado como proyección claramente distinguida.
5. Deuda/ahorro/patrimonio y alertas debajo.
6. Recientes en tabla/lista legible.

## Payroll workspace

Header con empleado/contrato activo, vigencia y próxima fecha esperada. Pestañas Perfil, Contrato, Jornada, Liquidaciones, Calendario y Reconciliación. Pantalla de cálculo con editor de periodo, resumen bruto/deducciones/neto estimado, desglose por concepto, fuentes legales y controles de confirmación. Reconciliación alineada concepto a concepto, diferencia y estado revisión.

## Componentes y animación

Button/Input/Select/DateTime; barra/sidenav; breadcrumb; surface, metric y status; data table; money field; calendar; shift timeline; document evidence row; calculation breakdown; toast/inline alert; dialogs accesibles; skeleton y empty state. Animación breve en navegación/modal/progreso, sin movimiento de montos ni gráficos cada render; respetar reduced motion y rendimiento.

## Accesibilidad/responsive

WCAG AA como meta, foco visible, navegación teclado, landmarks, encabezados ordenados, texto de estado no basado solo en color, labels/instrucciones conectados, tablas con caption/scope, alternativas textuales a gráficos, objetivos táctiles cómodos, zoom y reflow. Móvil una columna, filtros plegables, montos no recortados y tablas convertidas a filas legibles con encabezados.
