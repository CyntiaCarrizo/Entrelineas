# Bitácora del proyecto

Registro de avance, decisiones y observaciones. Se actualiza en cada sesión de trabajo y se regenera el PDF con `npm run docs:pdf` desde la raíz del repositorio.

## Estado actual

| Ítem | Valor |
|---|---|
| Fase | 0 — Preparación (en curso) |
| Rama de trabajo | `feat/fase-0-preparacion` |
| Código | Repositorio Git local creado; Next.js generado en `apps/web`; `apps/api` con dependencias declaradas |
| Bloqueo | Disco C: con 0,25 GB libres: no se pueden instalar dependencias |
| Próximo paso | Liberar espacio, instalar dependencias, conectar MySQL y subir a GitHub |

## Entorno de desarrollo verificado

| Herramienta | Versión |
|---|---|
| Node.js | 20.19.5 |
| npm | 10.8.2 |
| MySQL Server | 9.3.0 (local) |
| Git | 2.46.2 |
| GitHub CLI (`gh`) | No instalado |
| Espacio libre en C: | 0,25 GB (insuficiente) |
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
