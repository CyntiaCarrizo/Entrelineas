# Bitácora del proyecto

Registro de avance, decisiones y observaciones. Se actualiza en cada sesión de trabajo y se regenera el PDF con `npm run pdf` dentro de `documentacion/`.

## Estado actual

| Ítem | Valor |
|---|---|
| Fase | 0 — Preparación (sin empezar) |
| Código | Todavía no hay repositorio de código |
| Próximo paso | Decidir acceso a datos (Prisma o `mysql2`) y crear la estructura `apps/web` + `apps/api` |

## Entorno de desarrollo verificado

| Herramienta | Versión |
|---|---|
| Node.js | 20.19.5 |
| npm | 10.8.2 |
| MySQL Server | 9.3.0 (local) |
| Git | 2.46.2 |
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
