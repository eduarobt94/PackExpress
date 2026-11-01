/**
 * Inyecta el JSON-LD de la home ESTÁTICO en dist/index.html después del build.
 *
 * Por qué: antes el structured data lo montaba react-helmet en runtime, así que
 * un crawler que no ejecuta JavaScript (GPTBot, ClaudeBot, PerplexityBot, y las
 * auditorías de "agent readiness") no veía NINGÚN JSON-LD en la home.
 *
 * Fuente única de verdad: src/seo/schemas.js. Este script no redefine nada,
 * solo serializa `homeSchemas`. App.jsx ya NO los inyecta en runtime, para no
 * duplicarlos en el DOM.
 *
 * Idempotente: si ya hay un bloque inyectado lo reemplaza, así que se puede
 * correr varias veces sobre el mismo dist sin acumular scripts.
 *
 * Uso: node scripts/inject-jsonld.mjs [rutaHtml]   (por defecto dist/index.html)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homeSchemas } from '../src/seo/schemas.js'

const MARCA_INICIO = '<!-- JSON-LD estático — generado por scripts/inject-jsonld.mjs. NO editar a mano. -->'
const MARCA_FIN = '<!-- /JSON-LD estático -->'

const destino = process.argv[2] ?? 'dist/index.html'

if (!existsSync(destino)) {
  console.error(`✗ No existe ${destino}. Corré "pnpm run build" antes.`)
  process.exit(1)
}

/**
 * `</script>` dentro de un string JSON cerraría el <script> antes de tiempo.
 * Escaparlo es obligatorio aunque hoy ningún schema lo contenga: si mañana
 * alguien mete HTML en una descripción, el fallo sería silencioso y raro.
 */
const serializar = (schema) =>
  JSON.stringify(schema).replace(/<\/script/gi, '<\\/script')

const bloque = [
  MARCA_INICIO,
  ...homeSchemas.map(s => `<script type="application/ld+json">${serializar(s)}</script>`),
  MARCA_FIN,
].join('\n    ')

let html = readFileSync(destino, 'utf8')

const yaInyectado = html.includes(MARCA_INICIO)
if (yaInyectado) {
  const patron = new RegExp(
    `${MARCA_INICIO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${MARCA_FIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  )
  html = html.replace(patron, bloque)
} else {
  if (!html.includes('</head>')) {
    console.error('✗ No se encontró </head> en el HTML — no se inyectó nada.')
    process.exit(1)
  }
  html = html.replace('</head>', `    ${bloque}\n  </head>`)
}

writeFileSync(destino, html)

const tipos = homeSchemas.map(s => s['@type'])
console.log(`✓ JSON-LD inyectado en ${destino} — ${homeSchemas.length} schemas: ${[...new Set(tipos)].join(', ')}`)
