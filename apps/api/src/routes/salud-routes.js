import { Router } from 'express';
import { obtenerSalud, obtenerSaludBaseDeDatos } from '../controllers/salud-controller.js';

export const saludRouter = Router();

saludRouter.get('/', obtenerSalud);
saludRouter.get('/db', obtenerSaludBaseDeDatos);
