// Une la documentación del proyecto en un único PDF.
// Uso: npm run pdf   (desde docs/pdf/, o npm run docs:pdf desde la raíz)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');

// Orden de los capítulos. Si un archivo no existe se avisa y se omite.
const capitulos = [
  { archivo: 'bitacora.md', titulo: 'Bitácora del proyecto' },
  { archivo: 'PRD.md', titulo: 'PRD — Requisitos del producto' },
  { archivo: 'arquitectura.md', titulo: 'Arquitectura' },
  { archivo: 'guia-prisma.md', titulo: 'Arquitectura — Anexo: Prisma explicado' },
  { archivo: 'design.md', titulo: 'Diseño' },
  { archivo: 'rules.md', titulo: 'Reglas del proyecto' },
  { archivo: 'task.md', titulo: 'Tareas' },
  { archivo: 'memory.md', titulo: 'Memoria del proyecto' },
];

const salidaHtml = resolve(aqui, 'Entrelineas-Documentacion.html');
const salidaPdf = resolve(aqui, 'Entrelineas-Documentacion.pdf');

const slugify = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const indice = [];
let cuerpo = '';

capitulos.forEach(({ archivo, titulo }, n) => {
  const ruta = resolve(raiz, archivo);
  if (!existsSync(ruta)) {
    console.warn(`Aviso: no existe ${archivo}, se omite.`);
    return;
  }
  const prefijo = `c${n}`;
  const entradas = [];
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(texto, nivel) {
        // El h1 de cada archivo se reemplaza por el título del capítulo.
        if (nivel === 1) return '';
        const id = `${prefijo}-${slugify(texto)}`;
        if (nivel === 2) entradas.push({ id, texto });
        return `<h${nivel} id="${id}">${texto}</h${nivel}>\n`;
      },
    },
  });
  const md = readFileSync(ruta, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const html = marked.parse(md);
  const idCap = `${prefijo}-capitulo`;
  indice.push({ id: idCap, titulo, entradas });
  cuerpo += `<section class="capitulo">
  <p class="fuente">docs/${escapar(archivo)}</p>
  <h1 id="${idCap}">${titulo}</h1>
  ${html}
</section>\n`;
});

const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

const htmlIndice = indice
  .map(
    (c) => `<li><a href="#${c.id}">${c.titulo}</a>${
      c.entradas.length
        ? `<ol>${c.entradas.map((e) => `<li><a href="#${e.id}">${e.texto}</a></li>`).join('')}</ol>`
        : ''
    }</li>`
  )
  .join('\n');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Entrelíneas — Documentación del proyecto</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700&family=Public+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --papel: #F8F8F5;
    --tinta: #1A2333;
    --tinta-suave: #5B6170;
    --verde-tela: #1F4A3D;
    --ocre: #B07D24;
    --linea: #DEDCD5;
  }
  @page {
    size: A4;
    margin: 20mm 18mm 22mm;
    @bottom-center { content: counter(page); font: 9pt 'Public Sans', sans-serif; color: #5B6170; }
  }
  @page :first { @bottom-center { content: none; } }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 10.5pt/1.55 'Public Sans', 'Segoe UI', sans-serif;
    color: var(--tinta);
    background: #fff;
  }
  h1, h2, h3, h4 { font-family: 'Literata', Georgia, serif; line-height: 1.25; break-after: avoid; }
  h1 { font-size: 24pt; color: var(--verde-tela); margin: 0 0 18pt; padding-bottom: 8pt; border-bottom: 3px solid var(--ocre); }
  h2 { font-size: 15pt; margin: 22pt 0 8pt; color: var(--tinta); }
  h3 { font-size: 12pt; margin: 16pt 0 6pt; color: var(--verde-tela); }
  h4 { font-size: 11pt; margin: 12pt 0 4pt; }
  p, ul, ol { margin: 0 0 8pt; }
  li { margin-bottom: 2pt; }
  a { color: var(--verde-tela); text-decoration: none; }
  code { font-family: Consolas, 'Cascadia Mono', monospace; font-size: 9pt; background: var(--papel); padding: 0 3px; border-radius: 3px; }
  pre { background: var(--papel); border: 1px solid var(--linea); border-left: 3px solid var(--ocre); padding: 8pt 10pt; overflow: hidden; break-inside: avoid; }
  pre code { background: none; padding: 0; font-size: 8.3pt; line-height: 1.35; white-space: pre; }
  table { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt; font-size: 9pt; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th { text-align: left; background: var(--verde-tela); color: #fff; font-weight: 600; padding: 4pt 6pt; }
  td { padding: 4pt 6pt; border-bottom: 1px solid var(--linea); vertical-align: top; }
  tbody tr:nth-child(even) td { background: #FBFBF9; }
  input[type=checkbox] { margin: 0 5px 0 0; vertical-align: -1px; }
  li:has(> input[type=checkbox]) { list-style: none; margin-left: -16pt; }

  .portada { height: 250mm; display: flex; flex-direction: column; justify-content: center; break-after: page; }
  .portada .marca { font-family: 'Literata', Georgia, serif; font-size: 46pt; font-weight: 700; color: var(--verde-tela); margin: 0; }
  .portada .estante { height: 4px; background: var(--ocre); width: 70%; margin: 10pt 0 18pt; }
  .portada .sub { font-size: 15pt; color: var(--tinta); margin: 0 0 4pt; }
  .portada .meta { color: var(--tinta-suave); font-size: 10pt; margin-top: 40pt; }

  .indice { break-after: page; }
  .indice ol { padding-left: 16pt; }
  .indice > ol > li { font-weight: 600; margin-top: 8pt; }
  .indice ol ol { list-style: none; padding-left: 12pt; }
  .indice ol ol li { font-weight: 400; font-size: 9.5pt; }

  .capitulo { break-before: page; }
  .fuente { font-size: 8.5pt; color: var(--tinta-suave); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4pt; }
</style>
</head>
<body>
<section class="portada">
  <p class="marca">Entrelíneas</p>
  <div class="estante"></div>
  <p class="sub">Documentación del proyecto</p>
  <p class="sub" style="color:var(--tinta-suave)">Catálogo web, pedidos por WhatsApp, Mercado Pago, mostrador y caja</p>
  <p class="meta">Proyecto de portfolio · Generado el ${fecha}</p>
</section>
<nav class="indice">
  <h1>Índice</h1>
  <ol>${htmlIndice}</ol>
</nav>
${cuerpo}
</body>
</html>`;

writeFileSync(salidaHtml, html);

const navegadores = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const navegador = navegadores.find(existsSync);
if (!navegador) {
  console.error('No se encontró Edge ni Chrome. El HTML quedó en', salidaHtml);
  process.exit(1);
}

execFileSync(navegador, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--virtual-time-budget=15000',
  `--print-to-pdf=${salidaPdf}`,
  pathToFileURL(salidaHtml).href,
], { stdio: 'ignore' });

console.log('PDF generado:', salidaPdf);
