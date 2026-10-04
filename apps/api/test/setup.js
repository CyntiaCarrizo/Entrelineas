// Corre antes de cada archivo de tests: apunta Prisma a la base de prueba.
import 'dotenv/config';

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('Falta TEST_DATABASE_URL en apps/api/.env');
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = 'test';
