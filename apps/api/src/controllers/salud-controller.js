import { obtenerEstadoBaseDeDatos } from '../services/salud-service.js';

export function obtenerSalud(req, res) {
  res.json({ data: { estado: 'ok' } });
}

export async function obtenerSaludBaseDeDatos(req, res) {
  const estado = await obtenerEstadoBaseDeDatos();
  res.json({ data: estado });
}
