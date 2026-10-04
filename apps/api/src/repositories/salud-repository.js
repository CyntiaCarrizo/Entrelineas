import { prisma } from '../db/prisma.js';

export async function verificarConexion() {
  await prisma.$queryRaw`SELECT 1`;
}
