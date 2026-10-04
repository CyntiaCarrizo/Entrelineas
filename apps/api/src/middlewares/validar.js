import { AppError } from '../errors/app-error.js';

// Valida body, query o params con un esquema de Zod antes de llegar al controller.
// Los datos validados quedan en req.validado[origen].
export function validar(esquema, origen = 'body') {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req[origen]);
    if (!resultado.success) {
      const primero = resultado.error.issues[0];
      const campo = primero.path.join('.');
      const mensaje = campo ? `${campo}: ${primero.message}` : primero.message;
      return next(new AppError(400, 'DATOS_INVALIDOS', mensaje));
    }
    req.validado = { ...req.validado, [origen]: resultado.data };
    next();
  };
}
