import { Router } from 'express';
import { saludRouter } from './salud-routes.js';

export const router = Router();

router.use('/salud', saludRouter);
