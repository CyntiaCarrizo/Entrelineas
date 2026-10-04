# PRD — Entrelíneas

Documento de requisitos del producto. Define qué se construye, para quién y qué queda fuera del MVP.

## 1. Resumen

Entrelíneas es una librería ficticia de barrio que vende en su local y quiere vender online sin perder el trato personal con sus clientes. El sistema combina:

- Un **catálogo web público** donde cualquier persona arma un carrito sin crear cuenta.
- Un **checkout por WhatsApp**: el pedido se guarda en el sistema y se envía al WhatsApp de la librería, que lo confirma por chat.
- **Pagos** por Mercado Pago (Checkout Pro, confirmación automática) o transferencia (confirmación manual).
- Un **panel de administración** con pedidos, mostrador (punto de venta con lector de ISBN), caja diaria, carga de libros, usuarios y dashboard.

Es un proyecto de portfolio: tiene que funcionar de punta a punta en una demo pública, con datos de ejemplo y Mercado Pago en modo prueba.

## 2. Problema

Las librerías chicas venden por WhatsApp e Instagram de forma desordenada: el cliente pregunta si hay un libro, alguien revisa la estantería, se pasa el precio a mano, se cobra por transferencia y nadie sabe al final del día cuánto entró por cada medio. Las plataformas de e-commerce completas les resultan caras, impersonales y obligan al cliente a registrarse.

## 3. Objetivos

1. Que el cliente pueda ver el stock real y pedir en menos de un minuto, sin registrarse.
2. Que la librería centralice pedidos web y ventas del local en un solo sistema.
3. Que la caja del día muestre con exactitud cuánto entró por efectivo, transferencia y Mercado Pago, y por qué canal.
4. Que cargar un libro nuevo lleve segundos gracias al escáner y al autocompletado por ISBN.
5. (Portfolio) Demostrar integración real con Mercado Pago, manejo correcto de pagos (idempotencia, transacciones, anulaciones) y SEO con Next.js.

## 4. Usuarios

| Usuario | Descripción | Acceso |
|---|---|---|
| Cliente | Persona que compra desde la web, generalmente desde el celular | Sin login |
| Vendedor | Atiende el mostrador, confirma pedidos, cobra, abre y cierra caja | Login, rol `vendedor` |
| Administrador | Dueño o encargado. Todo lo del vendedor más precios, usuarios, reportes y anulaciones | Login, rol `admin` |

## 5. Alcance del MVP

### 5.1 Catálogo público
- Listado de libros con portada, título, autor, precio y disponibilidad.
- Búsqueda por título, autor e ISBN. Filtros por género y editorial. Paginación.
- Búsqueda y filtros reflejados en la URL (`/libros?genero=novela&q=borges`).
- Página de detalle por libro con URL amigable (`/libros/el-aleph-jorge-luis-borges`), sinopsis, datos y libros relacionados.
- Etiquetas Open Graph para que el link compartido por WhatsApp muestre portada, título y precio.
- Solo se muestran libros activos. Nunca se exponen datos internos.

### 5.2 Carrito y pedido por WhatsApp
- Carrito en el navegador. Datos del cliente: nombre y teléfono obligatorios, email opcional.
- Opción "Necesito factura" con CUIT/DNI, razón social y condición frente al IVA.
- Al confirmar: el pedido se guarda como `pendiente` con un código (`ENT-4821`) y un token público, y se abre WhatsApp con el mensaje armado.
- Protección antibots: Cloudflare Turnstile y límite de pedidos por IP.
- Los pedidos `pendiente` que nadie confirma vencen a las 2 horas (`expirada`).

### 5.3 Gestión de pedidos (admin)
- Lista con filtros por estado, búsqueda por código o teléfono.
- Confirmar pedido: descuenta stock y habilita el pago. Cancelar: devuelve el stock si ya se había descontado.
- Marcar como entregado o retirado.
- Copiar el link del pedido para enviarlo por WhatsApp.

### 5.4 Página pública del pedido
- URL única no adivinable (`/pedido/{token}`), sin login.
- Muestra estado, detalle y total.
- Si está confirmado: pagar con Mercado Pago, o ver los datos de transferencia (alias, CBU, monto exacto) y subir el comprobante.
- Si tiene factura cargada: botón "Descargar factura".

### 5.5 Pagos
- **Mercado Pago (Checkout Pro):** preferencia con `external_reference` = id de la venta; webhook que consulta el pago a la API y lo registra si está aprobado. Idempotente.
- **Transferencia:** número de operación obligatorio y único, comprobante opcional. Confirmación manual.
- **Efectivo, débito, crédito:** solo en el mostrador, registro manual.
- Un pago nunca se borra: se anula, registrando quién, cuándo y por qué.

### 5.6 Mostrador (punto de venta)
- Búsqueda por título o autor, o escaneo de ISBN (lector USB que funciona como teclado).
- Si el ISBN no existe, ofrecer darlo de alta.
- Cobro con uno o más métodos de pago. Stock descontado al registrar la venta.
- Requiere una caja abierta.

### 5.7 Caja diaria
- Apertura con efectivo inicial.
- Cada pago aprobado se asocia a la caja abierta en el momento del cobro, no a la fecha del pedido.
- Ingresos y egresos manuales (proveedor, insumos, retiro de efectivo).
- Cierre con arqueo: efectivo esperado contra contado, diferencia y observaciones.
- Resumen por método de pago y por canal. Historial de cajas cerradas.
- Los pagos de Mercado Pago que llegan sin caja abierta quedan "sin caja" y se asocian a la próxima caja que se abra.

### 5.8 Libros
- Alta escaneando el ISBN, con autocompletado desde Google Books y, si no hay resultado, Open Library.
- Portada copiada a Cloudinary (no se enlazan imágenes externas).
- Código interno para productos sin ISBN.
- Edición de precio, stock, género y estado (activo o inactivo).
- Cada cambio de stock queda registrado como movimiento.

### 5.9 Usuarios y roles
- Login con email y contraseña. Roles `admin` y `vendedor`.
- Cada venta, pago, movimiento y cierre de caja guarda el usuario que lo hizo.

### 5.10 Dashboard
- Ventas del día y del mes, por método de pago y por canal.
- Libros más vendidos. Pedidos pendientes de confirmar y de pago.

### 5.11 Facturas (carga manual)
- El admin sube el PDF de la factura emitida por la librería y lo asocia a la venta.
- La factura queda disponible en la página pública del pedido.
- La tabla de facturas ya contempla los campos de la futura integración con ARCA.

### 5.12 Importación desde Excel
- Pantalla del admin (solo rol `admin`) para subir el catálogo que la librería ya tiene en un archivo `.xlsx` o `.csv`.
- Plantilla descargable con las columnas recomendadas: ISBN, título, autor, editorial, género, precio, stock.
- Detección automática de columnas por el encabezado (por ejemplo "Título", "titulo" o "TITULO") y mapeo manual si no coincide.
- **Vista previa obligatoria** antes de guardar: cuántas filas se van a crear, cuántas actualizar, cuántas se omiten y cuáles tienen errores, con el motivo.
- Modo elegido explícitamente: solo crear libros nuevos, solo actualizar existentes, o ambos. Al actualizar, se elige qué campos se pisan (precio, stock, datos del libro).
- Los libros existentes se reconocen por ISBN o código interno.
- Cada cambio de stock por importación genera un movimiento de stock de tipo `importacion`.
- Informe final con descarga de las filas con error, para corregirlas y volver a importar.
- Opcional: completar datos faltantes y portadas desde Google Books / Open Library en segundo plano.
- Historial de importaciones: quién, cuándo, qué archivo y resultado.
- Script de línea de comandos con la misma lógica, para la carga inicial masiva o para cargar la demo.

## 6. Fuera del MVP (etapa 2 en adelante)

- Integración con ARCA en homologación (WSAA + WSFEv1, CAE, PDF con QR).
- QR de Mercado Pago integrado en el mostrador; Point integrado si hace falta.
- Encargos de libros sin stock.
- Historial de clientes por teléfono.
- Inventario avanzado: alertas de stock bajo, proveedores y compras.
- Promociones, descuentos y devoluciones.
- Exportación de reportes a Excel y PDF.
- Notificaciones por email.

## 7. Requisitos no funcionales

- **Mobile first** en el catálogo; el admin se usa principalmente en escritorio.
- **Rendimiento:** páginas del catálogo generadas en el servidor con revalidación; imágenes optimizadas por Cloudinary.
- **Seguridad:** contraseñas con bcrypt, sesión en cookie `httpOnly`, validación de entrada en todos los endpoints, firma del webhook validada, secretos solo en variables de entorno.
- **Integridad:** operaciones de dinero y stock dentro de transacciones; nada se borra en pagos, cajas ni ventas.
- **Accesibilidad:** contraste AA, foco visible, navegación por teclado (el mostrador debe poder usarse sin mouse).
- **SEO:** metadata por página, Open Graph, sitemap y URLs amigables.

## 8. Criterios de éxito de la demo

1. Un visitante pide un libro, paga con una tarjeta de prueba de Mercado Pago y el pedido aparece como pagado sin intervención manual.
2. Un vendedor abre caja, escanea un ISBN, cobra en efectivo y cierra caja con el arqueo correcto.
3. El link de un libro compartido por WhatsApp muestra la portada.
4. Los tests de caja, webhook y stock pasan.

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Pedidos falsos o spam | Turnstile, límite por IP, confirmación manual por WhatsApp, vencimiento a 2 h |
| Webhook duplicado suma dos veces | Referencia única por pago y procesamiento idempotente |
| Venta simultánea del último ejemplar (web y mostrador) | Descuento de stock en transacción con verificación de cantidad |
| Cambios en APIs de Mercado Pago o de libros | Integraciones aisladas en servicios propios; revisar documentación en cada etapa |
| Excel del cliente desordenado (columnas distintas, ISBN convertidos a número, precios con formato) | Mapeo de columnas, normalización de datos, vista previa y descarga de errores |
| Alcance demasiado grande | MVP cerrado en este documento; todo lo demás va a etapa 2 |
