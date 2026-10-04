# Entrelíneas

Librería de barrio con catálogo web, pedidos por WhatsApp, pagos con Mercado Pago, mostrador con lector de ISBN y caja diaria. Proyecto de portfolio.

> En construcción. El avance y las decisiones están en [`docs/bitacora.md`](docs/bitacora.md) y en el PDF [`docs/pdf/Entrelineas-Documentacion.pdf`](docs/pdf/Entrelineas-Documentacion.pdf).

## Stack

- **Web:** Next.js 16 (App Router, JavaScript) + Tailwind CSS 4
- **API:** Node.js 24 + Express 5 + Zod
- **Base de datos:** MySQL + Prisma ORM 7
- **Tests:** Vitest + Supertest

## Cómo correrlo en local

Requisitos: Node.js 24 y MySQL 8 o superior.

```bash
npm install

# API
cp apps/api/.env.example apps/api/.env     # completar DATABASE_URL
npm run db:check -w apps/api               # prueba la conexión
npm run dev:api                            # http://localhost:4000

# Web (en otra terminal)
cp apps/web/.env.example apps/web/.env.local
npm run dev:web                            # http://localhost:3000

# Tests
npm test
```

## Documentación

| Documento | Contenido |
|---|---|
| [PRD](docs/PRD.md) | Qué se construye y para quién |
| [Arquitectura](docs/arquitectura.md) | Cómo: modelo de datos, flujos, endpoints |
| [Guía de Prisma](docs/guia-prisma.md) | Conexión, esquema, migraciones y transacciones explicadas |
| [Diseño](docs/design.md) | Paleta, tipografía y layouts |
| [Reglas](docs/rules.md) | Convenciones de código |
| [Tareas](docs/task.md) | Avance por fases |
