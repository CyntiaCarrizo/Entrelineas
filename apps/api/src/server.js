import 'dotenv/config';
import { crearApp } from './app.js';
import { prisma } from './db/prisma.js';

const puerto = Number(process.env.PORT) || 4000;

const servidor = crearApp().listen(puerto, () => {
  console.log(`API de Entrelíneas escuchando en http://localhost:${puerto}`);
});

// Cierre ordenado: deja de aceptar pedidos y cierra el pool de MySQL.
async function apagar(senal) {
  console.log(`Recibí ${senal}, cerrando…`);
  servidor.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));
