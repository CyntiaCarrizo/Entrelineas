# Diseño — Entrelíneas

## 1. Idea central

Entrelíneas es una librería de barrio: estantes de madera, lomos de tela, papel blanco y tinta. La web tiene que sentirse como **recorrer un estante**, no como una tienda genérica.

**El elemento memorable es el estante.** En el catálogo, las portadas se muestran con su proporción real, apoyadas sobre una línea de estante común a cada fila (alineadas abajo, no arriba). Libros de distintas alturas, todos sobre la misma base, como en la librería. Todo lo demás es sobrio y silencioso: el protagonista es el libro.

Principios:
- La portada manda. Nada de fondos con degradé ni tarjetas con sombra alrededor de los libros.
- Tipografía de lectura para los títulos de libros; tipografía de interfaz clara para todo lo operativo.
- En el admin, densidad y velocidad: el vendedor tiene un cliente esperando.

## 2. Color

| Nombre | Hex | Uso |
|---|---|---|
| Papel | `#F8F8F5` | Fondo general |
| Blanco | `#FFFFFF` | Superficies (formularios, paneles del admin) |
| Tinta | `#1A2333` | Texto principal, encabezados |
| Grafito | `#5B6170` | Texto secundario, metadatos (autor, editorial) |
| Verde tela | `#1F4A3D` | Color primario: botones, enlaces, foco, elementos activos |
| Ocre lomo | `#B07D24` | Acento escaso: la línea del estante, "últimos ejemplares" |
| Línea | `#DEDCD5` | Bordes y divisores |
| Error | `#A3332D` | Errores y anulaciones |

Reglas:
- El ocre no se usa para texto chico (no alcanza contraste AA sobre papel). Va en la línea del estante, en íconos o en texto grande.
- Estados del admin: éxito en verde tela, advertencia en ocre, error en rojo. Siempre acompañados de texto o ícono, nunca solo color.

**Modo oscuro** (solo admin en el MVP, opcional): fondo `#12171F`, superficie `#1A212C`, texto `#E8E6E1`, secundario `#9BA1AD`, primario `#6FAF95`, ocre `#D9A441`, línea `#2C3542`.

## 3. Tipografía

| Familia | Rol |
|---|---|
| **Literata** (Google Fonts) | Logo, títulos de página, títulos de libros, sinopsis |
| **Public Sans** (Google Fonts) | Interfaz: navegación, botones, formularios, tablas, precios |

- Literata fue diseñada para lectura de libros, y en títulos de obras se nota. Public Sans es neutra y muy legible en formularios y tablas.
- Escala (ratio 1,25): 14 · 16 · 20 · 25 · 31 · 39 px. Texto base 16 px.
- Interlineado: 1,5 en Public Sans; 1,6 en Literata para sinopsis.
- Precios y montos con números tabulares (`font-variant-numeric: tabular-nums`) para que las columnas de la caja se alineen.
- Ancho de línea máximo de la sinopsis: 68 caracteres.
- Sin mayúsculas sostenidas en etiquetas. Todo en tipo oración.

**Logo:** la palabra "Entrelíneas" en Literata, con una línea ocre fina que pasa por debajo de las letras, como un renglón. Es el mismo trazo que el estante del catálogo.

## 4. Layouts

### Inicio
Arranca directamente con un estante de novedades: el primer contacto es con libros, no con un banner.

```
┌──────────────────────────────────────────────┐
│ Entrelíneas          [ Buscar libro… ]  🛒 2 │
├──────────────────────────────────────────────┤
│ Llegaron esta semana                          │
│   ▉▉   ▉▉▉  ▉▉   ▉▉▉   ▉▉                    │
│   ▉▉   ▉▉▉  ▉▉   ▉▉▉   ▉▉   ← portadas reales │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  (estante ocre)│
│   Título    Título   Título                   │
│   Autor     Autor    Autor                    │
│                                               │
│ Recorrer por género: Novela · Poesía · Infantil│
│ [Más estantes por género…]                    │
│                                               │
│ Cómo comprar: elegís, enviás el pedido por    │
│ WhatsApp y pagás cuando lo confirmamos.       │
└──────────────────────────────────────────────┘
```

### Listado (`/libros`)
Filtros a la izquierda en escritorio, en un panel desplegable en el celular. Estantes de 5 libros en escritorio, 2 en celular. Texto alineado a la izquierda.

```
┌───────────┬──────────────────────────────────┐
│ Género    │ 248 libros · Novela              │
│ ○ Novela  │  ▉▉  ▉▉▉  ▉▉  ▉▉▉  ▉▉            │
│ ○ Poesía  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│ Editorial │  ▉▉  ▉▉  ▉▉▉  ▉▉  ▉▉▉            │
│ ○ …       │ ━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│           │        ‹ 1 2 3 … 12 ›            │
└───────────┴──────────────────────────────────┘
```

### Detalle de libro
```
┌──────────────────────────────────────────────┐
│  ┌────────┐   El Aleph                        │  ← Literata 39
│  │        │   Jorge Luis Borges               │  ← Grafito
│  │ portada│   $ 18.500                        │
│  │        │   Hay 3 ejemplares                │
│  └────────┘   [ Agregar al carrito ]          │
│  ━━━━━━━━━━                                   │
│  Sinopsis en Literata, máximo 68 caracteres   │
│  por línea…                                   │
│  Editorial · ISBN · Páginas  (tabla simple)   │
│  Del mismo autor: estante de 4 libros         │
└──────────────────────────────────────────────┘
```

### Carrito
Una columna. Lista de libros, total, datos del cliente (nombre, teléfono, email opcional), casilla "Necesito factura" que despliega los datos fiscales, y un solo botón principal: **Enviar pedido por WhatsApp**. Debajo, una línea que explica qué pasa después: "Te vamos a responder por WhatsApp para confirmar stock y forma de pago."

### Página del pedido (`/pedido/{token}`)
Encabezado con el código (`ENT-4821`) y el estado en palabras ("Confirmado, esperando el pago"). Debajo, el recorrido del pedido como una línea de pasos (acá sí corresponde una secuencia): Enviado → Confirmado → Pagado → Listo para retirar. Luego el detalle y las opciones de pago.

### Admin — estructura
Menú lateral fijo: Inicio, Pedidos, Mostrador, Caja, Libros, Usuarios (solo admin). Arriba a la derecha: estado de la caja ("Caja abierta desde las 9:02") y usuario. Superficies blancas sobre papel, bordes de 1 px en color línea, radio de 4 px en campos y botones, 8 px en paneles.

### Mostrador
Pensado para teclado y escáner. El campo de escaneo siempre tiene el foco.

```
┌──────────────────────────────┬───────────────┐
│ [ Escaneá o buscá un libro ] │ Total         │
│                              │ $ 37.000      │
│ El Aleph        1  $ 18.500 ✕│               │
│ Ficciones       1  $ 18.500 ✕│ Efectivo   [ ]│
│                              │ Transfer.  [ ]│
│                              │ M. Pago    [ ]│
│                              │ Débito     [ ]│
│                              │ Vuelto $ 3.000│
│                              │ [Cobrar  F9 ] │
└──────────────────────────────┴───────────────┘
```
Atajos: `F9` cobrar, `Esc` vaciar venta, `Supr` quitar el último libro.

### Caja
Resumen arriba (efectivo, transferencia, Mercado Pago, débito, crédito; y web contra local) en una tabla con números tabulares alineados a la derecha. Debajo, la lista de movimientos del día. El cierre es un formulario corto: efectivo contado, observaciones, y la diferencia calculada en vivo.

## 5. Componentes

- **Botón primario:** fondo verde tela, texto blanco, radio 4 px. Uno solo por pantalla.
- **Botón secundario:** borde verde tela, fondo transparente.
- **Botón peligroso:** texto rojo con borde; para anular siempre pide motivo.
- **Campos:** borde línea, fondo blanco, foco con contorno verde tela de 2 px.
- **Portada:** sin sombra ni borde; si no hay imagen, un rectángulo verde tela con el título en Literata blanca.
- **Disponibilidad:** "Hay 3 ejemplares" en grafito; "Últimos ejemplares" con un marcador ocre; "Sin stock" en grafito y botón deshabilitado.
- **Estados de pedido:** texto con un punto de color a la izquierda, nunca solo un color.
- **Tablas del admin:** filas de 44 px, encabezado en Public Sans 14 seminegrita, montos alineados a la derecha.

## 6. Movimiento

- Un solo momento animado en el sitio público: al agregar un libro, el contador del carrito se actualiza con un cambio breve.
- En el admin, solo transiciones que confirman acciones (venta cobrada, caja cerrada).
- Todo se desactiva con `prefers-reduced-motion`.

## 7. Textos

- Botones con el verbo de lo que pasa: "Agregar al carrito", "Enviar pedido por WhatsApp", "Pagar con Mercado Pago", "Cerrar caja".
- La misma acción se llama igual en todo el flujo: el botón "Confirmar pedido" produce el aviso "Pedido confirmado".
- Errores que dicen qué pasó y cómo seguir: "No hay stock suficiente de El Aleph (quedan 1). Ajustá la cantidad."
- Estados vacíos que invitan a actuar: "Todavía no hay ventas hoy. Abrí la caja para empezar."

## 8. Tokens para Tailwind

Tailwind v4 (el que instala Next.js hoy) define los tokens en CSS con `@theme`:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-papel: #F8F8F5;
  --color-tinta: #1A2333;
  --color-grafito: #5B6170;
  --color-tela: #1F4A3D;
  --color-ocre: #B07D24;
  --color-linea: #DEDCD5;
  --color-error: #A3332D;

  --font-serif: var(--font-literata), Georgia, serif;
  --font-sans: var(--font-public-sans), system-ui, sans-serif;

  --radius-campo: 4px;
  --radius-panel: 8px;
}
```

Con eso se usan clases como `bg-papel`, `text-tinta`, `bg-tela`, `font-serif`, `rounded-campo`. Las fuentes se cargan con `next/font/google` en `app/layout.js` y se exponen como las variables `--font-literata` y `--font-public-sans`. Si el proyecto usara Tailwind v3, los mismos valores van en `theme.extend` de `tailwind.config.js`.
