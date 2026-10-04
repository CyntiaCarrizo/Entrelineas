import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validar } from '../src/middlewares/validar.js';
import { AppError } from '../src/errors/app-error.js';

const esquema = z.object({ nombre: z.string().min(1), telefono: z.string().min(8) });

describe('middleware validar', () => {
  it('deja pasar datos válidos y los guarda en req.validado', () => {
    const req = { body: { nombre: 'Ana', telefono: '1155556666' } };
    const next = vi.fn();
    validar(esquema)(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.validado.body).toEqual({ nombre: 'Ana', telefono: '1155556666' });
  });

  it('rechaza datos inválidos con un AppError 400', () => {
    const req = { body: { nombre: 'Ana', telefono: '123' } };
    const next = vi.fn();
    validar(esquema)(req, {}, next);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.status).toBe(400);
    expect(error.codigo).toBe('DATOS_INVALIDOS');
    expect(error.message).toMatch(/^telefono:/);
  });
});
