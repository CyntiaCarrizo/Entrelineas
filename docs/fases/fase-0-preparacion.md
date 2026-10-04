# Fase 0 — Preparación

## Resumen

| | |
|---|---|
| **Objetivo** | Dejar armada la base técnica del proyecto: repositorio, API, web, base de datos y tests, todo conectado y funcionando |
| **Estado** | Completa |
| **Fecha** | 4 de octubre de 2026 |
| **Rama** | `feat/fase-0-preparacion` |
| **Resultado verificable** | `GET /api/salud/db` responde `conectada` pasando por web → API → MySQL; 6 tests en verde; `next build` sin errores |

Al terminar esta fase todavía no hay ninguna función de la librería (catálogo, pedidos, caja). Lo que hay es el **esqueleto**: cada pieza en su lugar, conectada con las demás y con las reglas del proyecto aplicadas desde la primera línea. Las fases siguientes van a agregar funciones sobre esta base, sin rehacerla.

## Qué se construyó

| Tarea de `task.md` | Cómo quedó |
|---|---|
| Decidir el acceso a datos | Prisma ORM 7.10 (ver el anexo "Prisma explicado" al final de este documento) |
| Repositorio con `apps/web`, `apps/api` y `docs/` | Monorepo con *npm workspaces*, en GitHub |
| API: Express, carpetas, errores, Zod, `.env.example` | Express 5 con capas, `AppError`, middleware central de errores y validación con Zod |
| Web: Next.js, Tailwind, fuentes, tokens | Next.js 16.3, Tailwind 4 con la paleta de `design.md`, Literata y Public Sans |
| Rewrite de `/api/*` hacia Express | En `apps/web/next.config.mjs` |
| MySQL local y conexión desde la API | Tres bases y un usuario propio con permisos acotados |
| Vitest y Supertest con base de prueba | 6 tests contra `entrelineas_test` |
| *(extra)* Actualizar a Node.js 24 | Requisito de Prisma 7 en un proyecto JavaScript |

## Cómo está organizado el repositorio

```
Entrelineas/
├── apps/
│   ├── api/                  ← Express + Prisma (puerto 4000)
│   │   ├── prisma/           ← schema.prisma y migraciones
│   │   ├── prisma7.config.ts ← configuración de la CLI de Prisma
│   │   ├── src/
│   │   │   ├── app.js        ← arma la aplicación Express
│   │   │   ├── server.js     ← la pone a escuchar en un puerto
│   │   │   ├── routes/  controllers/  services/  repositories/
│   │   │   ├── middlewares/  ← errores y validación
│   │   │   ├── errors/       ← AppError
│   │   │   ├── db/prisma.js  ← el único cliente de Prisma
│   │   │   └── generated/    ← cliente generado por Prisma (no va a Git)
│   │   ├── test/             ← tests de Vitest
│   │   └── .env              ← secretos locales (no va a Git)
│   └── web/                  ← Next.js (puerto 3000)
│       ├── app/              ← páginas (App Router)
│       ├── components/       ← componentes React (Logo.jsx)
│       └── next.config.mjs   ← rewrite de /api
├── docs/                     ← toda la documentación y el generador de PDF
├── package.json              ← raíz del monorepo
└── README.md
```

### Monorepo y *npm workspaces*

Un **monorepo** es un solo repositorio que contiene varios proyectos: acá, la API y la web. Las dos se versionan juntas, así un cambio que toca ambas (por ejemplo, un endpoint nuevo y la pantalla que lo usa) queda en un mismo commit.

Los **workspaces** de npm permiten manejar esos proyectos desde la raíz:

- Un solo `npm install` instala las dependencias de todos.
- Un solo `package-lock.json` fija las versiones exactas.
- Las dependencias compartidas se instalan una sola vez en `node_modules/` de la raíz, lo que ahorra espacio.
- Los scripts se ejecutan desde la raíz: `npm run dev:api`, `npm run dev:web`, `npm test`, `npm run docs:pdf`.

## La API por dentro

### El recorrido de un pedido HTTP

Cada pedido atraviesa siempre las mismas capas, y cada capa tiene una sola responsabilidad (regla de `rules.md`, sección 3). Ejemplo real con `GET /api/salud/db`:

```
GET /api/salud/db
  │
  ▼  app.js            express.json() lee el cuerpo; todo /api va al router
  ▼  routes/           salud-routes.js: "GET /db → obtenerSaludBaseDeDatos"
  ▼  controllers/      lee el pedido, llama al servicio, arma la respuesta { data }
  ▼  services/         lógica: si la base no responde, lanza AppError 503
  ▼  repositories/     única capa que habla con la base: prisma.$queryRaw`SELECT 1`
  ▼  MySQL
```

| Capa | Hace | No hace |
|---|---|---|
| **Route** | Asocia método y URL con un controller | Lógica de ningún tipo |
| **Controller** | Traduce HTTP ↔ JavaScript: lee `req`, escribe `res` | Consultar la base |
| **Service** | Reglas del negocio (stock, caja, pagos) | Saber de HTTP o de Prisma |
| **Repository** | Consultas a la base con Prisma | Tomar decisiones de negocio |

**Por qué tanta separación:** cuando en la Fase 5 haya que calcular el cierre de caja, esa cuenta va a vivir en un *service*. Se va a poder probar sin levantar un servidor (sin HTTP) y sin depender de cómo se escriben las consultas. Además, cada archivo va a ser corto y fácil de encontrar.

### Errores: `AppError` y el middleware central

Toda respuesta de la API tiene una de estas dos formas (regla de `rules.md`):

```json
{ "data": { "estado": "ok" } }
{ "error": { "codigo": "NO_ENCONTRADO", "mensaje": "La ruta pedida no existe." } }
```

Para lograrlo:

1. Cuando algo sale mal por una regla del negocio, el código lanza un `AppError` con tres datos: estado HTTP, código y mensaje.
   ```js
   throw new AppError(409, 'SIN_STOCK', 'No hay stock suficiente de El Aleph (quedan 1). Ajustá la cantidad.');
   ```
   - El **código** (`SIN_STOCK`) es para el frontend: nunca cambia, y la web puede decidir qué hacer según el código.
   - El **mensaje** es para la persona: en español, con voseo, y dice cómo seguir.
2. Express 5 atrapa los errores, incluso los de funciones `async`, y los pasa al **middleware central** (`middlewares/errores.js`), que es el último de la cadena.
3. El middleware responde según el caso:
   - si es un `AppError`, devuelve su estado, código y mensaje;
   - si el JSON del cuerpo está mal formado, devuelve `400 JSON_INVALIDO`;
   - cualquier otro error es inesperado: lo escribe en la consola del servidor y al cliente le devuelve un `500` genérico, **sin detalles internos** ni *stack trace* (la lista de funciones donde ocurrió el error). Mostrar eso le daría pistas a un atacante.

Una ruta que no existe cae en `rutaNoEncontrada`, que genera un `AppError(404)`.

### Validación con Zod

**Zod** es una librería para describir cómo tienen que ser los datos y verificarlos. El middleware `validar(esquema)` se pone delante del controller:

```js
const esquemaPedido = z.object({
  nombre: z.string().min(1),
  telefono: z.string().min(8),
  email: z.email().optional(),
});

router.post('/pedidos', validar(esquemaPedido), crearPedido);
```

- Si los datos cumplen el esquema, quedan limpios en `req.validado.body` y el controller trabaja solo con eso.
- Si no, el pedido se corta con `400 DATOS_INVALIDOS` y un mensaje que dice qué campo falló (`telefono: …`).

Así ningún controller recibe datos sin verificar (regla de `rules.md`: "toda entrada se valida con Zod").

### `app.js` y `server.js`: por qué son dos archivos

- `app.js` **arma** la aplicación (middlewares, rutas, errores) y la devuelve, sin ponerla a escuchar.
- `server.js` la **pone a escuchar** en el puerto y maneja el apagado ordenado (cierra las conexiones con MySQL al recibir `Ctrl+C`).

La separación es para los tests: Supertest recibe la aplicación de `app.js` y le hace pedidos en memoria, sin ocupar ningún puerto.

## La web por dentro

### Next.js y el App Router

Next.js es un framework de React que genera las páginas **en el servidor**. Para el catálogo es clave: cuando alguien comparte el link de un libro por WhatsApp, WhatsApp lee el HTML y muestra la portada y el precio. Eso solo funciona si el HTML ya viene armado, sin esperar a que corra JavaScript en el navegador.

En el **App Router**, cada carpeta dentro de `app/` es una ruta y su `page.js` es la página:

| Archivo | URL |
|---|---|
| `app/page.js` | `/` |
| `app/libros/page.js` | `/libros` (Fase 2) |
| `app/libros/[slug]/page.js` | `/libros/el-aleph-jorge-luis-borges` (Fase 2) |

`app/layout.js` envuelve a todas las páginas: ahí se cargan las fuentes, el idioma (`lang="es-AR"`) y el título por defecto.

### El rewrite: web y API en el mismo dominio

```js
// apps/web/next.config.mjs
async rewrites() {
  return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
}
```

Cuando el navegador pide `localhost:3000/api/salud`, Next.js reenvía el pedido a Express (`localhost:4000/api/salud`) y devuelve la respuesta como si fuera propia. El navegador nunca se entera de que existe otro servidor.

**Por qué importa:** en la Fase 1 el login va a guardar la sesión en una *cookie*. Si la web y la API estuvieran en dominios distintos, el navegador trataría esa cookie como "de terceros" y habría que configurar CORS (las reglas que permiten pedidos entre dominios), lo que es complejo y propenso a errores de seguridad. Con el rewrite, todo está en el mismo dominio y la cookie viaja sola.

`API_URL` sale de `.env.local`. En la demo apunta a la API publicada en Railway o Render.

### Tailwind con los tokens de diseño

Tailwind es una forma de dar estilos con clases cortas directamente en el HTML (`bg-papel`, `text-grafito`, `mt-6`). En Tailwind 4, la paleta del proyecto se define en `app/globals.css` con `@theme`:

```css
@theme {
  --color-papel: #F8F8F5;
  --color-tela: #1F4A3D;
  --color-ocre: #B07D24;
  /* … */
}
```

Cada `--color-nombre` crea las clases `bg-nombre`, `text-nombre` y `border-nombre`. Como `rules.md` prohíbe colores sueltos fuera de la paleta, siempre se usan estas clases y nunca un `#hex` directamente en un componente.

También quedaron aplicadas desde el inicio dos reglas de accesibilidad:

- **Foco visible:** contorno verde tela de 2 px en todo elemento enfocado con el teclado.
- **`prefers-reduced-motion`:** si la persona pidió menos animaciones en su sistema, se desactivan todas.

### Fuentes con `next/font`

Literata y Public Sans se cargan con `next/font/google`. Next.js descarga los archivos en el momento del *build* y los sirve desde el mismo sitio. No hay pedidos a Google cuando alguien visita la página (mejor privacidad y velocidad), y se evita el salto visual cuando la fuente termina de cargar.

## Base de datos

| Base | Para qué | Quién la usa |
|---|---|---|
| `entrelineas` | Desarrollo | La API con `npm run dev:api` |
| `entrelineas_shadow` | Base sombra de Prisma | Solo `prisma migrate dev` (se borra sola) |
| `entrelineas_test` | Tests | Vitest |

El usuario `entrelineas` tiene permisos **solo** sobre esas tres bases. El detalle de la conexión, la configuración y los conceptos de Prisma está en el anexo al final de este documento.

## Tests

**Vitest** ejecuta los tests y **Supertest** le hace pedidos HTTP a la aplicación Express sin levantar un servidor.

```js
it('una ruta inexistente devuelve 404 con la forma { error }', async () => {
  const res = await request(app).get('/api/no-existe');
  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: { codigo: 'NO_ENCONTRADO', mensaje: 'La ruta pedida no existe.' } });
});
```

Cada test se lee como una frase: "hacé este pedido, **esperá** (`expect`) este resultado".

| Archivo | Qué verifica |
|---|---|
| `test/salud.test.js` | La API responde con `{ data }`; se conecta a la base **de prueba** (y no a la de desarrollo); 404 con `{ error }`; un JSON roto devuelve 400 sin detalles internos |
| `test/validar.test.js` | `validar` deja pasar datos correctos y rechaza los incorrectos con `AppError 400` |

`test/setup.js` cambia `DATABASE_URL` por `TEST_DATABASE_URL` antes de cada archivo. Así los tests nunca tocan los datos de desarrollo. Se ejecutan con `npm test` desde la raíz.

## Variables de entorno y secretos

Los datos sensibles (contraseñas, claves de Mercado Pago) **nunca van al repositorio**:

| Archivo | ¿Va a Git? | Contenido |
|---|---|---|
| `apps/api/.env` | No | Valores reales: la contraseña de MySQL |
| `apps/api/.env.example` | Sí | Las mismas variables con valores de ejemplo |
| `apps/web/.env.local` | No | `API_URL` real |
| `apps/web/.env.example` | Sí | Plantilla |

Los `.env.example` documentan qué variables hay que completar. Quien clone el repositorio los copia como `.env` y pone sus valores. Antes de cada commit se verifica que ningún archivo con secretos esté por subirse.

## Git y GitHub

```
main                     ●───────────────────────●  (merge del PR)
                          \                     /
feat/fase-0-preparacion    ●────●────●────●────●
```

- **`main`** tiene siempre una versión estable. Es la que Vercel va a publicar.
- Cada fase se trabaja en su rama (`feat/fase-0-preparacion`, `feat/fase-1-base-de-datos`, …).
- Al terminar la fase se abre un **pull request** (PR): la propuesta de sumar la rama a `main`, donde se revisan los cambios antes de aceptarlos.
- Los commits van en español, en presente (`agrega cierre de caja con arqueo`), según `rules.md`.

Repositorio: https://github.com/CyntiaCarrizo/Entrelineas

## Problemas encontrados y cómo se resolvieron

| Problema | Causa | Solución |
|---|---|---|
| `npm install` fallaba con `ENOSPC` | Disco C: con 0,25 GB libres | Se vació la papelera y la caché de npm. Después de cada instalación se vuelve a limpiar la caché |
| El cliente de Prisma 7 no corría en Node 20 | Prisma 7 genera el cliente en TypeScript | Actualización a Node 24 LTS, que ejecuta TypeScript directamente. Además, Node 20 ya no tenía soporte |
| `npm` no ejecutaba los scripts de Prisma | npm 11 bloquea por seguridad los scripts de instalación | Se revisó qué hacía cada script y se aprobaron con `npm approve-scripts` |
| Prisma daba `pool timeout` | MySQL 9 autentica con `caching_sha2_password` y el driver no pedía la clave pública | `?allowPublicKeyRetrieval=true` en la URL de conexión |
| Riesgo de borrar bases de otros proyectos | El permiso global `CREATE, DROP` que Prisma pide para la base sombra | Base sombra creada a mano y permisos solo sobre las bases del proyecto |
| El puerto 4000 respondía con otra API | Otro proyecto local (bonhomia) usa el mismo puerto | Pruebas en los puertos 4100 y 3100. Al liberar el puerto se cortó un momento el servidor de bonhomia, que se reinició solo |

## Cómo probar esta fase

```bash
npm install
npm run db:check -w apps/api     # "Conexión correcta: base entrelineas, MySQL 9.3.0"
npm test                         # 6 tests en verde
npm run dev:api                  # API en http://localhost:4000
npm run dev:web                  # Web en http://localhost:3000
```

Con las dos en marcha:

- `http://localhost:3000` muestra la página provisoria con el logo.
- `http://localhost:3000/api/salud/db` devuelve `{"data":{"baseDeDatos":"conectada"}}`, pasando por la web, la API y MySQL.

## Lo que sigue: Fase 1 — Base de datos y usuarios

- Escribir en `schema.prisma` todos los modelos de `arquitectura.md` y crear la primera migración.
- Cargar los datos de ejemplo (*seed*): 2 usuarios, 8 géneros y 60 libros.
- Login y logout con JWT en una cookie `httpOnly`, y roles `admin` y `vendedor`.
- Pantalla de login y layout del panel de administración.
