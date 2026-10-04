# Arquitectura — Entrelíneas

## 1. Vista general

```
                ┌──────────────────────────────┐
  Cliente ────▶ │  apps/web (Next.js)          │
  (celular)     │  · Catálogo público (SSR/ISR)│
                │  · Página del pedido         │
  Vendedor ───▶ │  · Panel admin               │
  Admin         └──────────────┬───────────────┘
                               │  /api/* (rewrite al mismo dominio)
                ┌──────────────▼───────────────┐
                │  apps/api (Node + Express)   │──▶ MySQL
                │  · API pública y admin       │
                │  · Webhook Mercado Pago      │──▶ Mercado Pago
                │  · Jobs (vencer pedidos)     │──▶ Cloudinary
                └──────────────────────────────┘──▶ Google Books / Open Library
                                                 ──▶ Cloudflare Turnstile
  El pedido viaja a WhatsApp con un enlace wa.me (no hay API de WhatsApp).
```

**Decisiones principales**

- **Next.js como frontend** (catálogo y admin) y **Express como API**. Express concentra toda la lógica de negocio, el acceso a datos y las integraciones. Next.js no accede a la base de datos.
- **Mismo dominio para web y API**: Next.js reescribe `/api/*` hacia Express (`rewrites` en `next.config.js`). Así la cookie de sesión es de primera parte y se evita configurar CORS con cookies entre dominios.
- **JavaScript** en ambos proyectos (coherente con el stack ya usado). Validación de datos con Zod.
- **Acceso a datos:** Prisma ORM 7 con el adapter `@prisma/adapter-mariadb` (compatible con MySQL). El esquema vive en `apps/api/prisma/schema.prisma` y las migraciones en `apps/api/prisma/migrations/`. Toda consulta vive en la capa `repositories/`. Explicación completa en el anexo `guia-prisma.md`.

## 2. Estructura del repositorio

```
entrelineas/
├── apps/
│   ├── web/                      # Next.js (App Router)
│   │   ├── app/
│   │   │   ├── layout.js
│   │   │   ├── page.js           # Inicio
│   │   │   ├── libros/
│   │   │   │   ├── page.js       # Listado con búsqueda y filtros
│   │   │   │   └── [slug]/page.js
│   │   │   ├── carrito/page.js
│   │   │   ├── pedido/[token]/page.js
│   │   │   └── admin/
│   │   │       ├── layout.js     # Verifica sesión, menú lateral
│   │   │       ├── page.js       # Dashboard
│   │   │       ├── pedidos/
│   │   │       ├── mostrador/
│   │   │       ├── caja/
│   │   │       ├── libros/
│   │   │       └── usuarios/
│   │   ├── components/
│   │   ├── context/              # Carrito (client)
│   │   └── lib/                  # fetch a la API, formato de precios
│   └── api/                      # Express
│       ├── prisma/               # schema.prisma y migraciones
│       └── src/
│           ├── routes/           # Definición de endpoints
│           ├── controllers/      # Leen request, llaman servicios, responden
│           ├── services/         # Lógica de negocio (caja, pagos, stock)
│           ├── repositories/     # Acceso a la base (único lugar que usa Prisma)
│           ├── integrations/     # mercadopago, cloudinary, libros, turnstile
│           ├── middlewares/      # auth, roles, rate limit, errores
│           ├── validators/       # Esquemas Zod
│           ├── jobs/             # Vencimiento de pedidos, enriquecimiento de importaciones
│           ├── importacion/      # Lectura de Excel/CSV, normalización, validación, ejecución
│           ├── scripts/          # importar-excel.js (línea de comandos)
│           └── app.js
├── docs/                         # PRD, arquitectura, rules, design, task, memory
└── README.md
```

## 3. Modelo de datos

Montos en `DECIMAL(12,2)`. Fechas en UTC. Ninguna tabla de dinero se borra físicamente.

### usuarios
| Campo | Tipo | Notas |
|---|---|---|
| id | INT PK | |
| nombre | VARCHAR | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | bcrypt |
| rol | ENUM('admin','vendedor') | |
| activo | BOOLEAN | |
| creado_en | DATETIME | |

### generos
`id`, `nombre`, `slug` UNIQUE.

### libros
| Campo | Tipo | Notas |
|---|---|---|
| id | INT PK | |
| isbn | VARCHAR(13) UNIQUE NULL | Se guarda como texto |
| codigo_interno | VARCHAR UNIQUE NULL | Productos sin ISBN |
| slug | VARCHAR UNIQUE | `titulo-autor`, sin tildes |
| titulo, autor, editorial | VARCHAR | |
| genero_id | FK generos | |
| sinopsis | TEXT NULL | |
| paginas | INT NULL | |
| precio | DECIMAL(12,2) | |
| stock | INT | Nunca negativo |
| portada_public_id | VARCHAR NULL | Id de Cloudinary |
| activo | BOOLEAN | |
| creado_en, actualizado_en | DATETIME | |

### ventas
Representa tanto un pedido web como una venta del mostrador.

| Campo | Tipo | Notas |
|---|---|---|
| id | INT PK | |
| codigo | VARCHAR UNIQUE | `ENT-4821` |
| token_publico | VARCHAR(32) UNIQUE NULL | Solo ventas web |
| canal | ENUM('web','local') | |
| estado | ENUM | Ver sección 4 |
| cliente_nombre, cliente_telefono, cliente_email | VARCHAR NULL | |
| requiere_factura | BOOLEAN | |
| datos_fiscales | JSON NULL | cuit_dni, razon_social, condicion_iva |
| total | DECIMAL(12,2) | |
| usuario_id | FK usuarios NULL | Quién la registró o confirmó |
| stock_descontado | BOOLEAN | Para saber si cancelar devuelve stock |
| creado_en, confirmada_en, expira_en | DATETIME | |

### venta_items
`id`, `venta_id`, `libro_id`, `titulo` (copia), `precio_unitario` (copia), `cantidad`, `subtotal`. Los datos se copian para que un cambio de precio posterior no altere ventas pasadas.

### cajas
| Campo | Tipo | Notas |
|---|---|---|
| id | INT PK | |
| estado | ENUM('abierta','cerrada') | Una sola abierta a la vez |
| abierta_por, cerrada_por | FK usuarios | |
| abierta_en, cerrada_en | DATETIME | |
| efectivo_inicial | DECIMAL | |
| efectivo_esperado, efectivo_contado, diferencia | DECIMAL NULL | Se completan al cerrar |
| observaciones | TEXT NULL | |

### pagos
| Campo | Tipo | Notas |
|---|---|---|
| id | INT PK | |
| venta_id | FK ventas | |
| caja_id | FK cajas NULL | NULL = cobrado sin caja abierta |
| metodo | ENUM('efectivo','transferencia','mercadopago','debito','credito') | |
| monto | DECIMAL | |
| referencia | VARCHAR NULL | N.º de operación o id de pago de MP |
| comprobante_url | VARCHAR NULL | |
| estado | ENUM('pendiente','aprobado','rechazado','anulado') | |
| usuario_id | FK usuarios NULL | NULL si lo registró el webhook |
| anulado_por, anulado_en, motivo_anulacion | | |
| creado_en | DATETIME | |

Índice único: (`metodo`, `referencia`). Evita cargar dos veces la misma transferencia o el mismo pago de Mercado Pago.

### movimientos_caja
`id`, `caja_id`, `tipo` ENUM('ingreso','egreso'), `concepto`, `monto`, `usuario_id`, `creado_en`, campos de anulación.

### movimientos_stock
`id`, `libro_id`, `tipo` ENUM('alta','ingreso','venta','cancelacion','ajuste','importacion'), `cantidad` (con signo), `venta_id` NULL, `usuario_id` NULL, `motivo`, `creado_en`.

### facturas
`id`, `venta_id`, `origen` ENUM('manual','arca'), `tipo` (A/B/C) NULL, `punto_venta` NULL, `numero` NULL, `cae` NULL, `cae_vencimiento` NULL, `pdf_url`, `usuario_id`, `creado_en`. Los campos de ARCA quedan vacíos en el MVP.

### importaciones
`id`, `archivo_nombre`, `modo` ENUM('crear','actualizar','ambos'), `campos_actualizados` JSON, `estado` ENUM('vista_previa','procesando','completada','fallida'), `filas_total`, `creados`, `actualizados`, `omitidos`, `con_error`, `errores` JSON (fila, columna, motivo), `usuario_id`, `creado_en`, `finalizado_en`.

### webhook_eventos
`id`, `proveedor`, `evento_id`, `payload` JSON, `procesado_en`, `error` NULL. Registro de auditoría de cada aviso recibido.

## 4. Estados de una venta

```
WEB:    pendiente ──▶ confirmada ──▶ comprobante_recibido ──▶ pagada ──▶ entregada
            │              │                                     ▲
            ▼              └──────────── (Mercado Pago) ─────────┘
         expirada          └──▶ cancelada (devuelve stock)

LOCAL:  pagada ──▶ entregada   (se crea ya pagada y entregada en el mostrador)
```

- `pendiente → expirada`: job cada 10 minutos para pedidos con `expira_en` vencido.
- `pendiente → confirmada`: acción del vendedor. Descuenta stock en transacción; si no alcanza, informa qué libros faltan.
- `confirmada → pagada`: webhook de Mercado Pago o confirmación manual de transferencia. Pasa a `pagada` cuando la suma de pagos aprobados cubre el total.

## 5. Flujos críticos

### 5.1 Pedido web
1. `POST /api/public/pedidos` con items, datos del cliente y token de Turnstile.
2. La API valida Turnstile, recalcula precios desde la base (nunca confía en precios del cliente), crea la venta `pendiente` con código, token y `expira_en`.
3. Devuelve el código y el texto del mensaje; el frontend abre `https://wa.me/{numero}?text=...`.

### 5.2 Pago con Mercado Pago
1. Desde `/pedido/{token}`, `POST /api/public/pedidos/{token}/mercadopago` crea la preferencia (`external_reference` = id de venta, `notification_url`, `back_urls`).
2. El cliente paga en Mercado Pago y vuelve a la página del pedido (solo informativo).
3. Mercado Pago llama a `POST /api/webhooks/mercadopago`. La API responde 200 de inmediato, valida la firma, guarda el evento y consulta el pago por id a la API de Mercado Pago.
4. Si está `approved`, en una transacción: verifica que no exista un pago con esa referencia, lo inserta en la caja abierta (o sin caja) y actualiza el estado de la venta.

### 5.3 Venta en el mostrador
1. El vendedor escanea o busca libros. `GET /api/admin/libros/isbn/{isbn}`.
2. `POST /api/admin/ventas` con items y pagos. En una transacción: verifica caja abierta y stock, crea venta `local`, items, pagos, movimientos de stock y descuenta stock.

### 5.5 Importación desde Excel
1. El admin sube el archivo: `POST /api/admin/importaciones/vista-previa` (máx. 5 MB, `.xlsx` o `.csv`, procesado en memoria, nunca se guarda en disco).
2. La API lee la primera hoja con ExcelJS, detecta columnas por encabezado y **normaliza** cada fila:
   - ISBN leído como texto; se quitan guiones y espacios; se corrige el formato científico (`9.78950E+12`) y se convierte ISBN-10 a ISBN-13; se valida el dígito verificador.
   - Precio: acepta `$15.000`, `15000`, `15.000,50`; se convierte a centavos.
   - Stock: entero mayor o igual a cero.
   - Texto: se recortan espacios y se unifica el género con los existentes.
3. Clasifica cada fila: `crear`, `actualizar`, `sin_cambios` o `error`, y detecta ISBN repetidos dentro del mismo archivo. Devuelve la vista previa y un id de importación en estado `vista_previa`.
4. El admin revisa, elige modo y campos a pisar y confirma: `POST /api/admin/importaciones/:id/confirmar`.
5. La API procesa en lotes de 200 filas, cada lote en una transacción: crea o actualiza libros, genera slugs y registra `movimientos_stock` de tipo `importacion`.
6. Guarda el resultado en `importaciones`. Si se pidió enriquecimiento, un job completa datos y portadas en segundo plano, respetando límites de las APIs externas.

### 5.4 Cierre de caja
`efectivo_esperado = efectivo_inicial + pagos en efectivo aprobados + ingresos manuales − egresos manuales`. Se guarda junto al contado y la diferencia. Una caja cerrada no admite cambios.

## 6. Endpoints

**Públicos**
| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/public/libros` | Listado con `q`, `genero`, `editorial`, `pagina` |
| GET | `/api/public/libros/:slug` | Detalle |
| GET | `/api/public/generos` | Filtros |
| POST | `/api/public/pedidos` | Crear pedido |
| GET | `/api/public/pedidos/:token` | Página del pedido |
| POST | `/api/public/pedidos/:token/mercadopago` | Crear preferencia |
| POST | `/api/public/pedidos/:token/comprobante` | Subir comprobante de transferencia |
| POST | `/api/webhooks/mercadopago` | Webhook |

**Admin** (requieren sesión; marcados con ★ solo `admin`)
| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/auth/login`, `/api/auth/logout` · GET `/api/auth/me` | Sesión |
| GET, POST, PATCH | `/api/admin/libros` | ABM de libros (precio ★) |
| GET | `/api/admin/libros/isbn/:isbn` | Buscar en base o en APIs externas |
| GET | `/api/admin/pedidos` | Listado web |
| POST | `/api/admin/pedidos/:id/confirmar` · `/cancelar` · `/entregar` | Estados |
| POST | `/api/admin/ventas` | Venta de mostrador |
| POST | `/api/admin/pagos` | Registrar pago manual |
| POST | `/api/admin/pagos/:id/anular` ★ | Anular pago |
| POST | `/api/admin/cajas/abrir` · GET `/api/admin/cajas/actual` · POST `/api/admin/cajas/cerrar` | Caja |
| GET | `/api/admin/cajas` | Historial |
| POST | `/api/admin/cajas/movimientos` | Ingreso o egreso manual |
| POST | `/api/admin/ventas/:id/factura` | Subir PDF |
| GET | `/api/admin/dashboard` | Métricas |
| GET | `/api/admin/importaciones/plantilla` ★ | Descargar plantilla `.xlsx` |
| POST | `/api/admin/importaciones/vista-previa` ★ | Subir archivo y obtener vista previa |
| POST | `/api/admin/importaciones/:id/confirmar` ★ | Ejecutar la importación |
| GET | `/api/admin/importaciones` ★ · `/:id` · `/:id/errores` | Historial, detalle y descarga de errores |
| GET, POST, PATCH | `/api/admin/usuarios` ★ | Usuarios |

## 7. Autenticación

- Login devuelve una cookie `httpOnly`, `Secure`, `SameSite=Lax` con un JWT firmado (expira en 12 h).
- Middleware `requireAuth` y `requireRole('admin')` en Express.
- `app/admin/layout.js` llama a `/api/auth/me` y redirige a `/admin/login` si no hay sesión.

## 8. Integraciones

| Servicio | Uso | Ubicación |
|---|---|---|
| Mercado Pago (SDK `mercadopago`) | Checkout Pro y consulta de pagos | `integrations/mercadopago.js` |
| Cloudinary | Portadas, comprobantes y facturas | `integrations/cloudinary.js` |
| Google Books / Open Library | Datos por ISBN | `integrations/libros.js` |
| Cloudflare Turnstile | Captcha del pedido | `integrations/turnstile.js` |
| ExcelJS | Lectura de `.xlsx`/`.csv` y generación de plantilla e informe de errores | `importacion/lector.js` |
| WhatsApp | Enlace `wa.me` armado en el frontend | `apps/web/lib/whatsapp.js` |

## 9. Variables de entorno

**apps/api**: `DATABASE_URL`, `JWT_SECRET`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `PUBLIC_URL`, `CLOUDINARY_URL`, `GOOGLE_BOOKS_KEY`, `TURNSTILE_SECRET`, `WHATSAPP_NUMERO`, `TRANSFERENCIA_ALIAS`, `TRANSFERENCIA_CBU`.

**apps/web**: `API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMERO`, `NEXT_PUBLIC_CLOUDINARY_CLOUD`.

## 10. Entornos y deploy

- **Desarrollo:** MySQL local, API en `localhost:4000`, web en `localhost:3000`, túnel (ngrok o Cloudflare Tunnel) para el webhook.
- **Demo:** web en Vercel; API y MySQL en Railway o Render. Mercado Pago con credenciales de prueba.
- **Etapa 2 (ARCA):** módulo `integrations/arca/` con WSAA (token cacheado) y WSFEv1, contra homologación.
