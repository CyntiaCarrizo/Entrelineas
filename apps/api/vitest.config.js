import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    // Los tests comparten la base de prueba: se ejecutan de a un archivo por vez.
    fileParallelism: false,
  },
});
