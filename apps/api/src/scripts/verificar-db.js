// Prueba la conexión a MySQL con los datos de .env. Uso: npm run db:check
import 'dotenv/config';
import { prisma } from '../db/prisma.js';

try {
  const [fila] = await prisma.$queryRaw`SELECT DATABASE() AS base, VERSION() AS version`;
  console.log(`Conexión correcta: base "${fila.base}", MySQL ${fila.version}.`);
} catch (error) {
  console.error('No se pudo conectar a MySQL. Revisá DATABASE_URL en apps/api/.env.');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
