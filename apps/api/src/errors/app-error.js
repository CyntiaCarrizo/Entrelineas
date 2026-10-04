// Error de negocio con estado HTTP y código estable para el frontend.
export class AppError extends Error {
  constructor(status, codigo, mensaje) {
    super(mensaje);
    this.name = 'AppError';
    this.status = status;
    this.codigo = codigo;
  }
}
