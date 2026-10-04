# Memoria del proyecto — Entrelíneas

Contexto acumulado para retomar el trabajo (persona o asistente de IA). Leer al empezar cada sesión. Actualizar al terminar: decisiones nuevas, problemas encontrados y estado.

## Contexto

- Proyecto de **portfolio**. La librería "Entrelíneas" es ficticia.
- Objetivo de la demo: que quien la revise pueda pedir, pagar con Mercado Pago de prueba y usar el mostrador y la caja en pocos minutos.
- Documentos de referencia: `PRD.md` (qué), `arquitectura.md` (cómo), `rules.md` (reglas), `design.md` (visual), `task.md` (avance).

## Decisiones tomadas

| Tema | Decisión | Motivo |
|---|---|---|
| Login de clientes | No hay. El pedido se valida por WhatsApp con un código | Menos fricción; el número de WhatsApp identifica al cliente |
| Checkout | Pedido guardado como `pendiente` + enlace `wa.me` | No requiere la API de WhatsApp Business |
| Antibots | Cloudflare Turnstile + rate limit + vencimiento a 2 h | Proteger sin pedir cuenta |
| Pago online | Mercado Pago Checkout Pro con webhook | Confirmación automática; no se manejan tarjetas |
| Transferencias | Número de operación único + comprobante; confirmación manual | No se pueden verificar automáticamente |
| Ventas del local | Misma tabla `ventas` con `canal = 'local'` | Una sola fuente para la caja |
| Pagos en la caja | Cuentan en la caja abierta al momento del cobro | La caja refleja lo cobrado ese día |
| Borrados | Ningún pago, venta, caja ni factura se borra; se anula | Historial confiable |
| Escáner | Lector USB como teclado, ISBN-13 como identificador | Sin drivers ni librerías |
| Datos de libros | Google Books, con Open Library de respaldo | Mejor cobertura en español |
| Imágenes | Cloudinary; se guarda `public_id`, no la URL | Transformaciones y cambio de proveedor fácil |
| Frontend | Next.js (App Router) | SEO y vista previa de links en WhatsApp |
| Backend | Express + MySQL | Stack ya conocido |
| Web y API | Mismo dominio vía rewrites de Next | Cookies de sesión sin CORS entre dominios |
| Lenguaje | JavaScript | Coherencia con proyectos anteriores |
| Facturas | MVP: carga manual de PDF. Etapa 2: ARCA en homologación | Terminar el MVP primero |
| QR y Point de Mercado Pago | MVP: registro manual. Etapa 2: integración | Reutilizar la lógica del webhook después |
| Diseño | Paleta papel, tinta, verde tela y ocre; Literata + Public Sans; catálogo como estante | Identidad propia de librería |
| Importación desde Excel | En el MVP, con vista previa obligatoria y modo explícito (crear, actualizar o ambos) | La librería ya tiene su catálogo en Excel; nada se pisa sin que el admin lo vea |
| Acceso a datos | Prisma ORM 7.10 (estable) con `@prisma/adapter-mariadb` | Migraciones versionadas, transacciones simples y consultas seguras. La etiqueta `latest` de npm apunta a Prisma 8 en versión candidata (rc), por eso se fija la 7.10. Guía completa en `guia-prisma.md` |
| Repositorio y ramas | GitHub desde el inicio. `main` siempre estable; una rama por fase (`feat/fase-0-preparacion`, …) que entra a `main` por pull request | Historial prolijo para el portfolio; Vercel publica `main` y genera vistas previas de cada rama |
| Librería de Excel | ExcelJS (`.xlsx` y `.csv`); los `.xls` viejos se guardan como `.xlsx` antes de subir | Mantenida y disponible en npm; el paquete `xlsx` de npm quedó desactualizado |

## Decisiones pendientes

- **Versión de Node.js:** Node 20 (instalado) quedó sin soporte en abril de 2026, y el cliente de Prisma 7 se genera en TypeScript, que Node 20 no ejecuta directamente. Propuesta: pasar a Node 24 LTS. Confirmar al instalar dependencias.
- **Formato del Excel de la librería:** qué columnas tiene, cómo vienen los precios y si incluye stock. Ajustar el mapeo automático cuando se conozca.

## Notas técnicas para recordar

- Mercado Pago: nunca confiar en el cuerpo del webhook ni en las `back_urls`; consultar el pago por id.
- Para probar el webhook en local hace falta un túnel; la URL cambia en cada ejecución del plan gratuito, así que va en `.env`.
- ARCA (etapa 2): el WSASS se adhiere con la clave fiscal de persona física desde el Administrador de Relaciones; el token del WSAA se cachea hasta su vencimiento.
- Revisar la documentación vigente de Mercado Pago y de ARCA al empezar cada integración: sus APIs cambian.

## Estado

- Fase actual: **0 — Preparación**.
- Última actualización: 2026-10-04 — documentos movidos a `docs/`, repositorio Git creado, decisión de Prisma y guía. Instalación de dependencias frenada por falta de espacio en disco.

## Registro de sesiones

<!-- Agregar una línea por sesión: fecha — qué se hizo — qué quedó pendiente -->

- 2026-10-04 — Lectura de documentos, PDF de documentación, `bitacora.md` — decidir acceso a datos.
- 2026-10-04 — Prisma elegido, `guia-prisma.md`, Git con rama `feat/fase-0-preparacion`, Next.js creado en `apps/web` — liberar disco, instalar dependencias, contraseña de MySQL, repositorio en GitHub.
