import { AppError } from '../errors/app-error.js';

export function rutaNoEncontrada(req, res, next) {
  next(new AppError(404, 'NO_ENCONTRADO', 'La ruta pedida no existe.'));
}

// Middleware central: nunca devuelve stack traces ni errores internos al cliente.
// eslint-disable-next-line no-unused-vars
export function manejarErrores(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: { codigo: error.codigo, mensaje: error.message } });
  }

  // JSON mal formado en el cuerpo del pedido
  if (error.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo del pedido no es un JSON válido.' } });
  }

  console.error(error);
  return res
    .status(500)
    .json({ error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.' } });
}
