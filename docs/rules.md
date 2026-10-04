# Reglas del proyecto — Entrelíneas

Reglas para cualquier persona o asistente de IA que escriba código en este repositorio. Ante una duda, priman este archivo, `arquitectura.md` y `PRD.md`, en ese orden.

## 1. Generales

- Leer `memory.md` y `task.md` antes de empezar una tarea, y actualizarlos al terminarla.
- Hacer solo lo que pide la tarea. Si aparece algo fuera del MVP, anotarlo en `task.md` (etapa 2) en vez de implementarlo.
- No agregar dependencias sin justificarlo en `memory.md`.
- Cambios chicos y verificables. Cada tarea termina con el código funcionando.

## 2. Idioma y nombres

- **Dominio en español** (coherente con el negocio): `venta`, `pago`, `caja`, `libro`, `obtenerVentaPorToken()`.
- Términos técnicos estándar en inglés cuando son de la librería o del framework (`req`, `res`, `router`, `middleware`).
- Variables y funciones en `camelCase`; componentes React en `PascalCase`; archivos de componentes `PascalCase.jsx`; resto en `kebab-case.js`.
- Tablas y columnas en `snake_case` y en plural para tablas.
- Textos de la interfaz en español rioplatense. Botones con verbo en infinitivo que dice exactamente qué pasa ("Agregar al carrito", "Enviar pedido por WhatsApp"); mensajes al usuario con voseo ("Revisá el teléfono").

## 3. Backend (Express)

- Capas: `routes → controllers → services → repositories`. Un controller no consulta la base; un repository no tiene lógica de negocio.
- Toda entrada se valida con Zod en `validators/` antes de llegar al controller.
- Errores con una clase `AppError(status, codigo, mensaje)` y un middleware central. Nunca devolver stack traces al cliente.
- Respuestas JSON con forma consistente: `{ data }` en éxito, `{ error: { codigo, mensaje } }` en error.
- Las integraciones externas viven solo en `integrations/`. Ningún service llama a `fetch` de un tercero directamente.

## 4. Dinero, stock y caja (reglas críticas)

- Montos como `DECIMAL(12,2)` en la base. En JavaScript, operar en **centavos enteros** (`Math.round(monto * 100)`) y convertir solo para mostrar. Nunca sumar floats directamente.
- **El precio lo decide el servidor.** Al crear un pedido o venta se ignoran precios que mande el cliente y se leen de la base.
- Toda operación que toque stock, pagos o caja va **dentro de una transacción**.
- El stock nunca queda negativo: el descuento se hace con una condición (`stock >= cantidad`) dentro de la transacción y se verifica cuántas filas se actualizaron.
- Cada cambio de stock genera un registro en `movimientos_stock`.
- **Nada se borra** en `ventas`, `pagos`, `cajas`, `movimientos_caja` ni `facturas`. Se anula con usuario, fecha y motivo.
- Una caja cerrada no se modifica.
- Un pago se asocia a la caja abierta **en el momento del cobro**.
- **Una importación nunca escribe sin vista previa confirmada**, y solo pisa los campos que el admin eligió.
- En importaciones, el ISBN siempre se lee y se guarda como **texto** (Excel suele convertirlo a número y romperlo).

## 5. Mercado Pago

- El webhook responde `200` de inmediato y procesa después.
- Validar la firma del webhook (`x-signature`) antes de procesar.
- Nunca usar el contenido del webhook como verdad: consultar siempre el pago por id a la API.
- Procesamiento idempotente: si ya existe un pago con esa referencia, no hacer nada.
- Las `back_urls` solo muestran mensajes; nunca cambian estados.
- Credenciales de prueba en la demo. El access token jamás llega al frontend.

## 6. Frontend (Next.js)

- Server Components por defecto. `"use client"` solo en componentes con estado, eventos o APIs del navegador.
- El catálogo se genera en el servidor con `revalidate`. `generateMetadata` en cada página de libro y de listado.
- Datos del admin: desde Client Components contra `/api/*` (la cookie viaja sola), o desde Server Components reenviando la cookie con `cookies()`.
- El carrito vive en un contexto de cliente y se guarda en `localStorage` envuelto en `try/catch`.
- Imágenes de portada siempre desde Cloudinary con transformaciones (`f_auto,q_auto,w_*`) y `alt` con el título del libro.
- Tailwind con los tokens definidos en `design.md`. No usar colores sueltos fuera de la paleta.

## 7. Seguridad

- Secretos solo en `.env` (nunca en el repo). Mantener `.env.example` actualizado sin valores reales.
- `bcrypt` con costo 12 para contraseñas.
- Rate limit en login y en creación de pedidos.
- Turnstile validado en el servidor.
- Tokens públicos de pedido generados con `crypto.randomBytes`, nunca con ids secuenciales.
- Endpoints públicos nunca devuelven datos internos (usuario, caja, costo, datos de otros pedidos).
- Archivos subidos: validar tipo y tamaño (imágenes y PDF, máximo 5 MB).

## 8. Accesibilidad

- Contraste AA mínimo, foco visible siempre, `label` en todos los campos.
- El mostrador se tiene que poder usar entero con teclado: el foco vuelve al campo del escáner después de cada acción.
- Respetar `prefers-reduced-motion`.

## 9. Tests

- Obligatorios para: cálculo de cierre de caja, procesamiento del webhook (incluido duplicado), descuento y devolución de stock, creación de pedido con precios manipulados.
- Vitest para unidades y Supertest para endpoints, contra una base de prueba.
- Los tests no llaman a servicios externos: se simulan las integraciones.

## 10. Git

- Ramas `feat/...`, `fix/...`, `docs/...`.
- Commits en español, en presente e imperativo: `agrega cierre de caja con arqueo`.
- Nunca commitear `.env`, claves ni certificados (`*.key`, `*.crt`).
