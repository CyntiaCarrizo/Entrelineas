// Único cliente de Prisma de la API. Solo lo importan los repositorios.
// Explicación en docs/guia-prisma.md, sección 3.4.
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.ts';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

export const prisma = new PrismaClient({ adapter });
