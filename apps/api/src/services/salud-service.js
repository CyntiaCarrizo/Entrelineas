import { AppError } from '../errors/app-error.js';
import { verificarConexion } from '../repositories/salud-repository.js';

export async function obtenerEstadoBaseDeDatos() {
  try {
    await verificarConexion();
    return { baseDeDatos: 'conectada' };
  } catch (error) {
    console.error(error);
    throw new AppError(503, 'BASE_NO_DISPONIBLE', 'No hay conexión con la base de datos.');
  }
}
