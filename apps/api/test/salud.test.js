import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { crearApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

const app = crearApp();

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/salud', () => {
  it('responde ok con la forma { data }', async () => {
    const res = await request(app).get('/api/salud');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { estado: 'ok' } });
  });

  it('se conecta a la base de prueba', async () => {
    const res = await request(app).get('/api/salud/db');
    expect(res.status).toBe(200);
    expect(res.body.data.baseDeDatos).toBe('conectada');

    const [fila] = await prisma.$queryRaw`SELECT DATABASE() AS base`;
    expect(fila.base).toBe('entrelineas_test');
  });
});

describe('Errores', () => {
  it('una ruta inexistente devuelve 404 con la forma { error }', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { codigo: 'NO_ENCONTRADO', mensaje: 'La ruta pedida no existe.' },
    });
  });

  it('un JSON mal formado devuelve 400 sin detalles internos', async () => {
    const res = await request(app)
      .post('/api/salud')
      .set('Content-Type', 'application/json')
      .send('{ "roto": ');
    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('JSON_INVALIDO');
    expect(JSON.stringify(res.body)).not.toMatch(/stack|SyntaxError/);
  });
});
