import express from 'express';
import { router } from './routes/index.js';
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores.js';

export function crearApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', router);

  app.use(rutaNoEncontrada);
  app.use(manejarErrores);

  return app;
}
