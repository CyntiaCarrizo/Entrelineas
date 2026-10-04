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
| Node.js | 24 LTS (`engines` en la raíz) | Node 20 quedó sin soporte (abril 2026) y Node 24 ejecuta el cliente TypeScript de Prisma 7 sin compilar |
| Bases MySQL | `entrelineas`, `entrelineas_shadow` y `entrelineas_test`, con el usuario `entrelineas` que solo tiene permisos sobre esas tres | Mínimo privilegio: en el mismo servidor hay otras bases de otros proyectos |
| Documentación en PDF | Un PDF de documentación base + un PDF por fase completada (`docs/fases/` → `docs/pdf/`) | Cada entrega queda cerrada y se puede leer por separado |
| Monorepo | npm workspaces (`apps/api`, `apps/web`, `docs/pdf`) | Un solo `npm install` y un solo lockfile |
| Facturas | MVP: carga manual de PDF. Etapa 2: ARCA en homologación | Terminar el MVP primero |
| QR y Point de Mercado Pago | MVP: registro manual. Etapa 2: integración | Reutilizar la lógica del webhook después |
| Diseño | Paleta papel, tinta, verde tela y ocre; Literata + Public Sans; catálogo como estante | Identidad propia de librería |
| Importación desde Excel | En el MVP, con vista previa obligatoria y modo explícito (crear, actualizar o ambos) | La librería ya tiene su catálogo en Excel; nada se pisa sin que el admin lo vea |
| Acceso a datos | Prisma ORM 7.10 (estable) con `@prisma/adapter-mariadb` | Migraciones versionadas, transacciones simples y consultas seguras. La etiqueta `latest` de npm apunta a Prisma 8 en versión candidata (rc), por eso se fija la 7.10. Guía completa en `guia-prisma.md` |
| Repositorio y ramas | GitHub desde el inicio. `main` siempre estable; una rama por fase (`feat/fase-0-preparacion`, …) que entra a `main` por pull request | Historial prolijo para el portfolio; Vercel publica `main` y genera vistas previas de cada rama |
| Librería de Excel | ExcelJS (`.xlsx` y `.csv`); los `.xls` viejos se guardan como `.xlsx` antes de subir | Mantenida y disponible en npm; el paquete `xlsx` de npm quedó desactualizado |

## Decisiones pendientes

- **Formato del Excel de la librería:** qué columnas tiene, cómo vienen los precios y si incluye stock. Ajustar el mapeo automático cuando se conozca.

## Notas técnicas para recordar

- Mercado Pago: nunca confiar en el cuerpo del webhook ni en las `back_urls`; consultar el pago por id.
- MySQL 9 + driver `mariadb`: las URLs llevan `?allowPublicKeyRetrieval=true`; sin eso Prisma muestra `pool timeout`.
- El puerto 4000 lo usa también otro proyecto local (bonhomia). Si está corriendo, levantar la API con `PORT=4100` y la web con `API_URL=http://localhost:4100`.
- npm 11 bloquea los scripts de instalación: los de `prisma`, `@prisma/engines` y `unrs-resolver` están aprobados en `allowScripts` del `package.json` raíz. Si se actualiza Prisma, aprobar la nueva versión con `npm approve-scripts`.
- Disco C: muy justo de espacio: después de instalar dependencias, correr `npm cache clean --force`.
- Para probar el webhook en local hace falta un túnel; la URL cambia en cada ejecución del plan gratuito, así que va en `.env`.
- ARCA (etapa 2): el WSASS se adhiere con la clave fiscal de persona física desde el Administrador de Relaciones; el token del WSAA se cachea hasta su vencimiento.
- Revisar la documentación vigente de Mercado Pago y de ARCA al empezar cada integración: sus APIs cambian.

## Estado

- Fase actual: **0 — Preparación, completa**. Próxima: Fase 1 (rama `feat/fase-1-base-de-datos`).
- Última actualización: 2026-10-04 — Fase 0 terminada: API y web funcionando, conexión a MySQL, tests pasando y repositorio en GitHub.

## Registro de sesiones

<!-- Agregar una línea por sesión: fecha — qué se hizo — qué quedó pendiente -->

- 2026-10-04 — Lectura de documentos, PDF de documentación, `bitacora.md` — decidir acceso a datos.
- 2026-10-04 — Prisma elegido, `guia-prisma.md`, Git con rama `feat/fase-0-preparacion`, Next.js creado en `apps/web` — liberar disco, instalar dependencias, contraseña de MySQL, repositorio en GitHub.
- 2026-10-04 — Espacio liberado, Node 24, bases y usuario MySQL, API Express + Prisma, web Next.js con tokens, rewrite, Vitest (6 tests), push a GitHub — empezar la Fase 1.
