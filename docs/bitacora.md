# Bitácora del proyecto

Registro de avance, decisiones y observaciones. Se actualiza en cada sesión de trabajo. Los PDF se regeneran con `npm run docs:pdf` desde la raíz del repositorio: uno con la documentación base y uno por cada fase completada.

## Estado actual

| Ítem | Valor |
|---|---|
| Fase | 0 — Preparación (completa) |
| Rama de trabajo | `feat/fase-0-preparacion` → pull request a `main` |
| Repositorio | https://github.com/CyntiaCarrizo/Entrelineas |
| Tests | 6 pasando (Vitest + Supertest) |
| Próximo paso | Fase 1: tablas con Prisma, seed, login y roles |

## Entorno de desarrollo verificado

| Herramienta | Versión |
|---|---|
| Node.js | 24.19.0 LTS (antes 20.19.5) |
| npm | 11.17.0 |
| MySQL Server | 9.3.0 (local) |
| Git | 2.46.2 |
| GitHub CLI (`gh`) | No instalado (se usa `git` directamente) |
| Espacio libre en C: | ~0,9 GB después de instalar (justo) |
| Sistema | Windows 11 Pro |

## Sesiones

### 2026-10-04 — Lectura de la documentación y armado del PDF

**Qué se hizo**

- Lectura completa de `PRD (1).md`, `arquitectura.md`, `rules.md`, `task.md` y `memory.md`.
- Se creó la carpeta `documentacion/` con un generador que une todos los documentos en un único PDF (`Entrelineas-Documentacion.pdf`).
- Se corrigió en `memory.md` una línea en blanco que partía la tabla de decisiones (las filas de Importación y Librería de Excel no se mostraban como tabla).

**Observaciones sobre la documentación**

1. **Falta `design.md`.** Lo citan `rules.md` (tokens de Tailwind), `task.md` (Fase 0) y `memory.md`. Hay que escribirlo antes de configurar Tailwind: paleta (papel, tinta, verde tela, ocre), tipografías (Literata + Public Sans) y el componente estante.
2. **Nombre del PRD.** El archivo se llama `PRD (1).md` pero los demás documentos lo citan como `PRD.md`. Conviene renombrarlo al copiarlo a `docs/`.
3. **Numeración en `arquitectura.md`.** En "Flujos críticos" la sección 5.5 (Importación) aparece antes que la 5.4 (Cierre de caja).
4. **Decisiones pendientes que bloquean:** acceso a datos (Prisma o `mysql2`), antes de la Fase 1; formato real del Excel de la librería, antes de la importación (Fase 2).

**Pendiente**

- Decidir Prisma o `mysql2`.
- Escribir `design.md`.
- Empezar la Fase 0.

### 2026-10-04 — Prisma, repositorio y estructura

**Decisiones**

- **Acceso a datos: Prisma ORM 7.10.** Se fija la 7.10 porque la etiqueta `latest` de npm apunta a Prisma 8 en versión candidata (rc). Se conecta a MySQL con `@prisma/adapter-mariadb`. La explicación completa está en el anexo "Prisma explicado", después del capítulo de Arquitectura.
- **Flujo de Git:**
  - `main` siempre estable y publicable.
  - Una rama por fase (`feat/fase-0-preparacion`, `feat/fase-1-base-de-datos`, …) que entra a `main` por *pull request*.
  - Cuando el catálogo esté estable (fin de la Fase 2) se conecta Vercel: publica `main` y genera una vista previa de cada rama.
  - La API y MySQL no pueden ir en Vercel: van en Railway o Render (`arquitectura.md`, sección 10).

**Qué se hizo**

- Documentos movidos a `docs/`. `PRD (1).md` pasó a llamarse `PRD.md`. Se sumó `design.md`, y el PDF usa ahora su paleta oficial.
- Repositorio Git iniciado en `main` con la documentación (primer commit). Se creó la rama `feat/fase-0-preparacion`.
- Raíz con *npm workspaces* (`apps/api`, `apps/web`, `docs/pdf`), `.gitignore` (excluye `.env`, claves y el cliente generado de Prisma) y `.gitattributes`.
- `apps/web` generado con `create-next-app` 16.3 (App Router, JavaScript, Tailwind v4).
- `apps/api` con `package.json`: Express 5, Zod 4, Prisma 7.10, Vitest y Supertest.
- `arquitectura.md`, `memory.md` y `task.md` actualizados con la decisión.

**Problemas encontrados**

1. **Sin espacio en disco.** El disco C: tiene 0,25 GB libres y `npm install` falla con `ENOSPC`. Next.js, Prisma y Vitest necesitan del orden de 1 GB entre dependencias y caché.
2. **Prisma 7 y JavaScript.** El generador nuevo (`prisma-client`) escribe el cliente en TypeScript. Node 20 no lo ejecuta directamente, y además dejó de tener soporte en abril de 2026. Propuesta: actualizar a Node 24 LTS, que ejecuta TypeScript simple de forma nativa. Se verifica al poder instalar.
3. **MySQL.** El usuario `root` pide contraseña. Hace falta para crear la base y el usuario `entrelineas` (guía de Prisma, sección 3.2).
4. **GitHub.** No está instalada la CLI `gh`. Para subir el repositorio hace falta crearlo en github.com (vacío, sin README) y pasar su URL.

**Pendiente**

- Liberar espacio en C: e instalar dependencias.
- Decidir la actualización a Node 24 LTS.
- Crear la base y el usuario de MySQL.
- Crear el repositorio en GitHub y hacer el primer *push*.
- Completar la Fase 0: estructura de Express, middleware de errores, Tailwind con los tokens, rewrite de `/api`, Vitest.

### 2026-10-04 — Fase 0 completa

**Espacio en disco**

- Se vació la papelera (19 elementos, 0,31 GB) y la caché de npm (0,9 GB). Pasamos de 0,25 GB a 1,36 GB libres.
- La caché de npm se vuelve a llenar en cada instalación: se limpió de nuevo después de instalar. Queda ~0,9 GB libre, que es poco. Convendría liberar más (`AppDataLocalTemp` ocupa 0,45 GB y `Descargas`, 0,47 GB).

**Node.js 24 LTS**

- Se instaló Node 24.19.0 con `winget`, reemplazando Node 20 en la misma carpeta. La raíz exige `"node": ">=24"`.
- Motivo: el cliente de Prisma 7 se genera en TypeScript (`client.ts`) y Node 24 lo ejecuta directamente (*type stripping*). Verificado: la API importa `client.ts` sin compilar.
- npm 11 bloquea los scripts de instalación. Se revisaron y aprobaron los de `prisma`, `@prisma/engines` (descarga el motor de migraciones) y `unrs-resolver` (binario de ESLint).

**MySQL**

- Se crearon tres bases: `entrelineas` (desarrollo), `entrelineas_shadow` (base sombra de Prisma) y `entrelineas_test` (tests).
- Usuario `entrelineas` con contraseña aleatoria guardada solo en `apps/api/.env`. Tiene permisos **solo sobre esas tres bases**. Primero se le había dado `CREATE, DROP` global para la base sombra, pero se revocó: el servidor tiene bases de otros proyectos (`clinica_db`, `gym_db`, …) y ese permiso le habría permitido borrarlas.
- Problema: Prisma daba `pool timeout`. Probando el driver directamente apareció la causa: `ER_CANNOT_RETRIEVE_RSA_KEY`, por la autenticación de MySQL 9. Solución: `?allowPublicKeyRetrieval=true` en las URLs. Explicado en la guía de Prisma (sección 3.1).

**API (`apps/api`)**

- Express 5 con capas `routes → controllers → services → repositories`.
- `AppError` y middleware central de errores: respuestas `{ data }` o `{ error: { codigo, mensaje } }`, sin *stack traces*, con 404 y JSON mal formado.
- Middleware `validar(esquema)` con Zod.
- `src/db/prisma.js`: único cliente, con el adapter MariaDB. `prisma7.config.ts` con base sombra propia.
- Endpoints `GET /api/salud` y `GET /api/salud/db` (prueba la conexión). Script `npm run db:check`.
- Vitest + Supertest contra `entrelineas_test`: 6 tests pasando (salud, conexión a la base de prueba, 404, JSON inválido, validación).

**Web (`apps/web`)**

- Next.js 16.3 + Tailwind 4 con los tokens de `design.md` (`bg-papel`, `text-tinta`, `bg-tela`, `rounded-campo`, …).
- Literata y Public Sans con `next/font`. `lang="es-AR"`, foco visible y `prefers-reduced-motion`.
- Rewrite de `/api/*` hacia Express. Verificado de punta a punta: `localhost:3100/api/salud/db` → Express → MySQL.
- Página de inicio provisoria con el logo (línea ocre). `next build` y ESLint sin errores.

**Incidente**

- Al probar la API, el puerto 4000 ya estaba ocupado por la API de otro proyecto local (**bonhomia**). El comando que cerraba el servidor de prueba detuvo también ese proceso. Su `node --watch` lo reinició solo y se verificó que volvió a responder. Desde entonces, las pruebas usan los puertos 4100 y 3100, y se cierran solo esos.

**GitHub**

- Remoto: `https://github.com/CyntiaCarrizo/Entrelineas.git`. Se subieron `main` (documentación) y `feat/fase-0-preparacion`.

**Pendiente**

- Revisar y aprobar el *pull request* de `feat/fase-0-preparacion` a `main` en GitHub.
- Fase 1: modelos de Prisma para todas las tablas, primera migración, seed, login y roles.

### 2026-10-04 — Un PDF por fase

- La documentación se separa en un **PDF por fase completada**, en lugar de un único PDF que crece:
  - `Entrelineas-00-Documentacion-base.pdf`: PRD, arquitectura, diseño, reglas, tareas, memoria y esta bitácora. Se regenera cuando cambian.
  - `Entrelineas-Fase-0-Preparacion.pdf`: informe de la Fase 0 (qué se construyó, cómo funciona cada parte, problemas y soluciones, cómo probarlo) con el anexo "Prisma explicado".
- Cada fase nueva suma su informe en `docs/fases/` y su entrada en `docs/pdf/generar-pdf.mjs`. Se puede generar uno solo con `npm run docs:pdf -- fase-1`.
- Se quitó `Entrelineas-Documentacion.pdf`.
