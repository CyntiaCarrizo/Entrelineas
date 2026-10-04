# Tareas — Entrelíneas

Marcar con `[x]` al terminar. Cada fase termina con algo que se puede probar. No pasar a la siguiente con la anterior rota.

## Fase 0 — Preparación
- [x] **Decidir acceso a datos: Prisma o `mysql2` con SQL.** Registrar la decisión en `memory.md`. → Prisma 7.10.
- [x] Escribir `docs/guia-prisma.md` (conexión, esquema, migraciones, consultas, transacciones).
- [ ] Subir el repositorio a GitHub (rama `main` + rama por fase).
- [ ] Crear repositorio con `apps/web`, `apps/api` y `docs/` (copiar estos documentos).
- [ ] `apps/api`: Express, estructura de carpetas, middleware de errores, Zod, `.env.example`.
- [ ] `apps/web`: Next.js (App Router, JavaScript), Tailwind, fuentes Literata y Public Sans, tokens de `design.md`.
- [ ] Rewrite de `/api/*` hacia Express en `next.config.js`.
- [ ] MySQL local y conexión desde la API.
- [ ] Configurar Vitest y Supertest con base de prueba.

## Fase 1 — Base de datos y usuarios
- [ ] Crear todas las tablas de `arquitectura.md` (migraciones).
- [ ] Script de datos de ejemplo (seed): 2 usuarios, 8 géneros, 60 libros con portadas.
- [ ] Login, logout y `/api/auth/me` con JWT en cookie `httpOnly`.
- [ ] Middlewares `requireAuth` y `requireRole`.
- [ ] Pantalla `/admin/login` y layout del admin con menú lateral.
- [ ] ABM de usuarios (solo admin).

## Fase 2 — Libros y catálogo
- [ ] Integración Cloudinary (subir desde URL, armar URLs con transformaciones).
- [ ] Integración Google Books con respaldo de Open Library (`buscarDatosPorIsbn`).
- [ ] Admin: alta de libro escaneando ISBN, con autocompletado y revisión.
- [ ] Admin: listado, edición de precio y stock (con movimiento de stock), activar y desactivar.
- [ ] Generación de slug único.
- [ ] Endpoints públicos de libros y géneros (sin datos internos).
- [ ] Página `/libros` con búsqueda, filtros en la URL y paginación.
- [ ] Componente estante (portadas alineadas abajo sobre la línea ocre).
- [ ] Página `/libros/[slug]` con `generateMetadata` y Open Graph.
- [ ] Página de inicio con estante de novedades y géneros.
- [ ] `sitemap.js` y `robots.js`.
- [ ] **Importación desde Excel:**
  - [ ] Conseguir (o simular) el Excel real de la librería y anotar su formato en `memory.md`.
  - [ ] Módulo `importacion/`: lector (ExcelJS), detección de columnas, normalización (ISBN, precio, stock) y validación.
  - [ ] Tests de normalización: ISBN con guiones, en formato científico, ISBN-10, precio con `$` y separadores, filas vacías, ISBN repetidos.
  - [ ] Tabla `importaciones` y tipo `importacion` en `movimientos_stock`.
  - [ ] Endpoints de plantilla, vista previa, confirmación, historial y descarga de errores.
  - [ ] Pantalla `/admin/libros/importar`: subir archivo, mapear columnas, vista previa, elegir modo y campos, confirmar, ver informe.
  - [ ] Procesamiento por lotes en transacciones.
  - [ ] Job opcional de enriquecimiento (datos y portadas desde APIs de libros).
  - [ ] Script `scripts/importar-excel.js` para línea de comandos (usarlo para cargar la demo).
- [ ] Probar la vista previa del link en WhatsApp.

## Fase 3 — Carrito y pedidos
- [ ] Contexto de carrito con persistencia en `localStorage`.
- [ ] Página `/carrito` con datos del cliente y opción de factura.
- [ ] Cloudflare Turnstile en el frontend y validación en la API.
- [ ] `POST /api/public/pedidos`: precios desde la base, código `ENT-XXXX`, token, vencimiento.
- [ ] Armado del mensaje y apertura de `wa.me`.
- [ ] Rate limit en creación de pedidos.
- [ ] Job de vencimiento de pedidos pendientes.
- [ ] Admin: listado de pedidos con filtros y búsqueda.
- [ ] Confirmar (descuenta stock en transacción), cancelar (devuelve stock), entregar.
- [ ] Página pública `/pedido/[token]` con estado y línea de pasos.
- [ ] Test: pedido con precios manipulados usa los de la base.
- [ ] Test: confirmar sin stock suficiente falla sin descontar nada.

## Fase 4 — Pagos
- [ ] Integración Mercado Pago: crear preferencia y consultar pago.
- [ ] Botón "Pagar con Mercado Pago" en la página del pedido.
- [ ] Webhook: respuesta inmediata, validación de firma, registro en `webhook_eventos`, consulta del pago, registro idempotente.
- [ ] Probar con túnel (ngrok o Cloudflare Tunnel) y tarjetas de prueba.
- [ ] Transferencia: datos de pago en la página del pedido y subida de comprobante.
- [ ] Admin: registrar pago por transferencia con número de operación único.
- [ ] Anulación de pagos (solo admin, con motivo).
- [ ] Cambio automático de estado a `pagada` cuando los pagos cubren el total.
- [ ] Test: webhook duplicado registra un solo pago.
- [ ] Test: transferencia con número de operación repetido es rechazada.

## Fase 5 — Mostrador y caja
- [ ] Abrir caja con efectivo inicial (una sola abierta a la vez).
- [ ] Indicador de caja en el encabezado del admin.
- [ ] Mostrador: campo de escaneo con foco permanente, búsqueda por texto, alta rápida si el ISBN no existe.
- [ ] Cobro con uno o varios métodos y cálculo de vuelto.
- [ ] `POST /api/admin/ventas` en una transacción (venta, items, pagos, stock, movimientos).
- [ ] Atajos de teclado del mostrador.
- [ ] Ingresos y egresos manuales.
- [ ] Asociar a la caja que se abre los pagos web que llegaron sin caja.
- [ ] Cierre con arqueo y diferencia calculada en vivo.
- [ ] Resumen por método y por canal; historial de cajas.
- [ ] Test: cálculo de efectivo esperado con ventas, ingresos, egresos y pagos anulados.
- [ ] Test: no se puede modificar una caja cerrada.

## Fase 6 — Dashboard y facturas
- [ ] `GET /api/admin/dashboard` con ventas del día y del mes, métodos, canales, más vendidos y pendientes.
- [ ] Pantalla de inicio del admin.
- [ ] Subida de PDF de factura a una venta.
- [ ] Botón "Descargar factura" en la página pública del pedido.

## Fase 7 — Calidad y publicación
- [ ] Revisión de accesibilidad (teclado, contraste, foco, `alt`).
- [ ] Revisión de seguridad con la lista de `rules.md`.
- [ ] Deploy de la web en Vercel y de la API con MySQL en Railway o Render.
- [ ] Webhook de Mercado Pago apuntando a la URL de producción de la demo.
- [ ] Usuario de demo y datos de ejemplo cargados.
- [ ] README: problema, capturas o GIF, stack, diagrama del flujo, cómo correrlo, credenciales de demo, tarjeta de prueba, decisiones técnicas y próximas funcionalidades.

## Etapa 2 (después del MVP)
- [ ] ARCA en homologación: certificado (WSASS), WSAA con token cacheado, WSFEv1, CAE, PDF con QR.
- [ ] QR de Mercado Pago integrado en el mostrador.
- [ ] Point integrado (si hace falta).
- [ ] Encargos de libros sin stock.
- [ ] Historial de clientes por teléfono.
- [ ] Alertas de stock bajo, proveedores y compras.
- [ ] Promociones, descuentos y devoluciones.
- [ ] Exportar reportes a Excel y PDF.
- [ ] Notificaciones por email.
