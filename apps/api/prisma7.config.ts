// Configuración de la CLI de Prisma (migrate, generate, studio).
// La API en ejecución no usa este archivo: se conecta desde src/db/prisma.js.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
