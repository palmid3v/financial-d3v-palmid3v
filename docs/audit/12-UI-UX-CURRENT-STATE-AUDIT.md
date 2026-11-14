# Auditoría UI/UX del estado actual

**Base revisada:** código y estilos estáticos. No se abrió la aplicación ni se generó una captura runtime.

## Arquitectura y navegación

`frontend/src/App.jsx` define shell, componentes base, dashboard y secciones en un archivo cercano a 930 líneas. Navegación usa `useState`, sin URL/rutas. Sidebar agrupa Finanzas, Planeación, Patrimonio y Aprendizaje; la barra móvil fija 4 destinos y oculta los demás bajo Más. La acción de guardar/bloquear está arriba; indicador de estado desaparece en móvil.

## Hallazgos por área

| Área | Estado observado | Problema / recomendación | Prioridad |
|---|---|---|---:|
| Dashboard | Patrimonio, flujo, ahorro%, deuda, chart 6 meses, categorías, cuentas, presupuesto y movimientos recientes. | No inicia por dinero disponible/cuentas ni calendario de pagos; añadir obligaciones próximas y contexto esperado vs real. | P1 |
| Navegación | Desktop sidebar fija; móvil bottom nav y More. | Sin URL, agrupación superficial, navegación móvil oculta módulos. Evaluar rutas con labels y destinos frecuentes. | P1 |
| Cards/densidad | Paneles/cards múltiples con bordes y fondo similares. | Mucha repetición y poca jerarquía; reservar card para síntesis, usar separadores/listas para contenido. | P1 |
| Formularios | Controles propios con validación dispersa; confirm/alert nativos en varias acciones. | Consistencia, explicación de errores y prevención de pérdida dependen de cada módulo; unificar validación y feedback. | P1 |
| Tablas | Extractos usan tabla dentro de wrapper; varios datos presentan texto compacto. | Revisar columnas, scroll móvil, encabezados, foco y acciones por fila. | P1 |
| Charts | Barras y donut CSS propios. | No se observan descripciones accesibles completas ni valores alternos; añadir resumen textual/tabular. | P1 |
| Tipografía | Rajdhani y Trebuchet/system; muchos estilos auxiliares de 7–11 px. | Dificulta lectura prolongada, especialmente cifras/ayudas; aumentar base y usar fuente legible. | P1 |
| Color | Tema grafito verdoso, menta positiva, rosa gasto, cian info, ámbar warning. | Semántica útil, pero verde domina identidad; varias variables duplicadas y tokens con roles no uniformes. | P1 |
| Iconos | Caracteres de texto/glyphs en navegación y tarjetas. | Rendimiento/consistencia visual y nombres accesibles variables; usar set aprobado y texto accesible. | P2 |
| Motion | Entrada, barras/donut, progreso y pulse; reduced-motion CSS presente. | Algunas animaciones se repiten con re-render y son ornamentales; aplicar solo cuando refuerce estado. | P2 |
| Estados | `Empty`, `Notice`, status de Vault/JS/WASM y carga en importador. | No hay lenguaje de error/loading sistemático entre páginas. | P1 |
| Responsive | Breakpoints 1050, 720 y 380px; layouts cambian a una columna y nav fija. | Revisar tablas, formularios, drawer More, keyboard y safe-area en móvil real. | P1 |
| Accesibilidad | `focus-visible`, etiquetas label en Field, reduced-motion. | Faltan pruebas runtime/contraste/lector; no asumir accesibilidad completa. | P1 |

## Design system

`index.css` importa Tailwind y `styles/design-system.css`, pero gran parte de UI está construida con CSS ad hoc. Hay tokens duplicados y bloques responsivos acumulados. No se usa un sistema de componentes externo. Esto permite evolucionar visualmente, pero requiere consolidar tokens y escala tipográfica antes de sumar Payroll.

## Por qué puede resultar incómodo

Hipótesis sustentada por estilos: tamaños de texto muy pequeños; contraste de texto secundario apagado; paneles similares reducen jerarquía; dashboard no responde primero «cuánto puedo usar» y «qué pago se acerca»; módulos concentrados en una única shell; navegación móvil esconde destinos; y la presentación parece más analítica/compacta que cotidiana. La calidad visual exacta requiere prueba con propietario y runtime.

## Cambios visuales recomendados

Revisar composición y tokens completos, no agregar Payroll con los tamaños/estilos actuales. Definir una escala tipográfica legible, niveles de superficie, espacios consistentes, contraste AA como mínimo para texto, focus/hover, empty/loading/error, gráficos accesibles y layout móvil para tablas. Mantener obligatoriamente modo oscuro según preferencia del propietario.
